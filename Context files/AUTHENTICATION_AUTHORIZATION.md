# Authentication and Authorization

## Ownership

Spring Boot owns registration, login, access-token issue, refresh rotation, logout, and account enforcement. PostgreSQL stores users, password hashes, roles, account state, and refresh-token hashes. The API client never connects directly to PostgreSQL.

Access tokens last exactly 12 hours (720 minutes). Refresh tokens are opaque, rotated on every refresh, and stored only as hashes.

## Request flow

1. Read Authorization: Bearer accessToken.
2. Validate approved algorithm, signature, issuer, audience, subject, issued-at, not-before, and expiry.
3. Treat subject as the UUID in users.id.
4. Load current roles and account state from PostgreSQL.
5. Return documented 401 errors for missing, invalid, revoked, or expired credentials and 403 for authenticated callers without permission.

JWT claims never override current database role or account status.

## Current implementation

- `SecurityConfig` runs a stateless filter chain: CSRF off, explicit CORS origins (`skillbridge.cors.allowed-origins`), JWT via `NimbusJwtDecoder` with HMAC-SHA256 shared secret, BCrypt password encoder.
- The `roles` claim is converted to Spring authorities in both `ADMIN` and `ROLE_ADMIN` forms so `@PreAuthorize` works either way.
- Public routes: `/api/v1/auth/**`, `/actuator/health`, `/v3/api-docs/**`, `/swagger-ui/**`. Everything else requires a valid JWT.
- Services resolve the acting user with `SecurityUtils.getCurrentUserId()`, which reads the JWT subject from the SecurityContext. Client-supplied user IDs are never accepted as proof of identity.
- Module authorization rules currently enforced:
  - Swap proposals: responder accepts/rejects; requester cancels; participants complete the session.
  - Sessions: only participants start, update, or complete.
  - Reviews: reviewer must be a session participant, reviewee must be the other participant, one review per reviewer/session.
  - Notifications: list/mark-read/delete are restricted to the owning user.
- Authorization violations throw Spring's `AccessDeniedException` (mapped to `403 FORBIDDEN` by `GlobalExceptionHandler`); invalid state transitions throw `IllegalStateException`/`IllegalArgumentException` (mapped to `400`).

## Credentials and session rules

- Hash passwords with Argon2id or BCrypt.
- Rate-limit login and refresh without revealing whether an email exists.
- Use stateless bearer authentication; do not store identity in a servlet login session.
- Use explicit CORS origins and never wildcard credentials.
- Never log passwords, hashes, JWTs, refresh tokens, signing keys, database credentials, private file keys, or meeting URLs.

## Account and role model

Account states:

- ACTIVE: normal access.
- WARNED: normal access plus warning history.
- SUSPENDED: only GET /me and logout; business actions return ACCOUNT_SUSPENDED.
- DISABLED: login and refresh fail; history remains.

Roles are USER, MENTOR, and ADMIN in user_roles. MENTOR is granted by the offering service after the first eligible active offering. It is not a separate identity. Account state overrides every role.

## Permission rules

- Owners control their profile, skills, certificates, wallet, notifications, and private records.
- Participants control allowed session, completion, review, and dispute actions.
- Authors control forum content; deletion is soft when referenced by moderation.
- Only selected mentors accept or reject requests.
- Only requesters cancel pending requests.
- Only admins manage catalog data, account status, settings, reports, disputes, and audited adjustments.
- Meeting URLs, certificate keys, evidence, idempotency records, and admin notes are private.
- Resolve the object and verify persisted owner/participant relationships before returning private data.

Stable security codes include UNAUTHENTICATED, TOKEN_INVALID, TOKEN_EXPIRED, REFRESH_TOKEN_INVALID, REFRESH_TOKEN_REUSED, ACCOUNT_SUSPENDED, ACCOUNT_DISABLED, FORBIDDEN, RESOURCE_NOT_FOUND, NOT_PARTICIPANT, and ADMIN_REQUIRED.
