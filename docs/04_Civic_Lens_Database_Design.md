# Database Design Document
# Civic Lens — AI-Powered Civic Issue Reporting & Transparency Platform

## Document Control

| Field | Detail |
|---|---|
| **Document Version** | 1.0 |
| **Date** | July 27, 2026 |
| **Author** | Database Engineering Team |
| **Status** | Draft — Pending Approval |
| **Depends On** | Document 1 (PRD), Document 2 (TDD), Document 3 (System Architecture) |

### Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | July 27, 2026 | Database Engineering Team | Initial schema design, consistent with prior documents |

---

## Table of Contents

1. Database Selection Justification
2. ER Diagram (Text Format)
3. Complete Schema
4. Relationships
5. Normalization / Denormalization Notes
6. Soft Delete Strategy
7. Audit Tables
8. History Tables
9. Triggers Equivalent
10. Views Equivalent
11. Stored Procedures Equivalent
12. Partitioning Strategy
13. Index Optimization
14. Query Optimization
15. Migration Strategy
16. Backup Strategy
17. Sample Data
18. Assumptions
19. References
20. Appendix

---

## 1. Database Selection Justification

**Selected: MongoDB (Atlas)**, using `mongoengine` as the ODM within Django (per TDD Section 6).

Justification:
- Native `2dsphere` geospatial index is a direct, first-class fit for the duplicate-detection radius query — no external extension required (unlike relational alternatives, which would require PostGIS).
- Document-oriented model naturally represents a `Ticket` with a variable-length embedded array of `photos` and an embedded, append-only `status_history` log — both awkward to model efficiently in a strict relational schema without extra join tables.
- Flexible schema accommodates the evolving nature of an MVP-stage product without frequent, disruptive migrations.

*(Note carried from TDD: PostgreSQL + PostGIS remains a valid, arguably more mature alternative if the MongoDB constraint were lifted — flagged for awareness, not acted upon.)*

---

## 2. ER Diagram (Text Format)

```
User (1) ──────< (M) Report
User (1) ──────< (M) Upvote
User (1) ──────< (M) Comment
User (1) ──────< (M) AuditLog  [as actor, when role = admin]

Report (M) ──────> (1) Ticket        [many reports merge into one ticket]

Ticket (1) ──────< (M) Upvote
Ticket (1) ──────< (M) Comment
Ticket (1) ──────< (M) StatusHistoryEntry   [embedded, not separate collection]
Ticket (1) ──────< (M) Photo                [embedded array, not separate collection]

Zone (1) ──────< (M) Ticket           [optional, for future multi-zone scope]

AdminAction (M) ──────> (1) User [admin]
AdminAction (M) ──────> (1) Ticket [nullable, if action is ticket-related]

Notification (M) ──────> (1) User
Notification (M) ──────> (1) Ticket [nullable]

ManualReviewQueueEntry (1) ──────> (1) Report
```

---

## 3. Complete Schema

### 3.1 Collection: `users`

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | No | auto-generated | Primary Key |
| `email` | String | No | — | Unique, indexed |
| `phone` | String | Yes | null | Unique (if present), indexed |
| `password_hash` | String | No | — | Never exposed via API |
| `full_name` | String | Yes | null | — |
| `role` | String (enum) | No | `"citizen"` | Values: `citizen`, `moderator`, `admin`, `super_admin` |
| `civic_score` | Integer | No | 0 | Non-negative |
| `mfa_enabled` | Boolean | No | false | Placeholder for future MFA |
| `is_active` | Boolean | No | true | Soft-delete/deactivation flag |
| `google_oauth_id` | String | Yes | null | Unique (if present) |
| `created_at` | DateTime | No | current timestamp | — |
| `updated_at` | DateTime | No | current timestamp | Updated on every write |

