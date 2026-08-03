"""Request lifecycle logging middleware, per TDD Section 14 (Logging Strategy)."""
import logging
import time

logger = logging.getLogger("django")


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start) * 1000)
        logger.info(
            "%s %s -> %s (%sms)",
            request.method,
            request.path,
            response.status_code,
            duration_ms,
        )
        return response
