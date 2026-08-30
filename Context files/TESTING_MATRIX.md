# Testing Matrix

This matrix describes current and planned automated coverage.

## Current state

- `mvnw test` runs **62 tests, all passing** (JUnit 5) on JDK 25 with the Maven wrapper (`.\mvnw.cmd`).
- Coverage is per-module unit testing: review is the largest suite (service 14, controller 1, mapper 2, entity mapping 1), session (service 8, controller 1, mapper 2), swap (controller 2, service 6, entity mapping 2), skill (controller 4, service 4, mapper 2, entity mapping 1, repository 2), request (service 2, controller 1, repository 2), moderation (controller 1, service 1), notification (controller 1, service 1), plus the Spring context smoke test.
- Services are tested through hand-rolled `java.lang.reflect.Proxy` fakes for repositories and recording subclasses for collaborators — no Mockito.
- `src/test/java/com/skillbridge/support/TestAuthContext.java` simulates JWT authentication in tests: call `TestAuthContext.loginAs(userId)` after creating fixtures whose services read `SecurityUtils.getCurrentUserId()`, and add an `@AfterEach` calling `TestAuthContext.logout()` to avoid leaking the security context between tests.
- Each module has a `*ModuleTestRunner` aggregating its suites.

## Test layers

Implemented today: unit tests per module (JUnit 5 + AssertJ, MockMvc controller slices, repository tests) — everything below is **required when added**, none exist yet:

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
