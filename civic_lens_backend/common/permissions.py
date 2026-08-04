"""
RBAC permission classes, per TDD Section 8 and System Architecture Document
Section 7 (Authorization Flow). Sensitive admin actions re-check the role
directly from the database rather than trusting the JWT claim alone, to
guard against a demoted admin whose token hasn't expired yet.
"""
from rest_framework.permissions import BasePermission


class IsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return bool(getattr(request.user, "is_authenticated", False))


class IsOwner(BasePermission):
    """Object-level permission: request.user must own the object (owner_field)."""

    owner_field = "user_id"

    def has_object_permission(self, request, view, obj):
        owner_id = getattr(obj, self.owner_field, None)
        return owner_id is not None and str(owner_id) == str(request.user.id)


class IsAdmin(BasePermission):
    """Re-verifies role from DB — used for sensitive admin actions."""

    def has_permission(self, request, view):
        user = request.user
        if user is None or not getattr(user, "is_authenticated", False):
            return False
        if hasattr(user, "reload"):
            try:
                user.reload()
            except Exception:
                return False
        return getattr(user, "role", None) in ("admin", "super_admin")


class IsAdminOrModerator(BasePermission):
    """Used for manual-review-queue endpoints (Assumption 2, API Design Doc Section 18)."""

    def has_permission(self, request, view):
        user = request.user
        if user is None or not getattr(user, "is_authenticated", False):
            return False
        if hasattr(user, "reload"):
            try:
                user.reload()
            except Exception:
                return False
        return getattr(user, "role", None) in ("admin", "super_admin", "moderator")

