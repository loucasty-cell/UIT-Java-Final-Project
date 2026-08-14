# DTO Catalog

Responses include timestamps where meaningful and mutable resources include `version`. Server-owned fields are never accepted in command DTOs.

## Stable values and common DTOs

- Roles: `USER|MENTOR|ADMIN`.
- Account: `ACTIVE|WARNED|SUSPENDED|DISABLED`.
- Direction/level: `TEACH|LEARN`; `BEGINNER|INTERMEDIATE|ADVANCED`.
- Mode: `POINTS|SKILL_SWAP|VOLUNTEER`.
- Request: `PENDING|ACCEPTED|REJECTED|CANCELLED|EXPIRED`.
- Session: `SCHEDULED|AWAITING_CONFIRMATION|COMPLETED|DISPUTED|CANCELLED`.
- Swap: `PROPOSED|ACCEPTED|AWAITING_CONFIRMATION|COMPLETED|REJECTED|CANCELLED|DISPUTED`.
- Escrow: `HELD|RELEASED|REFUNDED|DISPUTED`.
- Certificate: `PENDING|APPROVED|REJECTED`.
- Report: `OPEN|DISMISSED|ACTIONED`.
- Ledger: `REGISTRATION_BONUS|FORUM_REWARD|ESCROW_HOLD|ESCROW_RELEASE|ESCROW_REFUND|ADMIN_ADJUSTMENT`.
- `PageResponse<T>`: `data`, `page.number`, `page.size`, `page.totalElements`, `page.totalPages`.
- `UserSummaryResponse`: `id`, `displayName`, `major`, `yearOfStudy`, `avatarUrl`, safe mentor badge.
- `SkillSummaryResponse`: `id`, `name`, `slug`.
- `ProblemResponse`: RFC 9457 fields plus `code`, `requestId`, `timestamp`, optional `fieldErrors`.

Text is trimmed, blank required text is rejected, and unknown command properties are rejected.

## Authentication DTOs

- `RegisterRequest`: `email`, `password`, `displayName` 2..80, optional `major` 2..100, optional `yearOfStudy` 1..10.
- `LoginRequest`: `email`, `password`.
- `RefreshTokenRequest`: opaque `refreshToken`.
- `AuthResponse`: `accessToken`, `accessTokenExpiresAt`, rotated `refreshToken`, safe user `id`, `displayName`, `roles`, `accountStatus`.

Passwords/tokens are never echoed. Access lifetime is 30 minutes.

## Profile/dashboard/file DTOs

- `ProfileUpdateRequest`: optional `displayName`, `major`, `yearOfStudy`, `bio` max 1000, `timezone`, `avatarObjectKey`; at least one field.
- `MyProfileResponse`: ID, email, profile fields, avatar URL, roles, account status, rating/count, completed-session count, timestamps, version.
- `DashboardResponse`: profile summary, `WalletResponse`, completed/mentor/learner counts, next sessions, teach/learn skills, certificate summaries, recent point activity.
- `CertificateResponse`: ID, optional skill summary, original/display name, content type, size, status, authorized temporary URL, timestamps.

Certificate multipart field is `file`; optional `skillId`. Only PDF, maximum 10 MB, verified by MIME and signature.

## Skill, mentor, and offering DTOs

- `SkillResponse`: `id`, `name`, `slug`, `description`, `active`, timestamps, version.
- `UserSkillCreateRequest`: `skillId`, `direction`, `level`, optional `visible` default true.
- `UserSkillUpdateRequest`: optional `level`, `visible`; at least one field.
- `UserSkillResponse`: ID, skill summary, direction, level, visible, timestamps, version.
- `MentorSearchQuery`: optional `q` max 100, `skillId`, `level`, `mode`, page, size, allow-listed sort.
- `MentorSummaryResponse`: user summary, rating/count, active modes, matching teach skills, wanted skills, minimum point cost.
- `MentorDetailResponse`: public profile plus active offerings, all visible teach/learn skills, rating summary.
- `AvailabilityResponse`: mentor ID and ISO future slot list.
- `MentorOfferingCreateRequest`: owned `teachUserSkillId`, point cost 0..10000, `pointsEnabled`, `skillSwapEnabled`, `volunteerEnabled`, duration 15..180, optional availability text.
- `MentorOfferingUpdateRequest`: optional price/modes/duration/availability/active; at least one field.
- `MentorOfferingResponse`: ID, mentor/skill summaries, price, modes, duration, availability, active, timestamps, version.

Offering requires owned visible `TEACH` and at least one mode. Enabled `POINTS` requires positive price.

## Request, swap, session, review, and dispute DTOs

