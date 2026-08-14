# Complete API Contract

All paths are relative to `/api/v1`. Routes require an active authenticated account unless marked public or `ADMIN`. They follow [API_STANDARDS.md](API_STANDARDS.md). `If-Match` carries a mutable resource version where required. `Idempotency-Key` is required for retry-sensitive commands.

## Authentication

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `POST /auth/register` | AuthController -> RegistrationService | RegisterRequest -> AuthResponse | public; `IDEM`; user/role/wallet/+50 once; `201` |
| `POST /auth/login` | AuthController -> AuthenticationService | LoginRequest -> AuthResponse | public; rate-limited |
| `POST /auth/refresh` | AuthController -> RefreshTokenService | RefreshTokenRequest -> AuthResponse | public with refresh token; rotates family |
| `POST /auth/logout` | AuthController -> RefreshTokenService | RefreshTokenRequest -> none | authenticated; revokes family; `204` |

## Profile, dashboard, skills, and certificates

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /me` | ProfileController -> ProfileQueryService | none -> MyProfileResponse | owner |
| `PATCH /me` | ProfileController -> ProfileService | ProfileUpdateRequest -> MyProfileResponse | owner; `If-Match` |
| `GET /me/dashboard` | DashboardController -> DashboardQueryService | none -> DashboardResponse | owner; frontend dashboard projection |
| `GET /skills` | SkillCatalogController -> SkillQueryService | `q,page,size,sort` -> PageResponse<SkillResponse> | active catalog |
| `GET /me/skills` | MySkillController -> UserSkillQueryService | `direction,page,size` -> PageResponse<UserSkillResponse> | owner |
| `POST /me/skills` | MySkillController -> UserSkillService | UserSkillCreateRequest -> UserSkillResponse | owner; `201` |
| `PATCH /me/skills/{userSkillId}` | MySkillController -> UserSkillService | UserSkillUpdateRequest -> UserSkillResponse | owner; `If-Match` |
| `DELETE /me/skills/{userSkillId}` | MySkillController -> UserSkillService | path UUID -> none | owner; block active references; `204` |
| `GET /me/certificates` | CertificateController -> CertificateQueryService | page query -> PageResponse<CertificateResponse> | owner |
| `POST /me/certificates` | CertificateController -> CertificateService | multipart PDF + optional `skillId` -> CertificateResponse | owner; max 10 MB; `201` |
| `DELETE /me/certificates/{certificateId}` | CertificateController -> CertificateService | path UUID -> none | owner; allowed state only; `204` |

## Wallet and activity

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /me/wallet` | WalletController -> WalletQueryService | none -> WalletResponse | owner |
| `GET /me/wallet/transactions` | WalletController -> WalletQueryService | `type,from,to,page,size,sort` -> PageResponse<PointTransactionResponse> | owner |
| `GET /me/wallet/transactions.csv` | WalletController -> WalletQueryService | filters -> CSV | owner export only |

