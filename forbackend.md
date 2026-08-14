# SkillBridge Backend Implementation Guide

## 1. Goal and source of truth

Build the backend required by the current Lovable/React frontend using:

- Java 21
- Spring Boot 3.x
- REST API
- Tomcat 10.1+
- PostgreSQL hosted by Neon
- Flyway migrations

Do not use MySQL. The supplied MVC image is conceptual only: replace "MySQL Database" with Neon PostgreSQL and replace server-rendered MVC views/forwarding with a React client calling JSON REST controllers.

The current frontend routes are the functional source of truth:

- `/`: profile, wallet, skills, certificates, dashboard metrics, and activity.
- `/mentors`: mentor search and point, skill-swap, or volunteer requests.
- `/sessions`: pending, scheduled, completed, and disputed sessions; completion, reviews, escrow, and issue reporting.
- `/forum`: volunteer posts, likes, comments, leaderboard, and free requests.
- `/admin`: statistics, moderation, user warnings, reward settings, escrow timing, and disputes.

[Context files/API_CONTRACT.md](Context%20files/API_CONTRACT.md) is the HTTP contract. [Context files/REQUIRED_SKILLS.md](Context%20files/REQUIRED_SKILLS.md) defines the expected engineering capabilities.

## 2. Important frontend corrections

The backend must not copy the frontend's mock data literally.

1. The UI currently displays more than one hard-coded identity. All screens must use the user returned by `/api/v1/me`.
2. Display strings are not database IDs. Send UUIDs for users, offerings, skills, requests, sessions, posts, and comments.
3. The request modal must send `requestedSkillId`. A mentor may teach several skills, so mentor ID alone is insufficient.
4. A skill-swap request must also send `offeredUserSkillId`; the backend verifies that it is owned by the requester and wanted by the mentor.
5. The UI currently behaves as if one completion click releases points. The backend releases points only after both participants confirm or the no-dispute auto-release rule runs.
6. Point prices, wallet balances, escrow amounts, identities, roles, rewards, ratings, and timestamps are server-owned.
7. The current frontend's registration bonus of 50 points, helpful forum contribution reward of 5 points, and escrow auto-release of 18 hours are defaults stored in platform settings. Older diagrams showing +30 points or MySQL are outdated.
8. Admin visibility comes from the authenticated `ADMIN` role. It is never controlled by a browser boolean alone.

## 3. Architecture

```text
Lovable React client
        |
        | HTTPS JSON + JWT
        v
Spring Security filter chain
        |
REST controllers -> DTO validation -> application services
        |                                  |
        |                                  +-> domain/state rules
        v
repositories / explicit locking queries
        |
        v
Neon PostgreSQL
```

Use a modular monolith for this project. It is simpler to deploy and allows request, wallet, escrow, session, review, and skill-swap changes to share one PostgreSQL transaction.

Recommended packages:

```text
com.skillbridge
  auth
  user
  skill
  mentor
  request
  session
  wallet
  forum
  notification
  moderation
  admin
  shared
    config
    error
    idempotency
    security
```

Within each feature, separate controller, DTO, service, domain/entity, and repository code. Controllers perform HTTP mapping and validation; services own transactions and state changes; repositories persist data.

## 4. Spring Boot and Tomcat setup

Use Spring Boot 3.x compatible with Java 21. Required starters/libraries:

- `spring-boot-starter-web` for REST and embedded Tomcat 10.1+.
- `spring-boot-starter-validation`.
- `spring-boot-starter-security`.
- OAuth/JWT support or a maintained JWT library.
- `spring-boot-starter-data-jpa`.
- PostgreSQL JDBC driver.
- Flyway PostgreSQL support.
- Actuator for health checks.
- Testcontainers PostgreSQL for integration tests.

Preferred packaging is an executable JAR using embedded Tomcat. If the course specifically requires deployment to an installed Tomcat, produce a WAR, mark the embedded servlet container as provided, extend `SpringBootServletInitializer`, and deploy only to Tomcat 10.1+ with Java 21. In both cases use `jakarta.servlet`, not `javax.servlet`.

