# Project Architecture

## Current repository state

The repository contains a Spring Boot Maven build, core implementation slices, Flyway migrations (V1-V4), and documentation. The `auth`, `admin`, `mentor`, and `forum` feature packages contain full Spring Boot implementations with 12-hour JWT authentication and administrative moderation; remaining domains are planned for subsequent milestones.

## Package layout

The planned Java root is com.skillbridge:

~~~text
com/skillbridge/
  auth, user, skill, mentor, request, swap, session
  wallet, review, forum, notification, moderation, admin, search
  shared/
    config, error, idempotency, security, storage
    observability, time, events, scheduling, web, persistence
~~~

Each feature reserves:

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

## Feature folder locations

Every business feature uses the same locations below. Replace `{feature}` with
the feature package name:

~~~text
src/main/java/com/skillbridge/{feature}/
  api/controller              REST controllers and HTTP-only transport logic
  api/dto/request             request DTOs accepted from clients
  api/dto/response            response DTOs returned to clients
  api/mapper                  feature-local entity/projection-to-DTO mappers
  application/command         command services for writes and transactions
  application/query           query services for reads and projections
  domain/entity               persisted entities
  domain/model                states, enums, value objects, and invariants
  infrastructure/persistence  repositories, projections, and locking queries
~~~

The `{feature}` packages are:

~~~text
admin, auth, forum, mentor, moderation, notification, request,
review, search, session, skill, swap, user, wallet
~~~

For example, the user feature contains:

~~~text
src/main/java/com/skillbridge/user/api/controller
src/main/java/com/skillbridge/user/api/dto/request
src/main/java/com/skillbridge/user/api/dto/response
src/main/java/com/skillbridge/user/api/mapper
src/main/java/com/skillbridge/user/application/command
src/main/java/com/skillbridge/user/application/query
~~~

These folders are currently planned scaffold locations. The repository does
not yet contain implementation classes. Services are located under
`application/command` and `application/query`; there is no separate generic
`service` folder.

## Spring Boot implementation reminders

- Use `@RestController` for HTTP endpoints and accept/return DTOs only.
- Use Bean Validation (`@Valid`, `@Validated`) at the API boundary.
- Use `@Service` classes in `application/command` for writes and in
  `application/query` for reads.
- Put transaction boundaries on application services with `@Transactional`;
  use read-only transactions for query operations where appropriate.
- Use Spring Security for JWT validation, roles, account-state checks, and
  ownership authorization. Do not rely on frontend authorization.
- Use Spring Data JPA repositories and projections under
  `infrastructure/persistence`; never call repositories from controllers.
- Use `@RestControllerAdvice` and RFC 9457 `ProblemDetail` for consistent
  errors.
- Use Flyway for schema changes and keep Hibernate in validation-only mode.
- Use `@Scheduled` only for repeat-safe jobs that support multiple instances,
  locking, and idempotency.
- Use application events for non-critical follow-up work such as notification
  dispatch, while keeping financial changes inside the owning transaction.
- Use Actuator, structured logging, OpenAPI 3.1, MockMvc, and Testcontainers
  for operations, documentation, and verification.

Resources are reserved for configuration, Flyway migration and seed files, OpenAPI, and storage adapters. Tests are separated into unit, PostgreSQL/Testcontainers, migration, concurrency, web/security, contract, E2E, and fixture areas under src/test.

## Runtime boundary

~~~text
API client
  -> HTTPS JSON or multipart with Bearer JWT
  -> Spring Security
  -> controller and DTO validation
  -> application command/query
  -> domain rules
  -> repository or adapter
  -> Neon PostgreSQL
~~~

Spring Boot owns authentication and business-data writes. PostgreSQL owns persisted business state. Storage owns file bytes while PostgreSQL owns authorized metadata and object keys.

## Dependency direction

API depends on application. Application depends on domain contracts. Infrastructure implements inner-layer ports. A feature uses another feature through a narrow application interface and never calls another feature's repository.

Controllers do not call repositories, storage clients, schedulers, or mappers directly. Query services do not mutate state or calculate authoritative point changes. Wallet mutations pass through the wallet application boundary.

## Transactions and jobs

Use one transaction for registration, point holds, skill-swap snapshots, acceptance, completion, refunds, rewards, and dispute resolution. Use row locks, optimistic versions, and idempotency keys where required.

Scheduled jobs expire requests, refund escrow, auto-release eligible point sessions, queue notifications, and clean expired refresh tokens. Jobs must be repeat-safe and safe across multiple instances.

## Configuration

Use .env.example for local placeholders and .env.test.example for isolated tests. Require Neon SSL, a small Hikari pool, UTC, Flyway, JPA validate, and open-session-in-view disabled. Never commit credentials or run tests against production.
