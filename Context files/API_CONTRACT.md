# Complete API Contract

All paths below are relative to `/api/v1`, require an active Supabase-authenticated user unless marked `ADMIN`, and follow [API_STANDARDS.md](API_STANDARDS.md). `If-Match` carries the current numeric version for mutable resources. `Idempotency-Key` is required where marked `IDEM`.

## Profile and files

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `POST /me/onboarding` | ProfileController -> OnboardingService | OnboardingRequest -> MyProfileResponse | `IDEM`; creates profile, wallet, starter ledger once; `201` |
| `GET /me` | ProfileController -> ProfileQueryService | none -> MyProfileResponse | owner |
| `PATCH /me` | ProfileController -> ProfileService | ProfileUpdateRequest -> MyProfileResponse | owner; `If-Match` |
| `GET /users/{userId}` | ProfileController -> ProfileQueryService | path UUID -> PublicProfileResponse | hides private fields |
| `POST /me/avatar/upload-intents` | AvatarController -> FileService | FileUploadIntentRequest -> UploadIntentResponse | owner; `201` |
| `POST /me/avatar/confirm` | AvatarController -> FileService | FileConfirmRequest -> AvatarResponse | owner; `201` |
| `DELETE /me/avatar` | AvatarController -> FileService | none -> none | owner; `204` |
| `POST /me/certificates/upload-intents` | CertificateController -> FileService | FileUploadIntentRequest -> UploadIntentResponse | owner; `201` |
| `POST /me/certificates` | CertificateController -> CertificateService | CertificateCreateRequest -> CertificateResponse | owner; object must exist; `201` |
| `GET /me/certificates` | CertificateController -> CertificateQueryService | page query -> PageResponse<CertificateResponse> | owner |
| `DELETE /me/certificates/{certificateId}` | CertificateController -> CertificateService | path UUID -> none | owner; soft-delete metadata and delete object; `204` |

## Skills and mentor discovery

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /skills` | SkillCatalogController -> SkillQueryService | `q,category,page,size,sort` -> PageResponse<SkillResponse> | enabled catalog entries |
| `GET /me/skills` | MySkillController -> UserSkillQueryService | `direction,page,size` -> PageResponse<UserSkillResponse> | owner |
| `POST /me/skills` | MySkillController -> UserSkillService | UserSkillCreateRequest -> UserSkillResponse | owner; `201` |
| `PATCH /me/skills/{userSkillId}` | MySkillController -> UserSkillService | UserSkillUpdateRequest -> UserSkillResponse | owner; `If-Match` |
| `DELETE /me/skills/{userSkillId}` | MySkillController -> UserSkillService | path UUID -> none | owner; soft-disable; `204` |
| `GET /mentors` | MentorController -> MentorQueryService | MentorSearchQuery -> PageResponse<MentorSummaryResponse> | excludes caller and disabled offers |
| `GET /mentors/{mentorId}` | MentorController -> MentorQueryService | path UUID -> MentorDetailResponse | active mentor only |

## Learning requests and sessions

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `POST /learning-requests` | LearningRequestController -> LearningRequestService | LearningRequestCreateRequest -> LearningRequestResponse | learner; `IDEM`; holds points; `201` |
| `GET /learning-requests/{requestId}` | LearningRequestController -> LearningRequestQueryService | path UUID -> LearningRequestResponse | participant or admin |
| `GET /me/learning-requests` | LearningRequestController -> LearningRequestQueryService | `role,status,page,size,sort` -> PageResponse<LearningRequestResponse> | participant view |
| `POST /learning-requests/{requestId}/accept` | LearningRequestController -> LearningRequestService | no body -> SessionResponse | mentor; `IDEM`, `If-Match`; `201` |
| `POST /learning-requests/{requestId}/reject` | LearningRequestController -> LearningRequestService | ReasonCommandRequest -> LearningRequestResponse | mentor; `IDEM`, `If-Match`; releases escrow |
| `POST /learning-requests/{requestId}/cancel` | LearningRequestController -> LearningRequestService | ReasonCommandRequest -> LearningRequestResponse | learner while pending; `IDEM`, `If-Match`; releases escrow |
| `GET /me/sessions` | SessionController -> SessionQueryService | `role,status,from,to,page,size,sort` -> PageResponse<SessionSummaryResponse> | participant view |
| `GET /sessions/{sessionId}` | SessionController -> SessionQueryService | path UUID -> SessionResponse | participant or admin |
| `POST /sessions/{sessionId}/set-meet-link` | SessionController -> SessionService | MeetLinkUpdateRequest -> SessionResponse | mentor; `IDEM`, `If-Match` |
| `POST /sessions/{sessionId}/complete` | SessionController -> SessionService | no body -> SessionResponse | participant after scheduled end; `IDEM`, `If-Match`; may pay out |
| `POST /sessions/{sessionId}/cancel` | SessionController -> SessionService | SessionCancelRequest -> SessionResponse | participant before scheduled start; `IDEM`, `If-Match`; refunds escrow |
| `POST /sessions/{sessionId}/disputes` | DisputeController -> DisputeService | DisputeCreateRequest -> DisputeResponse | participant from start until payout; `IDEM`, `If-Match`; `201` |
| `GET /disputes/{disputeId}` | DisputeController -> DisputeQueryService | path UUID -> DisputeResponse | participant or admin |

## Wallet and reviews

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /me/wallet` | WalletController -> WalletQueryService | none -> WalletResponse | owner |
| `GET /me/point-transactions` | WalletController -> WalletQueryService | `type,from,to,page,size,sort` -> PageResponse<PointTransactionResponse> | owner |
| `POST /sessions/{sessionId}/reviews` | ReviewController -> ReviewService | ReviewCreateRequest -> ReviewResponse | learner after completion; `IDEM`; grants reward once; `201` |
| `GET /users/{userId}/reviews` | ReviewController -> ReviewQueryService | `page,size,sort` -> PageResponse<ReviewResponse> | public fields only |

