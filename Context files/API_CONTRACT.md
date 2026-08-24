# Complete API Contract

This is the **single source of truth** for SkillBridge's REST surface.
Everything in *Part 1* is verified against the live code on `dev` (22 controllers).
Everything in *Part 2* is designed but **not yet built** — do not call those routes from a frontend yet.

Conventions:

- Two base-path families exist today:
  - `/api/v1/**` — auth, profile, dashboard, wallet, mentors, mentor-offerings, forum, admin.
  - `/api/**` (unversioned) — skills, swaps, requests, sessions, reviews, notifications, moderation.
- All routes require a `Bearer` JWT unless marked **public** or `ADMIN`.
- The acting user is always derived from the JWT via `SecurityUtils.getCurrentUserId()`; client-supplied user IDs are never trusted for identity.
- Errors follow RFC 9457 Problem Detail — see [API_STANDARDS.md](API_STANDARDS.md).

---

## Part 1 — Live today (current `dev` state)

### Authentication (`auth`) — public

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `POST /api/v1/auth/register` | AuthController → RegistrationService | RegisterRequest → AuthResponse | public; creates user + role + wallet + starter bonus; `201` |
| `POST /api/v1/auth/login` | AuthController → AuthenticationService | LoginRequest → AuthResponse | public; returns access + refresh tokens |
| `POST /api/v1/auth/refresh` | AuthController → RefreshTokenService | RefreshTokenRequest → AuthResponse | rotates refresh-token family |
| `POST /api/v1/auth/logout` | AuthController → RefreshTokenService | RefreshTokenRequest → none | revokes token family; `204` |

Access tokens last **12 hours (720 minutes)** by default; refresh tokens **7 days** — see [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md).

### Profile and dashboard (`user`)

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `GET /api/v1/me` | ProfileController → UserProfileQueryService | none → MyProfileResponse | caller's profile |
| `PATCH /api/v1/me` | ProfileController → UserProfileService | ProfileUpdateRequest → MyProfileResponse | owner only |
| `GET /api/v1/me/dashboard` | DashboardController → DashboardQueryService | none → DashboardResponse | aggregated dashboard projection |

### Wallet (`wallet`)

All financial mutations go through `WalletService`; these routes are read-only views.

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `GET /api/v1/me/wallet` | WalletController → WalletQueryService | none → WalletResponse | balance + held points |
| `GET /api/v1/me/wallet/transactions` | WalletController → WalletQueryService | filters → List<PointTransactionResponse> | transaction history |
| `GET /api/v1/me/wallet/transactions.csv` | WalletController → WalletQueryService | same filters → CSV file | export download |

### Mentor discovery and offerings (`mentor`)

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `GET /api/v1/mentors` | MentorController → MentorQueryService | search params → list | mentor directory |
| `GET /api/v1/mentors/{mentorId}` | MentorController → MentorQueryService | path UUID → MentorDetailResponse | `404` when missing |
| `GET /api/v1/mentors/{mentorId}/availability` | MentorController → AvailabilityQueryService | range params → availability | published offerings as slots |
| `GET /api/v1/me/mentor-offerings` | MentorOfferingController → MentorOfferingQueryService | none → list | caller's TEACH/LEARN offerings |
| `POST /api/v1/me/mentor-offerings` | MentorOfferingController → MentorOfferingService | create request → MentorOfferingResponse | grants `MENTOR` role on first eligible offering; `201` |
| `PATCH /api/v1/me/mentor-offerings/{offeringId}` | MentorOfferingController → MentorOfferingService | update request → MentorOfferingResponse | owner only |
| `DELETE /api/v1/me/mentor-offerings/{offeringId}` | MentorOfferingController → MentorOfferingService | path UUID → none | owner only; `204` |

### Skill catalog (`skill`)

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `GET /api/skills` | SkillController → SkillService | none → List<SkillResponse> | full catalog |
| `GET /api/skills/search?q=` | SkillController → SkillService | query → List<SkillResponse> | case-insensitive name search; blank returns all |
| `GET /api/skills/{id}` | SkillController → SkillService | path UUID → SkillResponse | `404` when missing |
| `POST /api/skills` | SkillController → SkillService | CreateSkillRequest → SkillResponse | authenticated; unique name; `201` |

There is intentionally **no DELETE** on skills today (catalog rows are referenced by requests/reviews).

### Swap lifecycle (`swap`)

