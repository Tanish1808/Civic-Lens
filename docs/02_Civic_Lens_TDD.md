# Technical Design Document (TDD)
# Civic Lens — AI-Powered Civic Issue Reporting & Transparency Platform

## Document Control

| Field | Detail |
|---|---|
| **Document Version** | 1.0 |
| **Date** | July 27, 2026 |
| **Author** | Engineering Design Team |
| **Status** | Draft — Pending Approval |
| **Depends On** | Document 1 — PRD v1.0 |

### Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | July 27, 2026 | Engineering Design Team | Initial draft, consistent with PRD v1.0 |

---

## Table of Contents

1. Overall Technology Stack
2. Why Each Technology Was Selected
3. Alternatives Considered
4. Frontend Architecture
5. Backend Architecture
6. Database Selection
7. Authentication Strategy
8. Authorization Strategy
9. State Management
10. Folder Structure
11. Coding Standards
12. Naming Conventions
13. Error Handling Strategy
14. Logging Strategy
15. Environment Variables
16. Third-Party Services
17. External APIs
18. Data Structures
19. Algorithms
20. Design Patterns
21. Security Practices
22. Configuration Strategy
23. Deployment Strategy
24. CI/CD Strategy
25. Backup Strategy
26. Monitoring Strategy
27. Assumptions
28. References
29. Appendix

---

## 1. Overall Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Tailwind CSS |
| Backend | Django 5 + Django REST Framework |
| ML Inference Service | FastAPI + PyTorch |
| Database | MongoDB (Atlas), `mongoengine` ODM |
| Cache | Redis |
| Authentication | JWT (`djangorestframework-simplejwt`) |
| Hosting (MVP) | Render / Railway |
| Hosting (Production Scale) | AWS (EC2/ECS) |
| Image Storage | Cloudinary (or AWS S3) |
| Email Service | SendGrid |
| Maps/Heatmap | Leaflet.js (or Mapbox GL JS) |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Monitoring | Sentry + UptimeRobot |
| Containerization | Docker |

---

## 2. Why Each Technology Was Selected

| Technology | Reasoning |
|---|---|
| **React** | Component-driven architecture suits the repeated card/table/map patterns across citizen and admin views; large ecosystem for charting and mapping libraries |
| **Tailwind CSS** | Speeds up building a consistent, clean UI without heavy custom CSS overhead; enforces design-token discipline via utility classes |
| **Django + DRF** | Mature, batteries-included framework; built-in admin useful for internal developer tooling; DRF provides clean, versionable REST API structure; Python aligns naturally with the ML layer, easing code-sharing (e.g., shared image-preprocessing utilities) |
| **FastAPI (ML service)** | Async-first, lightweight, ideal for a narrowly scoped inference microservice; independent deployability from the Django monolith |
| **MongoDB** | Native `2dsphere` geospatial indexing is a direct fit for proximity-based duplicate detection; flexible schema accommodates evolving ticket/report structures without constant migrations |
| **Redis** | Sub-millisecond caching for frequently recomputed KPI/dashboard aggregations, reducing repeated MongoDB aggregation pipeline execution |
| **JWT** | Stateless authentication suited to a decoupled frontend/backend; supports embedding role claims for RBAC without a server-side session store |
| **Render/Railway → AWS** | Free/low-cost tiers sufficient for MVP; clear, low-friction upgrade path to AWS as scale/reliability requirements grow |
| **Cloudinary** | Dedicated image storage/CDN with built-in transformation (thumbnails, compression) — avoids storing binary blobs in MongoDB |
| **SendGrid** | Reliable transactional email delivery without managing SMTP infrastructure directly |
| **Leaflet.js** | Free, lightweight, strong plugin ecosystem for heatmap layers; no licensing cost concern for a pilot-stage project |
| **Docker** | Consistent environment parity between local development, ML training/inference, and production deployment |
| **GitHub Actions** | Native integration with source repository, sufficient CI/CD capability without a separate paid platform |
| **Sentry** | Real-time error tracking with stack traces across both frontend and backend, critical for a small team without dedicated QA infrastructure |

---

## 3. Alternatives Considered