## 5. Neon PostgreSQL configuration

Keep credentials outside Git. Use environment variables:

```text
DATABASE_URL=jdbc:postgresql://<neon-host>/<database>?sslmode=require
DATABASE_USERNAME=<role>
DATABASE_PASSWORD=<secret>
JWT_SECRET=<at-least-256-bit-secret>
ACCESS_TOKEN_MINUTES=30
REFRESH_TOKEN_DAYS=30
FRONTEND_ORIGINS=http://localhost:5173,https://<lovable-domain>
```

Production rules:

- Require SSL with Neon.
- Use a small Hikari connection pool appropriate for the selected Neon plan; start with a maximum of 5 and tune from metrics.
- Use Neon pooled connection details for normal web traffic and a direct connection for migrations if required by the Neon setup.
- Set `spring.jpa.hibernate.ddl-auto=validate`. Flyway, not Hibernate, owns schema creation.
- Disable open-session-in-view.
- Store every instant in `timestamptz` and normalize to UTC.
- Use separate Neon branches/databases for development, test, and production.
- Never run tests against production.

## 6. Database model

Use UUID primary keys generated by the application or PostgreSQL. Every mutable business table should have `created_at`, `updated_at`, and an integer `version` for optimistic locking where relevant. Prefer check constraints and foreign keys over application-only validation.

### Identity and profile

#### `users`

- `id uuid primary key`
- `email varchar unique not null`
- `password_hash varchar not null`
- `display_name varchar not null`
- `major varchar`
- `year_of_study smallint`
- `bio text`
- `timezone varchar not null default 'UTC'`
- `avatar_object_key varchar`
- `account_status varchar not null`
- timestamps and version

#### `user_roles`

- `user_id uuid references users`
- `role varchar` with `USER`, `MENTOR`, or `ADMIN`
- primary key `(user_id, role)`

#### `refresh_tokens`

- token ID/family ID, `user_id`, token hash, expiry, revoked timestamp, replacement token ID, and creation metadata
- store only a hash of the opaque refresh token

The same `users.id` identifies a learner, mentor, forum author, and admin. Do not create separate learner and mentor account tables.

### Skills and mentor offerings

#### `skills`

- `id uuid primary key`
- `slug varchar unique not null`
- `name varchar unique not null`
- `description text`
- `active boolean not null default true`

#### `user_skills`

- `id uuid primary key`
- `user_id uuid references users`
- `skill_id uuid references skills`
- `direction varchar` with `TEACH` or `LEARN`
- `level varchar` with `BEGINNER`, `INTERMEDIATE`, or `ADVANCED`
- `visible boolean not null default true`
- timestamps
- unique `(user_id, skill_id, direction)`

#### `mentor_offerings`

- `id uuid primary key`
- `mentor_id uuid references users`
- `teach_user_skill_id uuid references user_skills`
- `point_cost integer check (point_cost >= 0)`
- `points_enabled boolean`
- `skill_swap_enabled boolean`
- `volunteer_enabled boolean`
- `duration_minutes integer`
- `availability_text text`
- `active boolean`
- timestamps and version

The service must verify that `teach_user_skill_id` belongs to `mentor_id`, has direction `TEACH`, and is visible.

### Learning requests, skill swaps, and sessions

#### `learning_requests`

- `id uuid primary key`
- `requester_id uuid references users`
- `mentor_id uuid references users`
- `mentor_offering_id uuid references mentor_offerings`
- `requested_skill_id uuid references skills`
- `mode varchar` with `POINTS`, `SKILL_SWAP`, or `VOLUNTEER`
- `status varchar`
- `scheduled_start timestamptz`
- `duration_minutes integer`
- `message text`
- `point_cost_snapshot integer`
- `source_forum_post_id uuid nullable`
- `expires_at timestamptz`
- timestamps and version

