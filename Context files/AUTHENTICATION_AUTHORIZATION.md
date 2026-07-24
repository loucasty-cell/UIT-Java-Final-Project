# Authentication and Authorization

## Authentication ownership

Supabase Auth owns sign-up, sign-in, email verification, token refresh, sign-out, and password reset. The Lovable frontend uses the Supabase client for those operations. Spring Boot exposes no duplicate authentication endpoints and stores no passwords or refresh tokens.

The Supabase project must use asymmetric signing keys so Spring Security can validate JWTs through:

`https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`

## Request authentication flow

1. Frontend sends `Authorization: Bearer <access-token>`.
2. Spring Security verifies signature, approved algorithm, key ID, issuer, audience, expiry, and not-before time.
3. `sub` must be a UUID and becomes the immutable application user ID.
4. Backend loads the profile role and account status from PostgreSQL. Email/metadata claims never grant authorization.
5. Missing profile may call only onboarding. Existing active profile may use normal endpoints.
6. Invalid token returns `401`; valid identity without permission returns `403`.

Expected issuer is `https://<project-ref>.supabase.co/auth/v1` and expected audience is `authenticated`. Allow small clock skew only. Cache JWKS within Supabase rotation guidance and support key refresh on an unknown key ID.

## Session security

- API is stateless and uses bearer tokens, not server sessions or authentication cookies.
- Disable CSRF only because authentication is header-based and stateless.
- CORS uses an explicit allow-list of Lovable production/preview and local development origins; never `*` with credentials.
- Frontend refreshes tokens through Supabase and retries a request at most once after refresh.
- Logging out revokes/clears the Supabase session on the client; short access-token lifetime limits stale access.
- Role changes and suspension take effect from the database check even if an old JWT still exists.

## Account-state behavior

- `ACTIVE`: normal access based on role and ownership.
- `SUSPENDED`: may call `GET /me` only; all other business endpoints return `403 ACCOUNT_SUSPENDED`.
- `DELETED`: all protected endpoints return `403 ACCOUNT_DELETED`; retain historical records and prevent new actions.
- Account state overrides `ADMIN` role.

## Permission matrix

| Resource/action | User rule | Admin rule |
|---|---|---|
| Onboarding | authenticated identity with no profile | not applicable |
| Own profile/skills/files/wallet/notifications | owner only | admin does not impersonate owner |
| Public profile/mentor/reviews | any active user; public fields only | same public response unless using admin endpoint |
| Learning request read | learner or mentor | may read for moderation/audit |
| Request accept/reject | selected mentor only | forbidden in MVP |
| Pending request cancel | learner only | forbidden in MVP |
| Session read | participant | may read for dispute/report handling |
| Set Meet link | mentor participant | forbidden in MVP |
| Complete session | either participant after scheduled end | forbidden in MVP |
| Cancel session | either participant while scheduled and before start | no override in MVP; after start use dispute |
| Open/read dispute | participant | read and resolve |
| Create review | learner participant after completed session | cannot create for a user |
| Forum create/update/delete | author; delete is soft | moderate through admin/report flow |
| Report create/read | reporter reads own report | list, assign, resolve |
| Catalog skill mutation | forbidden | create, update, soft-disable |
| User status/role | forbidden | update with reason; cannot remove last active admin or change self unsafely |
| Wallet mutation | forbidden | explicit audited adjustment only |
| Private certificate | owner gets signed access | metadata/evidence access only when policy requires; never unrestricted browsing |

## Object-level checks

- Resolve resources by ID, then verify owner/participant before returning data or revealing existence.
- Use `404` for an unrelated user when existence itself is private; use `403` when the resource is known but the action is forbidden.
- Participant IDs always come from persisted request/session relationships, never from request bodies.
- A mentor offering must belong to the target mentor, be enabled, and support the requested mode.
- Forum author checks use persisted author ID. Admin moderation actions are separately audited.

## Database and Storage access

- Spring Boot is the only business-table write path. Lock down or disable the Supabase Data API for these tables.
- Use a least-privilege PostgreSQL runtime role; migration credentials are separate.
- Supabase service/secret keys remain backend-only and are never included in frontend configuration.
- Upload intents issue owner-scoped object paths. Confirmation verifies bucket, owner prefix, MIME type, size, object existence, and safe file signature before acceptance.
- Private files are returned only through short-lived signed URLs after authorization.

## Security error codes

Use stable codes including `TOKEN_INVALID`, `TOKEN_EXPIRED`, `PROFILE_REQUIRED`, `ACCOUNT_SUSPENDED`, `ACCOUNT_DELETED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `NOT_PARTICIPANT`, and `ADMIN_REQUIRED`. Responses follow RFC 9457 and never reveal token or policy internals.
