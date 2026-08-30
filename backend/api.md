# SkillBridge REST API Contract

## 1. Scope

This contract maps the current Lovable/React screens to a Java 21 Spring Boot REST API backed by PostgreSQL on Neon.

- Base path: `/api/v1`
- Content type: `application/json` except certificate upload and CSV export.
- Authentication: `Authorization: Bearer <accessToken>`.
- JSON field names: camelCase.
- IDs: UUID strings.
- Date/time: ISO-8601. Store instants as UTC `timestamptz`; return a `Z` or explicit offset.
- Point values: non-negative integers. Never accept a client-calculated balance.
- Pagination: zero-based `page`, `size` with a maximum size of 100, and optional `sort`.
- State-changing retry protection: send an `Idempotency-Key` UUID header for request creation, acceptance, completion, point awards, refunds, and dispute resolution.

## 2. Standard responses

Successful single-resource response:

```json
{
  "data": {
    "id": "4d04113c-b5b3-40f5-8bc8-9ee0a7acbc66"
  }
}
```

Successful list response:

```json
{
  "data": [],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0
  }
}
```

Error response:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more fields are invalid.",
    "fieldErrors": {
      "scheduledStart": "must be in the future"
    },
    "requestId": "01J9YV5QH1K4C6W7T8P9A0B1C2",
    "timestamp": "2026-08-14T08:30:00Z"
  }
}
```

Required error codes include `VALIDATION_FAILED`, `UNAUTHENTICATED`, `TOKEN_EXPIRED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `CONFLICT`, `INSUFFICIENT_POINTS`, `INVALID_STATE_TRANSITION`, `SKILL_SWAP_NOT_MATCHED`, `DUPLICATE_REVIEW`, `IDEMPOTENCY_CONFLICT`, `RATE_LIMITED`, and `INTERNAL_ERROR`.

## 3. Stable enums

- `ProficiencyLevel`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
- `LearningMode`: `POINTS`, `SKILL_SWAP`, `VOLUNTEER`
- `RequestStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `EXPIRED`
- `SessionStatus`: `SCHEDULED`, `AWAITING_CONFIRMATION`, `COMPLETED`, `DISPUTED`, `CANCELLED`
- `SkillSwapStatus`: `PROPOSED`, `ACCEPTED`, `AWAITING_CONFIRMATION`, `COMPLETED`, `REJECTED`, `CANCELLED`, `DISPUTED`
- `EscrowStatus`: `HELD`, `RELEASED`, `REFUNDED`, `DISPUTED`
- `CertificateStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `ReportStatus`: `OPEN`, `DISMISSED`, `ACTIONED`
- `AccountStatus`: `ACTIVE`, `WARNED`, `SUSPENDED`, `DISABLED`

Display labels such as "Skill Exchange" or "Under Review" are frontend concerns and must be mapped from these stable values.

## 4. Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create a user and starter wallet. |
| `POST` | `/auth/login` | Public | Verify credentials and return access and refresh tokens. |
| `POST` | `/auth/refresh` | Public with refresh token | Rotate refresh token and issue a new 30-minute access token. |
| `POST` | `/auth/logout` | Authenticated | Revoke the current refresh-token family. |

Register request:

```json
{
  "email": "alex@example.edu",
  "password": "a-strong-password",
  "displayName": "Alex Chen",
  "major": "Computer Science",
  "yearOfStudy": 3
}
```

Authentication response:

```json
{
  "data": {
    "accessToken": "jwt",
    "accessTokenExpiresAt": "2026-08-14T09:00:00Z",
    "refreshToken": "opaque-secret",
    "user": {
      "id": "uuid",
      "displayName": "Alex Chen",
      "roles": ["USER"]
    }
  }
}
```

Passwords, password hashes, refresh-token hashes, and internal security fields must never appear in API responses.

