"""
Django settings for Civic Lens backend.

Consistent with:
- TDD v1.0 Section 1 (Tech Stack), Section 6 (Database Selection: MongoDB/mongoengine),
  Section 7-8 (Auth/Authz Strategy), Section 22 (Configuration Strategy - env-driven feature flags)
- System Architecture Document Section 10 (Caching), Section 21 (High Availability)
- API Design Document Section 15 (Rate Limiting)
"""
import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Core / Security
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "insecure-dev-key-change-me")
DEBUG = os.getenv("DEBUG", "False") == "True"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    # Civic Lens modules (per TDD Section 5 - Modular Monolith)
    "apps.users",
    "apps.reports",
    "apps.tickets",
    "apps.analytics",
    "apps.notifications",
    "apps.audit",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "common.middleware.RequestLoggingMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": []},
    },
]

# ---------------------------------------------------------------------------
# Database — MongoDB via mongoengine (Database Design Document Section 1)
# No relational DATABASES entry is required for app data; a minimal sqlite
# stub is kept only because some Django internals expect DATABASES to exist.
# ---------------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "django_internal.sqlite3",
    }
}

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/civic_lens")

from mongoengine import connect  # noqa: E402

connect(host=MONGODB_URI, alias="default")

# ---------------------------------------------------------------------------
# DRF Configuration
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "UNAUTHENTICATED_USER": None,
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "common.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "common.pagination.CursorPagination",
    "PAGE_SIZE": 20,
    "EXCEPTION_HANDLER": "common.exceptions.civic_lens_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [
        "common.throttling.AuthenticatedUserThrottle",
        "common.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        # Per API Design Document Section 15
        "auth_login": "5/min",
        "auth_signup": "3/min",
        "report_submit": "10/hour",
        "upvote": "20/hour",
        "support_request": "10/hour",
        "authenticated": "100/min",
        "anon": "60/min",
    },
}


# ---------------------------------------------------------------------------
# JWT settings (TDD Section 7)
# ---------------------------------------------------------------------------
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "insecure-jwt-key-change-me")
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_LIFETIME = timedelta(
    seconds=int(os.getenv("JWT_ACCESS_TOKEN_LIFETIME_SECONDS", "900"))
)
JWT_REFRESH_TOKEN_LIFETIME = timedelta(
    seconds=int(os.getenv("JWT_REFRESH_TOKEN_LIFETIME_SECONDS", "604800"))
)
REFRESH_TOKEN_COOKIE_NAME = "civic_lens_refresh_token"

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173"
).split(",")
CORS_ALLOW_CREDENTIALS = True

# ---------------------------------------------------------------------------
# Third-party services (TDD Section 16)
# ---------------------------------------------------------------------------
CLOUDINARY_URL = os.getenv("CLOUDINARY_URL", "")
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
ML_SERVICE_BASE_URL = os.getenv("ML_SERVICE_BASE_URL", "http://localhost:9000")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# ---------------------------------------------------------------------------
# Civic Lens domain configuration (TDD Section 15 & 22 - feature flags / tunables)
# ---------------------------------------------------------------------------
DUPLICATE_RADIUS_METERS = {
    "pothole": int(os.getenv("DUPLICATE_RADIUS_METERS_POTHOLE", "50")),
    "waterlogging": int(os.getenv("DUPLICATE_RADIUS_METERS_WATERLOGGING", "150")),
    "streetlight": int(os.getenv("DUPLICATE_RADIUS_METERS_STREETLIGHT", "75")),
    "garbage": int(os.getenv("DUPLICATE_RADIUS_METERS_GARBAGE", "75")),
    "other": int(os.getenv("DUPLICATE_RADIUS_METERS_GARBAGE", "75")),
}
ML_CONFIDENCE_THRESHOLD = float(os.getenv("ML_CONFIDENCE_THRESHOLD", "0.6"))
IMAGE_SIMILARITY_THRESHOLD = float(os.getenv("IMAGE_SIMILARITY_THRESHOLD", "0.85"))
UPVOTE_ESCALATION_THRESHOLD = int(os.getenv("UPVOTE_ESCALATION_THRESHOLD", "5"))
MARK_RESOLVED_ESCALATION_THRESHOLD = int(
    os.getenv("MARK_RESOLVED_ESCALATION_THRESHOLD", "3")
)
COMMENTS_FEATURE_ENABLED = os.getenv("COMMENTS_FEATURE_ENABLED", "True") == "True"
MODERATOR_ROLE_ENABLED = os.getenv("MODERATOR_ROLE_ENABLED", "True") == "True"
MAX_REPORT_IMAGE_SIZE_BYTES = 8 * 1024 * 1024  # 8MB, per FR-8 / API Design Section 6.1

# ---------------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------------
STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# Logging (TDD Section 14)
# ---------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "format": '{"level":"%(levelname)s","time":"%(asctime)s","module":"%(module)s","message":"%(message)s"}'
        },
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "json"},
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "civic_lens.audit": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}
