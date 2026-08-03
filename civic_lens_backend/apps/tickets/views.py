import datetime

from django.conf import settings
from django.core.cache import cache
from mongoengine import NotUniqueError
from rest_framework.views import APIView

from common.pagination import CursorPagination
from common.response import error, paginated, success
from common.throttling import ScopedActionThrottle

from .models import Comment, Ticket, Upvote
from .serializers import CommentCreateSerializer
from .services import SeverityEscalationService

DASHBOARD_CACHE_TTL_SECONDS = 60


def _require_auth(request):
    return request.user.is_authenticated


def _apply_common_filters(queryset, params):
    category = params.get("category")
    severity = params.get("severity")
    status_ = params.get("status")
    date_from = params.get("date_from")
    date_to = params.get("date_to")

    if category:
        queryset = queryset.filter(category=category)
    if severity:
        queryset = queryset.filter(severity=severity)
    if status_:
        queryset = queryset.filter(status=status_)
    if date_from:
        queryset = queryset.filter(created_at__gte=datetime.datetime.fromisoformat(date_from))
    if date_to:
        queryset = queryset.filter(created_at__lte=datetime.datetime.fromisoformat(date_to))
    return queryset


class TicketListView(APIView):
    """GET /api/v1/tickets — public dashboard/heatmap list (API Design Doc Section 7.1)."""

    def get(self, request):
        cache_key = f"tickets_list:{request.GET.urlencode()}"
        cached = cache.get(cache_key)
        if cached is not None:
            return success(cached["data"], meta=cached["meta"])

        queryset = Ticket.objects(is_flagged_spam=False)
        queryset = _apply_common_filters(queryset, request.query_params)

        bbox = request.query_params.get("bbox")  # "min_lng,min_lat,max_lng,max_lat"
        if bbox:
            try:
                min_lng, min_lat, max_lng, max_lat = (float(v) for v in bbox.split(","))
                queryset = queryset.filter(
                    location__geo_within_box=[(min_lng, min_lat), (max_lng, max_lat)]
                )
            except ValueError:
                return error("INVALID_BBOX", "bbox must be 'min_lng,min_lat,max_lng,max_lat'.", status=400)

        paginator = CursorPagination(request)
        items, next_cursor, has_more = paginator.paginate_queryset(queryset)

        response_data = {"tickets": [t.to_list_dict() for t in items]}
        response_meta = {"pagination": {"next_cursor": next_cursor, "has_more": has_more}}
        cache.set(cache_key, {"data": response_data, "meta": response_meta}, DASHBOARD_CACHE_TTL_SECONDS)

        return success(response_data, meta=response_meta)


class TicketSearchView(APIView):
    """GET /api/v1/tickets/search (API Design Doc Section 7.3)."""

    def get(self, request):
        queryset = Ticket.objects(is_flagged_spam=False)
        queryset = _apply_common_filters(queryset, request.query_params)

        q = request.query_params.get("q")
        if q:
            # NOTE (implementation assumption): free-text `description` is
            # captured on the originating Report, not the Ticket. To search
            # it, we look up matching report_ids first, then filter tickets
            # by those reports' merged_into_ticket_id. This keeps Ticket's
            # schema aligned with Database Design Document Section 3.3
            # (no description field on Ticket) while still honoring the
            # `q` contract from API Design Document Section 7.3.
            from apps.reports.models import Report

            matching_ticket_ids = {
                r.merged_into_ticket_id
                for r in Report.objects(description__icontains=q, merged_into_ticket_id__ne=None).only(
                    "merged_into_ticket_id"
                )
            }
            queryset = queryset.filter(id__in=list(matching_ticket_ids))

        near_lat = request.query_params.get("near_lat")
        near_lng = request.query_params.get("near_lng")
        radius_meters = request.query_params.get("radius_meters")
        if near_lat and near_lng:
            point = {"type": "Point", "coordinates": [float(near_lng), float(near_lat)]}
            queryset = queryset.filter(location__near=point)
            if radius_meters:
                queryset = queryset.filter(location__max_distance=float(radius_meters))

        paginator = CursorPagination(request)
        items, next_cursor, has_more = paginator.paginate_queryset(queryset)
        return paginated("tickets", [t.to_list_dict() for t in items], next_cursor, has_more)