### 3.2 Collection: `reports`

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | No | auto-generated | Primary Key |
| `user_id` | ObjectId (ref: users) | No | — | Foreign Key, indexed |
| `photo_url` | String | No | — | Cloudinary-hosted URL |
| `location` | GeoJSON Point | No | — | `2dsphere` indexed |
| `user_selected_category` | String (enum) | Yes | null | Advisory only, not authoritative |
| `description` | String | Yes | null | Max 200 characters |
| `ml_category` | String (enum) | Yes | null | Set post-ML-inference |
| `ml_severity` | String (enum) | Yes | null | Values: `low`, `medium`, `high` |
| `ml_confidence` | Float | Yes | null | 0.0–1.0 |
| `perceptual_hash` | String | Yes | null | For duplicate pre-filtering |
| `embedding_vector` | Array<Float> | Yes | null | Fixed-length CNN feature vector |
| `merged_into_ticket_id` | ObjectId (ref: tickets) | Yes | null | Null if this report created a new ticket |
| `status` | String (enum) | No | `"processing"` | Values: `processing`, `classified`, `merged`, `ticket_created`, `manual_review` |
| `created_at` | DateTime | No | current timestamp | — |

### 3.3 Collection: `tickets`

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | No | auto-generated | Primary Key |
| `category` | String (enum) | No | — | Values: `pothole`, `waterlogging`, `streetlight`, `garbage`, `other` |
| `severity` | String (enum) | No | — | Values: `low`, `medium`, `high` |
| `location` | GeoJSON Point | No | — | `2dsphere` indexed |
| `zone_id` | ObjectId (ref: zones) | Yes | null | Future multi-zone scope |
| `photos` | Array<Embedded: Photo> | No | `[]` | Each entry: `{ url, uploaded_by, uploaded_at }` |
| `report_count` | Integer | No | 1 | Incremented on merge |
| `upvote_count` | Integer | No | 0 | Incremented via upvote action |
| `status` | String (enum) | No | `"reported"` | Values: `reported`, `verified`, `acknowledged`, `in_progress`, `resolved` |
| `status_history` | Array<Embedded: StatusHistoryEntry> | No | `[]` | Each entry: `{ status, changed_by, changed_at, note }` |
| `is_ml_overridden` | Boolean | No | false | True if admin manually changed category/severity |
| `is_flagged_spam` | Boolean | No | false | Soft-delete-equivalent flag |
| `created_at` | DateTime | No | current timestamp | — |
| `updated_at` | DateTime | No | current timestamp | — |
| `resolved_at` | DateTime | Yes | null | Set when status = resolved; used for resolution-time KPI |

### 3.4 Collection: `upvotes`

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | No | auto-generated | Primary Key |
| `ticket_id` | ObjectId (ref: tickets) | No | — | Foreign Key, indexed |
| `user_id` | ObjectId (ref: users) | No | — | Foreign Key |
| `created_at` | DateTime | No | current timestamp | — |
| — | — | — | — | **Unique compound index** on `(ticket_id, user_id)` — prevents duplicate upvotes |

### 3.5 Collection: `comments` *(Should-Have)*

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | No | auto-generated | Primary Key |
| `ticket_id` | ObjectId (ref: tickets) | No | — | Foreign Key, indexed |
| `user_id` | ObjectId (ref: users) | No | — | Foreign Key |
| `text` | String | No | — | Max 500 characters |
| `is_flagged` | Boolean | No | false | Moderation flag |
| `created_at` | DateTime | No | current timestamp | — |

### 3.6 Collection: `manual_review_queue`

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | No | auto-generated | Primary Key |
| `report_id` | ObjectId (ref: reports) | No | — | Foreign Key, unique |
| `reason` | String | No | — | e.g., `"low_confidence"`, `"duplicate_check_skipped"` |
| `resolved` | Boolean | No | false | — |
| `resolved_by` | ObjectId (ref: users) | Yes | null | Admin/moderator who processed it |
| `created_at` | DateTime | No | current timestamp | — |

### 3.7 Collection: `audit_logs`

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | No | auto-generated | Primary Key |
| `actor_id` | ObjectId (ref: users) | No | — | Admin performing the action |
| `action_type` | String (enum) | No | — | e.g., `status_change`, `category_override`, `bulk_update`, `user_suspend` |
| `target_ticket_id` | ObjectId (ref: tickets) | Yes | null | Nullable if action is not ticket-specific |
| `target_user_id` | ObjectId (ref: users) | Yes | null | Nullable if action is not user-specific |
| `before_value` | Mixed | Yes | null | Snapshot before change |
| `after_value` | Mixed | Yes | null | Snapshot after change |
| `created_at` | DateTime | No | current timestamp | Append-only, immutable |

