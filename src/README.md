# SkillBridge source scaffold

This directory contains the Java 21 Spring Boot backend described by `forbackend.md` and the files in `Context files/`. The mentor-offering and forum slices contain implementation classes, while the remaining feature folders are scaffold locations for planned controllers, services, entities, repositories, and tests.

## Main source layout

`src/main/java/com/skillbridge/` uses package-by-feature. Each business feature has:

- `api/controller` for REST endpoints and transport mapping.
- `api/dto/request` and `api/dto/response` for the public JSON contract.
- `api/mapper` for DTO mapping and caller-aware assembly.
- `application/command` and `application/query` for transactional writes and read-only projections.
- `domain/entity` and `domain/model` for persisted entities, states, enums, and invariants.
- `infrastructure/persistence` for PostgreSQL repositories, projections, and locking queries.

The `shared` package is reserved for configuration, RFC 9457 errors, JWT/security, idempotency, storage adapters, request IDs, observability, time, events, and shared persistence support.

## Resources and tests

- `src/main/resources/db/migration` is reserved for Flyway migrations in the documented V1–V9 order.
- `src/main/resources/openapi` is reserved for the OpenAPI 3.1 contract.
- `src/test/java/com/skillbridge` is separated into unit, PostgreSQL/Testcontainers, migration, concurrency, web/security, OpenAPI/frontend contract, and end-to-end coverage.
- `src/test/resources` is reserved for test fixtures and test-only configuration.

## Environment templates

Use the root `.env.example` for local Neon/API/auth configuration and `.env.test.example` for isolated tests. They contain placeholders only; never commit real credentials, JWT keys, or production connection strings.
