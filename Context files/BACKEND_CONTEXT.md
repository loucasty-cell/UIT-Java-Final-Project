# SkillBridge Backend Context

Use this file as the source of truth when building the backend. The proposal diagrams are references only; where they conflict with this file, this file wins.

Use [README.md](README.md) as the context index. Exact routes, DTO fields, mappings, permissions, controller ownership, and automated coverage are defined in their concern-specific companion files.

## 1. Product and scope

SkillBridge is a peer-to-peer learning platform. A user can teach skills, list skills they want to learn, find mentors, and request a session using one of three modes:

- `POINTS`: learner pays with Skill Points held in escrow.
- `SWAP`: both users exchange agreed skills in the same session; no points move.
- `VOLUNTEER`: mentor teaches for free; no points move.

MVP includes profiles, skills, mentor search, learning requests, sessions, points/escrow, reviews, certificates, volunteer forum, notifications, disputes, and basic administration.

Direct messaging, referrals, advanced milestones, AI matching, video hosting, payments, and a mobile app are later scope. Google Meet remains external.

## 2. Required architecture

- Java 21, Maven, and the current stable Spring Boot compatible with Java 21.
- REST JSON backend under `/api/v1`; do not build JSP/Servlet pages.
- Lovable SPA is the client.
- Supabase Auth owns registration, login, password reset, and email verification.
- Spring Security validates Supabase access tokens through the project JWKS endpoint.
- Spring Boot is the only write path for application tables and all point operations.
- Supabase PostgreSQL is the system of record; use Spring Data JPA and Flyway.
- Supabase Storage holds profile images and certificate files.
- Publish an OpenAPI 3.1 contract and Swagger UI for development.

Never store passwords in application tables. Never expose the database password, Supabase secret/service key, or storage service key to the frontend.

## 3. Identity and authorization

- The application user ID is the Supabase Auth `sub` claim: UUID everywhere.
- `profiles.id` references `auth.users.id`; do not create separate `User` and `Admin` identities.
- Roles: `USER`, `ADMIN`. Account states: `ACTIVE`, `SUSPENDED`, `DELETED`.
- A user may act as learner and mentor; “mentor” is a session role, not an account role.
- Backend authorization must check resource ownership and session participation, not only authentication.
- Only an admin may change roles, account states, catalog skills, or resolve disputes.

## 4. Workable lifecycle

1. User signs up with Supabase Auth and calls idempotent onboarding.
2. Backend creates profile and wallet and grants configurable starter points once. Default: `30`.
3. User adds `TEACH` and `LEARN` skills and optional certificates.
4. Learner searches enabled teaching offers by skill, level, mode, name, or major.
5. Learner sends a request with mentor offering, proposed UTC time, duration, mode, and message.
6. For `POINTS`, backend atomically moves the quoted price from available to held points. Reject the request if funds are insufficient.
7. Mentor accepts or rejects. Rejection, learner cancellation, or expiry releases held points.
8. Acceptance creates exactly one session. Mentor can add a valid Google Meet URL.
9. After the scheduled end, either participant may mark completion. The first confirmation starts a 24-hour completion window.
10. Second confirmation completes immediately. Otherwise, complete automatically after 24 hours if no dispute exists.
11. Completion transfers held points to the mentor for `POINTS`; `SWAP` and `VOLUNTEER` transfer nothing.
12. A dispute freezes escrow until an admin refunds the learner or releases it to the mentor.
13. After completion, the learner may review the mentor once. A valid first review grants configurable reward points once. Default: `5`.

Allowed request states: `PENDING -> ACCEPTED | REJECTED | CANCELLED | EXPIRED`.

Allowed session states: `SCHEDULED -> COMPLETION_PENDING | CANCELLED | DISPUTED`, `COMPLETION_PENDING -> COMPLETED | DISPUTED`, and `DISPUTED -> COMPLETED | REFUNDED` after admin resolution. A permitted cancellation or refund releases escrow.

