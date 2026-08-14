# SkillBridge Backend Context

This is the authoritative backend source of truth. The supplied MVC/MySQL and use-case diagrams are conceptual references only. Where they conflict with this file, this file wins.

Use [README.md](README.md) as the context index and root [forbackend.md](../forbackend.md) as the implementation sequence. Exact routes, DTO fields, mappings, permissions, ownership, and tests are defined in the concern-specific companion files.

## 1. Product and frontend scope

SkillBridge is a peer-learning platform. One authenticated account may learn, mentor, volunteer, participate in reciprocal swaps, post in the forum, and hold points.

Learning modes:

- `POINTS`: learner points are held in escrow and paid to the mentor after valid completion.
- `SKILL_SWAP`: the mentor teaches one agreed skill and the requester offers an owned teachable skill the mentor wants; no points move.
- `VOLUNTEER`: mentor teaches free; no points move.

The backend must support the current Lovable routes:

- `/`: profile, dashboard, wallet/escrow, teach/learn skills, certificates, activity, and upcoming sessions.
- `/mentors`: search/filter, mentor details, availability, offerings, and all three request modes.
- `/sessions`: pending requests, scheduled/completed/disputed sessions, meeting links, confirmations, reviews, and reports.
- `/forum`: volunteer posts, comments, likes, leaderboard, and free session requests.
- `/admin`: statistics, moderation, warnings, user state, settings, disputes, and audit history.
- Top navigation: current identity, wallet, notifications, and global search.

Direct messaging, referrals, advanced milestones, AI matching, in-app video, real-money payments, and mobile applications are outside the current MVP. Google Meet remains an optional external link.

## 2. Required stack and boundary

- React/TypeScript frontend generated and maintained through Lovable/TanStack Start.
- JSON REST API under `/api/v1` plus multipart certificate upload and CSV wallet export.
- Java 21 and Spring Boot 3.x.
- Tomcat 10.1+ embedded in the preferred executable JAR; external Tomcat 10.1+ WAR is optional.
- Spring Security with backend-issued 30-minute JWT access tokens and rotating refresh tokens.
- Neon-hosted PostgreSQL over SSL as the only business system of record.
- Spring Data JPA for ordinary persistence and explicit PostgreSQL locking/native queries for correctness-critical commands.
- Flyway for all schema changes; PostgreSQL Testcontainers for database behavior.
- OpenAPI 3.1 and local/test Swagger UI.

Do not use MySQL syntax, driver, auto-increment assumptions, JSP forwarding, direct Neon access from React, legacy `javax.servlet.*`, or Hibernate automatic schema creation in shared environments.

## 3. Identity and authorization

- `users.id` is the sole UUID identity across login, profile, learner, mentor, forum author, and admin behavior.
- Store only Argon2id/BCrypt password hashes and hashed opaque refresh tokens. Never store raw passwords or tokens.
- Roles: `USER`, `MENTOR`, `ADMIN`. `MENTOR` is an authority on the same user identity, not a second account.
- Account statuses: `ACTIVE`, `WARNED`, `SUSPENDED`, `DISABLED`.
- Register creates user, `USER` role, wallet, and a single configurable starter award in one transaction. Default: 50 points.
- Access tokens expire after 30 minutes. Refresh tokens rotate on every use; reuse revokes the token family.
- Backend checks current role/account status plus resource ownership or participant relationship for every protected command/read.
- Only admins may manually change account status/roles, mutate catalog skills, resolve disputes, change platform settings, or perform wallet adjustments. The offering service may grant `MENTOR` automatically when an active user creates their first eligible offering.

See [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md).

## 4. Workable lifecycle

### Point request

