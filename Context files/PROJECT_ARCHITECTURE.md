# Project Architecture

## System boundary

Lovable SPA -> Spring Boot REST API -> Supabase PostgreSQL and Storage.

Supabase Auth issues access tokens. Spring Boot verifies them and remains the only business API and write path for application data.

## Backend modules

- `profile`: onboarding, profile, account status, avatars, certificates.
- `skill`: catalog, teaching offers, learning interests, mentor search.
- `request`: learning-request creation, acceptance, rejection, cancellation, expiry.
- `session`: scheduling, Meet link, completion, timeout, cancellation.
- `wallet`: balances, escrow, ledger, payout, refund, rewards, admin adjustment.
- `review`: eligible reviews and rating summaries.
- `forum`: posts, comments, reactions, volunteer requests.
- `notification`: user events and read state.
- `moderation`: reports, disputes, and admin resolution.
- `security`, `storage`, and `shared`: cross-cutting infrastructure only.

## Package style

Use package-by-feature. Inside a feature, separate:

- `api`: controllers, request/response DTOs, validation.
- `application`: use cases, authorization decisions, transaction boundaries.
- `domain`: entities, enums, and business invariants.
- `infrastructure`: JPA repositories, database adapters, storage clients, schedulers.

Dependency direction is API -> application -> domain. Infrastructure implements needs defined by the inner layers. Features must not reach into another feature's repository; call its application service or a narrow interface.

The complete ownership list is in [CONTROLLER_SERVICE_MAP.md](CONTROLLER_SERVICE_MAP.md).

## Request path

1. Security validates token and creates the authenticated principal.
2. Controller validates transport input and calls one application use case.
3. Application service checks ownership, role, state, and business rules.
4. Service performs the transaction through repositories or adapters.
5. Mapper returns an explicit response DTO.
6. Global exception handling converts failures to RFC 9457 problems.

## Transaction boundaries

- One public application command owns one transaction.
- Wallet mutation locks the wallet row, validates funds, updates balance, and appends ledger rows atomically.
- Request acceptance creates one session atomically.
- Completion or dispute resolution changes state and pays/refunds atomically.
- Review creation and reward granting occur atomically with a unique constraint.
- External file operations are not hidden inside long database transactions; use upload-intent and confirmation steps.

## Data ownership

- Supabase Auth owns credentials and verified email identity.
- PostgreSQL owns application state and financial audit history.
- Storage owns file bytes; PostgreSQL stores authorized object metadata and paths.
- The frontend owns presentation state only and never calculates authoritative balances or statuses.

## Configuration

Use environment-specific configuration with validated startup properties. Keep secrets outside Git. Separate local, test, and production settings. Flyway is the only schema-change mechanism; JPA validates mappings.

## Background work

A scheduled application job expires pending requests and auto-completes eligible sessions. Jobs must claim records safely, be idempotent, and work correctly if multiple application instances run.

DTO assembly rules are defined in [DTO_MAPPING.md](DTO_MAPPING.md); authentication boundaries are defined in [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md).