### 3.8 Collection: `notifications`

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | No | auto-generated | Primary Key |
| `user_id` | ObjectId (ref: users) | No | — | Foreign Key |
| `ticket_id` | ObjectId (ref: tickets) | Yes | null | — |
| `type` | String (enum) | No | — | e.g., `status_change`, `merge_confirmation` |
| `delivery_status` | String (enum) | No | `"pending"` | Values: `pending`, `sent`, `failed` |
| `sent_at` | DateTime | Yes | null | — |
| `created_at` | DateTime | No | current timestamp | — |

### 3.9 Collection: `zones` *(Future Scope, schema reserved)*

| Field | Type | Nullable | Default | Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | No | auto-generated | Primary Key |
| `name` | String | No | — | Unique |
| `boundary` | GeoJSON Polygon | Yes | null | `2dsphere` indexed |
| `assigned_admin_ids` | Array<ObjectId (ref: users)> | Yes | `[]` | Future Super Admin scope |

---

## 4. Relationships

| Relationship | Type | Notes |
|---|---|---|
| User → Report | One-to-Many | A user submits many reports |
| Report → Ticket | Many-to-One | Many reports may merge into one ticket; `merged_into_ticket_id` field on Report |
| Ticket → Upvote | One-to-Many | A ticket can have many upvotes; unique constraint prevents duplicate votes per user |
| Ticket → Comment | One-to-Many | Should-Have feature |
| Ticket → Photo | One-to-Many (Embedded) | Photos embedded directly in Ticket document, not a separate collection, since they are always accessed together with the ticket |
| Ticket → StatusHistoryEntry | One-to-Many (Embedded) | Same reasoning as Photos |
| User (admin) → AuditLog | One-to-Many | Every admin action produces exactly one audit log entry |
| User → Notification | One-to-Many | — |
| Zone → Ticket | One-to-Many | Reserved for future multi-zone scope |

---

## 5. Normalization / Denormalization Notes

MongoDB does not use relational normal forms in the traditional sense, but deliberate design choices were made:

