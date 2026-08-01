# API Design Document
# Civic Lens — AI-Powered Civic Issue Reporting & Transparency Platform

## Document Control

| Field | Detail |
|---|---|
| **Document Version** | 1.0 |
| **Date** | July 27, 2026 |
| **Author** | API Design Team |
| **Status** | Draft — Pending Approval |
| **Depends On** | Documents 1–4 |

### Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | July 27, 2026 | API Design Team | Initial API contract, consistent with Database Design Document v1.0 |

---

## Table of Contents

1. API Design Conventions
2. Standard Response Envelope
3. Standard Error Format
4. Authentication & Authorization Endpoints
5. User/Profile Endpoints
6. Report Submission Endpoints
7. Ticket Endpoints
8. Upvote Endpoints
9. Comment Endpoints (Should-Have)
10. Admin Analytics Endpoints
11. Admin Ticket Management Endpoints
12. Admin Audit Endpoints
13. Notification Endpoints
14. Pagination, Sorting, Filtering, Searching
15. Rate Limiting
16. Caching
17. Idempotency
18. Assumptions
19. References
20. Appendix

---

## 1. API Design Conventions

- **Style**: RESTful
- **Base URL**: `/api/v1/`
- **Versioning**: URL path versioning (`/api/v1/...`); future breaking changes introduced as `/api/v2/...` without removing `/v1/` until deprecation window elapses (minimum 6 months notice, per general REST versioning best practice).
- **Format**: JSON request/response bodies exclusively.
- **Naming**: kebab-case, plural nouns for resource collections (e.g., `/tickets`, `/my-reports`).
- **HTTP Methods**: `GET` (read), `POST` (create), `PATCH` (partial update), `PUT` (full update, rarely used here), `DELETE` (soft-delete/flag, not hard delete per Database Design Section 6).

---

## 2. Standard Response Envelope

### Success
```json
{
  "success": true,
  "data": { },
  "meta": {
    "pagination": {
      "next_cursor": "string|null",
      "has_more": true
    }
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "STRING_ERROR_CODE",
    "message": "Human-readable message",
    "details": null
  }
}
```

---

## 3. Standard Error Format & Status Codes

| HTTP Status | Meaning | Example Use |
|---|---|---|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST creating a resource |
| 202 | Accepted | Report submitted, ML classification pending async processing |
| 204 | No Content | Successful DELETE/flag action |
| 400 | Bad Request | Validation failure |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Valid JWT, insufficient role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate upvote attempt |
| 422 | Unprocessable Entity | Semantically invalid payload (e.g., invalid GeoJSON) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled server exception |
| 503 | Service Unavailable | ML inference service unreachable (triggers manual review fallback) |

---

## 4. Authentication & Authorization Endpoints

### 4.1 POST `/api/v1/auth/signup`
| Field | Detail |
|---|---|
| **Purpose** | Register a new citizen account |
| **Auth Required** | No |
| **Request Body** | `{ "email": "string", "phone": "string (optional)", "password": "string", "full_name": "string" }` |
| **Validation Rules** | Valid email format; password ≥8 chars with at least 1 number; phone in E.164 format if provided |
| **Response 201** | `{ "user_id": "string", "email": "string", "role": "citizen" }` |
| **Errors** | 400 (validation), 409 (email/phone already registered) |

### 4.2 POST `/api/v1/auth/login`
| Field | Detail |
|---|---|
| **Purpose** | Authenticate and receive JWT tokens |
| **Auth Required** | No |
| **Request Body** | `{ "email": "string", "password": "string" }` |
| **Response 200** | `{ "access_token": "string", "role": "string", "expires_in": 900 }` (refresh token set as HTTP-only cookie) |
| **Errors** | 400 (validation), 401 (invalid credentials) |
| **Rate Limiting** | 5 requests/minute per IP |

### 4.3 POST `/api/v1/auth/refresh`
| Field | Detail |
|---|---|
| **Purpose** | Exchange valid refresh token (cookie) for new access token |
| **Auth Required** | Refresh token cookie |
| **Response 200** | `{ "access_token": "string", "expires_in": 900 }` |
| **Errors** | 401 (refresh token invalid/expired) |

