# Controller and Service Map

The classes below are planned locations, not implemented classes. Controllers translate HTTP only. Application commands own writes and transactions. Query services return read-only projections.

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
