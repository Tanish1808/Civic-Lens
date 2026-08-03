"""Notification endpoints — API Design Document Section 13."""
from rest_framework.views import APIView

from common.pagination import CursorPagination
from common.response import error, paginated

from .models import Notification


class NotificationListView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return error("UNAUTHORIZED", "Authentication required.", status=401)

        paginator = CursorPagination(request)
        queryset = Notification.objects(user_id=str(request.user.id))
        items, next_cursor, has_more = paginator.paginate_queryset(queryset)
        return paginated(
            "notifications", [n.to_dict() for n in items], next_cursor, has_more
        )
