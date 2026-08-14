# Project Architecture

## System boundary

```text
Lovable React client
  -> HTTPS JSON/multipart + JWT
  -> Spring Security
  -> Java 21 Spring Boot REST API on Tomcat 10.1+
  -> Neon PostgreSQL
```

Spring Boot owns authentication and every business-data write. Neon PostgreSQL is the system of record. File bytes use a storage adapter; PostgreSQL stores owner-scoped metadata/object keys. The frontend never accesses Neon directly.

## Deployment

- Preferred: executable Spring Boot JAR with embedded Tomcat 10.1+.
- Course-compatible option: WAR deployed to external Tomcat 10.1+, using `jakarta.servlet` and Java 21.
- Require Neon SSL, environment variables, a small Hikari pool, and separate development/test/production databases or Neon branches.
- Flyway owns schema changes. Set Hibernate schema behavior to validation and disable open-session-in-view.

## Backend modules

- `auth`: register, login, refresh rotation, logout, password hashes, token-family revocation.
- `user`: profile, account status, avatar metadata, certificates.
- `skill`: catalog, teach/learn associations, mentor offerings, availability, discovery.
- `request`: learning requests, acceptance, rejection, cancellation, expiry.
- `swap`: reciprocal validation, snapshots, status, participant confirmations.
- `session`: scheduling, meeting URL, completion confirmations, cancellation.
- `wallet`: wallet, immutable ledger, escrow, rewards, payout, refund, adjustments.
- `review`: eligibility, uniqueness, rating aggregates.
- `forum`: posts, skills/tags, comments, likes, leaderboard, volunteer requests.
- `notification`: user events and read state.
- `moderation`: reports, warnings, disputes, settings, audit events.
- `shared`: configuration, errors, security infrastructure, idempotency, clocks, storage, and observability.

## Package style

Use package-by-feature. Inside a feature separate `api`, `application`, `domain`, and `infrastructure`. Dependency direction is API -> application -> domain; infrastructure implements inner-layer interfaces. A feature calls another feature through a narrow application interface, never its repository.

## Request path

1. Spring Security validates JWT signature and claims, then loads current account state/roles.
2. Controller validates transport input and calls one application use case.
3. Service checks ownership, participant relationship, role, state, and domain rules.
4. Service executes one database transaction through repositories/adapters.
5. Mapper/assembler returns a caller-specific DTO.
6. Global error handling returns a stable RFC 9457 response.

## Transaction boundaries

- Registration creates user, roles, wallet, and +50 starter ledger entry once.
- Point request locks the learner wallet and creates request, escrow, and ledger hold atomically.
- Skill-swap request validates both owned teach/learn rows and writes both snapshots atomically without wallet rows.
- Request acceptance creates exactly one session and changes request/swap state atomically.
- Completion locks session plus escrow/swap. The second confirmation releases points or completes the swap exactly once.
- Reject/cancel/expiry refunds held points exactly once.
- Dispute creation freezes release; admin resolution releases/refunds/cancels exactly once and writes an audit event.
- External file transfer is outside long database transactions; metadata confirmation is short and transactional.

## Data ownership

- `users` owns login identity; password hashes and refresh-token hashes never leave the backend.
- Neon PostgreSQL owns business state, wallet balances, immutable ledger, snapshots, moderation, and audit history.
- Storage owns bytes; PostgreSQL owns private metadata and object keys.
- The frontend owns display state only.

## Background work

Scheduled jobs expire pending requests, refund escrow, auto-release eligible point sessions after their snapshotted deadline, send queued notifications, and remove expired refresh-token rows. Jobs are idempotent, use row claims/locks, and remain safe with multiple app instances.

See [CONTROLLER_SERVICE_MAP.md](CONTROLLER_SERVICE_MAP.md), [DTO_MAPPING.md](DTO_MAPPING.md), and [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md).
