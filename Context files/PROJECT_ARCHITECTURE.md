# Project Architecture

## Current repository state

The repository currently contains an empty Spring Boot package scaffold and documentation. There is no build descriptor or implementation class yet.

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
