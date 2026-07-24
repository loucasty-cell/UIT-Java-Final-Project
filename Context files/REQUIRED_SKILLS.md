# Required Skills

These are the project competencies expected from contributors, not optional product features.

## Essential

- Java 21: records, enums, collections, exceptions, streams, time API, and concurrency basics.
- Spring Boot: Web MVC, validation, configuration, dependency injection, Actuator, and testing.
- Spring Security: OAuth2 resource server, JWT verification, role checks, ownership checks, CORS, and method security.
- REST API design: resources, HTTP methods/statuses, pagination, idempotency, RFC 9457 errors, and OpenAPI 3.1.
- PostgreSQL: relational modeling, constraints, indexes, transactions, row locking, query plans, and `timestamptz`.
- Spring Data JPA: entity mapping, repositories, projections, pagination, optimistic locking, and avoiding N+1 queries.
- Flyway: forward-only, versioned, repeatable database migrations and seed data separation.
- Supabase: Auth/JWKS, PostgreSQL connection modes, Storage buckets, signed URLs, secrets, and access policies.
- Testing: JUnit 5, AssertJ, Mockito where appropriate, MockMvc, and PostgreSQL Testcontainers.
- Git and Maven: focused commits, branches, dependency management, reproducible builds, and CI basics.

## Domain knowledge required

- Request and session state machines.
- Escrow, immutable financial audit records, idempotency, and concurrent balance updates.
- Resource ownership, participant authorization, admin boundaries, and prevention of IDOR attacks.
- UTC storage and safe conversion to the user's local time.

## Helpful

- Docker for local PostgreSQL and integration tests.
- Frontend integration with TypeScript/React and generated OpenAPI clients.
- Structured logging, tracing, metrics, and production diagnostics.

## Learning priority

1. Java, Spring Boot, REST, and validation.
2. PostgreSQL, JPA, Flyway, and transactions.
3. Spring Security and Supabase Auth/Storage.
4. Integration testing, concurrency testing, and observability.

No contributor should implement wallet or escrow behavior before understanding transactions, row locks, and idempotency.

The required implementation responsibilities and verification cases are listed in [CONTROLLER_SERVICE_MAP.md](CONTROLLER_SERVICE_MAP.md) and [TESTING_MATRIX.md](TESTING_MATRIX.md).