Required constraints include requester not equal to mentor, future schedule at creation, non-negative snapshot, and one selected mode.

#### `skill_swaps`

- `id uuid primary key`
- `learning_request_id uuid unique references learning_requests`
- `requester_id uuid references users`
- `mentor_id uuid references users`
- `mentor_teach_user_skill_id uuid references user_skills`
- `requester_teach_user_skill_id uuid references user_skills`
- `mentor_skill_name_snapshot varchar not null`
- `mentor_skill_level_snapshot varchar not null`
- `requester_skill_name_snapshot varchar not null`
- `requester_skill_level_snapshot varchar not null`
- `status varchar not null`
- `requester_confirmed_at timestamptz`
- `mentor_confirmed_at timestamptz`
- `completed_at timestamptz`
- timestamps and version

The two skill snapshots preserve what was agreed even if either user later edits their profile. Foreign keys preserve traceability; snapshot columns preserve history.

#### `sessions`

- `id uuid primary key`
- `learning_request_id uuid unique references learning_requests`
- `mentor_id uuid references users`
- `learner_id uuid references users`
- `mode varchar not null`
- `status varchar not null`
- `scheduled_start timestamptz not null`
- `duration_minutes integer not null`
- `meeting_url varchar nullable`
- `first_completion_at timestamptz nullable`
- `auto_release_at timestamptz nullable`
- `completed_at timestamptz nullable`
- timestamps and version

#### `session_confirmations`

- `session_id uuid references sessions`
- `user_id uuid references users`
- `confirmed_at timestamptz not null`
- primary key `(session_id, user_id)`

Only the mentor and learner may have confirmation rows.

#### `reviews`

- `id uuid primary key`
- `session_id uuid references sessions`
- `reviewer_id uuid references users`
- `reviewee_id uuid references users`
- `rating smallint check (rating between 1 and 5)`
- `body text`
- `visible boolean default true`
- timestamps
- unique `(session_id, reviewer_id)`

### Wallet, ledger, and escrow

#### `wallets`

- `user_id uuid primary key references users`
- `available_points integer not null check (available_points >= 0)`
- `held_points integer not null check (held_points >= 0)`
- `version integer not null`
- timestamps

#### `point_ledger`

- `id uuid primary key`
- `wallet_user_id uuid references users`
- `type varchar` such as `REGISTRATION_BONUS`, `FORUM_REWARD`, `ESCROW_HOLD`, `ESCROW_RELEASE`, `ESCROW_REFUND`, or `ADMIN_ADJUSTMENT`
- `available_delta integer not null`
- `held_delta integer not null`
- `available_balance_after integer not null`
- `held_balance_after integer not null`
- `reference_type varchar`
- `reference_id uuid`
- `description varchar`
- `idempotency_key uuid`
- `created_at timestamptz not null`
- unique `(wallet_user_id, idempotency_key, type)`

Ledger rows are append-only. Never update or delete them; corrections use compensating entries.

#### `escrows`

- `id uuid primary key`
- `learning_request_id uuid unique references learning_requests`
- `payer_id uuid references users`
- `payee_id uuid references users`
- `amount integer check (amount > 0)`
- `status varchar not null`
- `held_at`, `released_at`, `refunded_at`, and `auto_release_at` as `timestamptz`
- version

There is no escrow row for `SKILL_SWAP` or `VOLUNTEER`.

### Forum and notifications

#### `forum_posts`

- author, title, description, availability text, active/deleted flags, timestamps, and version

#### `forum_post_skills`

- primary key `(post_id, skill_id)`

#### `forum_comments`

- post, author, body, deleted flag, timestamps, and version

#### `forum_likes`

- primary key `(post_id, user_id)` and `created_at`

#### `notifications`

- user, type, title, detail, tone, target path, read timestamp, and creation timestamp

Like and comment counts should be queried efficiently; do not trust counts submitted by clients.