- **Denormalized (Embedded)**: `photos` and `status_history` are embedded directly within `Ticket` documents because they are always read together with the parent ticket and rarely queried independently — embedding avoids extra round-trip queries (a core MongoDB best practice: "data that is accessed together should be stored together").
- **Referenced (Normalized)**: `User`, `Report`, `Upvote`, `Comment`, and `AuditLog` are kept as separate collections referencing `Ticket`/`User` by ObjectId, since these grow independently and unboundedly (a ticket could theoretically accumulate thousands of upvotes — embedding these directly in the Ticket document would risk exceeding MongoDB's 16MB document size limit and would degrade write performance on the parent document).

---

## 6. Soft Delete Strategy

- **Users**: `is_active` boolean flag; suspended/deactivated users are never hard-deleted, preserving referential integrity for their historical reports/tickets.
- **Tickets**: `is_flagged_spam` boolean flag rather than deletion — flagged tickets are excluded from public dashboard queries but retained for audit purposes.
- **Comments**: `is_flagged` boolean for moderation; hard deletion avoided to preserve moderation audit trail.
- **Hard deletes** are not used anywhere in the schema for user-generated content, to preserve audit integrity (per PRD FR-34 and Security Requirements).

---

## 7. Audit Tables

Covered by the `audit_logs` collection (Section 3.7) — append-only, immutable, capturing every admin action with before/after value snapshots. No update or delete operations are permitted on this collection at the application layer; only inserts.

---

## 8. History Tables

The `status_history` embedded array within each `Ticket` document functions as this ticket's own append-only history table, recording every status transition with timestamp, actor, and optional note — enabling reconstruction of a ticket's full lifecycle without needing a separate collection or join.

---

## 9. Triggers Equivalent

MongoDB does not support triggers natively in the same way as relational databases. Equivalent behavior is implemented at the **application/service layer** (per TDD Section 20, Design Patterns — Observer Pattern):

- On `Ticket.status` change → automatically append to `status_history` (enforced in the `TicketService`, not left to be manually done by every call site).
- On `Ticket.report_count + upvote_count` crossing threshold → automatically update `status` to `verified` (enforced in `SeverityEscalationService`).
- On `Report` merge → automatically increment `Ticket.report_count` (enforced in `TicketMergeService`).

*(Note: MongoDB Atlas does support "Atlas Triggers" as a managed feature for reacting to document changes; this is flagged as an alternative implementation approach but application-layer enforcement is recommended for MVP to keep logic version-controlled alongside the codebase rather than in platform-specific configuration.)*

---

## 10. Views Equivalent

MongoDB does not have SQL-style views, but equivalent read-optimized projections are achieved via:
- **Aggregation Pipelines** exposed through dedicated `analytics` module API endpoints (e.g., a pipeline that produces the "category breakdown" or "resolution time trend" without persisting a separate materialized collection).
- For frequently repeated aggregations, results are cached in Redis (per System Architecture Document Section 10) rather than recomputed per request — functioning as a materialized-view-like performance layer.

---

## 11. Stored Procedures Equivalent

Not applicable in MongoDB's document model. All business logic that would traditionally reside in stored procedures is implemented in the Django **Service Layer** (per TDD Section 20), keeping logic testable, version-controlled, and language-consistent with the rest of the application.

---

## 12. Partitioning Strategy

Not required at MVP data volume (per PRD Section 11 estimates: 5,000–20,000 tickets, 50,000–100,000 reports in the first 6–12 months). MongoDB Atlas supports **sharding** as a future scale-out mechanism if data volume grows substantially (e.g., multi-city rollout); a natural future shard key candidate would be `zone_id` once the multi-zone feature is implemented, since most queries (public dashboard, admin analytics) are naturally zone-scoped.

---

## 13. Index Optimization

| Collection | Index | Purpose |
|---|---|---|
| `users` | `email` (unique) | Login lookup |
| `users` | `phone` (unique, sparse) | Login lookup |
| `reports` | `user_id` | "My Reports" query |
| `reports` | `location` (`2dsphere`) | Geospatial candidate lookup during duplicate detection |
| `tickets` | `location` (`2dsphere`) | Public dashboard map query, duplicate detection candidate lookup |
| `tickets` | `status` | Filtering unresolved tickets for public dashboard |
| `tickets` | `category`, `severity` (compound) | Admin filter/sort queries |
| `tickets` | `created_at` | Date-range filtering, trend analytics |
| `upvotes` | `(ticket_id, user_id)` (unique compound) | Prevents duplicate upvotes, fast existence check |
| `audit_logs` | `actor_id`, `created_at` (compound) | Admin action history lookup |
| `manual_review_queue` | `resolved` | Fast retrieval of pending queue items |

---

## 14. Query Optimization

- **Duplicate Detection Query**: Uses `$geoNear` (which inherently sorts by distance and leverages the `2dsphere` index) with a `maxDistance` parameter set per category, limiting the candidate set before the more expensive image-similarity comparison step — avoiding a full collection scan.
- **Public Dashboard Query**: Paginated (cursor-based, not offset-based, to remain performant as ticket volume grows) and filtered server-side before serialization, never fetching the full unresolved-ticket set to the client.
- **Admin Analytics Aggregations**: Pre-aggregated via MongoDB's aggregation pipeline (`$match` → `$group` → `$project`) rather than fetching raw documents and computing in application code — pushes computation to the database layer, which is more efficient at scale.
- **Projection**: All list-view queries (dashboard, admin table) explicitly project only required fields (e.g., excluding `embedding_vector`, `status_history` detail) to minimize payload size and network transfer.

---

## 15. Migration Strategy

- MongoDB's flexible schema means "migrations" are primarily about **application-level schema evolution**, not rigid DDL changes:
  - New optional fields can be added without a migration script; `mongoengine` document defaults handle backward compatibility for existing documents missing the new field.
  - Structural changes (e.g., changing `photos` from a plain URL array to an embedded object array) require a one-time data migration script (Django management command) run against the existing collection.
- All migration scripts are version-controlled within the repository (`apps/<module>/migrations/` convention, even though MongoDB doesn't enforce Django's relational migration framework) and documented with a rollback plan before execution against production data.

---

## 16. Backup Strategy

- **MongoDB Atlas automated backups**: daily snapshot, retained per Atlas tier policy (paid tier recommended before production launch, as free/shared tiers have limited backup retention — per TDD Section 25).
- **Point-in-time recovery**: available on Atlas dedicated tiers, recommended as a pre-production upgrade to protect against accidental data corruption between daily snapshots.
- **Manual export**: periodic `mongodump` exports recommended during active development as an additional local safeguard, independent of Atlas's managed backups.

---

## 17. Sample Data

### Sample `ticket` Document
```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "category": "pothole",
  "severity": "high",
  "location": { "type": "Point", "coordinates": [72.5714, 23.0225] },
  "zone_id": null,
  "photos": [
    { "url": "https://res.cloudinary.com/civiclens/pothole1.jpg", "uploaded_by": "665f...user1", "uploaded_at": "2026-07-20T09:15:00Z" },
    { "url": "https://res.cloudinary.com/civiclens/pothole2.jpg", "uploaded_by": "665f...user2", "uploaded_at": "2026-07-21T11:02:00Z" }
  ],
  "report_count": 12,
  "upvote_count": 8,
  "status": "verified",
  "status_history": [
    { "status": "reported", "changed_by": "system", "changed_at": "2026-07-20T09:15:00Z", "note": null },
    { "status": "verified", "changed_by": "system", "changed_at": "2026-07-22T14:00:00Z", "note": "Auto-verified: threshold crossed" }
  ],
  "is_ml_overridden": false,
  "is_flagged_spam": false,
  "created_at": "2026-07-20T09:15:00Z",
  "updated_at": "2026-07-22T14:00:00Z",
  "resolved_at": null
}
```

### Sample `report` Document
```json
{
  "_id": "665f1b2c3d4e5f6a7b8c9d0e",
  "user_id": "665f...user1",
  "photo_url": "https://res.cloudinary.com/civiclens/pothole1.jpg",
  "location": { "type": "Point", "coordinates": [72.5716, 23.0227] },
  "user_selected_category": "pothole",
  "description": "Deep pothole near MG Road bus stop",
  "ml_category": "pothole",
  "ml_severity": "high",
  "ml_confidence": 0.91,
  "perceptual_hash": "af23c9e1b8...",
  "embedding_vector": [0.021, -0.114, 0.302, "...512-dim vector..."],
  "merged_into_ticket_id": null,
  "status": "ticket_created",
  "created_at": "2026-07-20T09:15:00Z"
}
```

### Sample `user` Document
```json
{
  "_id": "665f...user1",
  "email": "rohan@example.com",
  "phone": "+919000000000",
  "password_hash": "pbkdf2_sha256$...",
  "full_name": "Rohan Sharma",
  "role": "citizen",
  "civic_score": 24,
  "mfa_enabled": false,
  "is_active": true,
  "google_oauth_id": null,
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-07-22T14:00:00Z"
}
```

---

## 18. Assumptions

1. `mongoengine` is assumed capable of supporting embedded document arrays (`photos`, `status_history`) with acceptable query performance at MVP data volume; validated early in development per TDD Section 27, Assumption 3.
2. Document size limits (MongoDB's 16MB cap) will not be reached even for high-report-count tickets, given photos are stored as URL references (not binary), keeping embedded array growth lightweight.
3. `zones` collection is schema-reserved but not actively used in MVP queries, consistent with PRD's Out of Scope declaration for multi-zone/Super Admin functionality.
4. Comments collection is included in the schema (Should-Have per PRD) but its API exposure may be feature-flagged off for initial MVP launch per TDD Section 22 (Configuration Strategy).

---

## 19. References

- PRD v1.0 (Document 1) — functional requirements driving schema design.
- TDD v1.0 (Document 2) — database selection and ODM decision.
- System Architecture Document v1.0 (Document 3) — data flow and caching strategy.
- MongoDB official documentation — `2dsphere` indexing, aggregation pipeline, Atlas backup policies.

---

## 20. Appendix

**Consistency Note**: This schema directly supports every functional requirement listed in PRD Section 13 (Functional Requirements) and aligns with the data structures and algorithms described in TDD Sections 18–19 and System Architecture Document Sections 9–10. No new entities were introduced that contradict earlier documents; the `zones` collection is explicitly marked future-scope/reserved, consistent with PRD Section 12 (Out of Scope).

**Carried Forward to Subsequent Documents**: This schema forms the basis for all request/response body definitions in the API Design Document (Document 5).
