# Controller and Service Map

Controllers translate HTTP only. Application services own authorization, transactions, states, idempotency, and domain events. Query services return projections and never mutate state.

## Public/auth controllers

| Controller | Application dependencies | Responsibilities |
|---|---|---|
| AuthController | RegistrationService, AuthenticationService, RefreshTokenService | register, login, refresh rotation, logout |

## User-facing controllers

| Controller | Application dependencies | Responsibilities |
|---|---|---|
| ProfileController | ProfileService, ProfileQueryService | own profile read/update |
| DashboardController | DashboardQueryService | current frontend dashboard projection |
| CertificateController | CertificateService, CertificateQueryService, FileStorageService | PDF upload/list/delete |
| SkillCatalogController | SkillQueryService | active catalog search |
| MySkillController | UserSkillService, UserSkillQueryService | own teach/learn skills |
| MentorController | MentorQueryService, AvailabilityQueryService | mentor list/detail/availability |
| MentorOfferingController | MentorOfferingService, MentorOfferingQueryService | own offer lifecycle |
| LearningRequestController | LearningRequestService, LearningRequestQueryService | create/read/list/accept/reject/cancel requests |
| SessionController | SessionService, SessionCompletionService, SessionQueryService | list/read/update/confirm sessions |
| ReviewController | ReviewQueryService | caller session review and public mentor reviews |
| DisputeController | DisputeService | participant dispute creation |
| WalletController | WalletQueryService | own wallet, ledger, CSV export |
| ForumPostController | ForumService, ForumQueryService, VolunteerRankingQueryService | posts and leaderboard |
| ForumCommentController | ForumService, ForumQueryService | comments |
| ForumLikeController | ForumService | idempotent caller like/unlike |
| ForumRewardController | ForumRewardService | mark one eligible comment helpful and grant configured reward once |
| NotificationController | NotificationService, NotificationQueryService | list/read/read-all |
| SearchController | GlobalSearchQueryService | mentor/skill/forum grouped search |
| ReportController | ReportService | create report |

## Admin controllers

| Controller | Application dependencies | Responsibilities |
|---|---|---|
| AdminDashboardController | AdminQueryService | frontend aggregate cards |
| AdminReportController | ReportService, ReportQueryService | report queue, dismiss, remove content |
| AdminUserController | AdminUserService | warning and account status |
| AdminDisputeController | DisputeService, DisputeQueryService | dispute queue and mode-valid resolution |
| AdminSettingsController | PlatformSettingsService | reward/escrow settings |
| AdminAuditController | AdminAuditQueryService | immutable audit search |

Catalog-skill and wallet-adjustment admin controllers may be added only when their routes are added to [API_CONTRACT.md](API_CONTRACT.md). Do not expose hidden controllers.

## Command services

- `RegistrationService`: create user/password hash/role/wallet/+50 ledger once under idempotency.
- `AuthenticationService`: verify credentials/account state and issue 30-minute access token plus refresh token.
- `RefreshTokenService`: rotate/revoke token families and detect reuse.
- `ProfileService`: update permitted profile fields with version check.
- `FileStorageService`: generate private object keys, verify file type/signature/size, provide authorized access.
- `CertificateService`: persist owner metadata/status and allowed deletion.
- `UserSkillService`: enforce ownership, direction, level, uniqueness, visibility, and active-reference rules.
- `MentorOfferingService`: enforce owned `TEACH` skill and mode/price rules, grant `MENTOR` on first eligible offer, and deactivate safely.
- `LearningRequestService`: validate offering/schedule/mode; create escrow or swap snapshots; transition request; refund; create one session.
- `SessionService`: enforce participant/time/state rules, scheduling and meeting URL changes.
- `SessionCompletionService`: insert unique confirmation/review; calculate deadline; release points or complete swap once.
- `DisputeService`: freeze release/completion and resolve point/swap disputes atomically with audit.
- `WalletService`: sole component allowed to lock wallets and append ledger entries.
- `ReviewService`: used inside completion transaction for eligible unique reviews.
- `ForumService`: author/moderator checks, soft deletion, skills, comments, likes, and volunteer linkage.
- `ForumRewardService`: validate post ownership/comment eligibility and request one idempotent +5-default wallet reward.
- `NotificationService`: create committed events and owner read state.
- `ReportService`: report lifecycle, content removal, dismissal, and audit.
- `AdminUserService`: warning/status changes with last-admin and self-lockout protection.
- `PlatformSettingsService`: validated versioned settings and audit; future operations only.

## Query services

- `ProfileQueryService`, `DashboardQueryService`, `SkillQueryService`, `UserSkillQueryService`.
- `MentorQueryService`, `AvailabilityQueryService`, `MentorOfferingQueryService`.
- `LearningRequestQueryService`, `SessionQueryService`, `ReviewQueryService`.
- `WalletQueryService`, `ForumQueryService`, `VolunteerRankingQueryService`.
- `NotificationQueryService`, `GlobalSearchQueryService`, `ReportQueryService`, `DisputeQueryService`.
- `AdminQueryService`, `AdminAuditQueryService`.

Query services use read-only transactions, dedicated projections, allow-listed sorting, pagination, and caller-aware redaction. They never call command services or calculate authoritative point changes.

## Cross-feature rules

- Controllers never call repositories, storage clients, schedulers, or mappers directly.
- `WalletService` is the only financial mutation boundary.
- `LearningRequestService` asks `WalletService` for point holds/refunds and a swap application interface for validated snapshots.
- `SessionCompletionService` coordinates session, review, wallet/escrow, or swap completion in one transaction.
- Notification publishing follows committed business events and cannot corrupt the primary transaction.
- Scheduled jobs call the same idempotent application commands with a system actor.
- Shared security, exceptions, request IDs, configuration, and OpenAPI remain infrastructure, not business controllers.
