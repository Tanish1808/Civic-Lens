"""
Service layer for tickets — TDD Section 19 (Algorithms) & Section 20 (Design Patterns).
"""
import math

from django.conf import settings

from .models import Photo, StatusHistoryEntry, Ticket

OPEN_STATUSES = ("reported", "verified", "acknowledged", "in_progress")


class DuplicateDetectionService:
    """
    Two-stage duplicate detection (TDD Section 19):
      Stage 1 - Geospatial filter via 2dsphere ($geoNear-equivalent query).
      Stage 2 - Visual confirmation via perceptual-hash pre-filter + embedding
                cosine similarity.
    """

    HAMMING_PRE_FILTER_THRESHOLD = 10  # bits; coarse pre-filter before cosine similarity

    @classmethod
    def find_match(cls, report):
        radius_meters = settings.DUPLICATE_RADIUS_METERS.get(
            report.ml_category, settings.DUPLICATE_RADIUS_METERS["other"]
        )

        candidates = Ticket.objects(
            category=report.ml_category,
            status__in=OPEN_STATUSES,
            is_flagged_spam=False,
            location__near=report.location,
            location__max_distance=radius_meters,
        )

        best_match = None
        best_score = 0.0
        for candidate in candidates:
            score = cls._visual_similarity_score(report, candidate)
            if score >= settings.IMAGE_SIMILARITY_THRESHOLD and score > best_score:
                best_match = candidate
                best_score = score

        return best_match

    @classmethod
    def _visual_similarity_score(cls, report, candidate_ticket):
        """
        Calculates visual similarity between a report and candidate ticket photo reports
        via perceptual hash pre-filtering and embedding vector cosine similarity
        (TDD Section 19 - Stage 2 Visual Confirmation).
        """
        if not report.embedding_vector and not report.perceptual_hash:
            return 0.0

        from apps.reports.models import Report

        candidate_reports = Report.objects(merged_into_ticket_id=str(candidate_ticket.id))
        max_score = 0.0

        for cand_report in candidate_reports:
            # Stage 2a: Perceptual hash pre-filter (Hamming distance)
            if report.perceptual_hash and cand_report.perceptual_hash:
                try:
                    h1 = int(report.perceptual_hash, 16)
                    h2 = int(cand_report.perceptual_hash, 16)
                    diff = bin(h1 ^ h2).count("1")
                    if diff > cls.HAMMING_PRE_FILTER_THRESHOLD:
                        continue
                except ValueError:
                    pass

            # Stage 2b: CNN Embedding vector cosine similarity
            if report.embedding_vector and cand_report.embedding_vector:
                v1 = report.embedding_vector
                v2 = cand_report.embedding_vector
                dot_product = sum(a * b for a, b in zip(v1, v2))
                norm1 = math.sqrt(sum(a * a for a in v1))
                norm2 = math.sqrt(sum(b * b for b in v2))
                if norm1 > 0 and norm2 > 0:
                    similarity = dot_product / (norm1 * norm2)
                    if similarity > max_score:
                        max_score = similarity

        return max_score



class TicketMergeService:
    @staticmethod
    def create_new_ticket(report):
        import random
        zones = [
            "West Zone (Navrangpura)",
            "North West (Bodakdev)",
            "South Zone (Maninagar)",
            "East Zone (Nikol)",
            "Central Zone (Kalupur)"
        ]
        ticket = Ticket(
            category=report.ml_category or report.user_selected_category or "other",
            severity=report.ml_severity or "low",
            location=report.location,
            report_count=1,
            photos=[Photo(url=report.photo_url, uploaded_by=report.user_id)],
            zone_id=random.choice(zones)
        )
        ticket.append_status_history("reported", changed_by="system")
        ticket.save()
        return ticket

    @staticmethod
    def merge_report_into_ticket(report, ticket):
        ticket.photos.append(Photo(url=report.photo_url, uploaded_by=report.user_id))
        ticket.report_count += 1
        ticket.save()
        SeverityEscalationService.maybe_escalate(ticket)
        return ticket


class SeverityEscalationService:
    """
    A ticket's `verified` status is automatically set once
    report_count + upvote_count crosses a configurable threshold,
    independent of ML-assigned severity (TDD Section 19).
    """

    @staticmethod
    def maybe_escalate(ticket):
        total_signal = ticket.report_count + ticket.upvote_count
        if ticket.status == "reported" and total_signal >= settings.UPVOTE_ESCALATION_THRESHOLD:
            ticket.status = "verified"
            ticket.append_status_history(
                "verified", changed_by="system", note="Auto-verified: threshold crossed"
            )
            ticket.save()