## Volunteer forum

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /forum-posts` | ForumPostController -> ForumQueryService | ForumSearchQuery -> PageResponse<ForumPostSummaryResponse> | active posts |
| `POST /forum-posts` | ForumPostController -> ForumService | ForumPostCreateRequest -> ForumPostResponse | author; `201` |
| `GET /forum-posts/{postId}` | ForumPostController -> ForumQueryService | path UUID -> ForumPostResponse | active post or author/admin |
| `PATCH /forum-posts/{postId}` | ForumPostController -> ForumService | ForumPostUpdateRequest -> ForumPostResponse | author or admin; `If-Match` |
| `DELETE /forum-posts/{postId}` | ForumPostController -> ForumService | path UUID -> none | author or admin; soft-delete; `204` |
| `GET /forum-posts/{postId}/comments` | ForumCommentController -> ForumQueryService | page query -> PageResponse<ForumCommentResponse> | active comments |
| `POST /forum-posts/{postId}/comments` | ForumCommentController -> ForumService | ForumCommentCreateRequest -> ForumCommentResponse | author; `201` |
| `PATCH /forum-comments/{commentId}` | ForumCommentController -> ForumService | ForumCommentUpdateRequest -> ForumCommentResponse | author or admin; `If-Match` |
| `DELETE /forum-comments/{commentId}` | ForumCommentController -> ForumService | path UUID -> none | author or admin; soft-delete; `204` |
| `PUT /forum-posts/{postId}/reaction` | ForumReactionController -> ForumService | no body -> ReactionSummaryResponse | idempotent like |
| `DELETE /forum-posts/{postId}/reaction` | ForumReactionController -> ForumService | no body -> ReactionSummaryResponse | remove caller's like |
| `POST /forum-posts/{postId}/session-requests` | ForumPostController -> LearningRequestService | VolunteerRequestCreateRequest -> LearningRequestResponse | forces `VOLUNTEER`; `IDEM`; `201` |

## Notifications and reports

| Method and path | Controller -> service | Input -> output | Access and behavior |
|---|---|---|---|
| `GET /me/notifications` | NotificationController -> NotificationQueryService | `read,page,size,sort` -> PageResponse<NotificationResponse> | owner |
| `POST /me/notifications/{notificationId}/read` | NotificationController -> NotificationService | no body -> none | owner; idempotent; `204` |
| `POST /me/notifications/read-all` | NotificationController -> NotificationService | no body -> none | owner; idempotent; `204` |
| `POST /reports` | ReportController -> ReportService | ReportCreateRequest -> ReportResponse | reporter; `201` |
| `GET /me/reports` | ReportController -> ReportQueryService | page query -> PageResponse<ReportResponse> | reporter |

## Administration

Every route in this section requires an active `ADMIN`.

| Method and path | Controller -> service | Input -> output | Behavior |
|---|---|---|---|
| `GET /admin/dashboard` | AdminDashboardController -> AdminQueryService | none -> AdminDashboardResponse | aggregate counts only |
| `GET /admin/users` | AdminUserController -> AdminUserQueryService | `q,status,role,page,size,sort` -> PageResponse<AdminUserResponse> | admin listing |
| `GET /admin/users/{userId}` | AdminUserController -> AdminUserQueryService | path UUID -> AdminUserResponse | no private file bytes |
| `PATCH /admin/users/{userId}/status` | AdminUserController -> AdminUserService | AccountStatusUpdateRequest -> AdminUserResponse | `If-Match`; reason required |
| `PATCH /admin/users/{userId}/role` | AdminUserController -> AdminUserService | RoleUpdateRequest -> AdminUserResponse | `If-Match`; cannot remove last admin |
| `POST /admin/skills` | AdminSkillController -> AdminSkillService | SkillCreateRequest -> SkillResponse | `201` |
| `PATCH /admin/skills/{skillId}` | AdminSkillController -> AdminSkillService | SkillUpdateRequest -> SkillResponse | `If-Match` |
| `DELETE /admin/skills/{skillId}` | AdminSkillController -> AdminSkillService | path UUID -> none | soft-disable; `204` |
| `GET /admin/disputes` | AdminDisputeController -> DisputeQueryService | `state,page,size,sort` -> PageResponse<DisputeResponse> | moderation queue |
| `POST /admin/disputes/{disputeId}/resolve` | AdminDisputeController -> DisputeService | DisputeResolutionRequest -> DisputeResponse | `IDEM`, `If-Match`; payout or refund |
| `GET /admin/reports` | AdminReportController -> ReportQueryService | `state,targetType,page,size,sort` -> PageResponse<ReportResponse> | moderation queue |
| `POST /admin/reports/{reportId}/resolve` | AdminReportController -> ReportService | ReportResolutionRequest -> ReportResponse | `If-Match` |
| `POST /admin/wallet-adjustments` | AdminWalletController -> WalletService | WalletAdjustmentRequest -> PointTransactionResponse | `IDEM`; reason and audit actor; `201` |
| `GET /admin/point-transactions` | AdminWalletController -> WalletQueryService | `userId,type,from,to,page,size,sort` -> PageResponse<PointTransactionResponse> | financial audit |

## Non-API routes

- Supabase owns sign-up, sign-in, token refresh, sign-out, email verification, and password reset; the backend exposes no duplicate `/auth` controller.
- `GET /actuator/health` is public and reveals no internals. Detailed health requires admin/operations access.
- `/v3/api-docs` and Swagger UI are enabled only in local/test environments unless explicitly protected.
- Request expiry and session auto-completion are internal scheduled use cases, not public endpoints.
