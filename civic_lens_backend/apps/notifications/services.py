"""
Notification dispatch service — TDD Section 14 (Email Flow) & System
Architecture Document Section 13. In production, `dispatch` is enqueued
onto the background task queue (Celery/Django-Q with Redis broker per
System Architecture Document Section 12) rather than called synchronously
from the request/response cycle.
"""
import logging

from django.conf import settings

from .models import Notification

logger = logging.getLogger("django")

MAX_SEND_ATTEMPTS = 3


class NotificationService:
    @staticmethod
    def notify_status_change(user_id, ticket_id, new_status):
        notification = Notification(user_id=user_id, ticket_id=ticket_id, type="status_change")
        notification.save()
        NotificationService._dispatch_email(
            user_id,
            subject=f"Your reported issue status changed to {new_status}",
            notification=notification,
        )

    @staticmethod
    def notify_merge_confirmation(user_id, ticket_id):
        notification = Notification(user_id=user_id, ticket_id=ticket_id, type="merge_confirmation")
        notification.save()
        NotificationService._dispatch_email(
            user_id,
            subject="Your report was added to an existing tracked issue",
            notification=notification,
        )

    @staticmethod
    def _dispatch_email(user_id, subject, notification, attempt=1):
        if not settings.SENDGRID_API_KEY:
            logger.warning("SENDGRID_API_KEY not configured; skipping real send (dev stub).")
            notification.delivery_status = "sent"
            notification.save()
            return

        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail

            from apps.users.models import User

            user = User.objects(id=user_id).first()
            if not user:
                notification.delivery_status = "failed"
                notification.save()
                return

            message = Mail(
                from_email="noreply@civiclens.app",
                to_emails=user.email,
                subject=subject,
                plain_text_content=subject,
            )
            client = SendGridAPIClient(settings.SENDGRID_API_KEY)
            client.send(message)
            notification.delivery_status = "sent"
            notification.save()
        except Exception as exc:  # noqa: BLE001
            logger.error("Email send failed (attempt %s): %s", attempt, exc)
            if attempt < MAX_SEND_ATTEMPTS:
                NotificationService._dispatch_email(user_id, subject, notification, attempt + 1)
            else:
                notification.delivery_status = "failed"
                notification.save()