Either participant may cancel only while the session is `SCHEDULED` and before its start; after the start, problems use the dispute flow. A dispute may open from the scheduled start until payout, while state is `SCHEDULED` or `COMPLETION_PENDING`.

All state transitions are server controlled. Clients send commands; they never send a replacement status value.

## 5. Database model

Use UUID primary keys, `timestamptz` for instants, UTC storage, foreign keys, check constraints, and `created_at`/`updated_at`. Use `varchar` plus database check constraints for statuses. Add a `version` column to mutable request, session, wallet, and dispute rows.

Core tables:

- `profiles`: auth UUID, display name, bio, major, study year, phone as text, avatar path, role, status.
- `skill_catalog`: normalized unique name/slug, category, description, enabled.
- `user_skills`: user, skill, direction (`TEACH`/`LEARN`), proficiency, points price, `supports_points`, `supports_swap`, `supports_volunteer`, enabled. Unique `(user_id, skill_id, direction)`.
- `certificates`: owner, optional skill, private storage path, original name, MIME type, size, verification state.
- `learning_requests`: learner, mentor, mentor teaching skill, optional learner swap skill, mode, proposed start/end, message, quoted points, status, expiry.
- `sessions`: unique request, scheduled start/end, Meet URL, status, each participant's completion time, auto-complete time, final completion time.
- `wallets`: one per user, non-negative available and held balances, version.
- `point_ledger`: immutable deltas to available/held balance, event type, related entity, actor, and unique idempotency key.
- `reviews`: completed session, learner/reviewer, mentor/reviewee, rating `1..5`, comment, reward flag. Unique `(session_id, reviewer_id)`.
- `disputes`: session, opened by participant, reason, evidence text, state, admin resolution, resolved by/at.
- `forum_posts`: author, optional teaching skill, title, body, tags, active state. A free-session request reuses `learning_requests` with `VOLUNTEER` and `source_post_id`.
- `forum_comments` and `forum_reactions`: author, parent resource, timestamps; one reaction per user/post.
- `notifications`: user, type, payload or related entity, read time.
- `reports`: reporter, target type/id, reason, state, assigned admin, resolution.

Required rules:

- Learner and mentor must differ.
- The selected teaching skill must belong to the mentor and support the selected mode.
- `SWAP` requires an enabled learner teaching skill accepted by the mentor.
- `POINTS` requires positive `quoted_points`; other modes require zero.
- A session can only be created once for an accepted request.
- A review requires a completed session and the correct learner/mentor pair.
- Historical requests, sessions, ledger entries, and reviews are never hard-deleted.
- Index foreign keys plus mentor search fields, request/session participant and status fields, notification `(user_id, read_at)`, and ledger `(user_id, created_at)`.

Do not use `profiles.points` as a balance. Wallet and ledger changes must occur in one database transaction with a wallet row lock. Every point-changing command must have a unique idempotency key so retries cannot duplicate rewards or transfers.

## 6. Supabase decisions

- Persistent Spring Boot deployment: use the direct PostgreSQL connection when IPv6 is available; otherwise use Supavisor session mode on port `5432`.
- Use SSL and a small Hikari pool appropriate to the Supabase plan. Do not use transaction mode unless deployment is serverless and prepared statements are disabled.
- Run schema changes only through versioned Flyway migrations. JPA schema mode must be validation, never automatic update/create in shared environments.
- If the frontend never queries tables directly, disable or lock down the Supabase Data API for application tables. Use a least-privilege database role.
- Store avatars separately from private certificates. Certificates must use a private bucket and owner-scoped paths; return short-lived signed URLs after authorization.
- Validate upload MIME type, extension, and size on the backend. Store object paths, never public URLs, in database rows.
- Keep secrets in environment variables or a secret manager. Commit only an example environment file with placeholders.

## 7. API contract

General rules:

