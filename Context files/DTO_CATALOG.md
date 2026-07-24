# DTO Catalog

This file defines transport fields. Responses also include `createdAt`/`updatedAt` where meaningful. Mutable responses include `version`. Server-owned fields are never accepted in request DTOs.

## Common values and DTOs

- Roles: `USER|ADMIN`. Accounts: `ACTIVE|SUSPENDED|DELETED`.
- Skill direction/level: `TEACH|LEARN`, `BEGINNER|INTERMEDIATE|ADVANCED`.
- Learning mode: `POINTS|SWAP|VOLUNTEER`.
- Request state: `PENDING|ACCEPTED|REJECTED|CANCELLED|EXPIRED`.
- Session state: `SCHEDULED|COMPLETION_PENDING|COMPLETED|CANCELLED|DISPUTED|REFUNDED`.
- Certificate verification: `PENDING|VERIFIED|REJECTED`.
- Dispute state: `OPEN|RESOLVED`; outcome: `RELEASE_TO_MENTOR|REFUND_LEARNER`.
- Report state: `OPEN|IN_REVIEW|RESOLVED`; outcome: `DISMISSED|ACTION_TAKEN`; target: `USER|FORUM_POST|FORUM_COMMENT|SESSION|REVIEW`.
- Ledger event: `STARTER_GRANT|ESCROW_HOLD|ESCROW_RELEASE|SESSION_PAYOUT|REVIEW_REWARD|ADMIN_ADJUSTMENT`.
- Notification type: `REQUEST_RECEIVED|REQUEST_ACCEPTED|REQUEST_REJECTED|REQUEST_CANCELLED|SESSION_REMINDER|COMPLETION_PENDING|SESSION_COMPLETED|DISPUTE_OPENED|DISPUTE_RESOLVED|REVIEW_RECEIVED|POINTS_HELD|POINTS_RELEASED|POINTS_RECEIVED|REWARD_GRANTED|REPORT_RESOLVED`.
- `PageResponse<T>`: `items`, `page`, `size`, `total`, `totalPages`.
- `UserSummaryResponse`: `id`, `displayName`, `major`, `studyYear`, `avatarUrl`.
- `SkillSummaryResponse`: `id`, `name`, `slug`, `category`.
- `ProblemResponse`: RFC 9457 fields plus `code`, `traceId`, optional field `errors`.
- Text is trimmed. Blank text is rejected. Unknown JSON properties are rejected for command DTOs.

## Profile and file DTOs

- `OnboardingRequest`: `displayName` 2..80, `major` 2..100, optional `studyYear` 1..10.
- `ProfileUpdateRequest`: optional `displayName` 2..80, `bio` max 1000, `major` 2..100, `studyYear` 1..10, `phone` max 30; at least one field.
- `MyProfileResponse`: `id`, `email`, profile fields, `avatarUrl`, `role`, `status`, timestamps, `version`.
- `PublicProfileResponse`: `id`, public profile fields, rating average/count, completed-session count, teaching offers; never email or phone.
- `FileUploadIntentRequest`: `fileName` max 255, allowed `contentType`, positive `sizeBytes`.
- `UploadIntentResponse`: `objectPath`, short-lived `uploadUrl`, `expiresAt`, maximum size and allowed content types.
- `FileConfirmRequest`: `objectPath`, `fileName`, `contentType`, `sizeBytes` matching verified Storage metadata.
- `AvatarResponse`: `avatarUrl`, `expiresAt` when signed.
- `CertificateCreateRequest`: confirmed file fields plus optional `skillId` and `displayName` max 120.
- `CertificateResponse`: `id`, optional skill summary, display/original name, content type, size, verification state, authorized short-lived `downloadUrl`.

Avatar limit is 5 MB and `image/jpeg|image/png|image/webp`. Certificate limit is 10 MB and `application/pdf`. Object paths are server-issued and owner-scoped.

## Skill and mentor DTOs

- `SkillCreateRequest`: `name` 2..80, `category` 2..80, optional `description` max 500.
- `SkillUpdateRequest`: same optional fields plus optional `enabled`; at least one field.
- `SkillResponse`: `id`, `name`, `slug`, `category`, `description`, `enabled`, timestamps, `version`.
- `UserSkillCreateRequest`: `skillId`, `direction`, `proficiency`, optional `pointsPrice` 1..10000, three support booleans.
- `UserSkillUpdateRequest`: optional proficiency, price, support flags, enabled; at least one field.
- `UserSkillResponse`: `id`, skill summary, direction, proficiency, price, support flags, enabled, timestamps, `version`.
- `MentorSearchQuery`: optional `q` max 100, `skillId`, proficiency, mode, page, size, allow-listed sort.
- `MentorSummaryResponse`: user summary, rating average/count, completed-session count, matching `UserSkillResponse` offers.
- `MentorDetailResponse`: public profile plus all enabled teaching offers and review summary.