class TicketDetailView(APIView):
    """GET /api/v1/tickets/{ticket_id} — not cached (API Design Doc Section 16)."""

    def get(self, request, ticket_id):
        ticket = Ticket.objects(id=ticket_id, is_flagged_spam=False).first()
        if not ticket:
            return error("NOT_FOUND", "Ticket not found.", status=404)
        return success(ticket.to_detail_dict())


class UpvoteThrottle(ScopedActionThrottle):
    def __init__(self):
        super().__init__("upvote")


class UpvoteView(APIView):
    throttle_classes = [UpvoteThrottle]

    def post(self, request, ticket_id):
        if not _require_auth(request):
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        ticket = Ticket.objects(id=ticket_id).first()
        if not ticket:
            return error("NOT_FOUND", "Ticket not found.", status=404)

        try:
            Upvote(ticket_id=ticket_id, user_id=str(request.user.id)).save()
        except NotUniqueError:
            return error("ALREADY_UPVOTED", "You have already upvoted this ticket.", status=409)

        ticket.upvote_count += 1
        ticket.save()
        SeverityEscalationService.maybe_escalate(ticket)

        return success({"ticket_id": str(ticket.id), "upvote_count": ticket.upvote_count}, status=201)

    def delete(self, request, ticket_id):
        if not _require_auth(request):
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        existing = Upvote.objects(ticket_id=ticket_id, user_id=str(request.user.id)).first()
        if not existing:
            return error("NOT_FOUND", "No existing upvote to remove.", status=404)

        existing.delete()
        ticket = Ticket.objects(id=ticket_id).first()
        if ticket and ticket.upvote_count > 0:
            ticket.upvote_count -= 1
            ticket.save()

        return success(status=204)


class MarkResolvedView(APIView):
    def post(self, request, ticket_id):
        if not _require_auth(request):
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        ticket = Ticket.objects(id=ticket_id).first()
        if not ticket:
            return error("NOT_FOUND", "Ticket not found.", status=404)

        ticket.resolved_signal_count += 1
        ticket.save()

        # Community-driven signal: flags for admin confirmation once threshold
        # crossed, does not auto-close the ticket (API Design Doc Section 8.3).
        if ticket.resolved_signal_count >= settings.MARK_RESOLVED_ESCALATION_THRESHOLD:
            from apps.reports.models import ManualReviewQueueEntry

            if not ManualReviewQueueEntry.objects(
                report_id=f"ticket:{ticket_id}", reason="community_resolved_signal"
            ).first():
                ManualReviewQueueEntry(
                    report_id=f"ticket:{ticket_id}", reason="community_resolved_signal"
                ).save()

        return success(
            {"ticket_id": str(ticket.id), "resolved_signal_count": ticket.resolved_signal_count},
            status=201,
        )


class CommentListCreateView(APIView):
    """API Design Doc Section 9 — feature-flaggable per TDD Section 22."""

    def get(self, request, ticket_id):
        paginator = CursorPagination(request)
        queryset = Comment.objects(ticket_id=ticket_id)
        items, next_cursor, has_more = paginator.paginate_queryset(queryset)
        return paginated("comments", [c.to_dict() for c in items], next_cursor, has_more)

    def post(self, request, ticket_id):
        if not settings.COMMENTS_FEATURE_ENABLED:
            return error("FEATURE_DISABLED", "Comments are currently disabled.", status=403)
        if not _require_auth(request):
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = Comment(
            ticket_id=ticket_id, user_id=str(request.user.id), text=serializer.validated_data["text"]
        )
        comment.save()
        return success(comment.to_dict(), status=201)
