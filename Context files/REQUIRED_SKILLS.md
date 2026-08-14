# Required Skills

These are contributor competencies for implementing the planned backend.

- Java 21: records, enums, validation types, time, exceptions, collections, and concurrency.
- Spring Boot 3.x: MVC, dependency injection, validation, configuration, Actuator, testing, and Tomcat 10.1+.
- Jakarta APIs: use jakarta.* and never legacy javax.servlet.
- Spring Security: password hashing, JWT validation, refresh rotation, roles, account states, ownership, CORS, and method security.
- REST: resource methods/statuses, pagination, idempotency, RFC 9457, multipart, CSV, and OpenAPI 3.1.
- PostgreSQL/Neon: UUIDs, constraints, indexes, timestamptz, transactions, row locks, query plans, SSL, pooled connections, and environment isolation.
- Spring Data JPA: entity mapping, projections, optimistic versions, and locking queries without exposing entities.
- Flyway: forward-only PostgreSQL migrations, seed data, indexes, and upgrade validation.
- Testing: JUnit 5, AssertJ, MockMvc, Testcontainers, contract tests, concurrency tests, and isolated fixtures.
- Engineering: clean boundaries, DTO mapping, secure logging, observability, Git discipline, and incremental contract-first delivery.

Before implementing points, escrow, swaps, disputes, or completion, understand idempotency, locking, snapshots, state transitions, and audit requirements.
