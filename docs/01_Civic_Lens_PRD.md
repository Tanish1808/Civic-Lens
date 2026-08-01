# Product Requirements Document (PRD)
# Civic Lens — AI-Powered Civic Issue Reporting & Transparency Platform

## Document Control

| Field | Detail |
|---|---|
| **Document Version** | 1.0 |
| **Date** | July 27, 2026 |
| **Author** | Product Discovery Team |
| **Project Name** | Civic Lens |
| **Status** | Draft — Pending Approval |

### Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | July 27, 2026 | Product Discovery Team | Initial draft |

---

## Table of Contents

1. Executive Summary
2. Vision Statement
3. Problem Statement
4. Existing Problems
5. Proposed Solution
6. Target Audience
7. User Personas
8. Business Goals
9. Technical Goals
10. Success Metrics (KPIs)
11. Project Scope
12. Out of Scope
13. Functional Requirements
14. Non-Functional Requirements
15. User Stories
16. Acceptance Criteria
17. Risks
18. Assumptions
19. Constraints
20. Future Enhancements
21. Release Plan
22. Project Milestones
23. Glossary
24. References
25. Appendix

---

## 1. Executive Summary

Civic Lens is an AI-powered civic issue reporting and transparency platform designed to solve a persistent urban governance failure: citizen complaints about infrastructure issues (potholes, waterlogging, broken streetlights, illegal dumping) disappearing into unaccountable municipal systems. The platform enables citizens to submit geotagged photo reports that are automatically classified by category and severity using computer vision, automatically deduplicated using geospatial and image-similarity clustering, and publicly tracked via a transparency dashboard. The system is intended for pilot deployment in a single city/zone, with a modular monolith architecture designed to scale toward multi-city, microservices-based operation in future phases.

---

## 2. Vision Statement

To make civic infrastructure accountability visible, verifiable, and actionable — replacing opaque complaint systems with a transparent, intelligent reporting layer that empowers citizens and equips municipal bodies with prioritized, evidence-backed issue data.

---

## 3. Problem Statement

Citizens reporting civic issues (potholes, waterlogging, broken streetlights, illegal dumping) through existing municipal apps and helplines experience a fundamental trust failure: reports go unverified, unprioritized, and untracked. There is no mechanism to consolidate duplicate reports of the same issue, no automated severity assessment to help municipal staff triage effectively, and no public visibility into whether or when an issue will be resolved.

---

## 4. Existing Problems

| # | Problem | Impact |
|---|---|---|
| 1 | No verification of citizen-submitted reports | Municipal staff cannot distinguish genuine issues from spam/duplicates |
| 2 | No automated severity assessment | All reports treated with equal or arbitrary priority regardless of urgency |
| 3 | No duplicate detection | Same pothole may generate dozens of redundant tickets, wasting effort |
| 4 | No public transparency on status | Citizens lose trust because they cannot see if/when action is taken |
| 5 | Reliance on user-selected tags | Category misclassification common with manual-only tagging |
| 6 | No community verification mechanism | A single report cannot be corroborated or dismissed by other citizens |

---

## 5. Proposed Solution

Civic Lens addresses these problems through three integrated technical pillars:

1. **Computer Vision Classification** — A fine-tuned CNN model (MobileNetV2/ResNet18 backbone) automatically determines issue category and severity directly from the uploaded photograph.
2. **Geospatial + Visual Duplicate Detection** — MongoDB `2dsphere` geospatial queries identify nearby reports; image similarity (perceptual hashing or CNN embedding comparison) confirms whether they represent the same physical issue, merging them into a single ticket.
3. **Public Transparency Layer** — A public heatmap dashboard, individual ticket pages, and community upvote/verification system make issue status visible to all citizens.

---

## 6. Target Audience

| Audience Type | Description |
|---|---|
| **Primary** | Citizens residing in the pilot city/zone who encounter and wish to report civic infrastructure issues |
| **Secondary** | Municipal administrative staff responsible for reviewing, prioritizing, and resolving reported issues |
| **Tertiary (Assumption)** | Community moderators — trusted citizens assisting with report verification (optional role) |

---

## 7. User Personas

### Persona 1: "Rohan" — The Concerned Citizen
- Age 32, IT professional, daily two-wheeler commuter
- Goal: report a dangerous pothole quickly, without a lengthy form
- Frustration: previously reported issues with no follow-up
- Needs: fast photo-based reporting, visibility into report status

