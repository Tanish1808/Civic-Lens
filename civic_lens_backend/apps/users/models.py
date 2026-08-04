"""
User model — Database Design Document Section 3.1.
"""
import datetime

from django.contrib.auth.hashers import check_password, make_password
from mongoengine import (
    BooleanField,
    DateTimeField,
    Document,
    EmailField,
    IntField,
    StringField,
)

ROLE_CHOICES = ("citizen", "moderator", "admin", "super_admin")


class User(Document):
    email = StringField(required=True, unique=True)
    phone = StringField(unique=True, sparse=True)
    password_hash = StringField(required=True)
    full_name = StringField(null=True)
    role = StringField(choices=ROLE_CHOICES, default="citizen")
    civic_score = IntField(default=0, min_value=0)
    mfa_enabled = BooleanField(default=False)
    is_active = BooleanField(default=True)
    google_oauth_id = StringField(unique=True, sparse=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "users",
        "indexes": ["email", "phone", "google_oauth_id"],
    }

    # Required so DRF's request.user behaves reasonably in templates/admin checks.
    is_authenticated = True
    is_anonymous = False

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super().save(*args, **kwargs)

    def to_public_dict(self):
        return {
            "user_id": str(self.id),
            "email": self.email,
            "phone": self.phone,
            "full_name": self.full_name,
            "role": self.role,
            "civic_score": self.civic_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class RefreshToken(Document):
    """
    Tracks issued refresh tokens so logout can revoke them server-side
    (per TDD Section 7 - refresh token rotation / revocation).
    """

    jti = StringField(required=True, unique=True)
    user_id = StringField(required=True)
    revoked = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {"collection": "refresh_tokens", "indexes": ["jti", "user_id"]}


class SupportRequest(Document):
    name = StringField(required=True, max_length=100)
    email = EmailField(required=True, max_length=150)
    municipality = StringField(required=True, max_length=150)
    details = StringField(required=True, max_length=1000)
    status = StringField(default="pending", choices=["pending", "processed"])
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {"collection": "support_requests", "indexes": ["status", "created_at"]}

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "municipality": self.municipality,
            "details": self.details,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