| Decision | Alternative Considered | Reason Not Chosen |
|---|---|---|
| MongoDB | PostgreSQL + PostGIS | PostGIS is more mature/battle-tested for geospatial workloads, but project constraint specifically required MongoDB `2dsphere`; flagged as a valid alternative if constraint is lifted |
| Django | Node.js (Express/NestJS) | Python ecosystem better aligned with the ML training/inference pipeline, avoiding a language-boundary handoff for image processing |
| React | Vue.js | React has a larger ecosystem of mapping/charting libraries directly relevant to this project's dashboard-heavy requirements |
| FastAPI (separate ML service) | Embedding ML inference directly in Django views | Chosen microservice approach avoids coupling ML resource needs (potential GPU scaling) to the core API's scaling profile |
| JWT | Django session-based auth | Session auth is harder to scale across a decoupled SPA frontend and does not cleanly support future native mobile clients |
| Leaflet.js | Google Maps JavaScript API | Google Maps has usage-based billing that is less predictable for a budget-constrained MVP; Leaflet is fully free and sufficiently capable |
| Render/Railway | Heroku | Heroku no longer offers a meaningful free tier; Render/Railway currently offer better MVP-stage cost efficiency |

---

## 4. Frontend Architecture

- **Pattern**: Component-based SPA (Single Page Application) with React Router for navigation.
- **Structure**: Feature-based folder organization (see Section 10).
- **Data Fetching**: React Query for server-state caching, retries, and background refetching (dashboard KPIs, ticket lists).
- **Local UI State**: React `useState`/`useReducer`; Context API for cross-cutting concerns (auth state, theme).
- **Routing Map** (high-level; detailed page list in UI/UX Document):
  - `/` — Landing
  - `/report` — Submit issue
  - `/dashboard` — Public heatmap
  - `/my-reports` — Citizen's own reports
  - `/ticket/:id` — Ticket detail
  - `/login`, `/signup`
  - `/admin/*` — Admin dashboard (role-gated)
- **Error Boundaries**: Top-level React Error Boundary component wraps the app; feature-level boundaries around the map and chart components (isolate a chart-rendering failure from crashing the whole dashboard).

---

## 5. Backend Architecture

**Pattern: Layered Architecture within a Modular Monolith**

```
Client Request
   → Middleware (Auth, Logging, CORS)
   → URL Routing (DRF Routers)
   → Controller/View (DRF ViewSet)
   → Serializer (Validation/DTO layer)
   → Service Layer (business logic: duplicate detection, ticket merge logic)
   → Repository/Data Access Layer (mongoengine queries)
   → MongoDB
```

**Modules** (within the single Django project):
- `users` — auth, profile, roles
- `reports` — report submission, ML classification trigger, ML result handling
- `tickets` — ticket lifecycle, duplicate merge logic, upvotes
- `analytics` — admin KPI/aggregation endpoints
- `notifications` — email dispatch logic
- `audit` — admin action logging

**ML Inference Service** (separate FastAPI app):
- Exposes internal-only endpoints: `/classify`, `/severity`, `/similarity`
- Called by the `reports` module via internal HTTP request (not exposed publicly)
- Independently containerized and independently scalable

---

## 6. Database Selection

**Selected: MongoDB (Atlas)**

Justification:
- Native `2dsphere` geospatial index directly supports the "find tickets within X meters" duplicate-detection query without external geospatial extensions.
- Flexible document schema accommodates the ticket model's evolving structure (e.g., variable number of photos, variable report metadata) without frequent migrations.
- Atlas free tier is sufficient for MVP data volume (see Database Design Document for detailed schema and volume estimates).

---

## 7. Authentication Strategy

- **Mechanism**: JWT (access + refresh token pair) via `djangorestframework-simplejwt`.
- **Access Token**: Short-lived (~15 minutes), used for API authorization.
- **Refresh Token**: Longer-lived (~7 days), used to silently reissue access tokens.
- **Token Storage (Frontend)**: Access token in memory; refresh token in an HTTP-only secure cookie to mitigate XSS token theft.
- **Password Storage**: Django's default PBKDF2 (or Argon2 if configured) password hasher — never plaintext.
- **OAuth**: Google OAuth as an optional secondary login method, integrated via `django-allauth` or equivalent.
- **MFA Readiness**: Data model includes a placeholder `mfa_enabled` boolean field on the User model for future TOTP-based MFA; not implemented in MVP.