Status flow: `PENDING → ACCEPTED | REJECTED`, then accepted requests progress through their session to `COMPLETED`.
Point cost > 0 is escrowed at accept time, released on completion, refunded on cancellation — atomically with each state change.

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `POST /api/swaps/proposals` | SwapController → SwapService | CreateSwapProposalRequest → SwapRequestResponse | requester from JWT; validates users/skills/wallet balance; notifies responder; `201` |
| `POST /api/swaps/proposals/{id}/accept` | SwapController → SwapService | path UUID → SwapRequestResponse | responder only; holds points; creates exactly one session; notifies requester |
| `POST /api/swaps/proposals/{id}/reject` | SwapController → SwapService | path UUID → SwapRequestResponse | responder only; PENDING only |
| `POST /api/swaps/sessions/{sessionId}/complete` | SwapController → SwapService | path UUID → SwapSessionResponse | participants only; releases escrow; both parties notified |
| `GET /api/swaps/history/me` | SwapController → SwapService | none → List<SwapRequestResponse> | caller's proposals, newest first |

No `GET /swaps/proposals/{id}` and no cancel route here — cancellation is exposed on the request facade below.

### Request facade (`request`)

A thin facade over the same swap use cases, with its own DTOs; authorization stays inside `SwapService`. This is the preferred frontend entry point.

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `POST /api/requests/swaps` | RequestController → RequestService | create request → RequestProposalResponse | same rules as `POST /swaps/proposals` |
| `POST /api/requests/swaps/{id}/accept` | RequestController → RequestService | path UUID → RequestProposalResponse | responder only |
| `POST /api/requests/swaps/{id}/reject` | RequestController → RequestService | path UUID → RequestProposalResponse | responder only |
| `POST /api/requests/swaps/{id}/cancel` | RequestController → RequestService | path UUID → RequestProposalResponse | requester only; refunds held points |
| `GET /api/requests/swaps/history/me` | RequestController → RequestService | none → list | caller's request view |
| `GET /api/requests/swaps/pending/incoming` | RequestController → RequestService | none → list | PENDING proposals awaiting the caller |

### Sessions (`session`)

One-to-one with an accepted swap request. Status flow `ACCEPTED → STARTED → COMPLETED`; updates are blocked after completion/cancellation.

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `GET /api/sessions/active/me` | SessionController → SessionService | none → List<SessionResponse> | caller's ACCEPTED/STARTED sessions |
| `POST /api/sessions/{sessionId}/start` | SessionController → SessionService | path UUID → SessionResponse | participants only; ACCEPTED only; both notified |
| `POST /api/sessions/{sessionId}/complete` | SessionController → SessionService | path UUID → SessionResponse | participants only; releases escrow |
| `PATCH /api/sessions/{sessionId}` | SessionController → SessionService | UpdateSessionRequest → SessionResponse | participants only; schedule date/duration/meeting URL/notes |

### Reviews (`review`)

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `POST /api/reviews/sessions/{sessionId}` | ReviewController → ReviewService | SubmitReviewRequest → ReviewResponse | completed sessions only; participant check; reviewer ≠ reviewee; skill must belong to the session; one review per reviewer/session (DB unique constraint); response carries refreshed averages |

### Notifications (`notification`)

Events that create notifications: proposal created/accepted/rejected/cancelled, session started/completed/updated, forum comment replies.

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `GET /api/notifications/me` | NotificationController → NotificationService | none → List<NotificationResponse> | caller's notifications, newest first |
| `POST /api/notifications/{notificationId}/read` | NotificationController → NotificationService | path UUID → NotificationResponse | owner only; idempotent |
| `DELETE /api/notifications/{notificationId}` | NotificationController → NotificationService | path UUID → none | owner only; `204` |

