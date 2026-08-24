# Controller and Service Map

Controllers translate HTTP only. Application services own writes and transactions. Query services return read-only projections. Every feature module follows the same package layout, and the tables below reflect the **actual code on `dev`** (22 controllers).

## Package locations

| Responsibility | Package path |
|---|---|
| Controllers | `com.skillbridge.{feature}.api.controller` |
| Request DTOs | `com.skillbridge.{feature}.api.dto.request` |
| Response DTOs | `com.skillbridge.{feature}.api.dto.response` |
| Mappers and response assemblers | `com.skillbridge.{feature}.api.mapper` |
| Entities and domain models | `com.skillbridge.{feature}.domain` |
| Repositories | `com.skillbridge.{feature}.infrastructure.persistence` |
| Write/transaction services | `com.skillbridge.{feature}.application.command` |
| Read/query services | `com.skillbridge.{feature}.application.query` |

Feature packages: `admin`, `auth`, `forum`, `mentor`, `moderation`, `notification`, `request`, `review`, `search`, `session`, `shared`, `skill`, `swap`, `user`, `wallet`. (`search` is an empty scaffold reserved for the planned global-search endpoint; `shared` holds cross-cutting security/config/error support.)

## Live controller → service map

| Area | Controller(s) | Application ownership |
|---|---|---|
| Auth | AuthController (`/api/v1/auth`) | RegistrationService, AuthenticationService, RefreshTokenService, JwtTokenService |
| Profile & dashboard | ProfileController, DashboardController (`/api/v1`) | UserProfileService, UserProfileQueryService, DashboardQueryService |
| Wallet | WalletController (`/api/v1/me/wallet*`) | WalletQueryService (reads); **WalletService is the only financial mutation boundary** |
| Mentors | MentorController (`/api/v1/mentors`), MentorOfferingController (`/api/v1/me/mentor-offerings`) | MentorQueryService, AvailabilityQueryService, MentorOfferingService, MentorOfferingQueryService |
| Skills | SkillController (`/api/skills`) | SkillService |
| Swaps | SwapController (`/api/swaps`) | SwapService — lifecycle + escrow coordination |
| Request facade | RequestController (`/api/requests`) | RequestService (delegates to SwapService) |
| Sessions | SessionController (`/api/sessions`) | SessionService |
| Reviews | ReviewController (`/api/reviews`) | ReviewService |
| Notifications | NotificationController (`/api/notifications`) | NotificationService |
| Forum | ForumPostController, ForumCommentController, ForumLikeController, ForumRewardController (`/api/v1/forum`) | ForumService, ForumQueryService, VolunteerRankingQueryService, ForumRewardService |
| Moderation | ModerationController (`/api/moderation`) | ModerationService |
| Admin ×6 | AdminDashboardController, AdminSettingsController, AdminUserController, AdminReportController, AdminDisputeController, AdminAuditController (`/api/v1/admin/**`) | AdminDashboardQueryService, PlatformSettingsService, AdminUserService, AdminReportService/AdminReportQueryService, AdminDisputeService/AdminDisputeQueryService, AdminAuditQueryService/AdminAuditService |

Planned controllers (certificates, user skills, global search, user-facing disputes) are listed in [API_CONTRACT.md](API_CONTRACT.md) Part 2 and are intentionally absent here.

## Conventions

- All controllers use constructor injection (Lombok `@RequiredArgsConstructor` or explicit constructors); no field injection.
- Services resolve the acting user from the JWT via `SecurityUtils.getCurrentUserId()` — see [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md).
- JPA `@Version` fields are managed by Hibernate only; application code never sets them manually.
- Query services use read-only transactions and projections.

## Application rules

- Registration creates user, role, wallet, and one starter award in a single transaction.
- Authentication verifies credentials, account state, and refresh-token-family rules.
- Requests, sessions, reviews, forum, notifications, reports, and admin actions enforce ownership and state transitions inside their service layer.
- Accepting a paid swap request atomically holds points in escrow; completing releases them; cancelling refunds them. `WalletService` is the only code path that mutates balances.
- Session completion coordinates escrow release, swap completion, and notifications exactly once (idempotent).