---

## 8. Authorization Strategy

- **Model**: Role-Based Access Control (RBAC).
- **Roles**: `citizen`, `moderator` (optional), `admin`, `super_admin` (future scope).
- **Enforcement**: DRF custom permission classes checked at the ViewSet level for every endpoint; role claim embedded in the JWT payload to avoid an extra database lookup per request for basic role checks (full permission re-validation still occurs server-side, not trusted purely from token claims for sensitive actions).
- **Admin Routes**: Additionally gated by DRF's `IsAdminUser`-style custom permission plus route-level checks; admin accounts are provisioned manually, not via public self-registration (see PRD FR-27).

---

## 9. State Management

| State Type | Tool |
|---|---|
| Server state (API data) | React Query |
| Auth state | React Context |
| Local UI state (forms, modals) | `useState`/`useReducer` |
| Map/filter state (dashboard) | URL query params (shareable/bookmarkable filtered views) + local state |

---

## 10. Folder Structure

### Backend (Django)
```
civic_lens_backend/
├── config/                  # settings, urls, wsgi/asgi
├── apps/
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   └── urls.py
│   ├── reports/
│   ├── tickets/
│   ├── analytics/
│   ├── notifications/
│   └── audit/
├── common/                  # shared utilities, base classes
├── tests/
├── requirements.txt
├── Dockerfile
└── manage.py
```

### ML Service (FastAPI)
```
civic_lens_ml_service/
├── app/
│   ├── main.py
│   ├── models/               # trained model artifacts (.pt/.h5)
│   ├── inference/
│   │   ├── classify.py
│   │   ├── severity.py
│   │   └── similarity.py
│   └── schemas.py
├── requirements.txt
└── Dockerfile
```

### Frontend (React)
```
civic_lens_frontend/
├── src/
│   ├── components/           # shared/reusable UI components
│   ├── features/
│   │   ├── auth/
│   │   ├── report/
│   │   ├── dashboard/
│   │   ├── ticket/
│   │   └── admin/
│   ├── hooks/
│   ├── services/              # API client modules
│   ├── context/
│   ├── routes/
│   └── App.jsx
├── package.json
└── Dockerfile
```

---

## 11. Coding Standards

- **Python**: PEP 8 compliance, enforced via `flake8`/`black` formatter in CI.
- **JavaScript/React**: ESLint + Prettier, Airbnb style guide baseline.
- **Type Safety**: Python type hints on all service-layer functions; PropTypes or JSDoc typing on React components (TypeScript recommended for future scope if team capacity allows).
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `chore:`, etc.) for readable history and changelog generation.

---

## 12. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Django models | PascalCase | `Ticket`, `Report` |
| Database fields | snake_case | `report_count`, `created_at` |
| API endpoints | kebab-case, plural nouns | `/api/v1/tickets/`, `/api/v1/my-reports/` |
| React components | PascalCase | `TicketDetailPage.jsx` |
| React hooks | camelCase, `use` prefix | `useTicketData()` |
| Environment variables | UPPER_SNAKE_CASE | `MONGODB_URI`, `JWT_SECRET_KEY` |

---

## 13. Error Handling Strategy