### Persona 2: "Priya" — The Engaged Community Member
- Age 45, local shop owner, active in neighborhood groups
- Goal: confirm/upvote issues neighbors reported, track resolution across locality
- Frustration: no central place to see area-wide issues
- Needs: public map/dashboard, upvote/verification capability

### Persona 3: "Anand" — The Municipal Administrator
- Age 41, works in the local public works department
- Goal: prioritized, de-duplicated issue view to allocate repair crews
- Frustration: complaints arrive via disconnected channels with no severity ranking
- Needs: KPI dashboard, sortable/filterable ticket management, analytics

*(Assumption: Personas are illustrative constructs based on defined user roles; no primary user research conducted.)*

---

## 8. Business Goals

1. Reduce duplicate complaint volume through automated consolidation.
2. Increase citizen trust through visible, public status tracking.
3. Provide municipal bodies a prioritized, severity-ranked issue queue instead of an unsorted backlog.
4. Establish a reusable, city-agnostic platform with future multi-city licensing potential.
5. Demonstrate measurable reduction in average issue-resolution time from public accountability pressure.

---

## 9. Technical Goals

1. Achieve ≥80% image classification accuracy across all four issue categories.
2. Implement duplicate detection with tunable geospatial radius and image-similarity threshold.
3. Design a modular monolith architecture with the ML inference component isolated as an independently deployable service.
4. Ensure the public dashboard renders within acceptable performance thresholds at scale.
5. Maintain a clean, RESTful, versioned API enabling future mobile app development without backend rework.

---

## 10. Success Metrics (KPIs)

| KPI | Definition | Target (Assumption) |
|---|---|---|
| Duplicate reduction rate | % of reports merged into existing tickets vs. new tickets created | ≥40% merge rate |
| Average resolution time | Days between ticket creation and "resolved" status | 20% reduction by Month 6 |
| Citizen engagement rate | Ratio of upvotes/verifications to total tickets | ≥0.5 upvotes/ticket |
| ML classification accuracy | Precision/recall on held-out validation dataset | ≥80% per category |
| Public dashboard traffic | Unique visitors to transparency map/month | Baseline established during pilot |
| Admin resolution throughput | Tickets processed/updated per week | Baseline established during pilot |

---

## 11. Project Scope

### In Scope (MVP)
- Citizen registration/login (email/phone, optional Google OAuth)
- Photo + geotag-based issue reporting
- ML-based category and severity classification
- Geospatial + image-similarity duplicate detection and ticket merging
- Ticket lifecycle management (reported → verified → acknowledged → in-progress → resolved)
- Public heatmap dashboard with filtering
- Individual ticket detail pages
- Personal "My Reports" dashboard
- Community upvote/verification system
- Custom admin dashboard with KPI cards, charts, ticket management table
- Role-based access control (Citizen, Moderator [optional], Admin)
- Email notifications on status change

### Should-Have (In Scope, Lower Priority)
- Comments on tickets
- Leaderboard/gamification (civic score, badges)
- Moderator role and moderation queue

---

## 12. Out of Scope

| Item | Reason |
|---|---|
| Native mobile applications | Web-responsive only for MVP; future scope |
| MFA | Deferred; architecture remains MFA-ready |
| Push notifications | Email notifications only for MVP |
| Government ticketing system integration | Standalone parallel platform in MVP |
| Multi-city/Super Admin role | Single pilot-zone deployment only |
| Predictive analytics | Requires historical data not yet available |
| Multi-language support | English-only for MVP (Assumption) |
| Full regulatory certification (GDPR-equivalent) | Out of scope for MVP |

---

## 13. Functional Requirements

### FR Group A: Authentication & Profile
- FR-1: Citizen registration via email/phone + password.
- FR-2: Optional Google OAuth login.
- FR-3: Secure login/logout.
- FR-4: View/edit profile information.
- FR-5: Display contribution statistics.

### FR Group B: Issue Reporting
- FR-6: Submit report with mandatory photo + auto-captured geotag.
- FR-7: Optional category tag + free-text description (≤200 characters).
- FR-8: Validate image quality/format before processing.
- FR-9: Real-time upload/processing status display.
- FR-10: Attach additional photo to an existing ticket.