## Mentor discovery and offerings

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /mentors` | MentorController -> MentorQueryService | MentorSearchQuery -> PageResponse<MentorSummaryResponse> | excludes caller/inactive offers |
| `GET /mentors/{mentorId}` | MentorController -> MentorQueryService | path UUID -> MentorDetailResponse | active mentor/public fields |
| `GET /mentors/{mentorId}/availability` | MentorController -> AvailabilityQueryService | `from,to` -> AvailabilityResponse | active slots |
| `GET /me/mentor-offerings` | MentorOfferingController -> MentorOfferingQueryService | page query -> PageResponse<MentorOfferingResponse> | owner mentor |
| `POST /me/mentor-offerings` | MentorOfferingController -> MentorOfferingService | MentorOfferingCreateRequest -> MentorOfferingResponse | active user; owned `TEACH`; grants `MENTOR` on first eligible offer; `201` |
| `PATCH /me/mentor-offerings/{offeringId}` | MentorOfferingController -> MentorOfferingService | MentorOfferingUpdateRequest -> MentorOfferingResponse | owner mentor; `If-Match` |
| `DELETE /me/mentor-offerings/{offeringId}` | MentorOfferingController -> MentorOfferingService | path UUID -> none | owner; block pending reference; `204` |

## Learning requests and skill swaps

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `POST /learning-requests` | LearningRequestController -> LearningRequestService | LearningRequestCreateRequest -> LearningRequestResponse | requester; `IDEM`; mode-specific transaction; `201` |
| `GET /learning-requests` | LearningRequestController -> LearningRequestQueryService | `direction,status,page,size,sort` -> PageResponse<LearningRequestResponse> | caller participant view |
| `GET /learning-requests/{requestId}` | LearningRequestController -> LearningRequestQueryService | path UUID -> LearningRequestResponse | participant/admin |
| `POST /learning-requests/{requestId}/accept` | LearningRequestController -> LearningRequestService | RequestAcceptRequest -> SessionResponse | selected mentor; `IDEM`; creates one session; `201` |
| `POST /learning-requests/{requestId}/reject` | LearningRequestController -> LearningRequestService | ReasonCommandRequest -> LearningRequestResponse | selected mentor; `IDEM`; refund once |
| `POST /learning-requests/{requestId}/cancel` | LearningRequestController -> LearningRequestService | ReasonCommandRequest -> LearningRequestResponse | requester in allowed state; `IDEM`; refund once |

`LearningRequestCreateRequest` always includes `mentorId`, `mentorOfferingId`, `requestedSkillId`, `mode`, schedule, duration, and optional message.

- `POINTS`: `offeredUserSkillId` is null. Server snapshots offering price and creates wallet hold/escrow/ledger atomically.
- `SKILL_SWAP`: `offeredUserSkillId` is required, owned visible `TEACH`, and must match the mentor's active `LEARN` row. Server snapshots both reciprocal skills. No point rows are created.
- `VOLUNTEER`: price is zero and offered skill is null.
- `sourceForumPostId`: when present, it must belong to the selected mentor and forces `VOLUNTEER`.

## Sessions, reviews, and disputes

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /sessions` | SessionController -> SessionQueryService | `status,role,from,to,page,size,sort` -> PageResponse<SessionSummaryResponse> | caller participant view |
| `GET /sessions/{sessionId}` | SessionController -> SessionQueryService | path UUID -> SessionResponse | participant/admin; meeting URL redacted otherwise |
| `PATCH /sessions/{sessionId}` | SessionController -> SessionService | SessionUpdateRequest -> SessionResponse | participant in allowed state; `If-Match` |
| `POST /sessions/{sessionId}/completion-confirmations` | SessionController -> SessionCompletionService | CompletionConfirmationRequest -> CompletionResponse | participant; `IDEM`; optional review; may release/complete |
| `POST /sessions/{sessionId}/disputes` | DisputeController -> DisputeService | DisputeCreateRequest -> DisputeResponse | participant before final release; `IDEM`; `201` |
| `GET /sessions/{sessionId}/review` | ReviewController -> ReviewQueryService | none -> ReviewResponse | participant gets caller review or `404` |
| `GET /mentors/{mentorId}/reviews` | ReviewController -> ReviewQueryService | page query -> PageResponse<ReviewResponse> | active user; public fields |

Completion returns `confirmedByMe`, `confirmedByOtherParticipant`, `pointsReleased`, `autoReleaseAt`, and authoritative status. React must not announce payout unless `pointsReleased=true`. The second confirmation releases point escrow or completes a swap exactly once. Opening a dispute blocks release/completion.

