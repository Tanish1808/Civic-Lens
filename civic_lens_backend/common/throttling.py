"""
Rate limiting, per API Design Document Section 15.
Backed by Django's cache framework (Redis in production, per System
Architecture Document Section 12).
"""
from rest_framework.throttling import SimpleRateThrottle


class AuthenticatedUserThrottle(SimpleRateThrottle):
    scope = "authenticated"

    def get_cache_key(self, request, view):
        if not request.user or not getattr(request.user, "id", None):
            return None
        return self.cache_format % {"scope": self.scope, "ident": str(request.user.id)}


class AnonRateThrottle(SimpleRateThrottle):
    scope = "anon"

    def get_cache_key(self, request, view):
        if request.user and getattr(request.user, "id", None):
            return None
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class ScopedActionThrottle(SimpleRateThrottle):
    """Generic throttle for a named action (login, signup, report_submit, upvote)."""

    def __init__(self, scope):
        self.scope = scope
        self.rate = self.get_rate()
        self.num_requests, self.duration = self.parse_rate(self.rate)

    def get_cache_key(self, request, view):
        ident = (
            str(request.user.id)
            if request.user and getattr(request.user, "id", None)
            else self.get_ident(request)
        )
        return self.cache_format % {"scope": self.scope, "ident": ident}
