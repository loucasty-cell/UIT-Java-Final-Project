# SkillBridge source scaffold

This directory contains the Java 25 Spring Boot backend described by `forbackend.md` and the files in `Context files/`. All feature domains are implemented (auth, user, skill, mentor, request, swap, session, review, wallet, forum, notification, moderation, admin); `search/` remains an empty scaffold for the planned global-search endpoint.

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

- `src/main/resources/db/migration` holds the Flyway migrations V1–V8 plus V4.1 (skills catalog, applied out of order by design).
- `src/test/java/com/skillbridge` contains per-module unit/controller/repository tests (62 total) with a shared `support/TestAuthContext` helper; layered integration/E2E trees are planned.
- `src/test/resources` holds test configuration.

## Environment templates

Use the root `.env.example` for local Neon/API/auth configuration and `.env.test.example` for isolated tests. They contain placeholders only; never commit real credentials, JWT keys, or production connection strings.