### 4.4 POST `/api/v1/auth/logout`
| Field | Detail |
|---|---|
| **Purpose** | Invalidate refresh token |
| **Auth Required** | Yes (Bearer access token) |
| **Response 204** | No content |

### 4.5 POST `/api/v1/auth/google`
| Field | Detail |
|---|---|
| **Purpose** | Login/signup via Google OAuth |
| **Auth Required** | No |
| **Request Body** | `{ "id_token": "string" }` (Google-issued token) |
| **Response 200** | Same shape as 4.2 |
| **Errors** | 401 (invalid Google token) |

---

## 5. User/Profile Endpoints

### 5.1 GET `/api/v1/users/me`
| Field | Detail |
|---|---|
| **Purpose** | Retrieve logged-in user's profile |
| **Auth Required** | Yes |
| **Response 200** | `{ "user_id", "email", "phone", "full_name", "role", "civic_score", "created_at" }` |

### 5.2 PATCH `/api/v1/users/me`
| Field | Detail |
|---|---|
| **Purpose** | Update profile fields |
| **Auth Required** | Yes |
| **Request Body** | `{ "full_name": "string (optional)", "phone": "string (optional)" }` |
| **Validation Rules** | Same phone format rule as signup |
| **Response 200** | Updated user object |
| **Errors** | 400 (validation) |

---

## 6. Report Submission Endpoints

### 6.1 POST `/api/v1/reports`
| Field | Detail |
|---|---|
| **Purpose** | Submit a new civic issue report |
| **Auth Required** | Yes (citizen) |
| **Headers** | `Content-Type: multipart/form-data` |
| **Request Body** | `image` (file, required), `latitude` (float, required), `longitude` (float, required), `user_selected_category` (string, optional), `description` (string, optional, max 200 chars) |
| **Validation Rules** | Image must be JPEG/PNG, max 8MB; latitude/longitude within valid geographic bounds |
| **Business Rules** | Triggers async ML classification + duplicate detection pipeline (per System Architecture Document Section 15) |
| **Response 202** | `{ "report_id": "string", "status": "processing" }` |
| **Errors** | 400 (invalid image/coordinates), 401, 429 (rate limit) |
| **Rate Limiting** | 10 submissions per hour per user (spam prevention) |

### 6.2 GET `/api/v1/reports/{report_id}/status`
| Field | Detail |
|---|---|
| **Purpose** | Poll processing status of a submitted report |
| **Auth Required** | Yes (must be report owner) |
| **Response 200** | `{ "report_id", "status": "processing\|classified\|merged\|ticket_created\|manual_review", "ticket_id": "string|null" }` |
| **Errors** | 403 (not owner), 404 |

### 6.3 GET `/api/v1/my-reports`
| Field | Detail |
|---|---|
| **Purpose** | List logged-in user's submitted reports |
| **Auth Required** | Yes |
| **Query Params** | `cursor`, `limit` (pagination, see Section 14) |
| **Response 200** | `{ "reports": [ { "report_id", "photo_url", "ml_category", "ml_severity", "status", "ticket_id", "created_at" } ] }` |

### 6.4 POST `/api/v1/tickets/{ticket_id}/attach-photo`
| Field | Detail |
|---|---|
| **Purpose** | Attach an additional photo to an existing ticket |
| **Auth Required** | Yes |
| **Request Body** | `image` (file, required) |
| **Response 201** | `{ "ticket_id", "photos": [ "...updated array..." ] }` |
| **Errors** | 400, 404 |

---

## 7. Ticket Endpoints

### 7.1 GET `/api/v1/tickets`
| Field | Detail |
|---|---|
| **Purpose** | Public list of tickets for dashboard/heatmap |
| **Auth Required** | No |
| **Query Params** | `category`, `severity`, `status`, `date_from`, `date_to`, `bbox` (bounding box for map viewport), `cursor`, `limit` |
| **Response 200** | `{ "tickets": [ { "ticket_id", "category", "severity", "location", "status", "report_count", "upvote_count", "created_at" } ] }` |
| **Caching** | 60 seconds (per System Architecture Document Section 10) |

### 7.2 GET `/api/v1/tickets/{ticket_id}`
| Field | Detail |
|---|---|
| **Purpose** | Full ticket detail |
| **Auth Required** | No |
| **Response 200** | Full ticket object including `photos`, `status_history`, `report_count`, `upvote_count` |
| **Errors** | 404 |

