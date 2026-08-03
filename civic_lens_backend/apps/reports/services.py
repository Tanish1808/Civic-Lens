"""
Service layer for report submission — orchestrates the flow described in
System Architecture Document Section 15 (File Upload Flow) and Section 22
(Sequence Diagram: Report Submission -> Ticket Creation/Merge).

Business logic lives here, not in the views (TDD Section 5 - Layered
Architecture / Service Layer Pattern).
"""
import logging
import uuid

import requests
from django.conf import settings

from apps.tickets.services import DuplicateDetectionService, TicketMergeService

from .models import ManualReviewQueueEntry, Report

logger = logging.getLogger("django")


class ImageStorageService:
    """
    Wraps Cloudinary upload (System Architecture Document Section 15).
    Falls back to a stub "local" URL scheme when Cloudinary isn't configured,
    so the API remains runnable in a bare development environment.
    """

    @staticmethod
    def upload(file_obj):
        if settings.CLOUDINARY_URL:
            import cloudinary.uploader

            result = cloudinary.uploader.upload(file_obj, folder="civic_lens_reports")
            return result["secure_url"]

        # Dev fallback — in production this branch should never execute.
        logger.warning("CLOUDINARY_URL not configured; using stub image URL.")
        return f"https://stub-storage.local/civic_lens_reports/{uuid.uuid4().hex}.jpg"


class MLClient:
    """
    Thin internal HTTP client to the FastAPI ML inference service
    (TDD Section 5, System Architecture Document Section 15).
    """

    TIMEOUT_SECONDS = 8

    @classmethod
    def infer(cls, image_url):
        """
        Returns dict: {category, severity, confidence, embedding, perceptual_hash}
        Returns None on failure/timeout — caller must route to manual review
        per PRD Reliability NFR / Failure Scenarios (System Architecture Doc Section 20).
        """
        try:
            resp = requests.post(
                f"{settings.ML_SERVICE_BASE_URL}/infer",
                json={"image_url": image_url},
                timeout=cls.TIMEOUT_SECONDS,
            )
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as exc:
            logger.error("ML service unreachable/timeout: %s", exc)
            return None


class ReportSubmissionService:
    """
    Orchestrates the full report submission pipeline. In production this
    dispatch would run asynchronously via Celery/Django-Q (System
    Architecture Document Section 11); here `process` is written so it can
    be invoked either synchronously (dev/test) or from a background task
    without changes.
    """

    @staticmethod
    def submit(user, image_file, latitude, longitude, user_selected_category, description):
        photo_url = ImageStorageService.upload(image_file)

        report = Report(
            user_id=str(user.id),
            photo_url=photo_url,
            location={"type": "Point", "coordinates": [longitude, latitude]},
            user_selected_category=user_selected_category,
            description=description,
            status="processing",
        )
        report.save()

        # In production this call is dispatched to a background worker;
        # invoked inline here to keep behavior deterministic for the API contract.
        ReportSubmissionService.process(report)
        return report

    @staticmethod
    def process(report):
        inference = MLClient.infer(report.photo_url)

        if inference is None:
            # ML service unreachable -> graceful degradation to manual review
            # (System Architecture Document Section 20 - Failure Scenarios)
            ReportSubmissionService._route_to_manual_review(report, "ml_service_unreachable")
            return

        report.ml_category = inference.get("category")
        report.ml_severity = inference.get("severity")
        report.ml_confidence = inference.get("confidence")
        report.perceptual_hash = inference.get("perceptual_hash")
        report.embedding_vector = inference.get("embedding")
        report.status = "classified"
        report.save()

        if (report.ml_confidence or 0) < settings.ML_CONFIDENCE_THRESHOLD:
            ReportSubmissionService._route_to_manual_review(report, "low_confidence")
            return

        ReportSubmissionService._run_duplicate_detection_and_merge(report)

    @staticmethod
    def _route_to_manual_review(report, reason):
        report.status = "manual_review"
        report.save()
        ManualReviewQueueEntry(report_id=str(report.id), reason=reason).save()

    @staticmethod
    def _run_duplicate_detection_and_merge(report):
        try:
            candidate_ticket = DuplicateDetectionService.find_match(report)
        except Exception as exc:  # noqa: BLE001
            # Duplicate-check timeout/error -> fall back to creating a new
            # ticket rather than blocking submission (System Architecture
            # Document Section 20), flagged for admin review.
            logger.error("Duplicate detection failed: %s", exc)
            ticket = TicketMergeService.create_new_ticket(report)
            ManualReviewQueueEntry(
                report_id=str(report.id), reason="duplicate_check_skipped"
            ).save()
            report.status = "ticket_created"
            report.merged_into_ticket_id = str(ticket.id)
            report.save()
            return

        if candidate_ticket is not None:
            TicketMergeService.merge_report_into_ticket(report, candidate_ticket)
            report.status = "merged"
            report.merged_into_ticket_id = str(candidate_ticket.id)
            report.save()
        else:
            ticket = TicketMergeService.create_new_ticket(report)
            report.status = "ticket_created"
            report.merged_into_ticket_id = str(ticket.id)
            report.save()
