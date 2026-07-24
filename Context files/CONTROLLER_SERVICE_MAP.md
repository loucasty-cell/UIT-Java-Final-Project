# Controller and Service Map

Controllers handle HTTP translation only. Application services own authorization, transactions, state changes, and events. Query services return projections and never mutate state.

## User-facing controllers

| Controller | Application dependencies | Responsibilities |
|---|---|---|
| ProfileController | OnboardingService, ProfileService, ProfileQueryService | onboard, get/update own profile, public profile |
| AvatarController | FileService | avatar upload intent, confirmation, removal |
| CertificateController | FileService, CertificateService, CertificateQueryService | private certificate lifecycle |
| SkillCatalogController | SkillQueryService | catalog browsing |
| MySkillController | UserSkillService, UserSkillQueryService | own teaching/learning skills |
| MentorController | MentorQueryService | mentor list/detail and filters |
| LearningRequestController | LearningRequestService, LearningRequestQueryService | create/read/list/accept/reject/cancel requests |
| SessionController | SessionService, SessionQueryService | list/read sessions, Meet link, complete, cancel |
| DisputeController | DisputeService, DisputeQueryService | participant dispute creation/read |
| WalletController | WalletQueryService | own balance and ledger history |
| ReviewController | ReviewService, ReviewQueryService | create eligible review, list public reviews |
| ForumPostController | ForumService, ForumQueryService, LearningRequestService | posts and volunteer request conversion |
| ForumCommentController | ForumService, ForumQueryService | comments |
| ForumReactionController | ForumService | idempotent caller reaction |
| NotificationController | NotificationService, NotificationQueryService | list and mark read |
| ReportController | ReportService, ReportQueryService | create/list own reports |

## Admin controllers

| Controller | Application dependencies | Responsibilities |
|---|---|---|
| AdminDashboardController | AdminQueryService | safe aggregate dashboard |
| AdminUserController | AdminUserService, AdminUserQueryService | user lookup, status, role |
| AdminSkillController | AdminSkillService | catalog create/update/disable |
| AdminDisputeController | DisputeService, DisputeQueryService | dispute queue and audited resolution |
| AdminReportController | ReportService, ReportQueryService | report queue and resolution |
| AdminWalletController | WalletService, WalletQueryService | audited adjustments and ledger search |

## Application service commands

- `OnboardingService`: idempotently create profile/wallet/starter ledger.
- `ProfileService`: update only permitted profile fields with version check.
- `FileService`: issue upload intents, verify metadata and safe file signature, sign authorized downloads, clean abandoned uploads.
- `CertificateService`: attach verified objects and soft-delete certificate metadata.
- `UserSkillService`: enforce direction, proficiency, mode, price, uniqueness, and historical-safe disabling.
- `LearningRequestService`: validate offering/swap/time, hold/release escrow, transition request, create session on acceptance.
- `SessionService`: enforce participant/time/state rules, Meet URL, completion deadline, payout/refund, cancellation.
- `DisputeService`: freeze session, record evidence, resolve exactly once, call wallet payout/refund atomically.
- `WalletService`: the only component allowed to lock wallets and append ledger entries.
- `ReviewService`: enforce eligibility/uniqueness and grant reward once in the same transaction.
- `ForumService`: author/moderator checks, content lifecycle, counters/reactions.
- `NotificationService`: create from domain events and update owner read state.
- `ReportService`: report lifecycle and audited resolution.
- `AdminUserService`: guarded role/status changes and audit records.
- `AdminSkillService`: catalog normalization and safe disabling.

## Query services

Query services use read-only transactions and dedicated projections for page results. They apply caller-aware redaction and allow-listed sorting. They never call command services, mutate entities, sign unrestricted files, or calculate authoritative wallet changes.

## Cross-feature rules

- Only application services may call another feature's application interface.
- Controllers never call repositories, storage clients, schedulers, or mappers directly.
- `WalletService` is the sole financial mutation boundary; other services request a named wallet operation.
- Notification creation follows committed business events and cannot make the primary transaction succeed or fail unpredictably.
- Scheduled jobs call the same application commands as HTTP flows with system actor/audit context.
- GlobalExceptionHandler, security filters, configuration, and OpenAPI configuration are shared infrastructure, not business controllers.