- JSON uses `camelCase`; database uses `snake_case`.
- UUIDs are strings. Times are ISO-8601 UTC such as `2026-07-24T09:30:00Z`.
- Points are whole integers. The server calculates prices, balances, roles, rewards, and statuses.
- Collections return `{ items, page, size, total }`; default size `20`, maximum `100`.
- Support stable sorting and documented query filters. Never expose arbitrary database column sorting.
- Use `201` for creation, `204` for successful no-body commands, `400` malformed input, `401` missing/invalid token, `403` forbidden, `404` hidden/not found, `409` state or duplicate conflict, and `422` valid JSON that violates a business rule.
- Errors use `application/problem+json` following RFC 9457 with `type`, `title`, `status`, `detail`, `instance`, `code`, `traceId`, and field `errors` when applicable. Never return stack traces.
- Require `Idempotency-Key` on onboarding, session request creation, completion, review reward, and dispute resolution.
- Restrict CORS to configured Lovable production/preview origins and local development origins.

Endpoint groups:

- Profile: `POST /me/onboarding`, `GET/PATCH /me`, `GET /users/{id}`.
- Skills: `GET /skills`, `GET/POST /me/skills`, `PATCH/DELETE /me/skills/{id}`; delete soft-disables the row.
- Mentors: `GET /mentors` with `q`, `skillId`, `level`, `mode`, `page`, `size`, `sort`.
- Certificates: `POST /me/certificates/upload-intents`, `POST/GET /me/certificates`, `DELETE /me/certificates/{id}`.
- Requests: `POST /learning-requests`, `GET /me/learning-requests`, `POST /learning-requests/{id}/accept`, `/reject`, `/cancel`.
- Sessions: `GET /me/sessions`, `GET /sessions/{id}`, commands for Meet link, completion, cancellation, and `POST /sessions/{id}/disputes`.
- Wallet: `GET /me/wallet`, `GET /me/point-transactions`.
- Reviews: `POST /sessions/{id}/reviews`, `GET /users/{id}/reviews`.
- Forum: list/create posts, comments, reactions, and `POST /forum-posts/{id}/session-requests`.
- Notifications: `GET /me/notifications`, `POST /me/notifications/{id}/read`, `POST /me/notifications/read-all`.
- Admin: users, catalog skills, reports, disputes, wallet audit, and explicit adjustment/resolution commands.

This list is a domain summary. [API_CONTRACT.md](API_CONTRACT.md) is the complete route inventory and [DTO_CATALOG.md](DTO_CATALOG.md) is the complete wire-field inventory.

Command endpoints must re-read current state, enforce authorization, and be transactional. Never trust participant IDs, point cost, reward amount, wallet balance, rating aggregates, or account role supplied by the client.

## 8. Frontend alignment required

The inspected Lovable UI is a useful prototype but currently has contract gaps:

- Header user and dashboard user names are inconsistent; all identity data must come from `/me`.
- Pending mentor requests need Accept and Reject actions.
- Completed sessions need a Review action, and completed point sessions must not display “Locked in Escrow”.
- Session completion, auto-complete countdown, cancellation, and dispute resolution must reflect backend states exactly.
- The Admin frontend route is a placeholder; implement only the basic admin APIs in `API_CONTRACT.md`. The advanced Milestones page and APIs remain outside MVP.
- The proposal mentions chat/referrals, but the current frontend does not implement them; keep them out of MVP.

## 9. Delivery quality bar

- Layer by feature: controller, application/service, domain/entity, repository, DTO/mapper. Controllers contain no business logic.
- Never expose JPA entities directly. Validate request DTOs and map explicit response DTOs.
- Add database integration tests with PostgreSQL/Testcontainers for wallet concurrency, escrow release, payout, duplicate requests, auto-completion, disputes, and review rewards.
- Add authorization tests for owner, participant, unrelated user, suspended user, and admin.
- Add OpenAPI contract tests and verify the Lovable client against them.
- Implement every required case in [TESTING_MATRIX.md](TESTING_MATRIX.md).
- Provide health endpoints, structured logs with trace IDs, and no secrets or personal data in logs.

The backend is ready for frontend integration only when the complete flow works twice without duplicate points: onboard -> create teaching skill -> find mentor -> request -> hold -> accept -> schedule -> complete/timeout -> payout -> review -> reward.
