"""Admin audit endpoints — API Design Document Section 12."""
import datetime

from rest_framework.views import APIView

from common.pagination import CursorPagination
from common.permissions import IsAdmin
from common.response import error, paginated

from .models import AuditLog


class AuditLogListView(APIView):
    def get(self, request):
        if not IsAdmin().has_permission(request, None):
            return error("FORBIDDEN", "Admin role required.", status=403)

        queryset = AuditLog.objects()
        actor_id = request.query_params.get("actor_id")
        action_type = request.query_params.get("action_type")
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        if actor_id:
            queryset = queryset.filter(actor_id=actor_id)
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        if date_from:
            queryset = queryset.filter(created_at__gte=datetime.datetime.fromisoformat(date_from))
        if date_to:
            queryset = queryset.filter(created_at__lte=datetime.datetime.fromisoformat(date_to))

        paginator = CursorPagination(request)
        items, next_cursor, has_more = paginator.paginate_queryset(queryset)
        return paginated("logs", [log.to_dict() for log in items], next_cursor, has_more)