## 5. Profile, dashboard, skills, and certificates

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/me` | User | Current profile and roles. |
| `PATCH` | `/me` | User | Update display name, major, year, bio, avatar key, and timezone. |
| `GET` | `/me/dashboard` | User | Dashboard metrics, next sessions, profile summary, wallet summary, and recent activity. |
| `GET` | `/skills` | User | Search the canonical skill catalog with `q` and pagination. |
| `GET` | `/me/skills` | User | List the current user's teach and learn skills. |
| `POST` | `/me/skills` | User | Add one teach or learn skill. |
| `PATCH` | `/me/skills/{userSkillId}` | Owner | Change level or visibility. |
| `DELETE` | `/me/skills/{userSkillId}` | Owner | Remove an unused skill association. |
| `GET` | `/me/certificates` | User | List the user's certificate metadata and review status. |
| `POST` | `/me/certificates` | User, multipart | Upload one PDF, maximum 10 MB. |
| `DELETE` | `/me/certificates/{certificateId}` | Owner | Remove a certificate unless it is under active review. |

User skill request:

```json
{
  "skillId": "uuid",
  "direction": "TEACH",
  "level": "ADVANCED",
  "visible": true
}
```

The server must reject duplicate `(userId, skillId, direction)` rows. A teach skill referenced by an active mentor offer or pending skill swap cannot be deleted; return `409 CONFLICT`.

Certificate upload uses multipart fields `file` and optional `skillId`. The backend verifies MIME type and PDF signature; the original filename is metadata, not a storage path.

## 6. Wallet and activity

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/me/wallet` | User | Return available, held, earned, and spent point totals. |
| `GET` | `/me/wallet/transactions` | User | Paginated immutable ledger activity. |
| `GET` | `/me/wallet/transactions.csv` | User | Download the authenticated user's activity as CSV. |

Wallet response:

```json
{
  "data": {
    "availablePoints": 50,
    "heldPoints": 15,
    "totalEarned": 120,
    "totalSpent": 70,
    "version": 8
  }
}
```

The frontend may display these values but must never submit a new balance. Ledger rows return `type`, signed `amount`, `description`, `referenceType`, `referenceId`, and `createdAt`.

## 7. Mentor discovery and offerings

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/mentors` | User | Search mentors by `q`, `skillId`, `level`, `mode`, page, and sort. |
| `GET` | `/mentors/{mentorId}` | User | Mentor profile, ratings, teach skills, wanted skills, modes, and point prices. |
| `GET` | `/mentors/{mentorId}/availability` | User | Available ISO time slots for a date range. |
| `GET` | `/me/mentor-offerings` | Mentor | List the current user's offerings. |
| `POST` | `/me/mentor-offerings` | Mentor | Create an offering for one teach skill. |
| `PATCH` | `/me/mentor-offerings/{offeringId}` | Owner mentor | Change price, allowed modes, availability, or active state. |
| `DELETE` | `/me/mentor-offerings/{offeringId}` | Owner mentor | Deactivate an offering when no pending request uses it. |

Mentor results must include IDs for each teach/wanted skill. Names alone are display values and must not be used as foreign keys.

## 8. Learning requests and skill swaps

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/learning-requests` | User | Request a point, skill-swap, or volunteer session. |
| `GET` | `/learning-requests` | User | List requests where the user is requester or mentor; filter by `direction` and `status`. |
| `GET` | `/learning-requests/{requestId}` | Participant | Request details and current state. |
| `POST` | `/learning-requests/{requestId}/accept` | Requested mentor | Accept and create/schedule the session. |
| `POST` | `/learning-requests/{requestId}/reject` | Requested mentor | Reject with optional reason and refund held points. |
| `POST` | `/learning-requests/{requestId}/cancel` | Requester | Cancel while allowed and refund held points. |

Create request:

```json
{
  "mentorId": "uuid",
  "mentorOfferingId": "uuid",
  "requestedSkillId": "uuid",
  "mode": "SKILL_SWAP",
  "offeredUserSkillId": "uuid",
  "scheduledStart": "2026-08-20T15:00:00+06:30",
  "durationMinutes": 60,
  "message": "I can teach Java in exchange for React help.",
  "sourceForumPostId": null
}
```

Mode-specific rules:

