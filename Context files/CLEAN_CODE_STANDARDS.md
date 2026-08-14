# Clean Coding Standards

## Core principles

- Prefer clear direct code over speculative abstraction.
- Each class/method has one reason to change.
- Names express domain actions: `holdPoints`, `createSkillSwapSnapshot`, `confirmCompletion`, `refundEscrow`.
- Comments explain decisions, transaction constraints, and security boundaries.
- Do not copy mock frontend data into backend constants.

## Spring/Tomcat boundaries

- Use Java 21, Spring Boot 3.x, and `jakarta.*` for Tomcat 10.1+.
- Controllers handle HTTP only and call one application use case.
- Services own authorization, workflow rules, idempotency, orchestration, and transactions.
- Repositories contain persistence access only.
- Never expose JPA entities or bind command JSON directly to entities.
- Use constructor injection; avoid mutable global state, field injection, and service locators.
- Centralize exception-to-RFC-9457 mapping.

## PostgreSQL/Neon data

- PostgreSQL on Neon is the system of record; never add MySQL dependencies or syntax.
- Flyway owns schema changes; JPA validates mappings.
- Use UUIDs, `timestamptz`, explicit constraints/indexes, and version columns.
- Lock wallets/escrow/workflow rows explicitly where concurrency requires it.
- Ledger/audit rows are append-only. Corrections use compensating events.
- Use `Instant`/`OffsetDateTime` deliberately and inject `Clock` for time-dependent behavior.
- Points are integers, never floating point.
- Prevent N+1 queries and open-session lazy JSON access.

## Domain invariants

- Stable enums match [DTO_CATALOG.md](DTO_CATALOG.md), OpenAPI, and database checks.
- Point price and reward values are server-owned and snapshotted where historical meaning requires it.
- Skill swaps validate reciprocal owned skills and write immutable snapshots; they never touch wallets.
- Completion, refund, release, reward, and admin resolution are idempotent and occur once.
- State changes use named domain methods, not unrestricted status setters.

## DTO and validation

- Request DTOs validate required fields, formats, ranges, conditional mode fields, and unknown properties.
- Response DTOs reveal only caller-authorized fields.
- Mappers contain no repositories or business decisions.
- Client input is never trusted for identity, owner, role, author, participant, price, balance, reward, aggregate, audit actor, or final state.
- Follow [DTO_CATALOG.md](DTO_CATALOG.md) and [DTO_MAPPING.md](DTO_MAPPING.md).

## Security, files, and logging

- Passwords use Argon2id/BCrypt; refresh tokens are stored only as hashes.
- Never log passwords, hashes, JWTs, refresh tokens, signing keys, Neon credentials, meeting URLs, certificate content/keys, or personal payloads.
- Validate certificate PDF MIME, signature, size, ownership, and generated key.
- Log once at the boundary with request ID, operation, and safe entity IDs.
- Expected validation/auth failures are not server errors.

## Testing

- Test business outcomes, not private implementation.
- Unit-test pure rules; integration-test repositories, locks, transactions, security, and REST contracts.
- Use PostgreSQL Testcontainers; never substitute H2 for database behavior.
- Control time, IDs, idempotency keys, and storage responses.
- Include happy path, invalid state, unauthorized user, insufficient balance, mismatched swap, duplicate retry, and concurrent execution.
- [TESTING_MATRIX.md](TESTING_MATRIX.md) is mandatory.

## Change discipline

- Keep changes focused and build green.
- Update Flyway, OpenAPI, context, and tests with behavior changes.
- Do not mix schema changes with unrelated refactoring.
- Never rewrite applied production migrations.
- Delete dead code; unresolved TODOs require an issue reference.
- Keep secrets and real Neon connection details outside Git.

Choose the simplest implementation that preserves [BACKEND_CONTEXT.md](BACKEND_CONTEXT.md).