### Moderation and settings

#### `reports`

- reporter, target type, target ID, reason, details, status, assigned admin, resolution, and timestamps

#### `account_warnings`

- warned user, admin user, reason, message, and created timestamp

#### `disputes`

- session, opened by, reason, details, status, resolution, resolved by, and timestamps

#### `platform_settings`

- `key varchar primary key`
- typed value or constrained JSON value
- version, updated by, and updated timestamp

Initial settings:

- `registration_bonus_points = 50`
- `helpful_forum_contribution_points = 5`
- `escrow_auto_release_hours = 18`

#### `admin_audit_events`

- admin user, action, target type, target ID, before JSON, after JSON, reason, request ID, and timestamp

## 7. Skill swap transaction

### Creating a proposal

Run all steps in one transaction:

1. Load the authenticated requester.
2. Load the selected active mentor offering and its mentor teach skill.
3. Reject self-requests.
4. Verify that `requestedSkillId` equals the offering's teach skill.
5. Verify that the offering allows `SKILL_SWAP`.
6. Load `offeredUserSkillId`; require ownership by the requester, `TEACH`, and visible.
7. Verify that the mentor currently has a matching `LEARN` user-skill row.
8. Create a `learning_requests` row with `PENDING`.
9. Create a `skill_swaps` row with `PROPOSED`, both foreign keys, and both immutable skill snapshots.
10. Create a notification for the mentor.
11. Commit and return the server-created request/swap data.

If two identical requests are retried with the same idempotency key, return the original response. If the key is reused with different content, return `409 IDEMPOTENCY_CONFLICT`.

### Accepting a proposal

1. Lock the request row.
2. Require the authenticated user to be the requested mentor.
3. Require request `PENDING` and swap `PROPOSED`.
4. Recheck that both referenced teach skills still exist. Historical snapshots remain authoritative for the agreement text.
5. Change request to `ACCEPTED` and swap to `ACCEPTED`.
6. Create one scheduled session linked to the request and swap.
7. Notify the requester.

No points or wallet rows are created.

### Completing a swap

1. Lock the session and swap rows.
2. Verify caller is one of the two participants and session is eligible.
3. Insert the caller's session confirmation with a unique `(session_id, user_id)` key.
4. If only one party confirmed, change the session and swap to `AWAITING_CONFIRMATION` and calculate `auto_release_at` from current settings.
5. If both confirmed, set the session and swap to `COMPLETED` and set completion timestamps.
6. Never modify either wallet.
7. If a dispute exists, reject normal completion until an admin resolves it.

## 8. Point and escrow transactions

### Holding points when a request is created

In one transaction:

1. Load the active mentor offering and read its price; ignore any price supplied by the browser.
2. Lock the requester's wallet row with `PESSIMISTIC_WRITE` or `SELECT ... FOR UPDATE`.
3. Require `available_points >= price`.
4. Subtract price from available and add it to held.
5. Create the pending request with `point_cost_snapshot`.
6. Create a `HELD` escrow row.
7. Append an `ESCROW_HOLD` ledger row.
8. Create the mentor notification.

### Releasing points

After both completion confirmations, or a valid auto-release job:

1. Lock the session, escrow, learner wallet, and mentor wallet in a consistent UUID order to reduce deadlocks.
2. Require escrow `HELD`, no open dispute, and a valid completion condition.
3. Subtract amount from learner held points.
4. Add amount to mentor available points.
5. Append corresponding immutable release ledger rows for both wallets.
6. Mark escrow `RELEASED` and session `COMPLETED`.
7. Commit before sending notifications.

### Refunding points

On allowed rejection, cancellation, expiry, or admin decision:

1. Lock the escrow and learner wallet.
2. Require escrow `HELD` or the allowed disputed state.
3. Subtract from held and return to available.
4. Append an `ESCROW_REFUND` ledger row.
5. Mark escrow `REFUNDED` and update the request/session state.

