# SkillBridge Development Skills

## Purpose

This file defines the technical knowledge required to connect the current Lovable/React frontend to a production-ready SkillBridge backend.

The required stack is:

- Frontend: React 19, TypeScript, TanStack Start/Router, React Query, Tailwind CSS, and Lovable.
- API: JSON REST API over HTTPS.
- Backend: Java 21 and Spring Boot 3.x.
- Web runtime: Tomcat 10.1+ through Spring Boot's embedded Tomcat; an external Tomcat 10.1+ WAR is optional.
- Database: PostgreSQL hosted on Neon. MySQL is not supported.
- Database access: Spring Data JPA for normal persistence and explicit locking/native PostgreSQL queries where wallet or escrow correctness requires them.
- Database migrations: Flyway.
- Security: Spring Security, short-lived JWT access tokens, rotating refresh tokens, and role-based authorization.
- Build and test: Maven Wrapper, JUnit 5, Mockito, Spring Boot Test, Testcontainers PostgreSQL, and REST contract tests.

## Required backend skills

### Java 21 and Spring Boot

The backend developer must be able to:

- Build Spring Boot applications using Java 21 records, enums, validation, and clear exception handling.
- Use `jakarta.*` APIs. Tomcat 10 must not be combined with old `javax.servlet.*` imports.
- Separate controllers, application services, domain rules, repositories, security, and configuration.
- Use request and response DTOs instead of exposing JPA entities.
- Implement pagination, filtering, sorting, multipart uploads, and CSV downloads.
- Use `@Transactional` only around complete business operations, especially point holds, releases, refunds, and skill swaps.

### PostgreSQL and Neon

The backend developer must understand:

- PostgreSQL UUIDs, constraints, indexes, check constraints, partial indexes, and `timestamptz`.
- Neon SSL connections and environment-based JDBC configuration.
- Flyway migrations that are forward-only and reproducible.
- Transaction isolation, `SELECT ... FOR UPDATE`, optimistic version columns, and unique idempotency keys.
- Why PostgreSQL is the system of record and why wallet balances cannot be calculated or changed by the frontend.
- Why application tables must not use MySQL syntax, `AUTO_INCREMENT`, backticks, or MySQL-only enum definitions.

### REST API design

The backend developer must be able to:

- Keep all business endpoints under `/api/v1`.
- Use camelCase JSON, ISO-8601 timestamps, UUID identifiers, stable uppercase enum values, and integer point amounts.
- Return meaningful HTTP status codes and one consistent error structure.
- Enforce ownership and participant permissions on every resource.
- Make financial and state-changing requests idempotent where retries are possible.
- Maintain the endpoint and payload contract in [api.md](api.md).

### Authentication and authorization

The backend developer must be able to:

- Hash passwords with Argon2id or BCrypt and never store or log raw passwords.
- Issue a 30-minute access token and rotate refresh tokens.
- Apply `USER`, `MENTOR`, and `ADMIN` authorities without creating duplicate identity records.
- Treat a mentor as a user with approved teachable skills or mentor status, not as a separate login account.
- Restrict `/api/v1/admin/**` to `ADMIN`.
- Validate ownership for profile, certificate, forum, request, session, review, wallet, and notification operations.

## Required domain skills

### Skill profiles and mentor matching

Developers must model:

- A canonical skill catalog, for example Java, React, SQL, and UI/UX.
- Skills a user can teach, with proficiency level.
- Skills a user wants to learn, with desired level.
- Mentor offerings, point price, and allowed modes.
- Search by mentor name, major, skill, proficiency level, and mode.

Free-text skill names from the browser must be normalized against the skill catalog. The database must prevent duplicate user-skill rows.

### Skill swapping

A skill swap is a reciprocal agreement, not a point transfer. The developer must be able to implement these rules:

1. The learner chooses a skill the mentor can teach.
2. The learner offers one of their own teachable skills.
3. The offered skill must match a skill the mentor wants to learn.
4. The backend validates both sides from current database records.
5. The accepted agreement stores immutable snapshots of both skill names and levels.
6. No wallet or escrow rows are created for a skill swap.
7. Both participants must confirm completion before the swap becomes `COMPLETED`.
8. A dispute pauses completion and requires an admin decision.

The full transaction and table design is in [forbackend.md](forbackend.md).

### Points, wallet, ledger, and escrow

The backend developer must understand double-entry-style auditability:

- One wallet per user with available and held balances.
- An immutable point ledger for every award, hold, release, refund, or admin adjustment.
- Escrow for point-based requests only.
- Wallet row locking before balance checks and updates.
- Atomic release only after both participants confirm, or after the configured auto-release deadline when no dispute exists.
- Idempotency so duplicate HTTP requests cannot duplicate points.

### Sessions, reviews, forum, and moderation

The developer must support:

- Pending, accepted, scheduled, completed, cancelled, rejected, and disputed request/session states.
- Google Meet links as optional session data; never expose a private meeting link to non-participants.
- One review per reviewer per completed session, rating 1 through 5.
- Volunteer posts, comments, likes, and free session requests.
- Content reports, account warnings, removals, dismissals, disputes, and admin audit logs.

## Required frontend integration skills

The integration developer must:

- Replace all hard-coded users, wallet values, mentors, sessions, forum data, notifications, and admin data with React Query calls.
- Use the authenticated profile returned by `/api/v1/me`; never keep conflicting hard-coded identities such as Alex Chen and Ava Ramirez.
- Send `Authorization: Bearer <accessToken>` for protected calls.
- Refresh once after an expired access token, then return the user to login if refresh fails.
- Use server-returned status, balances, point amounts, and timestamps instead of predicting successful state changes.
- Invalidate related queries after mutations, especially dashboard, wallet, requests, sessions, notifications, and admin statistics.
- Send dates as ISO-8601 values with an explicit timezone instead of display strings such as `Jul 24, 2026`.

## Definition of done

Backend work is complete only when:

- The frontend's dashboard, mentors, requests, sessions, forum, notifications, certificates, and admin screens load from the API.
- Point request, hold, refund, and release paths pass concurrent transaction tests.
- Skill swap matching and completion pass positive and negative integration tests.
- Every schema change is represented by a Flyway migration.
- PostgreSQL Testcontainers tests pass; an in-memory substitute is not used for database behavior tests.
- Unauthorized users cannot read or mutate another user's private resources.
- API errors follow [api.md](api.md).
- No MySQL dependency, driver, query, or documentation remains.
