# Clean Coding Standards

## Core principles

- Prefer clear, direct code over clever abstractions.
- Each class and method has one reason to change.
- Names describe business meaning: `holdPoints`, `quotedPoints`, and `completionDeadline`, not vague words such as `process` or `data`.
- Remove duplication only when the shared concept is genuinely the same.
- Comments explain decisions and constraints, not what readable code already says.

## Spring boundaries

- Controllers handle HTTP concerns only and call one application use case.
- Services own business rules, authorization, orchestration, and transaction boundaries.
- Repositories contain persistence access only.
- Never expose JPA entities from controllers or bind request JSON directly to entities.
- Use constructor injection. Avoid field injection, mutable global state, and service-locator patterns.
- Centralize exception-to-problem mapping; do not catch broad exceptions in each controller.

## Domain and data

- Model modes, roles, states, and ledger event types with explicit enums and stable API values.
- Enforce critical invariants in both application logic and database constraints.
- Use `Instant` for stored timestamps and inject a `Clock` where current time affects behavior.
- Use integer types for points; never floating point.
- Do not use `Optional` as an entity field or method parameter.
- Avoid unrestricted setters. Mutations should express valid domain actions.
- Prevent N+1 queries and never rely on open-session lazy loading during JSON serialization.

## DTO and validation rules

- Request DTOs validate required fields, sizes, formats, ranges, and allowed values.
- Response DTOs reveal only fields allowed for that caller.
- Mappers are explicit and contain no database access or business decisions.
- Normalize user input deliberately; preserve original display text when required.
- Client input is never trusted for ownership, price, balance, reward, or workflow state.
- Follow the complete field contract in [DTO_CATALOG.md](DTO_CATALOG.md) and mapping rules in [DTO_MAPPING.md](DTO_MAPPING.md).

## Error handling and logging

- Throw specific domain/application exceptions with stable error codes.
- Log once at the correct boundary with `traceId`, operation, and safe entity IDs.
- Never log tokens, passwords, secrets, certificate contents, private URLs, or full personal profiles.
- Expected validation and authorization failures are not server errors.

## Testing standards

- Test behavior and business outcomes, not private implementation details.
- Unit-test pure rules; integration-test repositories, transactions, security, and HTTP contracts.
- Use PostgreSQL Testcontainers for database behavior; do not substitute H2 for transactional or SQL-specific tests.
- Include happy path, invalid state, unauthorized user, insufficient balance, duplicate retry, and concurrent execution cases.
- Tests must be deterministic: control time, IDs, and external storage responses.
- [TESTING_MATRIX.md](TESTING_MATRIX.md) is mandatory coverage, not a suggestion.

## Change discipline

- Keep changes focused and keep the build green.
- Add or update tests and OpenAPI documentation with behavior changes.
- Do not mix schema changes with unrelated refactoring.
- Never use automatic schema creation/update outside disposable local experiments.
- Delete dead code; do not keep commented-out implementations or unresolved TODOs without an issue reference.

When simplicity and abstraction conflict, choose the simplest design that preserves the rules in [BACKEND_CONTEXT.md](BACKEND_CONTEXT.md).
