"""
Standard response envelope helpers, per API Design Document Section 2.
"""
from rest_framework.response import Response


def success(data=None, meta=None, status=200):
    body = {"success": True, "data": data if data is not None else {}}
    if meta is not None:
        body["meta"] = meta
    return Response(body, status=status)


def error(code, message, details=None, status=400):
    return Response(
        {
            "success": False,
            "error": {"code": code, "message": message, "details": details},
        },
        status=status,
    )


def paginated(items_key, items, next_cursor=None, has_more=False, status=200):
    return Response(
        {
            "success": True,
            "data": {items_key: items},
            "meta": {
                "pagination": {
                    "next_cursor": next_cursor,
                    "has_more": has_more,
                }
            },
        },
        status=status,
    )
