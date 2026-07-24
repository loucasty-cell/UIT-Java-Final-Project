# Testing Matrix

## Test layers and tools

- Unit: JUnit 5 and AssertJ for pure domain/application rules; Mockito only at genuine external boundaries.
- Web/security: MockMvc with controlled JWT claims and profile status/role fixtures.
- Persistence/integration: PostgreSQL Testcontainers, Flyway migrations, real constraints and transactions; never H2.
- Storage: adapter contract tests against a fake HTTP server or isolated Supabase test project; never production buckets.
- API contract: generated OpenAPI validation plus request/response schema tests.
- End-to-end: Lovable test client against an isolated backend/database with deterministic seed data.

## Required feature coverage

| Feature | Required automated cases |
|---|---|
| Authentication | valid token, missing token, bad signature, wrong issuer/audience, expired token, unknown key refresh |
| Account state | missing profile only onboarding; active access; suspended read-me only; deleted rejection; admin status override |
| Onboarding | creates profile/wallet/+30 once; same idempotency retry returns original; different payload conflict; concurrent calls do not double grant |
| Profile | validation, version conflict, private-field redaction, owner update, unrelated-user restrictions |
| Files | allowed MIME/size/signature, forged path, wrong owner, missing object, mismatched metadata, signed URL expiry, cleanup after delete |
| Skills | unique user/skill/direction, LEARN restrictions, TEACH mode/price rules, disabled catalog/offer, mentor filtering/sorting |
| Request creation | self-request blocked, invalid offering/mode/swap/time, insufficient points, hold succeeds atomically, duplicate key/request blocked |
| Request decisions | mentor-only accept/reject, learner-only cancel, stale state/version, release exactly once, one session per acceptance |
| Session | participant read, Meet URL validation, completion blocked before scheduled end, first confirmation deadline, second confirmation completion |
| Auto-completion | eligible after 24h, not early, dispute blocks it, repeated/multi-instance job pays once |
| Cancellation | allowed state/actor, forbidden late cancellation, escrow refund once, historical state retained |
| Dispute | participant-only opening, one active dispute, escrow frozen, admin-only resolution, release/refund exactly once |
| Wallet | non-negative balances, available/held deltas, row locking, ledger/balance atomicity, rollback, admin audit reason |
| Review | learner only, completed session only, rating validation, unique review, +5 reward once, retry/concurrency safe |
| Forum | author CRUD, soft delete, validation, one like per user, counter correctness, volunteer request forced to zero points |
| Notifications | owner-only list/read, read-all idempotency, event generation, no private payload leakage |
| Reports/admin | reporter ownership, admin queues, role/status guards, last-admin protection, resolution audit |

## Authorization matrix tests

For every protected endpoint, cover the minimum relevant actors: owner, other active user, learner participant, mentor participant, suspended user, ordinary user against admin route, and admin. Verify both status code and absence of sensitive response fields.

## Concurrency and idempotency tests

- Two point requests competing for the same available balance cannot overspend.
- Duplicate onboarding, request, completion, review, refund, payout, and admin adjustment create one financial effect.
- Simultaneous participant completion produces one payout.
- Completion racing with dispute cannot bypass the dispute or pay twice.
- Request accept racing with cancel/reject creates at most one valid final state and one session.
- Optimistic-lock conflict returns `409`; database deadlock/serialization retry is bounded and safe.
- Reusing an idempotency key with a different request fingerprint returns `409`.

## Database tests

Run all Flyway migrations from empty database and from the previous released schema. Verify foreign keys, unique/partial indexes, check constraints, version columns, timezone behavior, query pagination, and rollback of every multi-table financial transaction.

## API and DTO tests

- Every route in `API_CONTRACT.md` appears in OpenAPI with security, DTO schema, responses, and examples.
- Unknown fields, malformed UUID/time/enum, blank strings, range violations, and conditional DTO rules return the documented problem code.
- Entity-only/private fields never appear in public, user, or admin DTOs unless explicitly listed.
- Pagination has stable ordering; invalid sort/filter names are rejected.
- `ETag`, `If-Match`, `Idempotency-Key`, `Location`, content type, and RFC 9457 behavior match standards.

## Quality gates

- Build, formatting/static analysis, unit tests, integration tests, migration validation, and OpenAPI checks must pass.
- No disabled/flaky tests, production credentials, external production calls, or order-dependent tests.
- Critical wallet, authorization, and state-machine branches require direct tests; coverage percentage alone is not acceptance.
- A release candidate must pass the complete end-to-end workflow twice with identical idempotency keys and prove balances/ledger rows remain correct.