### Volunteer forum (`forum`)

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `GET /api/v1/forum/posts` | ForumPostController → ForumQueryService | search params → list | active posts |
| `POST /api/v1/forum/posts` | ForumPostController → ForumService | ForumPostCreateRequest → ForumPostResponse | author from JWT; `201` |
| `GET /api/v1/forum/posts/{postId}` | ForumPostController → ForumQueryService | path UUID → ForumPostResponse | active post |
| `PATCH /api/v1/forum/posts/{postId}` | ForumPostController → ForumService | ForumPostUpdateRequest → ForumPostResponse | owner/admin |
| `DELETE /api/v1/forum/posts/{postId}` | ForumPostController → ForumService | path UUID → none | owner/admin; soft-delete; `204` |
| `GET /api/v1/forum/top-volunteers` | ForumPostController → VolunteerRankingQueryService | week param → ranking | weekly volunteer leaderboard |
| `PUT /api/v1/forum/posts/{postId}/like` | ForumLikeController → ForumService | none → engagement counts | idempotent like |
| `DELETE /api/v1/forum/posts/{postId}/like` | ForumLikeController → ForumService | none → engagement counts | idempotent unlike |
| `GET /api/v1/forum/posts/{postId}/comments` | ForumCommentController → ForumQueryService | none → list | comments for post |
| `POST /api/v1/forum/posts/{postId}/comments` | ForumCommentController → ForumService | ForumCommentCreateRequest → ForumCommentResponse | author from JWT; notifies post author on reply; `201` |
| `DELETE /api/v1/forum/comments/{commentId}` | ForumCommentController → ForumService | path UUID → none | owner/admin; soft-delete; `204` |
| `POST /api/v1/forum/comments/{commentId}/mark-helpful` | ForumRewardController → ForumRewardService | none → PointTransactionResponse | post author rewards a helper; not own comment; once per post (+5 points default) |

### Moderation (`moderation`)

| Method and path | Controller → service | Input → output | Behavior |
|---|---|---|---|
| `POST /api/moderation/reports` | ModerationController → ModerationService | ReportRequest → ReportResponse | any active user flags content/forum posts/users; `201` |
| `GET /api/moderation/reports` | ModerationController → ModerationService | filters → list | ADMIN queue view |
| `POST /api/moderation/reports/{reportId}/resolve` | ModerationController → ModerationService | resolution → ReportResponse | ADMIN; resolves report |

### Administration (`admin`) — requires active `ADMIN`

Default platform settings: registration bonus **50**, helpful forum contribution **5**, escrow auto-release **18 hours**. Updating settings never rewrites historical ledger entries or snapshots.

| Method and path | Controller → service | Behavior |
|---|---|---|
| `GET /api/v1/admin/dashboard` | AdminDashboardController → AdminDashboardQueryService | aggregate platform stats |
| `GET /api/v1/admin/settings` / `PATCH /api/v1/admin/settings` | AdminSettingsController → PlatformSettingsService | view/update global defaults (audited) |
| `GET /api/v1/admin/users` area: `POST /{userId}/warnings`, `POST /{userId}/wallet-adjustments`, `PATCH /{userId}/status` | AdminUserController → AdminUserService | warn users, adjust point balances (ledgered), suspend/reactivate/disable accounts |
| `GET /api/v1/admin/reports`, `POST /reports/{reportId}/dismiss`, `POST /reports/{reportId}/remove-content` | AdminReportController → AdminReportQueryService / AdminReportService | moderation queue; dismiss or soft-delete reported content (audited) |
| `GET /api/v1/admin/disputes`, `POST /disputes/{disputeId}/resolve` | AdminDisputeController → AdminDisputeQueryService / AdminDisputeService | dispute queue and resolution |
| `GET /api/v1/admin/audit-events` | AdminAuditController → AdminAuditQueryService | immutable audit history |

### Non-business routes

- `GET /actuator/health` — public health probe.
- Swagger UI at `http://localhost:9095/swagger-ui.html` (local development).

---

## Part 2 — Planned (designed, NOT implemented)

These routes appear in design docs but have **no live controller**. Do not build frontends against them until they land here in Part 1.

| Area | Planned capability |
|---|---|
| Certificates | upload/list/delete PDF certificates per user and skill |
| User skills | per-user taught/learned skill inventory endpoints (`/me/skills`) |
| Learning requests | dedicated `learning_requests` table with POINTS / SKILL_SWAP / VOLUNTEER modes (today's swaps cover POINTS-style flows only) |
| Disputes (user-facing) | participants open disputes that block escrow release until admin resolves |
| Completion confirmations | double-confirm model with `autoReleaseAt` deadline instead of single-action completion |
| Global search | one endpoint across mentors, skills, forum posts |
| Notifications v2 | pagination, unread filter, mark-all-read |
| Sessions v2 | paged session list, get-by-id with redacted meeting URLs, per-mentor review listings |
| Scheduled jobs | pending-request expiry, escrow auto-release after 18h, refresh-token cleanup |