## Volunteer forum

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /forum/posts` | ForumPostController -> ForumQueryService | ForumSearchQuery -> PageResponse<ForumPostSummaryResponse> | active posts |
| `POST /forum/posts` | ForumPostController -> ForumService | ForumPostCreateRequest -> ForumPostResponse | authenticated author from principal; `201` |
| `GET /forum/posts/{postId}` | ForumPostController -> ForumQueryService | path UUID -> ForumPostResponse | active post/owner/admin |
| `PATCH /forum/posts/{postId}` | ForumPostController -> ForumService | ForumPostUpdateRequest -> ForumPostResponse | owner/admin; `If-Match` |
| `DELETE /forum/posts/{postId}` | ForumPostController -> ForumService | path UUID -> none | owner/admin; soft-delete; `204` |
| `PUT /forum/posts/{postId}/like` | ForumLikeController -> ForumService | none -> ForumEngagementResponse | idempotent caller like |
| `DELETE /forum/posts/{postId}/like` | ForumLikeController -> ForumService | none -> ForumEngagementResponse | idempotent unlike |
| `GET /forum/posts/{postId}/comments` | ForumCommentController -> ForumQueryService | page query -> PageResponse<ForumCommentResponse> | active comments |
| `POST /forum/posts/{postId}/comments` | ForumCommentController -> ForumService | ForumCommentCreateRequest -> ForumCommentResponse | author from principal; `201` |
| `DELETE /forum/comments/{commentId}` | ForumCommentController -> ForumService | path UUID -> none | owner/admin; soft-delete; `204` |
| `POST /forum/comments/{commentId}/mark-helpful` | ForumRewardController -> ForumRewardService | none -> PointTransactionResponse | post author; not own comment; one reward/post; `IDEM` |
| `GET /forum/top-volunteers` | ForumPostController -> VolunteerRankingQueryService | `week` -> PageResponse<TopVolunteerResponse> | weekly ranking |

## Notifications and global search

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /notifications` | NotificationController -> NotificationQueryService | `unreadOnly,page,size,sort` -> PageResponse<NotificationResponse> | owner |
| `PATCH /notifications/{notificationId}/read` | NotificationController -> NotificationService | none -> NotificationResponse | owner; idempotent |
| `POST /notifications/read-all` | NotificationController -> NotificationService | none -> none | owner; idempotent; `204` |
| `GET /search` | SearchController -> GlobalSearchQueryService | `q,types,limit` -> GlobalSearchResponse | mentors, skills, forum posts |

## Reports and administration

`POST /reports` requires an active user. Every `/admin/**` route requires active `ADMIN`.

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `POST /reports` | ReportController -> ReportService | ReportCreateRequest -> ReportResponse | reporter from principal; `201` |
| `GET /admin/dashboard` | AdminDashboardController -> AdminQueryService | none -> AdminDashboardResponse | aggregate frontend cards |
| `GET /admin/reports` | AdminReportController -> ReportQueryService | `status,targetType,reason,page,size,sort` -> PageResponse<ReportResponse> | moderation queue |
| `POST /admin/reports/{reportId}/dismiss` | AdminReportController -> ReportService | AdminReasonRequest -> ReportResponse | audited; `IDEM` |
| `POST /admin/reports/{reportId}/remove-content` | AdminReportController -> ReportService | AdminReasonRequest -> ReportResponse | soft-delete target; audited; `IDEM` |
| `POST /admin/users/{userId}/warnings` | AdminUserController -> AdminUserService | AccountWarningRequest -> AccountWarningResponse | notify and audit; `201` |
| `PATCH /admin/users/{userId}/status` | AdminUserController -> AdminUserService | AccountStatusUpdateRequest -> AdminUserResponse | suspend/reactivate/disable; `If-Match` |
| `GET /admin/disputes` | AdminDisputeController -> DisputeQueryService | `status,page,size,sort` -> PageResponse<DisputeResponse> | dispute queue |
| `POST /admin/disputes/{disputeId}/resolve` | AdminDisputeController -> DisputeService | DisputeResolutionRequest -> DisputeResponse | mode-valid resolution; `IDEM`; audited |
| `GET /admin/settings` | AdminSettingsController -> PlatformSettingsService | none -> PlatformSettingsResponse | current defaults |
| `PATCH /admin/settings` | AdminSettingsController -> PlatformSettingsService | PlatformSettingsUpdateRequest -> PlatformSettingsResponse | affects future operations; audited |
| `GET /admin/audit-events` | AdminAuditController -> AdminAuditQueryService | filters/page -> PageResponse<AdminAuditEventResponse> | immutable audit history |

Default settings are registration bonus 50, helpful forum contribution 5, and escrow auto-release 18 hours. Updating settings does not rewrite historical ledger/snapshots/deadlines.

## Non-business routes and jobs

- `GET /actuator/health` is public and reveals no internals. Detailed health is operations/admin protected.
- `/v3/api-docs` and Swagger UI are local/test only unless protected.
- Pending-request expiry, escrow auto-release, notification dispatch, and refresh-token cleanup are internal idempotent jobs.
