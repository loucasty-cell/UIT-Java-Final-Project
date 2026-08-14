# Required Skills

These are required contributor competencies, not optional product features.

## Essential

- Java 21: records, enums, validation-friendly types, time API, exceptions, collections, and concurrency fundamentals.
- Spring Boot 3.x: Web MVC, dependency injection, validation, configuration, Actuator, testing, and embedded Tomcat 10.1+.
- Jakarta APIs: use `jakarta.*`; never combine Tomcat 10 with legacy `javax.servlet.*` code.
- Spring Security: password hashing, JWT issue/validation, rotating refresh tokens, roles, ownership, participants, CORS, and method security.
- REST: resource design, methods/statuses, pagination, idempotency, RFC 9457 errors, multipart upload, CSV export, and OpenAPI 3.1.
- PostgreSQL/Neon: UUIDs, constraints, indexes, `timestamptz`, transactions, row locks, query plans, SSL, pooled connections, and environment isolation.
- Spring Data JPA: entity mapping, repositories, projections, pagination, optimistic locking, explicit pessimistic locking, and avoiding N+1 queries.
- Flyway: forward-only PostgreSQL migrations and controlled seed data.
- Testing: JUnit 5, AssertJ, Mockito at external boundaries, MockMvc, and PostgreSQL Testcontainers.
- React integration: TanStack React Query cache invalidation, camelCase JSON, ISO timestamps, JWT refresh-once behavior, and server-owned state.
- Git/Maven: focused commits, branches, dependency management, reproducible builds, and CI basics.

## Domain knowledge

- Request, session, skill-swap, escrow, report, and dispute state machines.
- Reciprocal skill matching using owned `TEACH` and mentor `LEARN` rows plus immutable agreement snapshots.
- Wallet row locking, immutable ledger events, escrow, idempotency, and concurrent balance updates.
- Owner, participant, mentor, and admin authorization; prevention of IDOR attacks.
- UTC storage and safe conversion to the user's timezone.
- Moderation, warnings, soft deletion, and immutable admin audit records.

## Learning priority

1. Java 21, Spring Boot REST, Tomcat 10.1, DTO validation, and error handling.
2. PostgreSQL on Neon, JPA, Flyway, locks, transactions, and indexes.
3. Spring Security JWT, refresh-token rotation, ownership, and RBAC.
4. Wallet/escrow and skill-swap state machines.
5. Contract, concurrency, integration, and end-to-end testing.

No contributor should implement point or skill-swap behavior before understanding transactions, row locks, idempotency, snapshots, and state-transition rules.

See [CONTROLLER_SERVICE_MAP.md](CONTROLLER_SERVICE_MAP.md) and [TESTING_MATRIX.md](TESTING_MATRIX.md).
