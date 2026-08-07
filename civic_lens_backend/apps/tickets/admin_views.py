"""
Admin ticket management endpoints — API Design Document Section 11.
Every mutating action here creates an audit log entry (TDD Section 20 -
Observer-adjacent pattern for traceability) and triggers a notification
dispatch on status change (API Design Document Section 11.2).
"""
from django.conf import settings
from rest_framework.views import APIView

from apps.audit.services import AuditService
from apps.notifications.services import NotificationService
from apps.reports.models import Report
from common.pagination import CursorPagination
from common.permissions import IsAdmin, IsAdminOrModerator
from common.response import error, paginated, success

from .models import Photo, Ticket, TICKET_STATUS_CHOICES
from apps.reports.services import ImageStorageService

VALID_STATUS_TRANSITIONS = {
    "reported": {"verified", "acknowledged", "resolved"},
    "verified": {"acknowledged", "resolved"},
    "acknowledged": {"in_progress", "resolved"},
    "in_progress": {"resolved"},
    "resolved": set(),
}


def _check_admin(request):
    return IsAdmin().has_permission(request, None)


class AdminTicketListView(APIView):
    def get(self, request):
        if not _check_admin(request):
            return error("FORBIDDEN", "Admin role required.", status=403)

        show_spam = request.query_params.get("show_spam", "false") == "true"
        queryset = Ticket.objects(is_flagged_spam=show_spam)
        category = request.query_params.get("category")
        severity = request.query_params.get("severity")
        status_ = request.query_params.get("status")
        sort_by = request.query_params.get("sort_by", "created_at")
        sort_order = request.query_params.get("sort_order", "desc")

        if category:
            queryset = queryset.filter(category=category)
        if severity:
            queryset = queryset.filter(severity=severity)
        if status_:
            queryset = queryset.filter(status=status_)

        order_prefix = "-" if sort_order == "desc" else ""
        queryset = queryset.order_by(f"{order_prefix}{sort_by}")

        paginator = CursorPagination(request)
        items, next_cursor, has_more = paginator.paginate_queryset(queryset)
        return paginated("tickets", [t.to_admin_dict() for t in items], next_cursor, has_more)


class AdminTicketStatusUpdateView(APIView):
    def patch(self, request, ticket_id):
        if not _check_admin(request):
            return error("FORBIDDEN", "Admin role required.", status=403)

        new_status = request.data.get("status")
        note = request.data.get("note")

        if new_status not in TICKET_STATUS_CHOICES:
            return error("INVALID_STATUS", "Invalid status value.", status=400)

        ticket = Ticket.objects(id=ticket_id).first()
        if not ticket:
            return error("NOT_FOUND", "Ticket not found.", status=404)

        if new_status == ticket.status:
            # Idempotent no-op per API Design Document Section 17.
            return success(ticket.to_admin_dict())

        if new_status not in VALID_STATUS_TRANSITIONS.get(ticket.status, set()):
            return error(
                "INVALID_STATUS_TRANSITION",
                f"Cannot transition from '{ticket.status}' to '{new_status}'.",
                status=400,
            )

        before_status = ticket.status
        ticket.status = new_status
        ticket.append_status_history(new_status, changed_by=str(request.user.id), note=note)
        if new_status == "resolved":
            import datetime

            resolved_image = request.FILES.get("resolved_image")
            if resolved_image:
                photo_url = ImageStorageService.upload(resolved_image)
                ticket.resolved_photo = Photo(
                    url=photo_url,
                    uploaded_by=str(request.user.id),
                )
            elif not ticket.resolved_photo:
                return error(
                    "RESOLUTION_PHOTO_REQUIRED",
                    "A verification photo is required to mark the ticket as resolved.",
                    status=400,
                )

            ticket.resolved_at = datetime.datetime.utcnow()
        ticket.save()

        AuditService.record(
            actor_id=str(request.user.id),
            action_type="status_change",
            target_ticket_id=str(ticket.id),
            before_value={"status": before_status},
            after_value={"status": new_status},
        )

        _notify_reporters(ticket, new_status)

        return success(ticket.to_admin_dict())