### 7.3 GET `/api/v1/tickets/search`
| Field | Detail |
|---|---|
| **Purpose** | Search/filter tickets by location, category, severity |
| **Auth Required** | No |
| **Query Params** | `q` (text search on description, optional), `category`, `severity`, `near_lat`, `near_lng`, `radius_meters` |
| **Response 200** | Same shape as 7.1 |

---

## 8. Upvote Endpoints

### 8.1 POST `/api/v1/tickets/{ticket_id}/upvote`
| Field | Detail |
|---|---|
| **Purpose** | Upvote/confirm a ticket |
| **Auth Required** | Yes |
| **Business Rules** | One upvote per user per ticket (enforced via unique compound index, Database Design Section 3.4); crossing threshold triggers auto-escalation to `verified` status |
| **Response 201** | `{ "ticket_id", "upvote_count" }` |
| **Errors** | 401, 404, 409 (already upvoted) |
| **Idempotency** | Not idempotent by design — a second call from the same user returns 409, not a silent success, so the client can reflect accurate state |

### 8.2 DELETE `/api/v1/tickets/{ticket_id}/upvote`
| Field | Detail |
|---|---|
| **Purpose** | Remove own upvote |
| **Auth Required** | Yes |
| **Response 204** | No content |
| **Errors** | 404 (no existing upvote to remove) |

### 8.3 POST `/api/v1/tickets/{ticket_id}/mark-resolved`
| Field | Detail |
|---|---|
| **Purpose** | Community-driven "already resolved" signal |
| **Auth Required** | Yes |
| **Response 201** | `{ "ticket_id", "resolved_signal_count" }` |
| **Business Rules** | Does not immediately close the ticket; contributes to a threshold that flags the ticket for admin confirmation |

---

## 9. Comment Endpoints (Should-Have)

### 9.1 POST `/api/v1/tickets/{ticket_id}/comments`
| Field | Detail |
|---|---|
| **Purpose** | Add a comment to a ticket |
| **Auth Required** | Yes |
| **Request Body** | `{ "text": "string, max 500 chars" }` |
| **Response 201** | `{ "comment_id", "text", "user_id", "created_at" }` |
| **Errors** | 400, 401 |
| **Note** | Feature-flaggable per TDD Section 22; may be disabled at launch |

### 9.2 GET `/api/v1/tickets/{ticket_id}/comments`
| Field | Detail |
|---|---|
| **Purpose** | List comments on a ticket |
| **Auth Required** | No |
| **Query Params** | `cursor`, `limit` |
| **Response 200** | `{ "comments": [ { "comment_id", "text", "user_id", "created_at" } ] }` |

---

## 10. Admin Analytics Endpoints

### 10.1 GET `/api/v1/admin/analytics/overview`
| Field | Detail |
|---|---|
| **Purpose** | KPI overview cards data |
| **Auth Required** | Yes (admin role) |
| **Response 200** | `{ "total_tickets", "unresolved_count", "avg_resolution_time_days", "most_reported_category", "most_affected_zone" }` |
| **Caching** | 5 minutes, invalidated on ticket status change (per System Architecture Document Section 10) |

### 10.2 GET `/api/v1/admin/analytics/category-breakdown`
| Field | Detail |
|---|---|
| **Purpose** | Data for category pie/donut chart |
| **Auth Required** | Yes (admin) |
| **Query Params** | `date_from`, `date_to` (optional) |
| **Response 200** | `{ "breakdown": [ { "category", "count", "percentage" } ] }` |

### 10.3 GET `/api/v1/admin/analytics/severity-distribution`
| Field | Detail |
|---|---|
| **Purpose** | Data for severity bar chart |
| **Auth Required** | Yes (admin) |
| **Response 200** | `{ "distribution": [ { "severity", "count" } ] }` |

### 10.4 GET `/api/v1/admin/analytics/resolution-trend`
| Field | Detail |
|---|---|
| **Purpose** | Data for resolution-time trend line chart |
| **Auth Required** | Yes (admin) |
| **Query Params** | `interval` (`week`/`month`), `date_from`, `date_to` |
| **Response 200** | `{ "trend": [ { "period", "created_count", "resolved_count", "avg_resolution_days" } ] }` |