Every operation requires an idempotency key and a unique database constraint. API-level duplicate checks without database constraints are insufficient.

## 9. Request and session state rules

### Learning request

```text
PENDING -> ACCEPTED -> session created
PENDING -> REJECTED
PENDING -> CANCELLED
PENDING -> EXPIRED
```

Only the requested mentor can accept/reject. Only the requester can cancel before acceptance. Admin actions must be audited.

### Session

```text
SCHEDULED -> AWAITING_CONFIRMATION -> COMPLETED
SCHEDULED -> COMPLETED                 (second confirmation arrives immediately)
SCHEDULED/AWAITING_CONFIRMATION -> DISPUTED
DISPUTED -> COMPLETED or CANCELLED     (admin resolution)
SCHEDULED -> CANCELLED                 (policy-controlled)
```

State checks belong in the service layer and must also be protected by row locks/version checks.

## 10. Authentication and security

- Register creates one user, `USER` role, wallet, registration ledger entry, and starter points in one transaction.
- Access token lifetime is 30 minutes. The token contains user ID as subject and role claims.
- Store refresh-token hashes, rotate on every refresh, and revoke the token family on reuse detection or logout.
- Return `401 TOKEN_EXPIRED` for an expired access token so the frontend can refresh and retry once.
- Use BCrypt strength appropriate to deployment hardware or Argon2id. Never encrypt or store a reversible password.
- Apply method security and service-level ownership checks. URL secrecy is not authorization.
- Allow only configured Lovable/local origins through CORS; never use wildcard origins with credentials.
- Rate-limit login, registration, reports, comments, likes, requests, and uploads.
- Validate and sanitize all text lengths. Render user content as text, not raw HTML.
- Accept certificate PDFs up to 10 MB, verify file signature/MIME, generate storage object keys, and prevent path traversal.
- Do not log JWTs, passwords, refresh tokens, Neon credentials, meeting URLs, or uploaded file contents.

## 11. API implementation rules

- Implement exactly the routes and payload ownership described in [Context files/API_CONTRACT.md](Context%20files/API_CONTRACT.md).
- Use Bean Validation on request DTOs and domain validation in services.
- Never expose JPA entities, password hashes, refresh-token hashes, internal notes, or another user's private meeting URL.
- Use DTO projections for mentor cards, dashboard metrics, session cards, notifications, and admin queue rows.
- Calculate ratings from visible reviews in PostgreSQL; do not store a browser-controlled rating.
- Use soft deletion for forum content that may be referenced by moderation records.
- Return allowed actions or enough state for the frontend to enable/disable buttons accurately.
- Generate a request ID for every HTTP request and include it in errors and logs.
- Use UTC internally and return the user's timezone separately when needed for display.

## 12. Background jobs

Implement jobs that are safe to run more than once:

- Expire old pending requests and refund point escrows.
- Auto-release eligible point sessions after `auto_release_at` when no dispute exists.
- Auto-complete eligible skill swaps after the configured deadline only if project policy permits; otherwise leave them awaiting the second confirmation. The initial implementation should require two confirmations for swaps.
- Send queued notifications.
- Clean expired/revoked refresh tokens.

Use PostgreSQL row locking with skip-locked batch processing or a job-lock mechanism so multiple app instances cannot process the same row twice.

## 13. Flyway migration order

Recommended migration sequence:

1. `V1__users_roles_and_refresh_tokens.sql`
2. `V2__skills_and_user_skills.sql`
3. `V3__mentor_offerings.sql`
4. `V4__wallets_ledger_and_settings.sql`
5. `V5__learning_requests_skill_swaps_and_escrow.sql`
6. `V6__sessions_confirmations_and_reviews.sql`
7. `V7__forum_posts_comments_and_likes.sql`
8. `V8__notifications_reports_disputes_and_audit.sql`
9. `V9__indexes_and_seed_skill_catalog.sql`

Migrations must work on an empty PostgreSQL database and when upgrading from the previous version. Never edit an applied production migration; add a new migration.