1. User registers/logs in and adds teach/learn skills.
2. User searches active mentor offerings by name, major, skill, level, or mode.
3. Requester sends mentor offering ID, requested skill ID, future start, duration, message, and `POINTS` mode.
4. Server reads the offering price, locks the requester's wallet, checks funds, moves available points to held, writes immutable hold ledger data, and creates `PENDING` request plus `HELD` escrow atomically.
5. Mentor accepts or rejects. Accept creates exactly one `SCHEDULED` session. Reject/cancel/expiry refunds escrow once.
6. After delivery, either participant confirms. First confirmation changes the session to `AWAITING_CONFIRMATION` and records an auto-release deadline using the current default of 18 hours.
7. Second confirmation atomically completes the session and releases escrow to the mentor.
8. If the second confirmation does not arrive, the job releases after the snapshotted deadline only when no dispute exists.
9. A dispute changes the session and escrow to `DISPUTED`, blocking release until an admin resolves it.

### Skill swap

1. Requester selects a skill from an active mentor offering.
2. Requester sends `offeredUserSkillId` referencing their visible `TEACH` skill.
3. Server requires the mentor to have a matching active `LEARN` skill and validates the mentor's offered teach skill.
4. Server creates request and `skill_swaps` row containing both foreign keys and immutable names/levels. No wallet, escrow, or ledger rows are created.
5. Mentor accepts; one linked session is created.
6. Both participants must confirm. The second confirmation marks session and swap `COMPLETED` atomically.
7. A dispute blocks completion. Automatic one-sided completion is disabled for swaps in the initial implementation.

### Volunteer/forum request

- Direct volunteer requests use an active offering and cost zero.
- A request from a forum post includes `sourceForumPostId`, must target the post author, and is server-forced to `VOLUNTEER`.
- Volunteer workflows never create escrow or point-ledger rows.

### Review and forum reward

- A participant may review the other participant once per completed session; rating is 1 through 5 and text is optional.
- Reviews do not directly calculate or grant points.
- The configurable 5-point forum contribution reward is granted only through the defined helpful-contribution action, with an idempotency key and unique ledger constraint.

## 5. State machines

- Request: `PENDING -> ACCEPTED | REJECTED | CANCELLED | EXPIRED`.
- Session: `SCHEDULED -> AWAITING_CONFIRMATION | COMPLETED | DISPUTED | CANCELLED`; `AWAITING_CONFIRMATION -> COMPLETED | DISPUTED`; `DISPUTED -> COMPLETED | CANCELLED` by admin resolution.
- Skill swap: `PROPOSED -> ACCEPTED | REJECTED | CANCELLED`; `ACCEPTED -> AWAITING_CONFIRMATION | DISPUTED`; `AWAITING_CONFIRMATION -> COMPLETED | DISPUTED`; `DISPUTED -> COMPLETED | CANCELLED`.
- Escrow: `HELD -> RELEASED | REFUNDED | DISPUTED`; `DISPUTED -> RELEASED | REFUNDED`.
- Report: `OPEN -> DISMISSED | ACTIONED`.

Clients send commands and expected versions; they never submit replacement status values.

## 6. Neon PostgreSQL model

Use UUID primary keys, `timestamptz`, UTC, foreign keys, check constraints, and `created_at`/`updated_at`. Mutable workflow tables have an integer `version`. Stable status tokens use `varchar` plus checks so Flyway and JPA remain aligned.

Identity/profile:

- `users`: email, password hash, profile fields, timezone, avatar object key, account status, version.
- `user_roles`: `(user_id, role)` primary key.
- `refresh_tokens`: user, token-family ID, token hash, expiry, revocation, replacement reference.

Skills/offers:

- `skills`: normalized unique name/slug, description, active.
- `user_skills`: user, skill, `TEACH|LEARN`, level, visible; unique `(user_id, skill_id, direction)`.
- `mentor_offerings`: mentor, owned teach user-skill, point cost, enabled modes, duration, availability, active, version.

Requests/sessions:

- `learning_requests`: requester, mentor, offering, requested skill, mode, status, schedule, duration, message, point-cost snapshot, source forum post, expiry, version.
- `skill_swaps`: unique request, both users, mentor/requester teach user-skills, immutable name/level snapshots, confirmations, status, completion, version.
- `sessions`: unique request, mentor/learner, mode, schedule, meeting URL, status, first confirmation, auto-release deadline, completion, version.
- `session_confirmations`: `(session_id, user_id)` primary key and confirmation timestamp.
- `reviews`: session, reviewer/reviewee, rating, body, visibility; unique `(session_id, reviewer_id)`.

