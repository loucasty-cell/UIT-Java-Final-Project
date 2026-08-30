# API Standards

## Contract

- Base paths: `/api/v1` for auth, profile, dashboard, wallet, mentors, mentor-offerings, forum, and admin; unversioned `/api` for skills, swaps, requests, sessions, reviews, notifications, and moderation (new modules should use `/api/v1`).
- Media types: application/json and CSV for wallet export.
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
- Access tokens expire after 12 hours (720 minutes by default); return TOKEN_EXPIRED when applicable.
- Idempotency-Key headers are planned for retry-sensitive commands; today, financial operations achieve idempotency inside services (e.g., escrow release exactly once).
- If-Match/version checks are implemented for profile and mentor-offering updates.
- Use explicit CORS origins and rate-limit authentication, search, uploads, reports, and commands.
- Server owns identity, owner IDs, roles, prices, balances, rewards, counts, ratings, timestamps, and final states.
