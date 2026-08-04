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
        cloudinary_url = getattr(settings, "CLOUDINARY_URL", "")
        is_configured = (
            cloudinary_url
            and "key:secret@cloud_name" not in cloudinary_url
            and "changeme" not in cloudinary_url
        )

        if is_configured:
            try:
                import cloudinary.uploader

                result = cloudinary.uploader.upload(file_obj, folder="civic_lens_reports")
                return result["secure_url"]
            except Exception as exc:
                logger.error(
                    "Cloudinary upload failed: %s. Falling back to local stub storage.", exc
                )

        # Dev fallback — in production this branch should never execute.
        logger.warning("CLOUDINARY_URL not configured or invalid; using local media storage.")
        try:
            import os
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            
            # Ensure folder exists
            os.makedirs(os.path.join(settings.MEDIA_ROOT, "civic_lens_reports"), exist_ok=True)
            
            # Generate safe unique filename
            filename = f"civic_lens_reports/{uuid.uuid4().hex}.jpg"
            
            # Save file using django storage API
            file_obj.seek(0)
            saved_path = default_storage.save(filename, ContentFile(file_obj.read()))
            
            # Return relative media URL path
            return f"/media/{saved_path}"
        except Exception as e:
            logger.error("Failed to save media locally: %s. Using base64 SVG fallback.", e)
            import base64
            svg_content = (
                "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'>"
                "<rect width='100%' height='100%' fill='#1E293B'/>"
                "<circle cx='150' cy='90' r='25' fill='#38BDF8' opacity='0.2'/>"
                "<path d='M150 75 L162 105 L138 105 Z' fill='#38BDF8'/>"
                "<text x='50%' y='145' font-family='sans-serif' font-size='11' font-weight='bold' fill='#38BDF8' text-anchor='middle'>CITIZEN UPLOAD</text>"
                "<text x='50%' y='165' font-family='sans-serif' font-size='9' font-weight='bold' fill='#64748B' text-anchor='middle'>[Local Offline Sandbox]</text>"
                "</svg>"
            )
            encoded = base64.b64encode(svg_content.encode('utf-8')).decode('utf-8')
            return f"data:image/svg+xml;base64,{encoded}"


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
