# Authentication and Authorization

## Ownership

Spring Boot owns registration, login, access-token issue, refresh rotation, logout, and account enforcement. PostgreSQL stores users, password hashes, roles, account state, and refresh-token hashes. The API client never connects directly to PostgreSQL.

Access tokens last exactly 24 hours. Refresh tokens are opaque, rotated on every refresh, and stored only as hashes.

## Request flow

1. Read Authorization: Bearer accessToken.
2. Validate approved algorithm, signature, issuer, audience, subject, issued-at, not-before, and expiry.
3. Treat subject as the UUID in users.id.
4. Load current roles and account state from PostgreSQL.
5. Return documented 401 errors for missing, invalid, revoked, or expired credentials and 403 for authenticated callers without permission.

JWT claims never override current database role or account status.

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