## 14. Required indexes

At minimum add indexes for:

- Lowercased user email and display name search.
- Skill slug/name.
- `user_skills(user_id, direction)` and `(skill_id, direction, visible)`.
- Active mentor offerings by teach skill and enabled modes.
- Requests by requester/status and mentor/status.
- Sessions by each participant/status/scheduled start.
- Escrow by status/auto-release time.
- Ledger by wallet user/created time and reference.
- Forum posts by active/created time and post skills by skill.
- Comments by post/created time.
- Notifications by user/read time/created time.
- Reports and disputes by status/created time.

Use PostgreSQL full-text or trigram search only after basic indexed search is working and measured.

## 15. Testing requirements

### Unit tests

- Request and session transition rules.
- Skill-swap reciprocal matching.
- Point cost and setting validation.
- Review and permission rules.
- DTO mapping and error mapping.

### PostgreSQL integration tests with Testcontainers

- Registration creates exactly one starter award.
- Duplicate idempotency keys do not duplicate holds or awards.
- Concurrent point requests cannot overdraw a wallet.
- Concurrent completion calls release escrow once.
- Rejection/cancellation refunds once.
- Skill swap creates both snapshots and no escrow/ledger rows.
- Non-matching offered skills return `SKILL_SWAP_NOT_MATCHED`.
- Both swap confirmations complete once.
- A dispute blocks point release and swap completion.
- Unique constraints and Flyway migrations work on real PostgreSQL.

### Web and security tests

- Public auth endpoints work without a token.
- Every business endpoint rejects missing/expired tokens correctly.
- Users cannot access other users' private wallets, certificates, notifications, requests, or sessions.
- Only participants can see meeting URLs or complete/report sessions.
- Only admins can access admin routes or resolve disputes.
- Validation and error JSON match [Context files/API_CONTRACT.md](Context%20files/API_CONTRACT.md).

### Frontend contract tests

- Dashboard response contains every value shown by the current cards and tables.
- Mentor filters and mode labels map correctly.
- Request payloads differ correctly for points, skill swap, and volunteer modes.
- Session completion returns `pointsReleased` instead of relying on frontend assumptions.
- Forum author and counts are server-owned.
- Admin settings update only future operations.

## 16. Implementation order

1. Create Spring Boot project, security baseline, error format, PostgreSQL/Neon configuration, and Flyway.
2. Implement registration/login/refresh/logout, profile, roles, and wallet starter award.
3. Implement skill catalog, user teach/learn skills, mentor offerings, and mentor search.
4. Implement learning requests for `VOLUNTEER` first.
5. Add point wallet, immutable ledger, escrow, idempotency, and concurrency tests.
6. Add `SKILL_SWAP` validation, snapshots, acceptance, and two-party completion.
7. Implement sessions, meeting data, reviews, disputes, and background auto-release.
8. Implement dashboard projections, wallet activity, notifications, and global search.
9. Implement forum posts, comments, likes, leaderboard, and volunteer request linkage.
10. Implement certificate upload/review metadata.
11. Implement admin dashboard, moderation, warnings, settings, dispute resolution, and audit history.
12. Connect React Query screen by screen, removing mock arrays only after each API path is tested.

## 17. Backend definition of done

- The application starts on Java 21 and Tomcat 10.1+.
- Flyway creates and validates the complete schema on Neon PostgreSQL.
- No MySQL driver, SQL, naming, or assumptions exist.
- Every current frontend workflow has an authorized REST endpoint.
- Point holds/releases/refunds and registration rewards are atomic, idempotent, and auditable.
- Skill swaps are reciprocal, validated from database ownership, snapshotted, have no point movement, and require both participants to complete.
- All integration and concurrency tests pass against PostgreSQL Testcontainers.
- Secrets are environment-based and no production credential is committed.
- The React frontend displays API-returned identity, balances, states, and messages rather than mock assumptions.
