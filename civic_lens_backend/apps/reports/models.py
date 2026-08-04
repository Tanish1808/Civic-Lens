import datetime

from mongoengine import (
    BooleanField,
    DateTimeField,
    Document,
    DynamicField,
    FloatField,
    ListField,
    PointField,
    ReferenceField,
    StringField,
)

CATEGORY_CHOICES = ("pothole", "waterlogging", "streetlight", "garbage", "other")
SEVERITY_CHOICES = ("low", "medium", "high")
REPORT_STATUS_CHOICES = (
    "processing",
    "classified",
    "merged",
    "ticket_created",
    "manual_review",
)


class Report(Document):
    user_id = StringField(required=True)
    photo_url = StringField(required=True)
    location = PointField(required=True)  # GeoJSON Point, 2dsphere indexed
    user_selected_category = StringField(choices=CATEGORY_CHOICES, null=True)
    description = StringField(max_length=200, null=True)
    ml_category = StringField(choices=CATEGORY_CHOICES, null=True)
    ml_severity = StringField(choices=SEVERITY_CHOICES, null=True)
    ml_confidence = FloatField(null=True)
    perceptual_hash = StringField(null=True)
    embedding_vector = ListField(FloatField(), null=True)
    merged_into_ticket_id = StringField(null=True)
    status = StringField(choices=REPORT_STATUS_CHOICES, default="processing")
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "reports",
        "indexes": ["user_id", [("location", "2dsphere")], "-created_at"],
    }

    def to_status_dict(self):
        return {
            "report_id": str(self.id),
            "status": self.status,
            "ticket_id": self.merged_into_ticket_id,
        }

    def to_summary_dict(self):
        return {
            "report_id": str(self.id),
            "photo_url": self.photo_url,
            "ml_category": self.ml_category,
            "ml_severity": self.ml_severity,
            "status": self.status,
            "ticket_id": self.merged_into_ticket_id,
            "description": self.description,
            "location": self.location,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ManualReviewQueueEntry(Document):
    report_id = StringField(required=True, unique=True)
    reason = StringField(required=True)
    resolved = BooleanField(default=False)
    resolved_by = StringField(null=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {"collection": "manual_review_queue", "indexes": ["resolved"]}