Points:

- `wallets`: one per user, non-negative available/held balances, version.
- `point_ledger`: append-only available/held deltas, balances-after, event, reference, description, idempotency key.
- `escrows`: unique point request, payer, payee, amount, status, hold/release/refund/deadline, version.
- No escrow or point-ledger movement exists for `SKILL_SWAP` or `VOLUNTEER`.

Community/admin:

- `certificates`: owner, optional skill, private object key, original name, content type, size, status.
- `forum_posts`, `forum_post_skills`, `forum_comments`, `forum_likes`.
- `notifications`: owner, type, safe text/target, read timestamp.
- `reports`, `account_warnings`, `disputes`, `platform_settings`, `admin_audit_events`.

Required settings default to `registration_bonus_points=50`, `helpful_forum_contribution_points=5`, and `escrow_auto_release_hours=18`. Changes affect future operations only.

## 7. Transaction rules

- Wallet mutation requires `SELECT ... FOR UPDATE`/pessimistic locking and a consistent multi-wallet lock order.
- Wallet and ledger updates occur in one transaction. Ledger rows are append-only; corrections use compensating entries.
- Every financial command and retryable workflow command has a unique idempotency record/constraint.
- Point request uses the current offering price and snapshots it; the browser cannot submit an authoritative amount.
- Skill swap validates both current owned skill rows and stores immutable agreement snapshots.
- Completion locks session plus escrow/swap. Release/refund/completion can happen once.
- Admin resolutions write audit events in the same transaction as the resolved business effect.
- Historical requests, sessions, swaps, escrow, ledger, reviews, warnings, disputes, and audits are not hard-deleted.

## 8. Neon and storage decisions

- Use `jdbc:postgresql://<neon-host>/<database>?sslmode=require` through environment variables.
- Use Neon pooled connection details for web traffic and direct connection details for migrations if required.
- Start with a small Hikari maximum pool size such as 5; tune from the deployed plan and metrics.
- Use separate Neon branches/databases for development, test, and production.
- Runtime role is least privilege; migration role is separate when possible.
- `spring.jpa.hibernate.ddl-auto=validate`; Flyway is the only schema writer.
- File bytes use a replaceable private storage adapter. Store generated object keys and verified metadata, never public URLs or user-provided paths.
- Certificate upload is PDF only, maximum 10 MB, with MIME and file-signature verification.
- Secrets remain in environment variables/secret manager and are never committed or returned to React.

## 9. API/frontend alignment

- All frontend identity comes from `GET /me`; remove hard-coded Alex/Ava identity assumptions.
- Dashboard uses `GET /me/dashboard`; wallet badge/history use wallet endpoints.
- Mentor cards require skill/offer IDs, not skill names as keys.
- Request UI must send both `requestedSkillId` and, for swaps, `offeredUserSkillId`.
- Completion response explicitly returns `pointsReleased`; React must not announce release before it is true.
- Pending requests expose allowed actions so the mentor sees Accept/Reject and the requester sees Cancel.
- Completed point sessions do not display held escrow.
- Forum author, likes, comments, and counts are server-owned.
- Admin visibility comes from the JWT/database role, not a browser boolean.
- Notification popover does not silently mark all read unless the frontend calls read-all.

[API_CONTRACT.md](API_CONTRACT.md) is the complete route inventory and [DTO_CATALOG.md](DTO_CATALOG.md) is the complete wire-field inventory.

## 10. Delivery quality bar

- Controllers contain HTTP translation only; application services own authorization, state, and transactions.
- JPA entities never cross the API boundary.
- Flyway migrations work from empty and previous schemas.
- PostgreSQL Testcontainers cover constraints, locks, idempotency, wallet concurrency, skill-swap matching, escrow, disputes, and admin resolution.
- OpenAPI/DTO/security tests match every endpoint.
- Build, lint, tests, migration validation, and complete frontend workflow pass before integration.
- Structured logs use request IDs and contain no secrets, private links, tokens, or personal payloads.

The backend is ready when point, swap, and volunteer workflows run repeatedly against the current frontend without duplicate state or incorrect point movement.
