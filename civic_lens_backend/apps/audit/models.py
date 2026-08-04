import datetime

from mongoengine import DateTimeField, Document, DynamicField, StringField


class AuditLog(Document):
    actor_id = StringField(required=True)
    action_type = StringField(required=True)  # status_change, category_override, bulk_update, user_suspend, flag_spam
    target_ticket_id = StringField(null=True)
    target_user_id = StringField(null=True)
    before_value = DynamicField(null=True)
    after_value = DynamicField(null=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "audit_logs",
        "indexes": [("actor_id", "created_at"), "-created_at"],
    }

    def to_dict(self):
        return {
            "id": str(self.id),
            "actor_id": self.actor_id,
            "action_type": self.action_type,
            "target_ticket_id": self.target_ticket_id,
            "before_value": self.before_value,
            "after_value": self.after_value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