class AdminTicketOverrideView(APIView):
    def patch(self, request, ticket_id):
        if not _check_admin(request):
            return error("FORBIDDEN", "Admin role required.", status=403)

        ticket = Ticket.objects(id=ticket_id).first()
        if not ticket:
            return error("NOT_FOUND", "Ticket not found.", status=404)

        before = {"category": ticket.category, "severity": ticket.severity}
        category = request.data.get("category")
        severity = request.data.get("severity")

        if category:
            ticket.category = category
        if severity:
            ticket.severity = severity
        ticket.is_ml_overridden = True
        ticket.save()

        AuditService.record(
            actor_id=str(request.user.id),
            action_type="category_override",
            target_ticket_id=str(ticket.id),
            before_value=before,
            after_value={"category": ticket.category, "severity": ticket.severity},
        )

        return success(ticket.to_admin_dict())


class AdminBulkStatusUpdateView(APIView):
    def patch(self, request):
        if not _check_admin(request):
            return error("FORBIDDEN", "Admin role required.", status=403)

        ticket_ids = request.data.get("ticket_ids", [])
        new_status = request.data.get("status")
        note = request.data.get("note")

        if new_status not in TICKET_STATUS_CHOICES:
            return error("INVALID_STATUS", "Invalid status value.", status=400)

        updated_count = 0
        failed_ids = []

        for ticket_id in ticket_ids:
            ticket = Ticket.objects(id=ticket_id).first()
            if not ticket or new_status not in VALID_STATUS_TRANSITIONS.get(ticket.status, set()) | {ticket.status if ticket else ""}:
                failed_ids.append(ticket_id)
                continue

            before_status = ticket.status
            ticket.status = new_status
            ticket.append_status_history(new_status, changed_by=str(request.user.id), note=note)
            ticket.save()
            updated_count += 1

            # One audit log entry per affected ticket (API Design Doc Section 11.4).
            AuditService.record(
                actor_id=str(request.user.id),
                action_type="bulk_update",
                target_ticket_id=str(ticket.id),
                before_value={"status": before_status},
                after_value={"status": new_status},
            )
            _notify_reporters(ticket, new_status)

        return success({"updated_count": updated_count, "failed_ids": failed_ids})


class AdminFlagSpamView(APIView):
    def patch(self, request, ticket_id):
        if not _check_admin(request):
            return error("FORBIDDEN", "Admin role required.", status=403)

        ticket = Ticket.objects(id=ticket_id).first()
        if not ticket:
            return error("NOT_FOUND", "Ticket not found.", status=404)

        ticket.is_flagged_spam = True
        ticket.save()

        AuditService.record(
            actor_id=str(request.user.id),
            action_type="flag_spam",
            target_ticket_id=str(ticket.id),
            before_value={"is_flagged_spam": False},
            after_value={"is_flagged_spam": True},
        )

        return success({"ticket_id": str(ticket.id), "is_flagged_spam": True})


def _notify_reporters(ticket, new_status):
    """Notify every user who has an open report merged into this ticket."""
    reporter_ids = {
        r.user_id
        for r in Report.objects(merged_into_ticket_id=str(ticket.id)).only("user_id")
    }
    for user_id in reporter_ids:
        NotificationService.notify_status_change(user_id, str(ticket.id), new_status)


class AdminUnflagSpamView(APIView):
    def patch(self, request, ticket_id):
        if not _check_admin(request):
            return error("FORBIDDEN", "Admin role required.", status=403)

        ticket = Ticket.objects(id=ticket_id).first()
        if not ticket:
            return error("NOT_FOUND", "Ticket not found.", status=404)

        ticket.is_flagged_spam = False
        ticket.save()

        AuditService.record(
            actor_id=str(request.user.id),
            action_type="unflag_spam",
            target_ticket_id=str(ticket.id),
            before_value={"is_flagged_spam": True},
            after_value={"is_flagged_spam": False},
        )

        return success({"ticket_id": str(ticket.id), "is_flagged_spam": False})
