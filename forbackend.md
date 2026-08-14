# SkillBridge Backend Implementation Guide

## 1. Status and authority

This checkout contains the backend documentation, a Maven Spring Boot build, partial Java implementation, and Flyway migrations. The currently implemented slices are the mentor-offering and forum areas; the remaining API contract is still planned until its implementation is added.

This guide is the implementation source of truth. The detailed public interfaces are kept in:

- [Context files/API_CONTRACT.md](Context%20files/API_CONTRACT.md) for routes and status behavior.
- [Context files/DTO_CATALOG.md](Context%20files/DTO_CATALOG.md) for request, response, enum, and validation fields.
- [Context files/AUTHENTICATION_AUTHORIZATION.md](Context%20files/AUTHENTICATION_AUTHORIZATION.md) for access rules.
- [Context files/TESTING_MATRIX.md](Context%20files/TESTING_MATRIX.md) for required verification.

Features and endpoints without corresponding implementation files remain planned. The supplied MVC/MySQL diagrams are conceptual only. The target database is PostgreSQL on Neon; do not add MySQL drivers, SQL, or assumptions.

## 2. Required stack and runtime

- Java 21.
- Spring Boot 3.x.
- Spring MVC REST with JSON, multipart PDF upload, and CSV export.
- Embedded Tomcat 10.1+ or a WAR deployed to external Tomcat 10.1+.
- Jakarta APIs only; never javax.servlet.
- PostgreSQL hosted by Neon with SSL.
- Spring Data JPA/Hibernate for persistence.
- Flyway for forward-only schema migrations.
- Spring Security for password hashing, JWT access tokens, refresh rotation, roles, and account-state checks.
- Actuator, JUnit 5, AssertJ, MockMvc, and PostgreSQL Testcontainers.

Preferred deployment is an executable JAR. A WAR is permitted when external Tomcat is required; in that case the embedded servlet container is provided and the application uses SpringBootServletInitializer.

## 3. Actual repository layout

The existing scaffold uses package-by-feature under com.skillbridge:

~~~text
src/main/java/com/skillbridge/
  auth/
  user/
  skill/
  mentor/
  request/
  swap/
  session/
  wallet/
  review/
  forum/
  notification/
  moderation/
  admin/
  search/
  shared/
~~~

Each business feature reserves these packages:

~~~text
feature/
  api/controller
  api/dto/request
  api/dto/response
  api/mapper
  application/command
  application/query
  domain/entity
  domain/model
  infrastructure/persistence
~~~

The shared package reserves configuration, errors, idempotency, security, storage, observability, time, events, scheduling, web, and persistence support.

Resources and tests are reserved here:

~~~text
src/main/resources/
  config/
  db/migration/
  db/seed/
  openapi/
  storage/

src/test/java/com/skillbridge/
  unit/
  integration/postgres/
  integration/migration/
  integration/concurrency/
  web/security/
  contract/openapi/
  contract/frontend/
  e2e/
  support/fixtures/

src/test/resources/
  config/
  db/
  fixtures/
~~~

No implementation should be added outside these boundaries without updating this guide.

## 4. Request path and layer rules

~~~text
API client
  -> HTTPS JSON/multipart with Bearer JWT
  -> Spring Security filter chain
  -> REST controller and Bean Validation
  -> application command/query
  -> domain rules and authorization
  -> repository or adapter
  -> Neon PostgreSQL
~~~

- Controllers translate HTTP and call one application use case.
- Command services own state changes, authorization, idempotency, domain events, and transactions.
- Query services use read-only projections, pagination, allow-listed sorting, and caller-aware redaction.
- Domain code owns states and invariants.
- Infrastructure implements repositories, locking queries, storage, configuration, and external adapters.
- Features communicate through narrow application interfaces, never through another feature's repository.

## 5. Product rules and workflow modes

One account can learn, teach, volunteer, use points, participate in a reciprocal skill swap, post in the forum, and receive notifications.

Roles are USER, MENTOR, and ADMIN. MENTOR is granted to an existing user when that user creates the first eligible active offering based on an owned visible TEACH skill. It is not a second identity.

Supported learning modes are POINTS, SKILL_SWAP, and VOLUNTEER.

- POINTS requests snapshot the server price, lock the learner wallet, create escrow, and append an immutable ledger hold atomically.
- SKILL_SWAP requests require an owned visible TEACH skill from the requester and a matching visible LEARN skill for the selected mentor. Both skills are snapshotted. No wallet, escrow, or ledger rows are created.
- VOLUNTEER requests use zero points and have no financial rows. Forum-sourced requests must target the forum post author.
- Accepting a request creates at most one session and changes the request state atomically.
- Point completion requires both participant confirmations unless the configured, snapshotted auto-release deadline is reached without a dispute.
- Swap completion requires both confirmations and never moves points.
- Reject, cancel, expiry, refund, release, completion, reward, and dispute resolution operations are idempotent.
- A dispute freezes normal release or completion until an authorized admin resolution.
- Registration grants one default +50 point award. Marking one eligible forum comment helpful grants one default +5 reward. Values are stored in platform settings and are server-owned.

Exact states, transitions, and response fields remain in the API and DTO contracts.

## 6. Neon PostgreSQL and schema rules

Use environment variables from .env.example for local configuration and .env.test.example for isolated tests. Never commit real credentials.

