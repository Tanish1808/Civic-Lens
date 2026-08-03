"""
Cursor-based pagination, per API Design Document Section 14 and
Database Design Document Section 14 (Query Optimization - never offset-based).

The cursor is the base64-encoded string form of the last document's ObjectId.
Callers should order results by `_id` (or `created_at` + `_id` tiebreak) descending.
"""
import base64

from bson import ObjectId


class CursorPagination:
    default_limit = 20
    max_limit = 100

    def __init__(self, request):
        self.request = request
        self.limit = self._parse_limit()
        self.cursor = self._parse_cursor()

    def _parse_limit(self):
        try:
            limit = int(self.request.query_params.get("limit", self.default_limit))
        except (TypeError, ValueError):
            limit = self.default_limit
        return max(1, min(limit, self.max_limit))

    def _parse_cursor(self):
        raw = self.request.query_params.get("cursor")
        if not raw:
            return None
        try:
            decoded = base64.urlsafe_b64decode(raw.encode()).decode()
            return ObjectId(decoded)
        except Exception:
            return None

    @staticmethod
    def encode_cursor(object_id):
        return base64.urlsafe_b64encode(str(object_id).encode()).decode()

    def paginate_queryset(self, queryset, id_field="id"):
        qs = queryset.order_by(f"-{id_field}")
        if self.cursor is not None:
            qs = qs.filter(**{f"{id_field}__lt": self.cursor})
        # fetch one extra to know if there's more
        items = list(qs.limit(self.limit + 1))
        has_more = len(items) > self.limit
        items = items[: self.limit]
        next_cursor = None
        if has_more and items:
            last = items[-1]
            next_cursor = self.encode_cursor(getattr(last, id_field))
        return items, next_cursor, has_more
