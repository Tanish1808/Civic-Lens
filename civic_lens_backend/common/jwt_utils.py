"""
JWT encode/decode helpers, per TDD Section 7 (Authentication Strategy).
Access tokens are short-lived and carry the user's role claim (per
System Architecture Document Section 7 - Authorization Flow) so that
basic role checks don't require a DB hit; sensitive admin actions still
re-verify the role against the database (see common/permissions.py).
"""
import uuid
from datetime import datetime, timezone

import jwt
from django.conf import settings


def _now():
    return datetime.now(timezone.utc)


def generate_access_token(user):
    payload = {
        "type": "access",
        "sub": str(user.id),
        "role": user.role,
        "email": user.email,
        "name": user.full_name,
        "iat": _now(),
        "exp": _now() + settings.JWT_ACCESS_TOKEN_LIFETIME,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def generate_refresh_token(user):
    payload = {
        "type": "refresh",
        "sub": str(user.id),
        "jti": str(uuid.uuid4()),
        "iat": _now(),
        "exp": _now() + settings.JWT_REFRESH_TOKEN_LIFETIME,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token):
    """Raises jwt.PyJWTError subclasses on invalid/expired tokens."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