Required runtime settings include DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD, FRONTEND_ORIGINS, JWT_SECRET, ACCESS_TOKEN_MINUTES=1440, REFRESH_TOKEN_DAYS, FLYWAY_ENABLED, JPA_DDL_AUTO=validate, and OPEN_SESSION_IN_VIEW=false.

Database rules:

- Require sslmode=require for Neon.
- Use a small Hikari pool; start at a maximum of five connections.
- Use separate runtime and migration roles when possible.
- Use a separate database or Neon branch for development, test, and production.
- Store instants as UTC timestamptz.
- Use UUID identifiers, foreign keys, check constraints, unique constraints, version columns, and indexes.
- Flyway owns schema creation. Hibernate validates; it never creates or updates shared schemas.
- Never run tests against production.

The planned schema groups are:

- Identity: users, user_roles, refresh_tokens.
- Skills and teaching: skills, user_skills, mentor_offerings.
- Workflows: learning_requests, skill_swaps, sessions, session_confirmations, reviews.
- Points: wallets, point_ledger, escrows.
- Community: forum_posts, forum_post_skills, forum_comments, forum_likes, notifications.
- Administration: reports, account_warnings, disputes, platform_settings, admin_audit_events.

Recommended migration order:

~~~text
V1 users, roles, refresh tokens
V2 skills and user skills
V3 mentor offerings
V4 wallets, ledger, escrow, settings
V5 learning requests and skill swaps
V6 sessions, confirmations, reviews
V7 forum posts, comments, likes
V8 notifications, reports, disputes, audit
V9 indexes and initial skill catalog
~~~

Never edit an applied migration. Add a new version.

## 7. Authentication and authorization

Spring Boot owns registration, login, access-token issue, refresh rotation, logout, and account enforcement. Neon stores password hashes, roles, account status, and refresh-token hashes.

- Access tokens expire after exactly 24 hours; JWT exp is authoritative.
- Refresh tokens are opaque, rotated on every refresh, and stored only as hashes.
- Validate signature, algorithm, issuer, audience, subject, issued-at, not-before, and expiry.
- Load current roles and account status from PostgreSQL; JWT claims do not override database state.
- Missing, invalid, revoked, or expired credentials return documented 401 errors.
- Authenticated callers without permission return 403.
- Passwords use Argon2id or BCrypt with deployment-appropriate parameters.
- Rate-limit login and refresh without revealing whether an email exists.
- CORS uses explicit configured origins; never wildcard credentials.
- Never log passwords, JWTs, refresh tokens, signing keys, Neon credentials, private file keys, meeting URLs, or request bodies containing secrets.

Account states are ACTIVE, WARNED, SUSPENDED, and DISABLED. Account state overrides every role. Ownership, participant, author, and admin checks use persisted relationships and the authenticated principal, never caller-supplied owner IDs.

## 8. REST contract rules

- Base path is /api/v1.
- JSON uses camelCase; PostgreSQL uses snake_case.
- IDs are UUID strings, points are integers, and timestamps are ISO-8601.
- Controllers expose DTOs only; JPA entities and private fields never cross the API boundary.
- Errors use RFC 9457 application/problem+json with stable codes and requestId.
- Use GET for reads, POST for creation or commands, PATCH for partial updates, PUT for idempotent toggles, and DELETE for removal or soft deletion.
- Use PageResponse with default page size 20 and maximum size 100.
- Require Idempotency-Key on retry-sensitive commands.
- Use If-Match/version checks for mutable resources where specified.
- API clients must display server-returned identities, balances, prices, counts, ratings, timestamps, and states.
- Update API_CONTRACT, DTO_CATALOG, OpenAPI, tests, and this guide together when the contract changes.

## 9. Background work and storage

Planned scheduled jobs expire pending requests, refund eligible escrow, auto-release eligible point sessions, queue notifications, and remove expired refresh-token rows. Jobs must be repeat-safe, use row claims or locks, and work with multiple application instances.

Certificate bytes are handled by a storage adapter. PostgreSQL stores owner-scoped metadata and object keys. File access requires ownership or another explicit authorization check. File transfer must remain outside long database transactions.

## 10. Implementation order

1. Add the Spring Boot build, application entry point, configuration, error format, security baseline, and Flyway.
2. Implement registration, login, refresh, logout, roles, profile, and starter wallet award.
3. Implement skills, user skills, offerings, and mentor discovery.
4. Implement volunteer requests and sessions.
5. Implement wallet, ledger, escrow, idempotency, and concurrency protection.
6. Implement reciprocal skill swaps and two-party completion.
7. Implement reviews, disputes, notifications, forum, certificates, search, and admin operations.
8. Add OpenAPI, integration, security, contract, and end-to-end tests.

## 11. Definition of done

The backend is complete when:

- It builds and runs on Java 21 with Tomcat 10.1+.
- Flyway creates and validates the PostgreSQL schema on Neon.
- Every route in API_CONTRACT has an authorized implementation and DTO.
- Authentication, ownership, account state, and admin checks are enforced server-side.
- Point holds, releases, refunds, rewards, swaps, disputes, and completions are atomic, idempotent, and auditable.
- No MySQL, direct API-client database access, secret logging, Hibernate schema creation, or legacy javax.servlet code remains.
- Unit, web/security, PostgreSQL/Testcontainers, migration, OpenAPI, concurrency, and API contract tests pass.