### 10.5 GET `/api/v1/admin/analytics/area-density`
| Field | Detail |
|---|---|
| **Purpose** | Area-wise unresolved issue density (ties into geospatial data) |
| **Auth Required** | Yes (admin) |
| **Response 200** | `{ "areas": [ { "zone_or_grid_cell", "unresolved_count", "location" } ] }` |

---

## 11. Admin Ticket Management Endpoints

### 11.1 GET `/api/v1/admin/tickets`
| Field | Detail |
|---|---|
| **Purpose** | Full ticket management table (admin view) |
| **Auth Required** | Yes (admin) |
| **Query Params** | `category`, `severity`, `status`, `sort_by`, `sort_order`, `cursor`, `limit` |
| **Response 200** | Full ticket list including internal fields (e.g., `is_ml_overridden`, `is_flagged_spam`) |

### 11.2 PATCH `/api/v1/admin/tickets/{ticket_id}/status`
| Field | Detail |
|---|---|
| **Purpose** | Update ticket status |
| **Auth Required** | Yes (admin) |
| **Request Body** | `{ "status": "acknowledged\|in_progress\|resolved", "note": "string (optional)" }` |
| **Business Rules** | Appends entry to `status_history`; triggers notification dispatch; creates audit log entry |
| **Response 200** | Updated ticket object |
| **Errors** | 400 (invalid status transition), 403, 404 |

### 11.3 PATCH `/api/v1/admin/tickets/{ticket_id}/override`
| Field | Detail |
|---|---|
| **Purpose** | Manually override ML-assigned category/severity |
| **Auth Required** | Yes (admin) |
| **Request Body** | `{ "category": "string (optional)", "severity": "string (optional)" }` |
| **Business Rules** | Sets `is_ml_overridden = true`; creates audit log entry with before/after snapshot |
| **Response 200** | Updated ticket object |

### 11.4 PATCH `/api/v1/admin/tickets/bulk-status`
| Field | Detail |
|---|---|
| **Purpose** | Bulk status update across multiple tickets |
| **Auth Required** | Yes (admin) |
| **Request Body** | `{ "ticket_ids": ["string"], "status": "string", "note": "string (optional)" }` |
| **Response 200** | `{ "updated_count": integer, "failed_ids": ["string"] }` |
| **Business Rules** | Creates one audit log entry per affected ticket, not a single aggregate entry, for granular traceability |

### 11.5 PATCH `/api/v1/admin/tickets/{ticket_id}/flag-spam`
| Field | Detail |
|---|---|
| **Purpose** | Flag a ticket as spam/fake (soft-delete equivalent) |
| **Auth Required** | Yes (admin) |
| **Response 200** | `{ "ticket_id", "is_flagged_spam": true }` |
| **Business Rules** | Excludes ticket from public dashboard queries; retained in database per Soft Delete Strategy |

### 11.6 GET `/api/v1/admin/manual-review-queue`
| Field | Detail |
|---|---|
| **Purpose** | List reports pending manual categorization |
| **Auth Required** | Yes (admin/moderator) |
| **Response 200** | `{ "queue_items": [ { "report_id", "photo_url", "reason", "created_at" } ] }` |

### 11.7 PATCH `/api/v1/admin/manual-review-queue/{report_id}/resolve`
| Field | Detail |
|---|---|
| **Purpose** | Manually assign category/severity and process a queued report |
| **Auth Required** | Yes (admin/moderator) |
| **Request Body** | `{ "category": "string", "severity": "string" }` |
| **Response 200** | `{ "report_id", "resulting_ticket_id" }` |

---

## 12. Admin Audit Endpoints

### 12.1 GET `/api/v1/admin/audit-logs`
| Field | Detail |
|---|---|
| **Purpose** | View admin action history |
| **Auth Required** | Yes (admin) |
| **Query Params** | `actor_id`, `action_type`, `date_from`, `date_to`, `cursor`, `limit` |
| **Response 200** | `{ "logs": [ { "actor_id", "action_type", "target_ticket_id", "before_value", "after_value", "created_at" } ] }` |
| **Business Rules** | Read-only endpoint; no PATCH/DELETE — audit logs are immutable |

