"""
Global exception handler producing the standard error envelope,
per API Design Document Section 3 and TDD Section 13.
"""
import logging

from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger("django")


class ApplicationError(Exception):
    """Base class for domain/business-rule errors raised from the service layer."""

    def __init__(self, code, message, status_code=400, details=None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


def civic_lens_exception_handler(exc, context):
    if isinstance(exc, ApplicationError):
        return _error_response(exc.code, exc.message, exc.status_code, exc.details)

    try:
        import pymongo.errors
        if isinstance(exc, pymongo.errors.PyMongoError):
            logger.error("MongoDB error: %s", exc)
            return _error_response(
                "DATABASE_UNREACHABLE",
                "Database connection error. Please ensure MongoDB is running locally (mongodb://localhost:27017) or MONGODB_URI is correctly configured in .env.",
                503,
            )
    except ImportError:
        pass

    response = drf_exception_handler(exc, context)
    if response is not None:
        code = "VALIDATION_ERROR" if response.status_code == 400 else "REQUEST_ERROR"
        message = _flatten_message(response.data)
        response.data = {
            "success": False,
            "error": {"code": code, "message": message, "details": response.data},
        }
        return response

    logger.exception("Unhandled exception: %s", exc)
    return _error_response(
        "INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500
    )



def _flatten_message(data):
    if isinstance(data, dict):
        for v in data.values():
            if isinstance(v, list) and v:
                return str(v[0])
            if isinstance(v, str):
                return v
    return "Request could not be processed."


def _error_response(code, message, status_code, details=None):
    from rest_framework.response import Response

    return Response(
        {"success": False, "error": {"code": code, "message": message, "details": details}},
        status=status_code,
    )
