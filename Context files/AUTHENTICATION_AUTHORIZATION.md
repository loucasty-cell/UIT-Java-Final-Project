# Authentication and Authorization

## Authentication ownership

Spring Boot owns registration, login, access-token issue, refresh-token rotation, logout, and account enforcement. Neon PostgreSQL stores users, password hashes, roles, account status, and refresh-token hashes. The frontend never authenticates directly against Neon.

Access-token lifetime is exactly 30 minutes. The JWT `exp` claim is authoritative. Refresh tokens are opaque, long-lived secrets rotated on every refresh; only their hashes are stored.

## Endpoints

- `POST /api/v1/auth/register`: creates user, `USER` role, wallet, and one +50 registration award atomically.
- `POST /api/v1/auth/login`: verifies password hash and returns access/refresh tokens plus safe user summary.
- `POST /api/v1/auth/refresh`: verifies and rotates the refresh token; reuse revokes the token family.
- `POST /api/v1/auth/logout`: revokes the current refresh-token family.

Password reset/email verification may be added later with server-generated single-use tokens. Do not invent frontend behavior until routes/DTOs are added to the context.

## Request authentication flow

1. Frontend sends `Authorization: Bearer <accessToken>`.
2. Spring Security validates approved algorithm, signature, issuer, audience, `sub`, `iat`, `nbf`, and `exp`.
3. `sub` is the UUID from `users.id`.
4. Backend loads current roles and account status from PostgreSQL. JWT claims never override current suspension/role state.
5. Missing/invalid/revoked token returns `401`. Expired access token returns `401 TOKEN_EXPIRED`.
6. Frontend may call refresh and retry the original request once. A second failure returns the user to login.
7. Valid identity without resource permission returns `403`.

## Credential rules

- Passwords are hashed using Argon2id or BCrypt with deployment-appropriate parameters.
- Never log or return raw passwords, password hashes, JWTs, refresh tokens, token hashes, or signing keys.
- JWT signing secret/key is at least 256 bits for HS256 or use an asymmetric key pair; production keys come from a secret manager.
- Refresh rows record family, expiry, revocation, replacement, and reuse detection metadata.
- Login and refresh are rate-limited. Generic credential errors do not reveal whether an email exists.

## Session security

- API is stateless for access-token authentication; no servlet login session stores user identity.
- Header-based bearer authentication allows CSRF disabling only while credentials are not cookie-authenticated.
- CORS uses explicit Lovable production/preview and local origins; never wildcard origins with credentials.
- Logout/reuse detection revokes refresh capability. Existing access tokens remain short-lived and current account state is checked from the database.

## Account behavior

- `ACTIVE`: normal role/ownership/participant access.
- `WARNED`: normal access plus warning notification/history.
- `SUSPENDED`: may call `GET /me` and logout only; business endpoints return `403 ACCOUNT_SUSPENDED`.
- `DISABLED`: authentication/refresh fails; historical records remain.
- Account state overrides every role including `ADMIN`.

## Role model

- `USER`: ordinary authenticated account.
- `MENTOR`: same user identity with at least one eligible mentor offering. The offering service grants it atomically on the first eligible offering; a mentor may still act as learner.
- `ADMIN`: moderation and configuration authority.
- Roles use a `user_roles` table; do not create separate user/admin/mentor identity tables.

## Permission matrix

| Resource/action | User/mentor rule | Admin rule |
|---|---|---|
| Own profile, skills, certificates, wallet, notifications | owner only | no impersonation through user endpoint |
| Public mentor profile/reviews | any active account, public fields only | same unless admin endpoint |
| Create first mentor offering | active user with owned visible `TEACH` skill; service grants `MENTOR` | not through user endpoint |
| Learning request read | requester or selected mentor | read for moderation/audit |
| Request accept/reject | selected mentor only | no normal override |
| Pending request cancel | requester only | no normal override |
| Session/meeting URL read | participant | read for active dispute/report |
| Update schedule/meeting URL | participant under state rules | no normal override |
| Confirm completion | either participant when eligible | resolve only through dispute endpoint |
| Create dispute | participant before final completion/release | list/resolve |
| Create review | participant reviewing the other after completion | cannot fabricate review |
| Forum CRUD | author; deletion is soft | moderation action with audit |
| Report create/read | reporter reads own | list/dismiss/action |
| Catalog skill mutation | forbidden | create/update/disable |
| User status/role | forbidden | update with reason; protect last admin/self-lockout |
| Wallet mutation | forbidden | explicit audited adjustment/resolution only |
| Platform settings | forbidden | read/update with audit |

## Object-level checks

- Resolve resource, then verify owner/participant before returning private data.
- Use `404` when revealing existence would leak private data; otherwise `403` for known forbidden action.
- Participant/author/owner IDs come from persisted relationships or authenticated principal, never request bodies.
- Mentor offering must belong to the target mentor, be active, and support the mode.
- `offeredUserSkillId` must belong to the requester and be visible `TEACH`; the mentor must have matching visible `LEARN`.
- Meeting URLs, certificate object keys, idempotency keys, and admin notes are private.

## Database and storage access

- Spring Boot is the only business-table and file-metadata write path.
- React receives no Neon host credentials, database role, signing key, or storage secret.
- Runtime and migration PostgreSQL roles are least privilege and separated where practical.
- Private files are returned only after ownership/authorization through a short-lived storage URL or authenticated streaming endpoint.

## Security error codes

Use stable codes including `UNAUTHENTICATED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `REFRESH_TOKEN_INVALID`, `REFRESH_TOKEN_REUSED`, `ACCOUNT_SUSPENDED`, `ACCOUNT_DISABLED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `NOT_PARTICIPANT`, and `ADMIN_REQUIRED`. Responses follow [API_STANDARDS.md](API_STANDARDS.md).