### FR Group C: ML Classification & Duplicate Detection
- FR-11: Auto-classify image into category (pothole, waterlogging, streetlight fault, garbage/dumping, other).
- FR-12: Auto-assign severity (low/medium/high) independent of category.
- FR-13: Route low-confidence classifications to manual review queue.
- FR-14: Query existing tickets within configurable geospatial radius.
- FR-15: Image-similarity comparison to confirm duplicate status.
- FR-16: Merge confirmed duplicates into existing ticket, incrementing report count.
- FR-17: Create new ticket when no duplicate match found.

### FR Group D: Ticket Viewing & Tracking
- FR-18: Public map/heatmap of unresolved tickets, filterable by category/severity/status/date/area.
- FR-19: Individual ticket detail page with photos, report count, upvotes, status history.
- FR-20: Personal "My Reports" dashboard.
- FR-21: Search/filter tickets by location, category, severity.

### FR Group E: Community Interaction
- FR-22: Upvote/confirm an existing ticket.
- FR-23: Mark a ticket as "already resolved" (community closure signal).
- FR-24: Optional comments on a ticket (Should-Have).
- FR-25: Escalate ticket visibility/priority past upvote/report-count threshold.

### FR Group F: Notifications
- FR-26: Email notification on ticket status change.

### FR Group G: Admin Functionality
- FR-27: Separate admin login, not via public self-registration.
- FR-28: KPI overview dashboard (total tickets, unresolved count, avg. resolution time, most-reported category, most-affected zone).
- FR-29: Visual analytics charts (category breakdown, severity distribution, resolution trend, area-wise density).
- FR-30: Sortable/filterable ticket management table.
- FR-31: Manual override of ML-assigned category/severity.
- FR-32: Bulk status-update actions.
- FR-33: Flag/remove spam or fake reports.
- FR-34: Audit log of every admin action.

### FR Group H: Gamification (Should-Have)
- FR-35: Leaderboard of top civic contributors by area.
- FR-36: Badges/civic scores based on contribution activity.

---

## 14. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Image upload + ML classification within 3–5 seconds; dashboard map load within 2 seconds for up to 5,000 active tickets |
| Security | HTTPS everywhere; RBAC on all endpoints; secure upload validation; JWT-based stateless auth |
| Scalability | ML inference service independently horizontally scalable, decoupled from core API |
| Availability | Target 99% uptime during MVP/pilot stage (Assumption) |
| Reliability | Failed ML inference falls back to manual review queue; duplicate detection must not silently discard legitimate distinct reports |
| Accessibility | WCAG 2.1 AA: color contrast, alt text, keyboard navigability |
| Maintainability | Modular codebase; documented API contracts (OpenAPI-style) |
| Compliance | Baseline privacy handling; full regulatory certification out of scope for MVP |

---

## 15. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-1 | Citizen | Submit a photo report with location auto-attached | I don't have to manually describe/locate the issue |
| US-2 | Citizen | See real-time status of my submitted report | I know whether it's acknowledged or pending |
| US-3 | Citizen | See my report merged with an existing ticket | I understand it contributed to a recognized issue |
| US-4 | Citizen | View a public map of unresolved issues nearby | I stay informed about civic problems near me |
| US-5 | Citizen | Upvote an existing ticket | I can add credibility to an issue I've also observed |
| US-6 | Citizen | Receive an email when report status changes | I don't have to keep checking manually |
| Admin US-1 | Admin | View a KPI dashboard with charts | I understand system-wide trends at a glance |
| Admin US-2 | Admin | Filter/sort tickets by severity and report count | I can prioritize which issues to act on first |
| Admin US-3 | Admin | Override an incorrect ML classification | Ticket data remains accurate despite model errors |
| Admin US-4 | Admin | Bulk-update status of multiple tickets | I can efficiently process large batches |

---

## 16. Acceptance Criteria

| User Story | Acceptance Criteria |
|---|---|
| US-1 | Given a citizen uploads a photo with location access granted, when submission completes, then the system returns category, severity, and ticket ID within 5 seconds |
| US-2 | Given a citizen has submitted ≥1 report, when they visit "My Reports," then all reports display accurate current status |
| US-3 | Given a new report is geospatially and visually similar to an open ticket, when processed, then it merges into that ticket without creating a duplicate |
| US-4 | Given ≥1 open ticket exists, when any user visits the public dashboard, then all open tickets appear as severity-colored map markers |
| US-5 | Given a logged-in citizen views a ticket they haven't upvoted, when they click upvote, then the count increases by exactly one and cannot be incremented twice by the same user |
| Admin US-1 | Given ≥1 ticket exists, when an admin visits the dashboard, then KPI cards and charts render accurate, current aggregated data |
| Admin US-3 | Given a ticket has an ML-assigned category, when an admin overrides it, then the category updates and an audit log entry is created |

