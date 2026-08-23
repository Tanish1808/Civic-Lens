"""
Custom DRF authentication class validating our JWT access tokens and
loading the corresponding mongoengine User document.

A custom class is required (rather than djangorestframework-simplejwt's
default) because the User model here is a mongoengine Document, not a
Django ORM model — simplejwt's default backends assume the ORM. This
keeps the JWT *format*/claims aligned with what the TDD specifies while
sourcing identity from MongoDB.
"""
import jwt
from rest_framework import authentication, exceptions

from apps.users.models import User

from . import jwt_utils


class JWTAuthentication(authentication.BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).decode("utf-8")
        if not auth_header or not auth_header.startswith(self.keyword + " "):
            return None

        token = auth_header[len(self.keyword) + 1 :].strip()
        try:
            payload = jwt_utils.decode_token(token)
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Access token expired.")
        except jwt.PyJWTError:
            raise exceptions.AuthenticationFailed("Invalid access token.")

        if payload.get("type") != "access":
            raise exceptions.AuthenticationFailed("Invalid token type.")

        try:
            user = User.objects.get(id=payload["sub"], is_active=True)
        except (User.DoesNotExist, Exception):
            raise exceptions.AuthenticationFailed("User not found or inactive.")

        # Attach the token's role claim for cheap checks; permissions.py
        # re-verifies against the DB for sensitive actions.
        user.token_role = payload.get("role")
        return (user, token)
