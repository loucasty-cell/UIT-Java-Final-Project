# DTO Catalog

This catalog matches the **actual DTO classes on `dev`**. Each entry names a real class under `com.skillbridge.{module}.api.dto.*`. Routes that use them are in [API_CONTRACT.md](API_CONTRACT.md) Part 1. Designed-but-unbuilt DTOs are listed at the end as Planned.

Global rules:

- Responses include timestamps where meaningful; mutable resources include `version` (copied from the entity's JPA `@Version` field by mappers — never set by hand).
- Server-owned fields (identity, balances, snapshots, rewards, counts) are never accepted in command DTOs.
- Text is trimmed, blank required text is rejected, unknown JSON properties are rejected.

## Stable enum tokens

These must match Java enums, PostgreSQL check constraints, and API payloads exactly:

| Enum | Values |
|---|---|
| `Role` | `USER \| MENTOR \| ADMIN` |
| `AccountStatus` | `ACTIVE \| WARNED \| SUSPENDED \| DISABLED` |
| `Direction` / `Level` | `TEACH \| LEARN` / `BEGINNER \| INTERMEDIATE \| ADVANCED` |
| `Mode` | `POINTS \| SKILL_SWAP \| VOLUNTEER` |
| `SwapRequestStatus` | `PENDING \| ACCEPTED \| REJECTED \| COMPLETED \| CANCELLED` |
| `SwapSessionStatus` | `ACCEPTED \| STARTED \| COMPLETED \| CANCELLED` |
| `EscrowStatus` | `HELD \| RELEASED \| REFUNDED \| CANCELLED` |
| `ReportStatus` | `OPEN \| DISMISSED \| ACTIONED` |
| `ReportTargetType` | `FORUM_POST \| FORUM_COMMENT \| USER \| USER_PROFILE \| REVIEW \| SESSION_MESSAGE` |
| `DisputeStatus` | `OPEN \| RESOLVED \| REJECTED` |
| `PointEventType` | `REGISTRATION_BONUS \| FORUM_REWARD \| ADMIN_ADJUSTMENT \| POINTS_HOLD \| POINTS_RELEASE \| POINTS_REFUND` |
| `NotificationType` | `SWAP_PROPOSAL_CREATED \| SWAP_PROPOSAL_ACCEPTED \| SWAP_PROPOSAL_REJECTED \| SWAP_PROPOSAL_CANCELLED \| SESSION_STARTED \| SESSION_UPDATED \| SESSION_COMPLETED \| FORUM_COMMENT_REPLY` |

## Shared DTOs (`shared`)

- `UserSummaryResponse`: safe user projection — id, display name, major, year of study, avatar URL.
- `SkillSummaryResponse`: id, name, slug.

## Auth DTOs (`auth`)

- `RegisterRequest`: email, password, displayName, optional profile basics.
- `LoginRequest`: email, password.
- `RefreshTokenRequest`: opaque `refreshToken`.
- `AuthResponse`: `accessToken`, `accessTokenExpiresAt`, rotated `refreshToken`, nested `user`.
- `AuthUserResponse`: id, email, first/last/display name, roles, account status.

Passwords/tokens are never echoed. Access-token lifetime defaults to **12 hours (720 minutes)** — see application.yml.

## User DTOs (`user`)

- `ProfileUpdateRequest`: optional displayName/major/year/bio/timezone/avatar fields.
- `MyProfileResponse`: identity, profile fields, roles, status, rating summary, timestamps, version.
- `DashboardResponse`: wallet summary + session/skill/review rollups for the caller's home view.

## Skill DTOs (`skill`)

- `CreateSkillRequest`: name (+ description); unique name enforced.
- `SkillResponse`: id, name, slug/description metadata, version.

## Mentor DTOs (`mentor`)

- `MentorSearchQuery`: search/filter parameters for the mentor directory.
- `MentorSummaryResponse`: user summary, rating, active offerings snapshot.
- `MentorDetailResponse`: public profile plus active offerings.
- `AvailabilityResponse`: mentor id + derived availability slots.
- `MentorOfferingCreateRequest` / `UpdateRequest`: point cost, modes enabled, duration, availability text.
- `MentorOfferingResponse`: offering with skill/mentor summaries, version.

## Swap and request DTOs (`swap`, `request`)

- `CreateSwapProposalRequest`: `responderId`, `offeredSkillId`, `requestedSkillId`, optional message. Identity comes from the JWT, not this body.
- `SwapRequestResponse`: full proposal state including status, participants, skill summaries, timestamps, version.
- `SwapSessionResponse`: created/updated swap session state.
- `CreateRequestProposalRequest` / `RequestProposalResponse`: facade equivalents of the two above (same semantics, own classes).

## Session and review DTOs (`session`, `review`)

- `UpdateSessionRequest`: optional `scheduledAt`, `durationMinutes`, HTTPS `meetingUrl`, `notes`.
- `SessionResponse`: session state incl. status, schedule, meeting URL for participants, escrow linkage, version.
- `SubmitReviewRequest`: `revieweeId`, `skillId`, `rating` 1..5, `feedback`.
- `ReviewResponse`: review with reviewer/reviewee summaries plus refreshed rating averages on submit.

## Wallet DTOs (`wallet`)

- `WalletResponse`: `availablePoints`, `heldPoints`, `totalEarned`, `totalSpent`, version, updatedAt.
- `PointTransactionResponse`: event type, signed deltas, balances after, description, timestamp.
- `WalletAdjustmentRequest` (admin): target user, non-zero delta ±10000, reason 10..500.

Clients never send balances, held deltas, price snapshots, or event types.

## Forum DTOs (`forum`)

- `ForumPostCreateRequest` / `ForumPostUpdateRequest`: title 5..150, skill tags 1..10, description 20..5000, availability text.
- `ForumPostSummaryResponse` / `ForumPostResponse`: author summary, counts, likedByMe; detail adds full description.
- `ForumSearchQuery`: filter/pagination params.
- `ForumCommentCreateRequest`: body 1..2000; `ForumCommentResponse` adds author/timestamps/version.
- `ForumEngagementResponse`: like/comment counts, likedByMe.
- `TopVolunteerResponse`: user summary, weekly completed volunteer sessions, rank.

## Notification DTOs (`notification`)

- `NotificationResponse`: id, type, safe title/detail, read state, target path, createdAt.

## Moderation DTOs (`moderation`)

- `FlagContentRequest`: targetType, targetId, reason, details. (A reporter field exists in the class but is ignored — identity comes from the JWT.)
- `ResolveReportRequest`: status, actionTaken, note.
- `ModerationReportResponse`: report state with target/reporter references, version.

## Admin DTOs (`admin`)

- `AccountWarningRequest` → `AccountWarningResponse`: reason enum + message; audited.
- `AccountStatusUpdateRequest` → `AdminUserResponse`: suspend/reactivate/disable with reason; response never exposes password/token hashes.
- `AdminReasonRequest`: reason for dismiss/remove-content actions.
- `DisputeResolutionRequest` → `DisputeResponse`.
- `PlatformSettingsUpdateRequest` / `PlatformSettingsResponse`: registration bonus 0..10000, forum reward 0..10000, escrow release hours 1..168.
- `AdminDashboardResponse`: total users, held escrow points, open reports, active disputes, active sessions.
- `AdminAuditEventResponse`: actor, action, target, before/after summaries, timestamp.

## Collections

There is no generic pagination wrapper today — list endpoints return plain JSON arrays. A `PageResponse<T>` envelope is planned together with the paginated endpoints in [API_CONTRACT.md](API_CONTRACT.md) Part 2.

## Planned DTOs (not yet implemented)

`CertificateResponse`, `UserSkill*` request/response family, `LearningRequestCreateRequest`/`Response`, `CompletionConfirmationRequest`/`CompletionResponse` (double-confirm model), `DisputeCreateRequest` (user-facing), `GlobalSearchResponse`. See [API_CONTRACT.md](API_CONTRACT.md) Part 2.