---

## 17. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Insufficient training data for waterlogging/streetlight categories | High | High | Manual data collection/labeling built into timeline |
| 2 | Duplicate-detection radius mistuned | Medium | Medium | Category-specific radius tuning during testing |
| 3 | Low citizen adoption (cold start) | Medium | High | Pilot in limited, well-defined zone |
| 4 | Data privacy concerns (geotagged photos) | Low | Medium | Baseline privacy handling, minimal metadata retention |
| 5 | Lack of municipal buy-in limits real-world impact | Medium | High | Position as citizen-facing tool independent of formal integration |
| 6 | Free-tier infrastructure limits reached | Low | Medium | Clear upgrade path (Render/Railway → AWS/GCP) |

---

## 18. Assumptions

1. Pilot/MVP-stage project for a single city/zone, not immediate nationwide deployment.
2. Moderator role and ticket comments are Should-Have, may be descoped under timeline pressure.
3. Super Admin role is future scope, not required for single-zone MVP.
4. MFA and push notifications explicitly deferred; architecture remains compatible with adding them later.
5. Full regulatory compliance certification out of scope for MVP.
6. Public datasets assumed sufficient for pothole/garbage; waterlogging/streetlight require manual collection.
7. English is the only supported language for MVP.
8. Free/low-cost infrastructure tiers assumed adequate for MVP-scale traffic.
9. No direct integration with government ticketing systems assumed for MVP.
10. Target scale: single-city pilot, 50–200 concurrent users, 2,000–10,000 monthly active users.

---

## 19. Constraints

1. Budget — free/low-cost infrastructure tiers assumed during MVP.
2. Dataset availability — waterlogging/streetlight categories require manual collection/labeling.
3. Team size/skill breadth — small team covering full-stack, ML, and deployment.
4. Timeline — ~9–12 week academic/early-stage schedule limits scope.
5. No official government data integration at MVP stage.

---

## 20. Future Enhancements

1. Integration with municipal/government ticketing APIs.
2. Multi-city/multi-zone support with Super Admin role activation.
3. Native mobile apps (iOS/Android) with push notifications.
4. MFA for admin accounts.
5. Predictive analytics (flood-prone area forecasting).
6. Multi-language support.
7. Public API for third-party civic-tech/research access to anonymized data.

---

## 21. Release Plan

| Release | Scope | Target Milestone |
|---|---|---|
| Alpha (Internal) | Core reporting flow, ML classification, duplicate detection, basic ticket lifecycle | End of Development Phase (Week 7) |
| Beta (Pilot) | Full MVP feature set incl. public dashboard, admin analytics, upvote system | End of Testing Phase (Week 9–10) |
| v1.0 (Production Pilot Launch) | Stabilized Beta, security-reviewed, deployed for single-city pilot | End of Deployment Phase (Week 11–12) |

---

## 22. Project Milestones

| Milestone | Target Timeframe |
|---|---|
| Requirement finalization & tech stack confirmed | Week 1 |
| Wireframes, DB schema, API contracts finalized | Week 2–3 |
| Backend API core functionality complete | Week 5 |
| ML model trained and integrated | Week 6 |
| Frontend (citizen + admin) core functionality complete | Week 7 |
| Full functional + security testing complete | Week 9 |
| Production deployment | Week 11–12 |

---

## 23. Glossary

| Term | Definition |
|---|---|
| Ticket | Consolidated record representing a single civic issue, backed by one or more reports |
| Report | An individual citizen submission (photo + geotag) |
| Severity | ML-assigned urgency classification (low/medium/high) |
| Duplicate Detection | Combined geospatial + image-similarity process for matching reports to tickets |
| RBAC | Role-Based Access Control |
| KPI | Key Performance Indicator |
| MVP | Minimum Viable Product |

---

## 24. References

- Project Details established during product discovery.
- OWASP Top 10 (referenced for security requirements in TDD/System Architecture).
- WCAG 2.1 AA (referenced for accessibility requirements).

---

## 25. Appendix

**Carried-Forward Decisions for Subsequent Documents:**
- Architecture: Modular Monolith with isolated ML microservice
- Database: MongoDB with `2dsphere` indexing
- Authentication: JWT via `djangorestframework-simplejwt`
- User Roles: Citizen, Moderator (optional), Admin, Super Admin (future scope)
