# Controller and Service Map

The classes below describe the architecture and ownership. Controllers translate HTTP only. Application commands own writes and transactions. Query services return read-only projections. Auth, Admin, Mentor, and Forum packages contain fully implemented classes.

## Package locations

For every feature, the related classes belong in the following packages:

| Responsibility | Package path |
|---|---|
| Controllers | `com.skillbridge.{feature}.api.controller` |
| Request DTOs | `com.skillbridge.{feature}.api.dto.request` |
| Response DTOs | `com.skillbridge.{feature}.api.dto.response` |
| Mappers and response assemblers | `com.skillbridge.{feature}.api.mapper` |
| Write/transaction services | `com.skillbridge.{feature}.application.command` |
| Read/query services | `com.skillbridge.{feature}.application.query` |

The feature names are `admin`, `auth`, `forum`, `mentor`, `moderation`,
`notification`, `request`, `review`, `search`, `session`, `skill`, `swap`,
`user`, and `wallet`.

Implemented controllers and services as of the latest `dev` state:

| Area | Controllers | Application ownership |
|---|---|---|
| Auth | AuthController | RegistrationService, AuthenticationService, RefreshTokenService, RefreshTokenIssuer |
| Skill catalog | SkillController | SkillService (CRUD + search) |
| Swap proposals | SwapController | SwapService (lifecycle + escrow coordination) |
| Request facade | RequestController | RequestService (delegates to SwapService) |
| Sessions | SessionController | SessionService (start/update/complete) |
| Reviews | ReviewController | ReviewService (submit + averages) |
| Notifications | NotificationController | NotificationService (list/mark-read/delete/create) |
| Moderation | ModerationController | ModerationService (flag/resolve) |
| Forum | ForumPostController, ForumCommentController, ForumLikeController | ForumService, ForumQueryService |
| Mentor offerings | MentorOfferingController | MentorOfferingService, MentorQueryService |
| Wallet | WalletController | WalletService, WalletRepository |

All controllers use constructor injection (Lombok `@RequiredArgsConstructor` or explicit constructors); there is no field injection. Services resolve the acting user from the JWT via `SecurityUtils.getCurrentUserId()` — see [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md).

## Controllers

| Area | Controllers | Application ownership |
|---|---|---|
| Auth | AuthController | RegistrationService, AuthenticationService, RefreshTokenService |
| Profile and skills | ProfileController, DashboardController, CertificateController, SkillCatalogController, MySkillController | Profile, dashboard, certificate, skill, and user-skill commands/queries |
| Mentors | MentorController, MentorOfferingController | Mentor, availability, and offering queries/commands |
| Requests and sessions | LearningRequestController, SessionController, DisputeController, ReviewController | Request, session, completion, dispute, and review use cases |
| Wallet | WalletController | Wallet queries; all financial writes use WalletService |
| Forum | ForumPostController, ForumCommentController, ForumLikeController, ForumRewardController | Forum, ranking, and reward use cases |
| Notifications and search | NotificationController, SearchController | Notification and global-search queries/commands |
| Reports and admin | ReportController, AdminDashboardController, AdminReportController, AdminUserController, AdminDisputeController, AdminSettingsController, AdminAuditController | Report, moderation, user, dispute, settings, and audit use cases |

## Application rules

- Registration creates user, role, wallet, and one starter award.
- Authentication verifies credentials, account state, and token-family rules.
- Profile, skills, offerings, requests, sessions, reviews, forum, notifications, reports, disputes, and settings enforce ownership and state transitions.
- Learning requests coordinate POINTS escrow, SKILL_SWAP snapshots, or VOLUNTEER zero-point rules.
- Session completion coordinates confirmations, reviews, points, escrow, swaps, and dispute locks.
- WalletService is the only financial mutation boundary.
- Query services use read-only transactions, projections, pagination, redaction, and allow-listed sorting.
- Scheduled jobs call the same idempotent application operations as user commands.
