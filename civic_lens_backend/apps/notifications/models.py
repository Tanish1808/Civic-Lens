import datetime

from mongoengine import DateTimeField, Document, StringField

NOTIFICATION_TYPE_CHOICES = ("status_change", "merge_confirmation", "ticket_created")
DELIVERY_STATUS_CHOICES = ("pending", "sent", "failed")


class Notification(Document):
    user_id = StringField(required=True)
    ticket_id = StringField(null=True)
    type = StringField(required=True, choices=NOTIFICATION_TYPE_CHOICES)
    delivery_status = StringField(default="pending", choices=DELIVERY_STATUS_CHOICES)
    sent_at = DateTimeField(null=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {"collection": "notifications", "indexes": ["user_id", "-created_at"]}

    def to_dict(self):
        return {
            "notification_id": str(self.id),
            "type": self.type,
            "ticket_id": self.ticket_id,
            "delivery_status": self.delivery_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
