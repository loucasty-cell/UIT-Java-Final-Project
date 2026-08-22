# SkillBridge Backend Logic Gaps

## Scope and interpretation

This repository is a planned, partially implemented Spring Boot backend. It is not a finished product. Therefore, a missing controller, service, entity, migration, or package is recorded as **planned work** unless the current code already exposes or claims to implement that behavior.

This document focuses on the current mentor and forum slices, their UUID/authentication usage, and the dependencies that those slices need. It does not represent a request to implement any item.

Status labels:

- **Planned**: the architecture or contract describes it, but the implementation has not been written yet.
- **Partial**: a placeholder or first vertical slice exists, but it does not satisfy the complete contract.
- **Logic risk**: existing code exposes behavior that can be incorrect, incomplete, or unsafe when used.

## What is not automatically a defect

The following are expected because the project is unfinished:

- `.gitkeep` files in the auth, user, skill, request, session, wallet, review, moderation, notification, search, and admin packages.
- Placeholder services that explicitly throw `UnsupportedOperationException` because their dependent domains are not implemented yet.
- DTOs and API contract rows for future features that do not have controllers or persistence yet.
- Empty availability and ranking results while their underlying scheduling, session, and volunteer domains are still planned.

These items become defects only when the corresponding feature is presented as implemented or enabled for real users.

## UUID and authenticated-user review

The current UUID usage is structurally consistent:

- Database IDs and relationship fields use PostgreSQL `UUID` columns and Java `java.util.UUID` fields.
- `UUID.randomUUID()` creates new IDs for offerings, posts, comments, and likes.
- `SecurityUtils.getCurrentUserId()` reads the authenticated JWT subject and converts it to a UUID.
- Mentor offerings store the current authenticated UUID as `mentorId`.
- Forum posts and comments store the current authenticated UUID as author ownership.
- Forum likes store the current authenticated UUID as `userId` and enforce `(post_id, user_id)` uniqueness in the migration.
- URL identifiers such as `mentorId`, `offeringId`, `postId`, and `commentId` are correctly typed as UUID path variables.

The main remaining identity assumptions are:

1. The JWT `sub` claim must always be the UUID from `users.id`. If it is not a valid UUID, `UUID.fromString(...)` raises an `IllegalArgumentException`.
2. UUID format validation does not prove ownership. Every submitted relationship UUID still needs a database ownership/visibility check.
3. `getCurrentUserId()` retrieves identity; it does not grant permission. Ownership, role, account-state, and participant checks must still happen in the application service.

## Mentor slice

### Partial behavior already present

- `POST /api/v1/me/mentor-offerings` assigns `mentorId` from the authenticated principal rather than accepting a caller-supplied mentor ID.
- Offering update and delete compare the stored `mentorId` with `getCurrentUserId()`.
- `GET /api/v1/me/mentor-offerings` queries by the authenticated user UUID.
- Offering and public mentor DTOs use UUID identifiers consistently.

### Logic risks in existing mentor code

1. **Submitted skill ownership is not validated.** `teachUserSkillId` is accepted as a UUID, but creation does not verify that the row belongs to the authenticated user, is visible, and has direction `TEACH`.
2. **Offering mode rules are not enforced.** The service accepts any combination of `pointsEnabled`, `skillSwapEnabled`, and `volunteerEnabled`; it does not enforce the planned mode-specific price and reciprocal-skill rules.
3. **Mentor-role promotion is missing.** Creating the first eligible active offering does not grant the `MENTOR` role.
4. **Optimistic concurrency is missing.** The API contract requires `If-Match`, but update does not read or validate the entity version.
5. **Deletion protection is missing.** Delete does not block an offering referenced by pending learning requests or sessions.
6. **Public mentor discovery is a placeholder.** `searchMentors` and `getMentorDetail` throw `UnsupportedOperationException`; no real user, skill, role, active-offering, or rating joins exist yet.
7. **Availability is a placeholder.** The availability service always returns an empty list and does not consult sessions, time windows, or timezone rules.
8. **Response data is stubbed.** `MentorMapper` returns UUID-only user and skill summaries and does not load display names, profile data, or skill details.
9. **Persistence relationships are incomplete.** The mentor migration stores `mentor_id` and `teach_user_skill_id` as UUIDs but does not yet provide the required foreign-key relationships to the user and user-skill tables.