- `POINTS`: `offeredUserSkillId` must be null. The server reads the current offering price, stores it as `pointCostSnapshot`, locks that amount in escrow, and returns `INSUFFICIENT_POINTS` if the wallet is too low.
- `SKILL_SWAP`: `offeredUserSkillId` is required and must reference the requester's visible `TEACH` skill. It must match a current mentor `LEARN` skill. `requestedSkillId` must match the selected mentor offering. The server creates a `skillSwap` snapshot; no points are held.
- `VOLUNTEER`: cost is always zero, there is no escrow, and `offeredUserSkillId` must be null.
- `sourceForumPostId`: when supplied, it must reference an active volunteer post owned by the requested mentor and forces `VOLUNTEER` mode.

Request response includes `status`, `pointCostSnapshot`, optional `escrowStatus`, optional `skillSwap`, participant summaries, and server timestamps.

Accept request:

```json
{
  "scheduledStart": "2026-08-20T15:00:00+06:30",
  "durationMinutes": 60,
  "meetingUrl": "https://meet.google.com/abc-defg-hij"
}
```

The meeting URL is optional and may be added later by a participant. Only participants and admins may retrieve it.

## 9. Sessions, completion, reviews, and disputes

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/sessions` | User | List participant sessions; filter by `status`, `role`, page, and sort. |
| `GET` | `/sessions/{sessionId}` | Participant/admin | Session details, confirmations, escrow/swap summary, and allowed actions. |
| `PATCH` | `/sessions/{sessionId}` | Participant | Change future schedule or meeting URL when state permits. |
| `POST` | `/sessions/{sessionId}/completion-confirmations` | Participant | Confirm completion and optionally submit a review. |
| `POST` | `/sessions/{sessionId}/disputes` | Participant | Open a dispute before final release. |
| `GET` | `/sessions/{sessionId}/review` | Participant | Retrieve the caller's submitted review, if any. |
| `GET` | `/mentors/{mentorId}/reviews` | User | Public, paginated mentor reviews. |

Completion request:

```json
{
  "rating": 5,
  "review": "Clear explanations and useful examples."
}
```

`rating` and `review` may both be omitted when the user chooses "Skip Review". If a rating is provided, it must be 1 through 5. A review is created only for a participant reviewing the other participant and only once per session.

Completion response:

```json
{
  "data": {
    "sessionId": "uuid",
    "status": "AWAITING_CONFIRMATION",
    "confirmedByMe": true,
    "confirmedByOtherParticipant": false,
    "pointsReleased": false,
    "autoReleaseAt": "2026-08-21T09:00:00Z"
  }
}
```

The frontend must not announce that points were released unless `pointsReleased` is true. On the second confirmation, the same endpoint atomically completes the session and releases escrow. For `SKILL_SWAP`, it atomically completes both reciprocal obligations and changes the swap to `COMPLETED` without touching wallets.

Dispute request:

```json
{
  "reason": "SESSION_NOT_DELIVERED",
  "details": "The mentor did not join the meeting."
}
```

Opening a dispute changes the session and any escrow or skill swap to `DISPUTED`, preventing auto-release.

## 10. Volunteer forum

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/forum/posts` | User | Paginated active posts; filter by `q`, `skillId`, and author. |
| `POST` | `/forum/posts` | User | Publish a volunteer teaching post. |
| `GET` | `/forum/posts/{postId}` | User | Post with author, tags, like count, and comment count. |
| `PATCH` | `/forum/posts/{postId}` | Owner/admin | Edit title, description, skills, and availability. |
| `DELETE` | `/forum/posts/{postId}` | Owner/admin | Soft-delete a post. |
| `PUT` | `/forum/posts/{postId}/like` | User | Idempotently like a post. |
| `DELETE` | `/forum/posts/{postId}/like` | User | Idempotently remove the caller's like. |
| `GET` | `/forum/posts/{postId}/comments` | User | Paginated comments. |
| `POST` | `/forum/posts/{postId}/comments` | User | Add a comment. |
| `DELETE` | `/forum/comments/{commentId}` | Owner/admin | Soft-delete a comment. |
| `GET` | `/forum/top-volunteers` | User | Weekly volunteer leaderboard. |

Create post request:

```json
{
  "title": "Free weekend React basics tutoring",
  "skillIds": ["uuid"],
  "description": "I can help with components, hooks, and state.",
  "availabilityText": "Saturday 10:00-12:00",
  "active": true
}
```

The server gets author data from the authenticated user. The client must not submit author name, initials, major, likes, or comments.