- **Backend**: Global DRF exception handler returns a standardized error envelope:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_CHECK_FAILED",
    "message": "Unable to verify duplicate status at this time.",
    "details": null
  }
}
```
- **ML Service Failure Handling**: If the FastAPI inference call times out or errors, the `reports` module catches this and routes the report to the manual review queue rather than surfacing a raw error to the user (per PRD Reliability NFR).
- **Frontend**: React Error Boundaries at app and feature level; API errors surfaced via toast notifications with user-friendly messages mapped from backend error codes.

---

## 14. Logging Strategy

- **Backend**: Python `logging` module, structured JSON log output for easier ingestion by monitoring tools.
- **Log Levels**: `DEBUG` (local only), `INFO` (request lifecycle), `WARNING` (recoverable issues, e.g., low-confidence ML result), `ERROR` (exceptions), `CRITICAL` (service-down scenarios).
- **Audit Logs**: Separate, append-only log/collection specifically for admin actions (status changes, overrides, suspensions) — distinct from general application logs, per PRD FR-34.
- **ML Service**: Logs inference latency and confidence scores per request to support future model performance monitoring.

---

## 15. Environment Variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET_KEY` | JWT signing secret |
| `JWT_ACCESS_TOKEN_LIFETIME` | Access token expiry configuration |
| `REDIS_URL` | Redis cache connection string |
| `CLOUDINARY_URL` | Cloudinary API credentials |
| `SENDGRID_API_KEY` | Email service credentials |
| `ML_SERVICE_BASE_URL` | Internal URL of the FastAPI ML service |
| `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth credentials |
| `DUPLICATE_RADIUS_METERS` | Configurable duplicate-detection radius (category-adjustable) |
| `ML_CONFIDENCE_THRESHOLD` | Minimum confidence before auto-classification is accepted |
| `SENTRY_DSN` | Error tracking endpoint |
| `DEBUG` | Environment flag (never `True` in production) |
| `ALLOWED_HOSTS` / `CORS_ALLOWED_ORIGINS` | Security configuration per environment |

All secrets managed via `.env` locally and the hosting provider's secret manager in staging/production — never committed to source control.

---

## 16. Third-Party Services

| Service | Purpose |
|---|---|
| Cloudinary | Image storage, CDN delivery, thumbnail transformation |
| SendGrid | Transactional email (status-change notifications) |
| Sentry | Error tracking (frontend + backend) |
| UptimeRobot | Uptime/availability monitoring |
| MongoDB Atlas | Managed database hosting with automated backups |

---

## 17. External APIs

| API | Purpose | Notes |
|---|---|---|
| Google OAuth API | Optional social login | Standard OAuth 2.0 flow |
| Browser Geolocation API | Client-side geotag capture | Native browser API, no external service dependency |
| Mapbox Geocoding API *(optional)* | Reverse geocoding (coordinates → readable address) | Only if address display is desired beyond raw coordinates |

---

## 18. Data Structures

- **GeoJSON Point** — used for all location fields (`{"type": "Point", "coordinates": [lng, lat]}`), MongoDB-native format compatible with `2dsphere` indexing.
- **Ticket Document** — nested array of `photos` (URLs), embedded `status_history` array (append-only log of status transitions with timestamp + actor).
- **Feature Vector** (image embeddings) — stored as a float array (fixed dimensionality, e.g., 512) alongside each report for similarity comparison; not exposed via public API.
- **Perceptual Hash** — stored as a string (hex) per photo for fast preliminary similarity filtering before more expensive embedding comparison.

---

## 19. Algorithms

### Duplicate Detection Algorithm (Two-Stage)
1. **Stage 1 — Geospatial Filter**: MongoDB `$geoNear` / `$geoWithin` query against the `2dsphere` index to retrieve candidate open tickets within a category-specific radius (e.g., 50m for potholes, 150m for waterlogging).
2. **Stage 2 — Visual Confirmation**: For each candidate, compute perceptual hash Hamming distance as a fast pre-filter; if below threshold, compute cosine similarity between CNN embeddings for a more precise confirmation.
3. **Decision**: If visual similarity exceeds the configured threshold, merge into the candidate ticket (highest similarity score wins if multiple candidates qualify); otherwise, create a new ticket.

### Severity Escalation Algorithm
- A ticket's `verified` status is automatically set once `report_count + upvote_count` crosses a configurable threshold (e.g., 5), independent of the ML-assigned severity — this reflects community corroboration, not just visual severity.

---

## 20. Design Patterns

| Pattern | Where Used |
|---|---|
| **Repository Pattern** | Data access layer abstracts `mongoengine` queries from service logic |
| **Service Layer Pattern** | Business logic (duplicate detection, merge logic) isolated from DRF views |
| **DTO Pattern** | DRF Serializers act as DTOs between API layer and internal domain models |
| **Strategy Pattern** | Category-specific duplicate-radius and similarity-threshold logic implemented as swappable strategies per category |
| **Observer Pattern** | Ticket status change triggers notification dispatch (email) without tightly coupling the ticket module to the notification module |
| **Singleton Pattern** | ML model loaded once per FastAPI worker process, not reloaded per request |

---

## 21. Security Practices

Covered in depth in the System Architecture and Database Design Documents; summarized here:
- OWASP Top 10 alignment (see Section 12 of PRD, expanded upon in System Architecture Document).
- JWT best practices: short-lived access tokens, refresh token rotation.
- Password hashing via Django's default secure hasher.
- RBAC enforced at every endpoint.
- CORS restricted to known frontend origins in production.
- Input validation at the serializer layer for every incoming request.
- Rate limiting on authentication and report-submission endpoints via DRF throttling.
- Secrets never committed to source control; managed via environment-specific secret storage.

---

## 22. Configuration Strategy

- Environment-specific settings files: `settings/base.py`, `settings/development.py`, `settings/production.py` (Django settings module split pattern).
- Feature flags (e.g., enabling/disabling the comments feature or moderator role) managed via environment variables to allow toggling Should-Have features without code redeploys.

---

## 23. Deployment Strategy

- **MVP Stage**: Render/Railway for both Django backend and FastAPI ML service; MongoDB Atlas managed database; Vercel/Netlify for the React frontend.
- **Production Scale**: Migration path to AWS (ECS/EKS for containerized services, S3 for static/image assets if moving off Cloudinary, RDS-equivalent managed database service if migrating away from Atlas).
- **Containerization**: Both backend and ML service Dockerized independently; `docker-compose` for local development orchestration.

---

## 24. CI/CD Strategy

- **Pipeline (GitHub Actions)**:
  1. On pull request: run linter, unit tests, and build check.
  2. On merge to `main`: run full test suite, build Docker images, push to container registry, trigger deployment to staging.
  3. Manual approval gate before production deployment.
- **Testing Gate**: No deployment proceeds if unit/integration test coverage thresholds are not met (target ≥70% for MVP, per Testing Requirements).

---

## 25. Backup Strategy

- **Database**: MongoDB Atlas automated daily backups (paid tier recommended before production launch, as free/shared tiers have backup limitations).
- **Images**: Cloudinary's own redundancy/storage durability relied upon; no separate backup pipeline needed for MVP.
- **Configuration**: Infrastructure-as-code / environment variable definitions version-controlled separately from secrets themselves.

---

## 26. Monitoring Strategy

- **Error Tracking**: Sentry integrated on both React frontend and Django backend.
- **Uptime Monitoring**: UptimeRobot free tier pinging key health-check endpoints.
- **Health Checks**: `/health` endpoint on both Django backend and FastAPI ML service, checked by the reverse proxy/load balancer and uptime monitor.
- **ML-Specific Monitoring**: Inference latency and confidence-score distribution logged for future model drift detection.

---

## 27. Assumptions

1. Team has working Python and JavaScript/React proficiency; no additional language onboarding required.
2. Render/Railway free tiers remain available and sufficient through the MVP timeline; migration to AWS is a post-pilot activity.
3. `mongoengine` is assumed viable for the project's geospatial query needs; to be validated early in Development Phase (Week 1–2) with a fallback to `djongo` or raw `pymongo` if limitations are found — **any such change will be documented as a Revision Note in this document.**
4. TypeScript is not adopted for MVP due to timeline constraints but is flagged as a maintainability improvement for future scope.

---

## 28. References

- PRD v1.0 (Document 1) — functional and non-functional requirement baseline.
- OWASP Top 10.
- MongoDB `2dsphere` official documentation (geospatial indexing).

---

## 29. Appendix

**Consistency Note**: All technology selections in this document directly match the "Technology Preferences" and "Architecture Recommendation" established in the PRD and prior Project Details. No contradicting stack decision has been introduced.

**Carried Forward to Subsequent Documents**:
- Modular Monolith + isolated FastAPI ML microservice (detailed further in System Architecture Document)
- MongoDB schema design (detailed in Database Design Document)
- REST API structure and versioning (detailed in API Design Document)
