# Civic Lens — Backend API

> Django REST Framework API powering the Civic Lens platform — handles citizen report ingestion, AI-assisted classification and de-duplication, ticket lifecycle management, RBAC-secured admin operations, and real-time notifications for a municipal civic issue reporting system.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup & Migrations](#database-setup--migrations)
- [Available Scripts](#available-scripts)
- [API Endpoints Overview](#api-endpoints-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Logging & Monitoring](#logging--monitoring)
- [Docker & Deployment](#docker--deployment)
- [Contributing Guidelines](#contributing-guidelines)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Python 3.12 |
| Framework | Django 5.0 + Django REST Framework 3.15 |
| Primary Database | MongoDB (via MongoEngine 0.29 ODM) |
| Internal DB stub | SQLite (Django internals only — not used for app data) |
| Caching / Rate-limit store | Redis 5.x |
| Image Storage | Cloudinary (falls back to local `media/` in dev) |
| Authentication | Custom PyJWT (HS256) — access + refresh token pair |
| Email | SendGrid |
| ML Service | External HTTP service (AI classification + image similarity) |
| OAuth | Google OAuth 2.0 |
| WSGI server | Gunicorn |
| Error Monitoring | Sentry SDK |
| Containerization | Docker (python:3.12-slim base) |

---

## Architecture Overview

The backend follows a **Modular Monolith with a Service Layer** pattern, implemented as a set of cohesive Django apps under a single process.

```
HTTP Request
    |
    v
CORS Middleware (django-cors-headers)
    |
    v
SecurityMiddleware
    |
    v
RequestLoggingMiddleware        <- logs method, path, status, duration
    |
    v
DRF Router -> View (APIView)    <- input validation via DRF Serializers
    |
    v
Permission / Throttle Check     <- RBAC (IsAuthenticated / IsAdmin / IsAdminOrModerator)
    |
    v
Service Layer                   <- all business logic (ReportSubmissionService,
    |                              DuplicateDetectionService, TicketMergeService,
    |                              NotificationService, AuditService)
    v
MongoEngine ODM -> MongoDB      <- primary data store
    |
    v
Standard JSON Response Envelope <- { success, data } or { success, error }
```

### Django Apps

| App | Responsibility |
|---|---|
| `apps.users` | Authentication (signup/login/refresh/logout/Google OAuth), user profile, leaderboard, support requests |
| `apps.reports` | Report submission, image upload, ML classification dispatch, manual review queue |
| `apps.tickets` | Ticket read/write, upvoting, community resolution signals, comments, admin CRUD |
| `apps.analytics` | Aggregated stats for the admin dashboard (overview, category breakdown, resolution trend, area density) |
| `apps.notifications` | In-app notification delivery tracking (SendGrid email + in-app) |
| `apps.audit` | Append-only audit log for all admin actions |
| `common` | Shared utilities: JWT auth class, permissions, throttling, response helpers, cursor pagination, exception handler |

---

## Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| Python | **3.12** | Matches Dockerfile base image |
| pip | any current | Use a virtual environment |
| MongoDB | **6.x** | Must be running locally or provide `MONGODB_URI` |
| Redis | **6.x** | Required for rate limiting; optional for dev if throttle backends are swapped |
| Cloudinary account | — | Optional for dev — falls back to `media/` local storage |
| SendGrid account | — | Optional for dev — email delivery silently fails |

---

## Project Structure

```
civic_lens_backend/
|-- manage.py                   # Django management entry point
|-- requirements.txt            # All Python dependencies (pinned)
|-- Dockerfile                  # python:3.12-slim; runs gunicorn on port 8000
|-- .env.example                # Environment variable template -- copy to .env
|-- test_api_suite.py           # Integration smoke-test script (plain requests)
|-- django_internal.sqlite3     # SQLite stub (Django internals only)
|
|-- config/                     # Django project configuration
|   |-- settings.py             # All settings, loaded from environment variables
|   |-- urls.py                 # Root URL router; all routes under /api/v1/
|   |-- wsgi.py                 # WSGI entry point (Gunicorn)
|   `-- asgi.py                 # ASGI entry point (future use)
|
|-- common/                     # Shared cross-cutting utilities
|   |-- authentication.py       # Custom DRF JWT authentication backend
|   |-- jwt_utils.py            # Access/refresh token generation & decoding (PyJWT)
|   |-- permissions.py          # RBAC: IsAuthenticated, IsAdmin, IsAdminOrModerator
|   |-- throttling.py           # Rate-limit classes backed by Redis cache
|   |-- pagination.py           # Cursor-based pagination (base64 ObjectId cursors)
|   |-- exceptions.py           # Global exception handler + ApplicationError base class
|   |-- middleware.py           # RequestLoggingMiddleware (method/path/status/duration)
|   |-- response.py             # Standard response envelope helpers
|   `-- validators.py           # Shared field-level validators
|
`-- apps/                       # Django application modules
    |-- users/                  # Auth, profile, leaderboard, support requests
    |   |-- models.py           # User, RefreshToken, SupportRequest (MongoEngine Documents)
    |   |-- serializers.py      # Input validation for signup, login, Google OAuth, etc.
    |   |-- views.py            # Auth + profile + leaderboard + support-request endpoints
    |   |-- urls_auth.py        # Routes under /api/v1/auth/
    |   `-- urls.py             # Routes under /api/v1/users/
    |
    |-- reports/                # Report ingestion, ML orchestration, manual review
    |   |-- models.py           # Report, ManualReviewQueueEntry (MongoEngine Documents)
    |   |-- serializers.py      # ReportSubmitSerializer, AttachPhotoSerializer
    |   |-- services.py         # ImageStorageService, ReportSubmissionService
    |   |-- views.py            # Citizen + admin report endpoints
    |   `-- urls.py             # Routes under /api/v1/reports/ and /api/v1/admin/
    |
    |-- tickets/                # Ticket read/write, upvotes, comments, admin management
    |   |-- models.py           # Ticket, Upvote, Comment, ResolutionSignal (MongoEngine)
    |   |-- serializers.py      # Ticket output serializer
    |   |-- services.py         # DuplicateDetectionService, TicketMergeService
    |   |-- views.py            # Citizen ticket endpoints
    |   |-- admin_views.py      # Admin ticket management endpoints
    |   `-- urls.py             # Routes under /api/v1/tickets/ and /api/v1/admin/tickets/
    |
    |-- analytics/              # Admin analytics aggregations
    |   |-- views.py            # Overview, category breakdown, severity, resolution trend
    |   `-- urls.py             # Routes under /api/v1/admin/analytics/
    |
    |-- notifications/          # In-app notification store
    |   |-- models.py           # Notification (MongoEngine Document)
    |   |-- services.py         # NotificationService (creates + dispatches via SendGrid)
    |   |-- views.py            # GET /api/v1/notifications
    |   `-- urls.py             # Routes under /api/v1/notifications/
    |
    `-- audit/                  # Append-only admin audit trail
        |-- models.py           # AuditLog (MongoEngine Document)
        |-- services.py         # AuditService.log() helper
        |-- views.py            # GET /api/v1/admin/audit-logs
        `-- urls.py             # Routes under /api/v1/admin/
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/Civic-Lens.git
cd Civic-Lens/civic_lens_backend
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your actual values. At minimum, set `MONGODB_URI` and both secret keys. See [Environment Variables](#environment-variables) for the full reference.

### 5. Start required services

```bash
# MongoDB (must be running before starting Django)
mongod --dbpath /data/db        # or use MongoDB Atlas and set MONGODB_URI

# Redis (required for rate limiting)
redis-server
```

### 6. Run the development server

```bash
python manage.py runserver
```

The API will be available at **`http://localhost:8000`**.

> MongoDB collections and indexes are created automatically by MongoEngine on first write. No migration command is required for application data.

### 7. Verify the server is working

```bash
# Quick health check
curl http://localhost:8000/health

# Run the full integration smoke-test suite
python test_api_suite.py
```

---

## Environment Variables

Copy `.env.example` to `.env` and populate the values below. **Never commit `.env` to version control.**

| Variable | Description | Required | Default / Example |
|---|---|---|---|
| `DEBUG` | Enable Django debug mode | Y | `True` (dev), `False` (prod) |
| `DJANGO_SECRET_KEY` | Django cryptographic secret key | Y | `change-me` |
| `MONGODB_URI` | MongoDB connection string | Y | `mongodb://localhost:27017/civic_lens` |
| `JWT_SECRET_KEY` | HMAC-SHA256 signing key for JWTs | Y | `change-me-too` |
| `JWT_ACCESS_TOKEN_LIFETIME_SECONDS` | Access token TTL in seconds | N | `900` (15 min) |
| `JWT_REFRESH_TOKEN_LIFETIME_SECONDS` | Refresh token TTL in seconds | N | `604800` (7 days) |
| `REDIS_URL` | Redis connection URL (rate-limit cache) | Y | `redis://localhost:6379/0` |
| `CLOUDINARY_URL` | Cloudinary connection URL for image storage | N | `cloudinary://key:secret@cloud_name` |
| `SENDGRID_API_KEY` | SendGrid API key for email notifications | N | `SG.xxxxx` |
| `ML_SERVICE_BASE_URL` | Base URL of the external ML microservice | Y | `http://localhost:9000` |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth 2.0 client ID | N | `xxx.apps.googleusercontent.com` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth 2.0 client secret | N | `GOCSPX-xxx` |
| `DUPLICATE_RADIUS_METERS_POTHOLE` | Geo-dedup radius for potholes (meters) | N | `50` |
| `DUPLICATE_RADIUS_METERS_WATERLOGGING` | Geo-dedup radius for waterlogging (meters) | N | `150` |
| `DUPLICATE_RADIUS_METERS_STREETLIGHT` | Geo-dedup radius for streetlights (meters) | N | `75` |
| `DUPLICATE_RADIUS_METERS_GARBAGE` | Geo-dedup radius for garbage reports (meters) | N | `75` |
| `ML_CONFIDENCE_THRESHOLD` | Min ML confidence to auto-classify (0-1) | N | `0.6` |
| `UPVOTE_ESCALATION_THRESHOLD` | Upvotes required to auto-escalate severity | N | `5` |
| `MARK_RESOLVED_ESCALATION_THRESHOLD` | Community "resolved" signals to trigger review | N | `3` |
| `SENTRY_DSN` | Sentry DSN for error tracking | N | *(empty = disabled)* |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames | Y | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | Y | `http://localhost:5173` |

---

## Database Setup & Migrations

### Application Data — MongoDB (MongoEngine)

Civic Lens uses **MongoEngine** as the ODM for all application data. There is **no Django-style migration workflow** for MongoDB — MongoEngine creates collections and enforces indexes automatically on first write.

Required MongoDB indexes (created automatically on first access):

| Collection | Indexes |
|---|---|
| `users` | `email`, `phone`, `google_oauth_id` |
| `refresh_tokens` | `jti`, `user_id` |
| `reports` | `user_id`, `location` (2dsphere), `-created_at` |
| `tickets` | `location` (2dsphere), `status`, `(category, severity)`, `-created_at` |
| `upvotes` | `(ticket_id, user_id)` unique compound |
| `comments` | `ticket_id`, `-created_at` |
| `resolution_signals` | `(ticket_id, user_id)` unique compound |
| `audit_logs` | `(actor_id, created_at)`, `-created_at` |
| `notifications` | `user_id`, `-created_at` |
| `support_requests` | `status`, `created_at` |
| `manual_review_queue` | `resolved` |

To manually ensure indexes after a model change:

```python
python manage.py shell
>>> from apps.tickets.models import Ticket
>>> Ticket.ensure_indexes()
```

### Internal Django State — SQLite

A minimal `django_internal.sqlite3` stub exists solely to satisfy Django internals that require a relational `DATABASES` entry. It contains **no application data**. Running `manage.py migrate` is not required unless a Django ORM model is added.

---

## Available Scripts

| Command | Description |
|---|---|
| `python manage.py runserver` | Start the Django development server on `http://localhost:8000` |
| `python manage.py runserver 0.0.0.0:8000` | Start dev server accessible on all interfaces |
| `python manage.py shell` | Open the Django interactive shell with all models available |
| `python manage.py collectstatic` | Collect static files into `STATIC_ROOT` (production only) |
| `python test_api_suite.py` | Run the integration smoke-test suite against a running server |
| `pip install -r requirements.txt` | Install all Python dependencies |

---

## API Endpoints Overview

All endpoints are prefixed with `/api/v1/` unless noted. Pagination uses cursor-based navigation via `?cursor=<token>&limit=<n>` query parameters (default limit: 20, max: 100).

### Health

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Server health check | No |

### Authentication (`/api/v1/auth/`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | Register a new citizen account | No |
| `POST` | `/api/v1/auth/login` | Authenticate and receive access + refresh tokens | No |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token and issue a new access token | Cookie |
| `POST` | `/api/v1/auth/logout` | Revoke the current refresh token | Cookie |
| `POST` | `/api/v1/auth/google` | Sign in / sign up via Google OAuth 2.0 ID token | No |

### Users & Profile

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | Get the authenticated user's profile | Citizen |
| `PATCH` | `/api/v1/users/me` | Update profile fields (full_name, phone) | Citizen |
| `GET` | `/api/v1/users/leaderboard` | Top citizens ranked by civic score | No |

### Support Requests

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/support-requests` | Submit a municipal onboarding support request | No |
| `GET` | `/api/v1/admin/support-requests` | List all support requests | Admin |
| `POST` | `/api/v1/admin/support-requests/<request_id>/process` | Mark a support request as processed | Admin |

### Reports

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/reports` | Submit a new civic report (image + geolocation) | Citizen |
| `DELETE` | `/api/v1/reports/<report_id>` | Delete a report (owner only) | Citizen (owner) |
| `GET` | `/api/v1/reports/<report_id>/status` | Poll report processing status | Citizen (owner) |
| `GET` | `/api/v1/my-reports` | List the authenticated citizen's own reports | Citizen |
| `POST` | `/api/v1/tickets/<ticket_id>/attach-photo` | Attach an additional photo to an existing ticket | Citizen |

### Manual Review Queue

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/admin/manual-review-queue` | List unresolved items awaiting human review | Admin / Moderator |
| `PATCH` | `/api/v1/admin/manual-review-queue/<report_id>/resolve` | Resolve a queue entry (assign category + severity) | Admin / Moderator |

### Tickets (Public)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/tickets` | List tickets (filterable by status, category, severity, bounding box) | No |
| `GET` | `/api/v1/tickets/search` | Full-text / geo search for tickets | No |
| `GET` | `/api/v1/tickets/<ticket_id>` | Detailed ticket with status history and photos | No |
| `POST` | `/api/v1/tickets/<ticket_id>/upvote` | Upvote a ticket | Citizen |
| `POST` | `/api/v1/tickets/<ticket_id>/mark-resolved` | Signal that the citizen believes the issue is resolved | Citizen |
| `GET` | `/api/v1/tickets/<ticket_id>/comments` | List comments on a ticket | No |
| `POST` | `/api/v1/tickets/<ticket_id>/comments` | Post a comment on a ticket | Citizen |

### Tickets (Admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/admin/tickets` | List all tickets with admin metadata | Admin |
| `PATCH` | `/api/v1/admin/tickets/<ticket_id>/status` | Update a ticket's lifecycle status | Admin |
| `PATCH` | `/api/v1/admin/tickets/<ticket_id>/override` | Override ML-assigned category/severity | Admin |
| `POST` | `/api/v1/admin/tickets/<ticket_id>/flag-spam` | Flag a ticket as spam | Admin |
| `POST` | `/api/v1/admin/tickets/<ticket_id>/unflag-spam` | Remove spam flag from a ticket | Admin |
| `PATCH` | `/api/v1/admin/tickets/bulk-status` | Bulk-update status on multiple tickets | Admin |

### Analytics

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/admin/analytics/overview` | KPI summary: total, open, resolved, avg resolution time | Admin |
| `GET` | `/api/v1/admin/analytics/category-breakdown` | Ticket count by issue category | Admin |
| `GET` | `/api/v1/admin/analytics/severity-distribution` | Ticket count by severity level | Admin |
| `GET` | `/api/v1/admin/analytics/resolution-trend` | Resolved vs. reported counts over time | Admin |
| `GET` | `/api/v1/admin/analytics/area-density` | Ticket density by geographic area | Admin |
| `GET` | `/api/v1/analytics/wards` | Public ward-level analytics for the civic leaderboard | No |

### Notifications

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | List the authenticated citizen's in-app notifications | Citizen |

### Audit Log

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/admin/audit-logs` | Paginated, immutable audit trail of all admin actions | Admin |

> No Swagger / OpenAPI spec is currently generated. <!-- TODO: confirm with team — consider adding drf-spectacular -->

---

## Authentication & Authorization

### Token Flow

1. **Signup / Login** — server returns an `access_token` in the JSON body and sets a `civic_lens_refresh_token` HttpOnly, Secure, SameSite=Strict cookie.
2. **Authenticated requests** — client sends `Authorization: Bearer <access_token>` in the request header.
3. **Token refresh** — `POST /api/v1/auth/refresh` reads the cookie and issues a new access token + rotated refresh token (persisted in the `refresh_tokens` MongoDB collection).
4. **Logout** — `POST /api/v1/auth/logout` marks the refresh token's `jti` as revoked in MongoDB; the cookie is cleared.
5. **Google OAuth** — `POST /api/v1/auth/google` validates a Google ID token; creates or retrieves the user, then follows the same token issuance flow.

### JWT Claims

```json
{
  "type": "access",
  "sub": "<user_id>",
  "role": "citizen | moderator | admin | super_admin",
  "email": "user@example.com",
  "name": "Full Name",
  "iat": 1234567890,
  "exp": 1234568790
}
```

Algorithm: **HS256**. Signing key: `JWT_SECRET_KEY` environment variable.

### Role-Based Access Control (RBAC)

| Role | Capabilities |
|---|---|
| `citizen` | Submit reports, upvote, comment, mark-resolved, view own reports and notifications |
| `moderator` | All citizen capabilities + manual review queue access |
| `admin` | All moderator capabilities + full ticket management, analytics, audit log, support requests |
| `super_admin` | All admin capabilities (reserved for future user management features) |

> Sensitive admin endpoints re-query MongoDB to verify the user's role on every request, guarding against stale JWT claims after a role demotion.

### Rate Limits (Redis-backed)

| Scope | Limit |
|---|---|
| `auth_login` | 5 / minute |
| `auth_signup` | 3 / minute |
| `report_submit` | 10 / hour |
| `upvote` | 20 / hour |
| `support_request` | 10 / hour |
| `authenticated` (global) | 100 / minute |
| `anon` (global) | 60 / minute |

---

## Error Handling

All error responses use a standard JSON envelope enforced by `common/exceptions.py`:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description.",
    "details": null
  }
}
```

All success responses:

```json
{
  "success": true,
  "data": { ... }
}
```

Paginated success responses append a `meta` key:

```json
{
  "success": true,
  "data": { "tickets": [ ... ] },
  "meta": {
    "pagination": {
      "next_cursor": "<base64-encoded-cursor>",
      "has_more": true
    }
  }
}
```

### Standard Error Codes

| Code | HTTP Status | Trigger |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid access token |
| `FORBIDDEN` | 403 | Authenticated but insufficient role |
| `NOT_FOUND` | 404 | Resource does not exist |
| `ALREADY_REGISTERED` | 409 | Email or phone already in use |
| `VALIDATION_ERROR` | 400 | DRF serializer validation failure |
| `REQUEST_ERROR` | 4xx | Generic DRF-handled client error |
| `DATABASE_UNREACHABLE` | 503 | MongoDB connection failure |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled exception |

---

## Testing

### Integration Smoke-Test Suite

A lightweight integration suite (`test_api_suite.py`) exercises critical flows against a live server:

```bash
# Ensure the server is running first
python manage.py runserver

# In a second terminal — run the suite
python test_api_suite.py

# Target a different server
API_BASE_URL=http://staging.example.com/api/v1 python test_api_suite.py
```

Covered scenarios:
- `GET /health` — server reachability
- `GET /api/v1/tickets` — public ticket list (MongoDB connectivity check)
- `POST /api/v1/auth/signup` — citizen registration flow

### Unit / Integration Tests

<!-- TODO: confirm with team — no pytest or Django TestCase files were found. Formal test modules have not been added yet. Recommended setup: -->

```bash
pip install pytest pytest-django mongomock

# Run tests
pytest
```

---

## Logging & Monitoring

### Request Logging

Every HTTP request is logged by `RequestLoggingMiddleware` in structured JSON to stdout:

```
{"level":"INFO","time":"...","module":"middleware","message":"GET /api/v1/tickets -> 200 (42ms)"}
```

### Log Configuration

All Django log records use a JSON formatter (`settings.LOGGING`):

```json
{"level":"INFO","time":"2026-08-07 12:00:00,000","module":"views","message":"..."}
```

The `civic_lens.audit` logger is reserved for admin audit events and is configured independently (no propagation to the root logger) to avoid duplicate entries.

### Sentry

Error monitoring is integrated via `sentry-sdk`. Set `SENTRY_DSN` in `.env` to enable automatic exception capture. An empty `SENTRY_DSN` silently disables Sentry.

<!-- TODO: confirm with team — verify that sentry_sdk.init() is called at application startup -->

### Cache Invalidation

`Ticket.save()` calls `cache.delete()` on the analytics cache key automatically, ensuring admin analytics views never serve stale data after a ticket mutation.

---

## Docker & Deployment

### Build the Docker Image

```bash
docker build -t civic-lens-backend .
```

### Run the Container

```bash
docker run -p 8000:8000 \
  --env-file .env \
  civic-lens-backend
```

The container runs Gunicorn with **3 workers** bound to `0.0.0.0:8000`.

### Docker Compose

<!-- TODO: confirm with team — no docker-compose.yml was found in the repository. Example below for reference. -->

```yaml
# docker-compose.yml (example -- not present in repo)
version: "3.9"
services:
  api:
    build: ./civic_lens_backend
    ports:
      - "8000:8000"
    env_file: ./civic_lens_backend/.env
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine

volumes:
  mongo_data:
```

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Use a cryptographically strong `DJANGO_SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Set `ALLOWED_HOSTS` to your production domain(s)
- [ ] Set `CORS_ALLOWED_ORIGINS` to your frontend origin only
- [ ] Configure `CLOUDINARY_URL` for persistent image storage
- [ ] Configure `SENDGRID_API_KEY` for email notifications
- [ ] Set `SENTRY_DSN` for production error tracking
- [ ] Run behind a reverse proxy (Nginx / Caddy) that terminates TLS
- [ ] Ensure the refresh token cookie `Secure` flag is honoured (HTTPS only)
- [ ] Run `python manage.py collectstatic` before starting the container

---

## Contributing Guidelines

1. **Branch naming:** `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
2. **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
3. **No secrets:** Never commit `.env`, credentials, or API keys. Use environment variables exclusively.
4. **Service layer:** Business logic belongs in `services.py` — views should only handle HTTP input/output concerns.
5. **Error responses:** Always raise `ApplicationError` from the service layer or return `common.response.error(...)` from views. Never return raw dicts or allow unhandled exceptions to propagate.
6. **New endpoints:** Add to the corresponding app's `urls.py` and document the endpoint in `README.md`.
7. **Pull Requests:** At least one reviewer approval is required before merging to `main`.

---

<!-- TODO: confirm with team -- no LICENSE file was found in the repository root -->