- `LearningRequestCreateRequest`: `mentorId`, `mentorOfferingId`, `requestedSkillId`, `mode`, optional `offeredUserSkillId`, `scheduledStart`, `durationMinutes` 15..180, optional `message` max 1000, optional `sourceForumPostId`.
- `LearningRequestResponse`: ID, participant summaries, offering/requested skill, mode, schedule, message, `pointCostSnapshot`, request status, optional escrow/swap/session summaries, expiry, allowed actions, timestamps, version.
- `SkillSwapSummaryResponse`: ID, both participant/skill snapshots, status, confirmation flags/times, completion time, version.
- `RequestAcceptRequest`: optional replacement future schedule/duration and optional HTTPS Google Meet URL.
- `ReasonCommandRequest`: `reason` 2..500.
- `SessionUpdateRequest`: optional future `scheduledStart`, `durationMinutes`, nullable HTTPS meeting URL; state controlled by server.
- `SessionSummaryResponse`: ID, counterpart, caller role, requested skill, mode, schedule, status, point snapshot, escrow/swap summary, allowed actions.
- `SessionResponse`: summary plus request ID, meeting URL for participants/admin, confirmation data, `autoReleaseAt`, dispute/review references, timestamps, version.
- `CompletionConfirmationRequest`: optional `rating` 1..5 and optional `review` max 2000; review text requires rating if project policy requires.
- `CompletionResponse`: session ID/status, both confirmation flags, `pointsReleased`, `autoReleaseAt`, optional review ID, version.
- `ReviewResponse`: ID, session, reviewer/reviewee summaries, rating, body, timestamp.
- `DisputeCreateRequest`: `reason` 2..100, `details` 10..2000.
- `DisputeResolutionRequest`: `resolution`, `note` 10..2000.
- `DisputeResponse`: ID, session/mode, opener, reason/details, status, resolution, resolver, timestamps, version.

Mode rules:

- `POINTS`: offered skill null; server derives/snapshots cost and escrow.
- `SKILL_SWAP`: offered user-skill required, owned visible `TEACH`, matches mentor visible `LEARN`; server snapshots both skill names/levels.
- `VOLUNTEER`: offered skill null and cost zero.
- Source forum post forces volunteer and validates post author/active state.

Point dispute resolutions: `RELEASE_TO_MENTOR|REFUND_LEARNER|CANCEL_NO_TRANSFER`. Swap: `MARK_COMPLETED|CANCEL_SWAP`.

## Wallet DTOs

- `WalletResponse`: `availablePoints`, `heldPoints`, `totalEarned`, `totalSpent`, `version`, `updatedAt`.
- `PointTransactionResponse`: ID, event type, signed available/held deltas, balances after, safe description, reference type/ID, timestamp.
- `WalletAdjustmentRequest`: target user ID, non-zero available delta -10000..10000, reason 10..500.

Clients never send balances, held deltas, offering price snapshots, registration/forum rewards, event types, or resulting balances.

## Forum DTOs

- `ForumPostCreateRequest`: title 5..150, `skillIds` 1..10, description 20..5000, optional availability text max 500, active default true.
- `ForumPostUpdateRequest`: optional title/skills/description/availability/active; at least one field.
- `ForumPostSummaryResponse`: ID, author summary, title, excerpt, skill tags, availability, like/comment counts, likedByMe, timestamp, version.
- `ForumPostResponse`: summary plus full description.
- `ForumSearchQuery`: optional `q`, `skillId`, author ID, page/size/sort.
- `ForumCommentCreateRequest`: body 1..2000.
- `ForumCommentResponse`: ID, post ID, author summary, body, timestamps, version.
- `ForumEngagementResponse`: post ID, like count, comment count, likedByMe.
- `TopVolunteerResponse`: user summary, completed volunteer sessions for requested week, rank.

Author, initials, major, counts, likes, and comments are server-owned.

## Notification, search, report, and admin DTOs

- `NotificationResponse`: ID, type, safe title/detail, tone, target path, readAt, createdAt.
- `GlobalSearchResponse`: limited mentor, skill, and forum-post result groups.
- `ReportCreateRequest`: target type/ID, reason 2..100, optional details max 2000.
- `ReportResponse`: ID, reporter summary, target reference, reason/details, status, resolution metadata, timestamps, version.
- `AdminReasonRequest`: reason 10..500.
- `AccountWarningRequest`: reason `VIOLENT_CONTENT|FRAUDULENT_ACTIVITY|SPAM|OTHER`, message 10..2000.
- `AccountWarningResponse`: ID, user/admin summaries, reason, message, timestamp.
- `AccountStatusUpdateRequest`: `ACTIVE|WARNED|SUSPENDED|DISABLED`, reason 10..500.
- `AdminUserResponse`: profile fields, roles/status, warning/report/activity counts, wallet summary, timestamps, version; never password/token hashes.
- `AdminDashboardResponse`: total users, held escrow points, open reports, active disputes, active sessions.
- `PlatformSettingsUpdateRequest`: optional registration bonus 0..10000, forum contribution reward 0..10000, escrow release hours 1..168; at least one.
- `PlatformSettingsResponse`: all settings plus updater/timestamp/version.
- `AdminAuditEventResponse`: actor, action, target type/ID, safe before/after summaries, reason, request ID, timestamp.

Stable enum tokens must match OpenAPI, Java enums, and PostgreSQL check constraints exactly.
