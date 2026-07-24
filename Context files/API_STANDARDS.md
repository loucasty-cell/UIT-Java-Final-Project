# API Standards

## Base contract

- Base path: `/api/v1`.
- Media type: `application/json`; errors use `application/problem+json`.
- Contract: OpenAPI 3.1 is updated with every endpoint change.
- JSON fields use `camelCase`; database fields use `snake_case`.
- UUIDs are strings, points are integers, and instants are ISO-8601 UTC.

## Authentication and authorization

- Protected requests send `Authorization: Bearer <Supabase access token>`.
- Return `401` for a missing, expired, or invalid token.
- Return `403` when the authenticated user cannot perform the action.
- Validate role, ownership, participant relationship, and account status on every protected resource.
- Never accept role, owner ID, balance, reward, price, aggregate rating, or final status from the client.

## Resource design

- Use nouns for resources and `POST` subresource commands for transitions such as `/accept`, `/complete`, and `/resolve`.
- Use `GET` for reads, `POST` for creation/commands, `PATCH` for partial updates, and `DELETE` for supported removal or soft-disable behavior.
- Do not place verbs in ordinary CRUD routes.
- Do not expose internal entity names, database columns, or stack traces.

## Responses

- `200`: successful read or update with a response body.
- `201`: resource created; return its representation and `Location` header.
- `204`: successful command or deletion with no response body.
- `400`: malformed request or invalid syntax.
- `401`: unauthenticated.
- `403`: authenticated but forbidden.
- `404`: resource missing or intentionally hidden from an unrelated user.
- `409`: duplicate, stale version, or invalid state transition.
- `422`: valid request structure that violates a business rule.

## Errors

Follow RFC 9457 with `type`, `title`, `status`, `detail`, `instance`, stable `code`, and `traceId`. Validation problems also include field-level `errors`. Messages must be useful without exposing SQL, secrets, implementation details, or other users' data.

## Collections

- Response shape: `{ items, page, size, total }`.
- Default `size=20`; maximum `size=100`.
- Filters and sort values must be allow-listed and documented.
- Every paginated query must use a stable secondary sort, normally ID.
- Search input is trimmed, length-limited, and safely parameterized.

## Reliability

- Require `Idempotency-Key` for onboarding and every command that can hold, transfer, refund, or reward points.
- The same key and same payload return the original result; the same key with a different payload returns `409`.
- Use optimistic versioning for mutable workflows and database locking for wallet mutation.
- State-changing operations must be transactional.

## Compatibility and security

- Additive response fields are non-breaking; removed/renamed fields or changed meanings require a new API version.
- Restrict CORS to configured frontend origins and methods.
- Rate-limit authentication-sensitive, search, upload, forum-write, and command endpoints.
- Validate file type, size, ownership, and object path before returning a signed URL.
- Never log authorization headers, tokens, passwords, connection strings, or private file URLs.

The complete route inventory is [API_CONTRACT.md](API_CONTRACT.md), DTO fields are in [DTO_CATALOG.md](DTO_CATALOG.md), and access rules are in [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md).
