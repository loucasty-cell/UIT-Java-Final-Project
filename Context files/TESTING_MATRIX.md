# Testing Matrix

## Test layers and tools

- Unit: JUnit 5 and AssertJ for pure domain/application rules; Mockito only at real external boundaries.
- Web/security: MockMvc with signed JWT fixtures, roles, account states, owners, participants, and admins.
- Persistence/integration: PostgreSQL Testcontainers, all Flyway migrations, real constraints/locks/transactions; never H2.
- Storage: adapter contract tests against isolated fake/test storage; never production files.
- API: OpenAPI 3.1 validation and request/response/error schema tests.
- End-to-end: current Lovable workflow against an isolated backend and Neon-compatible PostgreSQL schema.

## Required feature coverage

| Feature | Required automated cases |
|---|---|
| Register/login | valid registration creates one user/role/wallet/+50; duplicate email; password hash only; idempotency retry; login success/failure/rate limit |
| JWT/refresh | 30-minute expiry boundary, invalid signature/issuer/audience, `TOKEN_EXPIRED`, rotate on refresh, reuse revokes family, logout revokes |
| Account/roles | active/warned access, suspended restricted access, disabled login/refresh rejection, mentor/admin permissions, no duplicate identity |
| Profile/dashboard | owner update/version conflict, identity consistency, private redaction, correct wallet/session/skill/certificate aggregates |
| Certificates | PDF MIME/signature, 10 MB limit, wrong owner, forged key, authorized URL, delete-state rules |
| Skills | unique user/skill/direction, level/visibility, active catalog, block active-reference deletion |
| Offerings/mentor search | first eligible offer grants mentor role, owned teach skill, mode/price rules, deactivate conflict, filters, stable pagination |
| Point request | self-request blocked, invalid offer/time, server price snapshot, insufficient funds, atomic hold/escrow/ledger, duplicate retry blocked |
| Skill-swap request | requested skill matches offering, offered skill owned visible `TEACH`, mentor matching `LEARN`, both snapshots, no wallet/escrow/ledger rows |
| Volunteer request | direct and forum-source validation, target post author, forced zero points, no financial rows |
| Request decision | mentor-only accept/reject, requester-only cancel, stale state/version, one session, point refund once, swap state transition |
| Session | participant/redaction, meeting URL validation, allowed reschedule state, first/second confirmation, unique participant confirmation |
| Point completion | first confirmation sets 18-hour snapshot, second releases exactly once, response `pointsReleased`, repeated/concurrent calls safe |
| Swap completion | both confirmations required, completes session/swap atomically, no point movement, one-sided auto-complete disabled |
| Auto-release | point session eligible after deadline, not early, setting snapshot unchanged, dispute blocks, multi-instance job releases once |
| Dispute | participant-only opening, one active dispute, escrow/swap frozen, admin-only mode-valid resolution, release/refund/cancel exactly once |
| Wallet/ledger | non-negative balances, lock order, deltas/balances-after, append-only ledger, rollback, CSV owner export, audited adjustment boundary |
| Review | participant reviewing other participant, completed session only, rating 1..5, optional text, unique reviewer/session, aggregate correctness |
| Forum | author from principal, post/comment soft delete, skill validation, one like per user, counts, weekly volunteer ranking, no client-owned counters |
| Forum reward | post-author-only helpful action, no own-comment reward, one reward/post, +5 setting snapshot, idempotency and uniqueness |
| Notifications/search | owner-only read, read-all idempotency, safe payloads, grouped search limits and filters |
| Reports/admin | report ownership, queues, dismiss/remove content, warning notification, account status guard, settings future-only behavior, immutable audit |

## Authorization matrix

For each protected route, test the relevant owner, unrelated active user, learner participant, mentor participant, suspended user, ordinary user against admin route, and admin. Verify status code plus absence of email, hashes, wallet, meeting URL, certificate key, private evidence, and admin-only notes.

## Concurrency and idempotency

- Concurrent point requests cannot overdraw available balance.
- Duplicate register/request/accept/reject/cancel/complete/reward/refund/release/admin-resolution commands create one effect.
- Simultaneous participant confirmations release or complete once.
- Completion racing with dispute cannot bypass the dispute.
- Accept racing with cancel/reject creates one valid terminal request state and at most one session.
- Setting changes racing with confirmation do not change an already-snapshotted deadline/amount.
- Lock order avoids common deadlocks; bounded retries remain idempotent.
- Reusing an idempotency key with a different fingerprint returns `409 IDEMPOTENCY_CONFLICT`.

## Database and migration tests

- Run Flyway from empty database and every supported previous schema.
- Verify UUID/FK/check/unique/partial indexes, non-negative wallet checks, timezone behavior, version columns, and rollback.
- Verify no MySQL syntax/driver and no Hibernate auto-created schema.
- Test Neon-style SSL configuration separately without production credentials.
- Verify query plans/index usage for mentor search, sessions, escrow job, notifications, forum, and admin queues.

## API/DTO contract tests

- Every route in [API_CONTRACT.md](API_CONTRACT.md) appears once in OpenAPI with security, DTO schema, statuses, and examples.
- Unknown fields, malformed UUID/time/enum, blank/range/conditional violations return documented problems.
- Stable enums match DTO catalog, Java, OpenAPI, and PostgreSQL constraints.
- `ETag`/`If-Match`, `Idempotency-Key`, `Location`, multipart, CSV, pagination, and RFC 9457 behavior match standards.
- Frontend request modes send the correct mode-specific fields.
- Server-owned identity, author, counts, prices, balances, rewards, and states are ignored/rejected from clients.

## Frontend end-to-end flows

1. Register/login -> dashboard identity/wallet +50 -> add skills/certificate.
2. Search mentor -> point request -> hold -> accept -> session -> two confirmations -> payout -> optional review.
3. Search mentor -> reciprocal skill swap -> accept -> both confirm -> complete with unchanged wallets.
4. Create forum post/comment/like -> volunteer request -> session -> complete at zero points.
5. Open dispute -> admin resolve -> correct refund/release/swap outcome plus audit/notification.
6. Update admin settings -> existing operation unchanged -> new operation uses new values.

## Quality gates

- Maven build, formatting/static analysis, unit tests, PostgreSQL integration tests, migration validation, security tests, OpenAPI checks, and frontend contract tests pass.
- No disabled/flaky tests, production credentials, production calls, or order-dependent tests.
- Critical wallet, authorization, swap, and state-machine branches have direct tests.
- Release candidate repeats the complete workflows with retry/concurrency and proves no duplicate point or workflow effects.