For `LEARN`, price is null and all support flags are false. `TEACH` requires at least one supported mode; supporting `POINTS` requires a price.

## Request and session DTOs

- `LearningRequestCreateRequest`: `mentorSkillId`, optional `learnerSwapSkillId`, `mode`, `proposedStartAt` at least 1 hour ahead, `proposedEndAt`, optional `message` max 1000.
- `LearningRequestResponse`: IDs and user/skill summaries, mode, proposed times, message, server `quotedPoints`, status, expiry, escrow indicator, optional session ID, timestamps, `version`.
- `ReasonCommandRequest`: `reason` 2..500.
- `VolunteerRequestCreateRequest`: future start/end and optional message; mentor/skill come from the post and mode is server-forced.
- `MeetLinkUpdateRequest`: HTTPS Google Meet URL, max 500.
- `SessionCancelRequest`: `reason` 2..500.
- `SessionSummaryResponse`: `id`, other participant summary, caller role, skill, mode, scheduled times, status, quoted points, escrow state.
- `SessionResponse`: summary fields plus request ID, Meet URL, both completion times, completion deadline, completed/cancelled/refunded time, dispute ID, timestamps, `version`.
- `DisputeCreateRequest`: `reason` 2..100, `details` 10..2000.
- `DisputeResolutionRequest`: `outcome`=`RELEASE_TO_MENTOR|REFUND_LEARNER`, `resolution` 10..2000.
- `DisputeResponse`: ID, session summary, opener summary, reason/details, state, outcome/resolution, resolver summary, timestamps, `version`.

Start must precede end; duration is 15..180 minutes. Requests expire at the earlier of 48 hours after creation or 1 hour before the proposed start. `SWAP` requires `learnerSwapSkillId`; other modes forbid it. The server derives learner, mentor, price, escrow, expiry, and all states.

## Wallet and review DTOs

- `WalletResponse`: `availablePoints`, `heldPoints`, `totalPoints`, `version`, `updatedAt`.
- `PointTransactionResponse`: `id`, event type, available/held deltas, resulting balances, related entity type/ID, safe description, timestamp.
- `ReviewCreateRequest`: `rating` integer 1..5, optional `comment` max 2000.
- `ReviewResponse`: `id`, session ID, reviewer summary, reviewee summary, rating, comment, reward granted, timestamp.
- `WalletAdjustmentRequest`: `userId`, non-zero `availableDelta` -10000..10000, `reason` 10..500.

The client never sends wallet balances, held deltas, starter/review reward amounts, transaction types, or review reward flags.

## Forum DTOs

- `ForumPostCreateRequest`: `title` 5..150, `body` 20..5000, optional teaching `userSkillId`, up to 5 unique tags of 2..30 characters.
- `ForumPostUpdateRequest`: optional title/body/userSkillId/tags; at least one field.
- `ForumPostSummaryResponse`: `id`, author summary, title, excerpt, tags, optional skill, like/comment counts, likedByMe, timestamp, `version`.
- `ForumPostResponse`: summary fields plus full body.
- `ForumSearchQuery`: optional `q`, `tag`, `skillId`, page, size, allow-listed sort.
- `ForumCommentCreateRequest` and `ForumCommentUpdateRequest`: `body` 1..2000.
- `ForumCommentResponse`: `id`, post ID, author summary, body, timestamps, `version`.
- `ReactionSummaryResponse`: `postId`, `likeCount`, `likedByMe`.

## Notification, report, and admin DTOs

- `NotificationResponse`: `id`, `type`, safe title/message, related entity type/ID, `readAt`, timestamp.
- `ReportCreateRequest`: `targetType`, `targetId`, `reason` 2..100, optional `details` max 2000.
- `ReportResolutionRequest`: `outcome`=`DISMISSED|ACTION_TAKEN`, `resolution` 10..2000.
- `ReportResponse`: IDs, reporter summary, target reference, reason/details, state, resolution metadata, timestamps, `version`.
- `AccountStatusUpdateRequest`: `status`=`ACTIVE|SUSPENDED`, `reason` 10..500.
- `RoleUpdateRequest`: `role`=`USER|ADMIN`, `reason` 10..500.
- `AdminUserResponse`: profile fields, role/status, wallet summary, activity counts, timestamps, `version`; never email, password, or token data.
- `AdminDashboardResponse`: user, pending-request, active-session, open-dispute/report, and point-circulation aggregates.

All enum tokens above are stable API values and must be reproduced exactly in OpenAPI and database check constraints.
