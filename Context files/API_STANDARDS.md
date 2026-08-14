# API Standards

## Base contract

- Base path: `/api/v1`.
- Primary media type: `application/json`; certificate upload uses multipart and activity export uses CSV.
- Errors use `application/problem+json` following RFC 9457.
- OpenAPI 3.1 changes with every route or DTO change.
- JSON uses `camelCase`; PostgreSQL uses `snake_case`.
- IDs are UUID strings, points are integers, and instants are ISO-8601 with `Z` or an explicit offset.
- The backend stores instants in UTC `timestamptz`.

## Authentication and authorization

- Protected requests send `Authorization: Bearer <accessToken>`.
- Access tokens expire after 30 minutes. Return `401 TOKEN_EXPIRED` when expiry is the cause.
- The frontend may refresh and retry the original request at most once.
- Return `403` for an authenticated caller without role, ownership, participant, or account-state permission.
- Never accept owner ID, role, balance, point price, reward, aggregate rating, author fields, or final status from the client.

## Resource design

- Use nouns for resources and command subresources for state transitions such as `/accept`, `/reject`, `/cancel`, `/completion-confirmations`, and `/resolve`.
- Use `GET` for reads, `POST` for creation/commands, `PATCH` for partial updates, `PUT` for idempotent replacement/toggle creation, and `DELETE` for removal/soft deletion.
- Controllers expose DTOs only; never database entities or column-oriented payloads.

## Responses

- `200`: successful read/update/command with a body.
- `201`: resource created with representation and `Location` when meaningful.
- `204`: successful deletion or no-body idempotent command.
- `400`: malformed syntax or JSON.
- `401`: missing, invalid, revoked, or expired authentication.
- `403`: authenticated but forbidden.
- `404`: absent resource or private resource intentionally hidden from an unrelated caller.
- `409`: duplicate, stale version, idempotency mismatch, or invalid state transition.
- `422`: well-formed input violating field/domain validation.
- `429`: rate limit exceeded.

## Errors

Problem responses contain `type`, `title`, `status`, `detail`, `instance`, stable `code`, `requestId`, and `timestamp`. Validation failures also contain `fieldErrors`. Never expose SQL, stack traces, credentials, token content, or other users' private data.

Required stable codes include `VALIDATION_FAILED`, `UNAUTHENTICATED`, `TOKEN_EXPIRED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `CONFLICT`, `INSUFFICIENT_POINTS`, `INVALID_STATE_TRANSITION`, `SKILL_SWAP_NOT_MATCHED`, `DUPLICATE_REVIEW`, `IDEMPOTENCY_CONFLICT`, `ACCOUNT_SUSPENDED`, `ADMIN_REQUIRED`, and `RATE_LIMITED`.

## Collections

- Response shape: `{ data: [], page: { number, size, totalElements, totalPages } }`.
- Default `size=20`; maximum `size=100`.
- Filters and sort values are allow-listed and documented.
- Every query has a stable secondary sort, normally UUID.
- Search input is trimmed, length-limited, and parameterized.

## Reliability

- Require `Idempotency-Key` on registration, learning-request creation, accept/reject/cancel, completion, point reward/adjustment, refund/release, and dispute resolution.
- The same key and request fingerprint return the original result. Reuse with different content returns `409 IDEMPOTENCY_CONFLICT`.
- Use optimistic versions for mutable resources and explicit row locking for wallet, escrow, request, session, and swap commands.
- State-changing operations are transactional.
- The frontend must display API-returned state; it must not predict release, completion, balances, counts, or identities.

## Compatibility and security

- Additive response fields are normally non-breaking; removed/renamed fields or changed meanings require a new API version.
- CORS uses explicit Lovable production/preview and local-development origins.
- Rate-limit authentication, search, uploads, forum writes, reports, and workflow commands.
- Verify multipart MIME, PDF signature, size, ownership, and generated object key.
- Never log authorization headers, passwords, JWTs, refresh tokens, Neon URLs/passwords, meeting links, or private file URLs.

See [API_CONTRACT.md](API_CONTRACT.md), [DTO_CATALOG.md](DTO_CATALOG.md), and [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md).
