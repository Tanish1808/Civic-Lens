"""
Root URL configuration.
Base path: /api/v1/ (per API Design Document Section 1 - URL path versioning).
"""
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({"success": True, "data": {"status": "ok"}})


urlpatterns = [
    path("health", health_check),
    path("api/v1/auth/", include("apps.users.urls_auth")),
    path("api/v1/", include("apps.users.urls")),
    path("api/v1/", include("apps.reports.urls")),
    path("api/v1/", include("apps.tickets.urls")),
    path("api/v1/", include("apps.analytics.urls")),
    path("api/v1/", include("apps.notifications.urls")),
    path("api/v1/", include("apps.audit.urls")),
]
