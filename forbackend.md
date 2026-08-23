# SkillBridge Backend Implementation Guide

## 1. Status and authority

This checkout contains the backend documentation, a Maven Spring Boot build, Java domain implementations, and Flyway migrations. The implemented slices are the auth (with 12-hour JWT token lifespan), admin, mentor-offering, and forum areas; the remaining API contract domains (such as wallet, learning requests, sessions) are planned for subsequent milestones.

This guide is the implementation source of truth. The detailed public interfaces are kept in:

- [Context files/API_CONTRACT.md](Context%20files/API_CONTRACT.md) for routes and status behavior.
- [Context files/DTO_CATALOG.md](Context%20files/DTO_CATALOG.md) for request, response, enum, and validation fields.
- [Context files/AUTHENTICATION_AUTHORIZATION.md](Context%20files/AUTHENTICATION_AUTHORIZATION.md) for access rules.
- [Context files/TESTING_MATRIX.md](Context%20files/TESTING_MATRIX.md) for required verification.

Features and endpoints without corresponding implementation files remain planned. The supplied MVC/MySQL diagrams are conceptual only. The target database is PostgreSQL on Neon; do not add MySQL drivers, SQL, or assumptions.

## 2. Required stack and runtime

- Java 25 (Temurin LTS).
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

### 2.1 How to build and run locally

`mvn` is not on PATH in this checkout. Use the Maven bundled with IntelliJ:

~~~powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.3\plugins\maven\lib\maven3\bin\mvn.cmd" -o compile
~~~

The project targets Java 25 (LTS). The JDK used is Temurin 25 installed at `C:\Users\ASUS\.jdks\temurin-25.0.4`; the user-level `JAVA_HOME` environment variable points there, and `.vscode/settings.json` registers it as the workspace runtime.

Because the project targets JDK 25+ while the Spring Boot parent (3.3.x) manages an older Lombok, `pom.xml` pins `<lombok.version>1.18.46</lombok.version>`. Without that pin, Lombok annotation processing fails during compilation with misleading errors such as `cannot find symbol getId()`.

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

### 4.1 Worked example: what happens for `POST /api/v1/auth/login`

This is the exact call chain in the implemented code; every auth endpoint follows the same pattern. Use it to explain the architecture to a teacher.

~~~text
1. HTTP arrives as JSON: { "email": "...", "password": "..." }
2. AuthController.login()                       api/controller/AuthController.java
   - @Valid triggers Bean Validation on LoginRequest BEFORE any business logic
3. AuthenticationService.login()                application/command/AuthenticationService.java
   - UserRepository.findByEmail()               infrastructure/persistence (Spring Data JPA -> SELECT on "users")
   - PasswordEncoder.matches()                  BCrypt comparison against password_hash column
   - status check                               DISABLED accounts are rejected (403)
   - UserRoleRepository.findByUserId()          loads roles from "user_roles"
   - JwtTokenService.generateAccessToken()      signs HS256 JWT with sub/email/roles/status claims
   - RefreshTokenIssuer.issueNewFamily()        creates opaque refresh token, stores ONLY its SHA-256 hash
4. AuthMapper.toAuthResponse()                  api/mapper: entity + tokens -> response DTOs
5. AuthController returns 200 + AuthResponse JSON:
   { accessToken, accessTokenExpiresAt, refreshToken, user: { id, email, ..., roles, accountStatus } }
~~~

Failure paths never reach step 4: invalid payload -> 400 via `MethodArgumentNotValidException`, wrong credentials -> 401 via `BadCredentialsException`, disabled account -> 403 via `AccessDeniedException`; all are converted to RFC 9457 ProblemDetail by `shared/error/GlobalExceptionHandler.java`.

The same layering applies to every feature slice:

| Layer | Package | Responsibility | Rule of thumb |
|---|---|---|---|
| Controller | `api/controller` | HTTP mapping, status codes, `@Valid` | No business logic |
| Request DTO | `api/dto/request` | Input shape + validation annotations | Never an entity |
| Response DTO | `api/dto/response` | Output shape, safe fields only | Never leak `passwordHash`, `version` |
| Mapper | `api/mapper` | Entity <-> DTO translation | Only place that knows both shapes |
| Command service | `application/command` | Use cases, `@Transactional`, security checks | Owns state changes |
| Query service | `application/query` | Reads, pagination, projections | Read-only |
| Entity | `domain/entity` | JPA table mapping (`@Entity`) | Mirrors one table |
| Enum/model | `domain/model` | Domain vocabulary (e.g. `Role`, `AccountStatus`) | Stored as STRING columns |
| Repository | `infrastructure/persistence` | Spring Data JPA interfaces | The only code touching SQL |

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

