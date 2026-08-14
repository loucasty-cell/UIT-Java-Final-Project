# API Standards

## Contract

- Base path: /api/v1.
- Media types: application/json, multipart for certificates, and CSV for wallet export.
- Errors use RFC 9457 application/problem+json.
- JSON uses camelCase; PostgreSQL uses snake_case.
- IDs are UUID strings, points are integers, and instants are UTC ISO-8601 values.
- OpenAPI 3.1 must change with every route or DTO change.

## HTTP behavior

- GET reads, POST creates or executes commands, PATCH partially updates, PUT creates an idempotent toggle, and DELETE removes or soft-deletes.
- Controllers expose DTOs only; entities and private fields never cross the API boundary.
- Use 200, 201, 204, 400, 401, 403, 404, 409, 422, and 429 according to the documented condition.
- Problem responses contain type, title, status, detail, instance, code, requestId, and timestamp. Validation adds fieldErrors.
- Collections use data plus page with default size 20 and maximum size 100.
- Filters and sorting are allow-listed; searches are trimmed, bounded, parameterized, and stably sorted.

## Security and reliability

- Protected requests use Authorization: Bearer accessToken.
- Access tokens expire after 24 hours; return TOKEN_EXPIRED when applicable.
- Require Idempotency-Key for registration, workflow commands, point mutations, rewards, refunds, releases, and dispute resolution.
- Use If-Match/version checks for mutable resources where specified.
- Use explicit CORS origins and rate-limit authentication, search, uploads, reports, and commands.
- Server owns identity, owner IDs, roles, prices, balances, rewards, counts, ratings, timestamps, and final states.
