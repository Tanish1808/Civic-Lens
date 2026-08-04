"""
Audit logging service — append-only, immutable (Database Design Document
Section 7). Every sensitive admin action must call `record` exactly once
per affected ticket (API Design Doc Section 11.4 - one entry per ticket
even for bulk operations, for granular traceability).
"""
from .models import AuditLog


class AuditService:
    @staticmethod
    def record(actor_id, action_type, target_ticket_id=None, target_user_id=None,
               before_value=None, after_value=None):
        AuditLog(
            actor_id=actor_id,
            action_type=action_type,
            target_ticket_id=target_ticket_id,
            target_user_id=target_user_id,
            before_value=before_value,
            after_value=after_value,
        ).save()
