import datetime

from mongoengine import (
    BooleanField,
    DateTimeField,
    Document,
    EmbeddedDocument,
    EmbeddedDocumentListField,
    IntField,
    PointField,
    StringField,
)

CATEGORY_CHOICES = ("pothole", "waterlogging", "streetlight", "garbage", "other")
SEVERITY_CHOICES = ("low", "medium", "high")
TICKET_STATUS_CHOICES = ("reported", "verified", "acknowledged", "in_progress", "resolved")


class Photo(EmbeddedDocument):
    url = StringField(required=True)
    uploaded_by = StringField(required=True)
    uploaded_at = DateTimeField(default=datetime.datetime.utcnow)


class StatusHistoryEntry(EmbeddedDocument):
    status = StringField(required=True, choices=TICKET_STATUS_CHOICES)
    changed_by = StringField(required=True)  # user_id or "system"
    changed_at = DateTimeField(default=datetime.datetime.utcnow)
    note = StringField(null=True)


class Ticket(Document):
    category = StringField(required=True, choices=CATEGORY_CHOICES)
    severity = StringField(required=True, choices=SEVERITY_CHOICES)
    location = PointField(required=True)
    zone_id = StringField(null=True)  # future multi-zone scope
    photos = EmbeddedDocumentListField(Photo, default=list)
    report_count = IntField(default=1)
    upvote_count = IntField(default=0)
    resolved_signal_count = IntField(default=0)
    status = StringField(default="reported", choices=TICKET_STATUS_CHOICES)
    status_history = EmbeddedDocumentListField(StatusHistoryEntry, default=list)
    is_ml_overridden = BooleanField(default=False)
    is_flagged_spam = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)
    resolved_at = DateTimeField(null=True)

    meta = {
        "collection": "tickets",
        "indexes": [
            [("location", "2dsphere")],
            "status",
            ("category", "severity"),
            "-created_at",
        ],
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        res = super().save(*args, **kwargs)
        try:
            from django.core.cache import cache
            cache.delete("tickets_list:")
            from apps.analytics.views import invalidate_analytics_cache
            invalidate_analytics_cache()
        except Exception:
            pass
        return res

    def append_status_history(self, status, changed_by, note=None):
        self.status_history.append(
            StatusHistoryEntry(status=status, changed_by=changed_by, note=note)
        )

    def to_list_dict(self):
        return {
            "ticket_id": str(self.id),
            "category": self.category,
            "severity": self.severity,
            "location": self.location,
            "status": self.status,
            "report_count": self.report_count,
            "upvote_count": self.upvote_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def to_detail_dict(self):
        return {
            **self.to_list_dict(),
            "photos": [
                {"url": p.url, "uploaded_by": p.uploaded_by, "uploaded_at": p.uploaded_at.isoformat()}
                for p in self.photos
            ],
            "status_history": [
                {
                    "status": h.status,
                    "changed_by": h.changed_by,
                    "changed_at": h.changed_at.isoformat(),
                    "note": h.note,
                }
                for h in self.status_history
            ],
            "is_ml_overridden": self.is_ml_overridden,
            "resolved_signal_count": self.resolved_signal_count,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }

    def to_admin_dict(self):
        return {**self.to_detail_dict(), "is_flagged_spam": self.is_flagged_spam}


class Upvote(Document):
    ticket_id = StringField(required=True)
    user_id = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "upvotes",
        "indexes": [{"fields": ("ticket_id", "user_id"), "unique": True}],
    }


class Comment(Document):
    ticket_id = StringField(required=True)
    user_id = StringField(required=True)
    text = StringField(required=True, max_length=500)
    is_flagged = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {"collection": "comments", "indexes": ["ticket_id", "-created_at"]}

    def to_dict(self):
        return {
            "comment_id": str(self.id),
            "text": self.text,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