## Forum slice

### Partial behavior already present

- Post and comment creation take the author from the authenticated principal.
- Post and comment update/delete ownership checks compare database ownership UUIDs with `getCurrentUserId()`.
- Like creation uses the authenticated user UUID and checks the repository uniqueness pair.
- Post deletion is represented as an `active` flag rather than immediate deletion.
- URL IDs and entity relationships use UUID consistently.

### Logic risks in existing forum code

1. **`skillIds` are accepted but ignored.** Both post create and update DTOs contain UUID skill lists, but `ForumService` never validates or persists them. The planned `forum_post_skills` table is also absent from the current migrations.
2. **Post visibility is incomplete.** `getPost` loads any post by UUID without filtering inactive posts or applying the documented owner/admin exception.
3. **Comment visibility is incomplete.** `getComments` does not filter inactive/deleted comments, and the current comment model/service path does not implement soft deletion.
4. **Admin ownership bypass is missing.** Post and comment deletion currently allow only the owner; the documented admin/moderation path is not implemented.
5. **Helpful rewards are only a placeholder.** `ForumRewardService.markHelpful` checks that a comment exists, but does not verify post authorship, reject rewarding one’s own comment, enforce one reward per post, write the +5 ledger transaction, or provide idempotency.
6. **Helpful response does not match the contract.** The controller returns `void`, while the API contract requires a point transaction response.
7. **Like count updates are not concurrency-safe.** The unique constraint prevents duplicate rows, but checking then inserting and updating the denormalized count can race under concurrent requests. The count must remain server-derived and transactionally consistent.
8. **Unlike response is optimistic.** `unlikePost` always sets `likedByMe` to `false`, even when no matching like existed; this is harmless for the final state but does not communicate whether a state change occurred.
9. **Forum search validation is incomplete.** Page size, page bounds, and sort allow the contract’s maximum and safe-query rules to be enforced later; the current query directly builds `LIKE` expressions without the full search contract.
10. **Volunteer ranking is a placeholder.** The ranking service does not yet calculate completed volunteer work by week.
11. **Forum persistence relationships are incomplete.** `author_id`, `mentor_id`-style relationships, and skill joins are not fully backed by foreign keys to the future user/skill tables.

## Shared authentication and authorization dependencies

These are planned dependencies, not evidence that the mentor/forum slices alone were expected to finish the entire project:

- Registration, login, refresh rotation, logout, password hashing, account-state enforcement, and role loading are not implemented.
- The current security configuration uses a shared-secret JWT decoder, but issuer, audience, approved algorithm, and database-backed role/account-state validation still need to be completed according to the authentication contract.
- The default JWT secret in configuration is explicitly a development fallback and must not be used in deployment.
- `getCurrentUserId()` is currently the only principal extraction helper; the completed security layer will also need consistent role, account-state, and possibly tenant/request-context checks.

## Project-wide planned work

The following domains are represented in the context documents but are not implemented in this checkout:

- Auth and user profile lifecycle.
- Skills and user-skill ownership/visibility.
- Learning requests and skill swaps.
- Sessions, confirmations, disputes, reviews, and auto-release jobs.
- Wallets, point ledger, escrow, refunds, idempotency, and transaction locking.
- Notifications and scheduled jobs.
- Moderation, reports, warnings, admin settings, and audit events.
- Global search, storage/certificate handling, OpenAPI contracts, and complete integration tests.

## Recommended implementation order

1. Complete auth, users, roles, account state, and `SecurityUtils` contract tests.
2. Implement skills and user-skill ownership checks.
3. Finish mentor offerings, including modes, role promotion, version checks, availability, and deletion references.
4. Add forum post-skill persistence and validation.
5. Finish forum moderation, soft deletion, likes, helpful rewards, ledger/idempotency, and ranking.
6. Implement learning requests, sessions, wallet/escrow, and completion workflows.
7. Add cross-domain integration tests and database migration validation before enabling production behavior.

## Verification note

This document is an inspection record only. No source files, migrations, configuration files, or generated artifacts were changed as part of the audit that produced it.