### 7.1 Implemented auth module (com.skillbridge.auth)

The auth slice is fully implemented and is the reference implementation for all other features.

Endpoints exposed by `AuthController` (all public, no JWT required):

| Method | Path | Service called | Success response |
|---|---|---|---|
| POST | `/api/v1/auth/register` | `RegistrationService.register()` | 201 + AuthResponse |
| POST | `/api/v1/auth/login` | `AuthenticationService.login()` | 200 + AuthResponse |
| POST | `/api/v1/auth/refresh` | `RefreshTokenService.refreshToken()` | 200 + rotated tokens |
| POST | `/api/v1/auth/logout` | `RefreshTokenService.logout()` | 204 No Content |

Components and their single responsibility:

- `AuthController` - maps HTTP to one use case per method; no logic.
- `LoginRequest` / `RegisterRequest` / `RefreshTokenRequest` (`api/dto/request`) - input contracts with Bean Validation annotations. Registration enforces email format + length, password length 8..100 with at least one letter and one digit (`@Pattern`).
- `AuthResponse` / `AuthUserResponse` (`api/dto/response`) - output contracts; `AuthUserResponse` deliberately excludes `passwordHash`, `version`, and audit timestamps.
- `AuthMapper` (`api/mapper`) - the only class that knows both entity and DTO shapes; builds the user summary via `toAuthUserResponse()`.
- `RegistrationService`, `AuthenticationService`, `RefreshTokenService` (`application/command`) - transactional use cases.
- `JwtTokenService` - signs HS256 access tokens (Nimbus JOSE) with claims `sub` (user id), `email`, `roles`, `status`; also generates opaque refresh tokens and their SHA-256 hex hashes.
- `RefreshTokenIssuer` - single place that creates a refresh-token row: generate raw token -> store only hash -> return raw token once. `issueNewFamily(userId)` for register/login, `issueRotated(userId, familyId)` for refresh.
- Repositories (`infrastructure/persistence`): `UserRepository.findByEmail/existsByEmail`, `UserRoleRepository.findByUserId`, `RefreshTokenRepository.findByTokenHash/revokeFamily/deleteExpiredTokens`.

Token design:

- Access token: HMAC-SHA256 signed JWT, default lifespan 1440 minutes (24h) via `skillbridge.security.jwt.access-token-minutes`; the `exp` claim is authoritative.
- Refresh token: 64-character opaque random string, default 7 days; the client receives the raw value exactly once, PostgreSQL stores only its SHA-256 hash in `refresh_tokens`.
- Rotation: every `/refresh` revokes the presented token and issues a new token inside the same `family_id`.
- Reuse detection: presenting an already-revoked token is treated as theft; `revokeFamily(familyId)` invalidates the entire chain and returns 403.
- Logout: revokes the whole family so every device sharing it is signed out.

Identity database tables (Flyway V1):

~~~text
users            id UUID PK, email UNIQUE NOT NULL, password_hash NOT NULL,
                 first_name, last_name, status (enum STRING), created_at, updated_at, version
user_roles       composite PK (user_id, role)   -- Role enum: USER, MENTOR, ADMIN
refresh_tokens   id UUID PK, user_id FK, token_hash UNIQUE, family_id,
                 expires_at, created_at, revoked BOOLEAN
~~~

Error mapping for auth failures (handled by `shared/error/GlobalExceptionHandler.java`, RFC 9457 `application/problem+json`):

| Exception | Status | Code |
|---|---|---|
| `MethodArgumentNotValidException` | 400 | VALIDATION_FAILED (+ fieldErrors map) |
| `IllegalArgumentException` (e.g. duplicate email) | 400 | INVALID_ARGUMENT |
| `BadCredentialsException` | 401 | UNAUTHENTICATED |
| `AccessDeniedException` (disabled account, revoked/expired/reused token) | 403 | FORBIDDEN |

### 7.2 Security rules

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

- It builds and runs on Java 25 (Temurin LTS) with Tomcat 10.1+.
- Flyway creates and validates the PostgreSQL schema on Neon.
- Every route in API_CONTRACT has an authorized implementation and DTO.
- Authentication, ownership, account state, and admin checks are enforced server-side.
- Point holds, releases, refunds, rewards, swaps, disputes, and completions are atomic, idempotent, and auditable.
- No MySQL, direct API-client database access, secret logging, Hibernate schema creation, or legacy javax.servlet code remains.
- Unit, web/security, PostgreSQL/Testcontainers, migration, OpenAPI, concurrency, and API contract tests pass.
