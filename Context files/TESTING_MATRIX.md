# Testing Matrix

This matrix describes current and planned automated coverage. The repository has a Maven build and a basic Spring Boot test; the broader web, PostgreSQL, contract, concurrency, and end-to-end coverage remains to be implemented.

## Test layers

- Unit: JUnit 5 and AssertJ for domain states, commands, validation, mapping, and error conversion.
- Web/security: MockMvc with signed JWT fixtures, roles, account states, owners, participants, and admins.
- PostgreSQL integration: Testcontainers, real Flyway migrations, constraints, locks, and transactions; never H2.
- Storage: adapter tests with isolated fake/test storage.
- Contract: OpenAPI 3.1 route, DTO, status, header, multipart, CSV, and RFC 9457 checks.
- End-to-end: isolated API and PostgreSQL workflow tests.
- Concurrency: repeated and simultaneous commands against wallet, escrow, sessions, swaps, and disputes.

## Required scenarios

- Registration creates one user, role, wallet, and +50 award; retries do not duplicate.
- JWT expiry, invalid claims, refresh rotation, reuse detection, logout, suspension, and disabled accounts.
- Owner, participant, author, mentor, and admin boundaries; private fields are redacted.
- Skill ownership, offering eligibility, mode support, stable pagination, and deactivation rules.
- POINTS creates one price snapshot, hold, escrow, and ledger entry without overdraft.
- SKILL_SWAP validates reciprocal skills, creates both snapshots, writes no financial rows, and completes only after both confirmations.
- VOLUNTEER forces zero points and creates no financial rows.
- Request accept/reject/cancel/expiry creates at most one session and refunds once.
- Completion, auto-release, dispute, review, reward, notification, report, warning, settings, and audit effects are idempotent.
- Concurrent requests cannot overdraw wallets or release/complete twice.
- Flyway works from an empty database and supported upgrades; no MySQL or Hibernate-created schema.
- Every route in API_CONTRACT matches OpenAPI, DTO_CATALOG, authorization, statuses, and examples.

## Quality gates

As implementation expands, require formatting/static analysis, unit tests, web/security tests, PostgreSQL/Testcontainers tests, migration validation, contract checks, concurrency checks, and full workflow tests. Never use production credentials or production data.
