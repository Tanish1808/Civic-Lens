from rest_framework.views import APIView

from common.pagination import CursorPagination
from common.permissions import IsAdminOrModerator
from common.response import error, paginated, success
from common.throttling import ScopedActionThrottle
from apps.tickets.models import Photo, Ticket
from apps.tickets.services import TicketMergeService

from .models import ManualReviewQueueEntry, Report
from .serializers import AttachPhotoSerializer, ReportSubmitSerializer
from .services import ImageStorageService, ReportSubmissionService


class ReportSubmitThrottle(ScopedActionThrottle):
    def __init__(self):
        super().__init__("report_submit")


def _require_auth(request):
    return request.user is not None and request.user.is_authenticated


class ReportSubmitView(APIView):
    throttle_classes = [ReportSubmitThrottle]

    def post(self, request):
        if not _require_auth(request):
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        serializer = ReportSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        report = ReportSubmissionService.submit(
            user=request.user,
            image_file=data["image"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            user_selected_category=data.get("user_selected_category"),
            description=data.get("description"),
        )
        return success({"report_id": str(report.id), "status": report.status}, status=202)


class ReportStatusView(APIView):
    def get(self, request, report_id):
        if not _require_auth(request):
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        report = Report.objects(id=report_id).first()
        if not report:
            return error("NOT_FOUND", "Report not found.", status=404)
        if report.user_id != str(request.user.id):
            return error("FORBIDDEN", "You do not own this report.", status=403)

        return success(report.to_status_dict())


class MyReportsView(APIView):
    def get(self, request):
        if not _require_auth(request):
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        paginator = CursorPagination(request)
        queryset = Report.objects(user_id=str(request.user.id))
        items, next_cursor, has_more = paginator.paginate_queryset(queryset)
        return paginated(
            "reports", [r.to_summary_dict() for r in items], next_cursor, has_more
        )


class AttachPhotoView(APIView):
    def post(self, request, ticket_id):
        if not _require_auth(request):
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        serializer = AttachPhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ticket = Ticket.objects(id=ticket_id).first()
        if not ticket:
            return error("NOT_FOUND", "Ticket not found.", status=404)

        photo_url = ImageStorageService.upload(serializer.validated_data["image"])
        ticket.photos.append(Photo(url=photo_url, uploaded_by=str(request.user.id)))
        ticket.save()

        return success(
            {
                "ticket_id": str(ticket.id),
                "photos": [{"url": p.url} for p in ticket.photos],
            },
            status=201,
        )


class ManualReviewQueueListView(APIView):
    """GET /api/v1/admin/manual-review-queue (API Design Doc Section 11.6)."""

    def get(self, request):
        if not IsAdminOrModerator().has_permission(request, None):
            return error("FORBIDDEN", "Admin or moderator role required.", status=403)

        paginator = CursorPagination(request)
        queryset = ManualReviewQueueEntry.objects(resolved=False)
        items, next_cursor, has_more = paginator.paginate_queryset(queryset)

        queue_items = []
        for entry in items:
            photo_url = None
            if entry.report_id.startswith("ticket:"):
                try:
                    ticket_id = entry.report_id.split(":", 1)[1]
                    t = Ticket.objects(id=ticket_id).first()
                    if t and t.photos:
                        photo_url = t.photos[0].url
                except Exception:
                    pass
            else:
                try:
                    r = Report.objects(id=entry.report_id).first()
                    if r:
                        photo_url = r.photo_url
                except Exception:
                    pass

            queue_items.append(
                {
                    "report_id": entry.report_id,
                    "photo_url": photo_url,
                    "reason": entry.reason,
                    "created_at": entry.created_at.isoformat() if entry.created_at else None,
                }
            )
        return paginated("queue_items", queue_items, next_cursor, has_more)


class ManualReviewQueueResolveView(APIView):
    """PATCH /api/v1/admin/manual-review-queue/{report_id}/resolve (Section 11.7)."""

    def patch(self, request, report_id):
        if not IsAdminOrModerator().has_permission(request, None):
            return error("FORBIDDEN", "Admin or moderator role required.", status=403)

        category = request.data.get("category")
        severity = request.data.get("severity")
        if not category or not severity:
            return error("VALIDATION_ERROR", "category and severity are required.", status=400)

        entry = ManualReviewQueueEntry.objects(report_id=report_id, resolved=False).first()
        if not entry:
            return error("NOT_FOUND", "Queue entry not found or already resolved.", status=404)

        # Handle ticket resolution signal
        if report_id.startswith("ticket:"):
            import datetime
            entry.resolved = True
            entry.resolved_by = str(request.user.id)
            entry.save()
            
            ticket_id = report_id.split(":", 1)[1]
            ticket = Ticket.objects(id=ticket_id).first()
            if ticket and category != "other":
                ticket.status = "resolved"
                ticket.resolved_at = datetime.datetime.utcnow()
                ticket.append_status_history("resolved", changed_by=str(request.user.id), note="Admin manual override approval of community resolution signal.")
                ticket.save()
                
            return success({"report_id": report_id, "message": "Community resolution signal processed."})

        report = Report.objects(id=report_id).first()
        if not report:
            # Gracefully clear the orphaned queue entry
            entry.resolved = True
            entry.resolved_by = str(request.user.id)
            entry.save()
            return success({
                "report_id": report_id,
                "message": "Orphaned queue entry resolved and cleared."
            })

        report.ml_category = category
        report.ml_severity = severity
        report.status = "ticket_created"

        ticket = TicketMergeService.create_new_ticket(report)
        report.merged_into_ticket_id = str(ticket.id)
        report.save()

        entry.resolved = True
        entry.resolved_by = str(request.user.id)
        entry.save()

        return success({"report_id": report_id, "resulting_ticket_id": str(ticket.id)})


class ReportDetailView(APIView):
    def delete(self, request, report_id):
        if not _require_auth(request):
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        report = Report.objects(id=report_id).first()
        if not report:
            return error("NOT_FOUND", "Report not found.", status=404)
        if report.user_id != str(request.user.id):
            return error("FORBIDDEN", "You do not own this report.", status=403)

        report.delete()
        return success({"message": "Report deleted successfully."})