## 11. Notifications and global search

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/notifications` | User | Paginated notifications with optional `unreadOnly`. |
| `PATCH` | `/notifications/{notificationId}/read` | Owner | Mark one notification read. |
| `POST` | `/notifications/read-all` | User | Mark all current-user notifications read. |
| `GET` | `/search` | User | Search mentors, skills, and forum posts with `q`, `types`, and limits. |

Notification fields include `id`, `type`, `title`, `detail`, `tone`, `targetPath`, `readAt`, and `createdAt`. Opening the notification popover must not automatically mark every notification as read unless the frontend deliberately calls `read-all`.

## 12. Reports and admin API

All endpoints in this section require `ADMIN`, except content-report creation.

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/reports` | User | Report a forum post, comment, user, session, or session message. |
| `GET` | `/admin/dashboard` | Admin | User, escrow, moderation, and dispute statistics. |
| `GET` | `/admin/reports` | Admin | Moderation queue filtered by target type/status/reason. |
| `POST` | `/admin/reports/{reportId}/dismiss` | Admin | Dismiss a report and write an audit event. |
| `POST` | `/admin/reports/{reportId}/remove-content` | Admin | Soft-delete reported content and resolve report. |
| `POST` | `/admin/users/{userId}/warnings` | Admin | Issue and log an account warning. |
| `PATCH` | `/admin/users/{userId}/status` | Admin | Suspend, reactivate, or disable an account. |
| `GET` | `/admin/disputes` | Admin | List open and resolved disputes. |
| `POST` | `/admin/disputes/{disputeId}/resolve` | Admin | Release, refund, cancel a swap, or mark delivered. |
| `GET` | `/admin/settings` | Admin | Read platform reward and escrow settings. |
| `PATCH` | `/admin/settings` | Admin | Change settings with validation and audit logging. |
| `GET` | `/admin/audit-events` | Admin | Paginated immutable admin audit history. |

Admin settings request:

```json
{
  "registrationBonusPoints": 50,
  "helpfulForumContributionPoints": 5,
  "escrowAutoReleaseHours": 18
}
```

Changing settings affects new operations only. It must not rewrite historical ledger entries, existing point-cost snapshots, or already-calculated auto-release deadlines.

Dispute resolution request:

```json
{
  "resolution": "REFUND_LEARNER",
  "note": "Session was not delivered."
}
```

Allowed resolutions depend on mode. Point sessions allow `RELEASE_TO_MENTOR`, `REFUND_LEARNER`, or `CANCEL_NO_TRANSFER`. Skill swaps allow `MARK_COMPLETED` or `CANCEL_SWAP`. Every resolution is transactional, idempotent, and audited.

## 13. HTTP status rules

- `200 OK`: successful read or non-creating mutation.
- `201 Created`: registration, request, post, comment, report, certificate, warning, or dispute created.
- `204 No Content`: successful delete/unlike/logout when no body is needed.
- `400 Bad Request`: malformed JSON or parameters.
- `401 Unauthorized`: absent/invalid token; use `TOKEN_EXPIRED` when the access token expired.
- `403 Forbidden`: valid identity without permission.
- `404 Not Found`: missing resource or a private resource that must not be disclosed.
- `409 Conflict`: invalid state transition, duplicate row, stale version, insufficient state for deletion, or idempotency mismatch.
- `422 Unprocessable Entity`: well-formed request that violates field or domain validation.
- `429 Too Many Requests`: rate limit exceeded.

## 14. Frontend query mapping

| Frontend area | Primary API calls |
|---|---|
| Dashboard | `GET /me/dashboard`, `GET /me/skills`, `GET /me/certificates` |
| Wallet badge/activity | `GET /me/wallet`, `GET /me/wallet/transactions` |
| Find Mentors | `GET /mentors`, `GET /mentors/{id}/availability`, `POST /learning-requests` |
| My Sessions | `GET /learning-requests`, `GET /sessions`, completion and dispute endpoints |
| Volunteer Forum | Forum post/comment/like endpoints and volunteer `POST /learning-requests` |
| Top navigation | `GET /search`, `GET /notifications`, `GET /me` |
| Admin Portal | `/admin/dashboard`, reports, users, disputes, settings, and audit endpoints |