---

## 13. Notification Endpoints

### 13.1 GET `/api/v1/notifications`
| Field | Detail |
|---|---|
| **Purpose** | List logged-in user's notifications |
| **Auth Required** | Yes |
| **Response 200** | `{ "notifications": [ { "notification_id", "type", "ticket_id", "delivery_status", "created_at" } ] }` |

---

## 14. Pagination, Sorting, Filtering, Searching

- **Pagination**: Cursor-based (not offset-based), per Database Design Document Section 14 — request via `cursor` + `limit` (default 20, max 100) query params; response includes `meta.pagination.next_cursor` and `has_more`.
- **Sorting**: `sort_by` (e.g., `created_at`, `report_count`, `severity`) + `sort_order` (`asc`/`desc`) query params on list endpoints.
- **Filtering**: Resource-specific query params as documented per endpoint above (e.g., `category`, `severity`, `status`, `date_from`/`date_to`).
- **Searching**: Text search supported via `q` param on `/tickets/search`, matching against `description` field.

---

## 15. Rate Limiting

| Endpoint Group | Limit |
|---|---|
| `/auth/login` | 5 requests/minute/IP |
| `/auth/signup` | 3 requests/minute/IP |
| `/reports` (POST) | 10 requests/hour/user |
| `/tickets/{id}/upvote` | 20 requests/hour/user |
| All other authenticated endpoints | 100 requests/minute/user |
| Public unauthenticated endpoints (`/tickets`, `/tickets/{id}`) | 60 requests/minute/IP |

Enforced via DRF throttling classes (per TDD Section 21); 429 response includes `Retry-After` header.

---

## 16. Caching

| Endpoint | Cache Duration |
|---|---|
| `GET /tickets` | 60 seconds (public dashboard) |
| `GET /admin/analytics/*` | 5 minutes, explicit invalidation on ticket status change |
| `GET /tickets/{ticket_id}` | Not cached (needs near-real-time status_history accuracy) |

---

## 17. Idempotency

- **POST `/reports`**: Not idempotent — each call creates a new report submission by design (even if visually identical, duplicate detection logic handles merging server-side rather than rejecting at the API layer).
- **POST `/tickets/{id}/upvote`**: Enforced non-idempotent with explicit 409 on repeat (see Section 8.1) rather than silent idempotent success, so the client always reflects true vote state.
- **PATCH `/admin/tickets/{id}/status`**: Idempotent in effect — setting the same status twice results in no duplicate `status_history` entry (checked server-side before appending).

---

## 18. Assumptions

1. All endpoints are versioned under `/api/v1/` from initial launch, consistent with TDD Section 1 technology stack decisions.
2. Moderator-role endpoints (manual review queue resolution) are accessible to both `admin` and `moderator` roles, per PRD's optional Moderator role definition; if the Moderator role is descoped, these endpoints remain admin-only without contract changes.
3. Comment endpoints (Section 9) are included in the contract but may be feature-flagged off at launch per PRD's Should-Have designation — this does not require an API version change, only a feature flag toggle.
4. Geospatial bounding-box (`bbox`) filtering on `/tickets` is included to support efficient map-viewport-based queries on the frontend, an implementation detail not explicitly listed in the PRD but necessary to satisfy FR-18's dashboard performance expectations.

---

## 19. References

- PRD v1.0 (Document 1) — Functional Requirements Sections 13.B–13.G directly map to endpoint groups here.
- Database Design Document v1.0 (Document 4) — schema fields referenced in all request/response bodies.
- System Architecture Document v1.0 (Document 3) — caching and rate-limiting strategy referenced in Sections 15–16.

---

## 20. Appendix

**Consistency Note**: Every endpoint in this document maps directly to a functional requirement in the PRD (Document 1) and a schema field defined in the Database Design Document (Document 4). No endpoint introduces a data field not already defined in the schema; where an implementation-necessary field was introduced (e.g., `bbox` param), it is explicitly flagged in Section 18, Assumption 4, rather than silently added.

**Carried Forward to Subsequent Documents**: Endpoint list and request/response shapes here inform all page-level data requirements in the UI/UX Design & User Flow Document (Document 6).
