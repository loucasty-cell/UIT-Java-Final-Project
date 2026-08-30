# SkillBridge Frontend API Documentation & Backend Audit (`dev` Branch)

> **Client Configuration:**
>
> - **Default Base URL:** `http://localhost:9095` (Configurable via `VITE_API_BASE_URL`)
> - **Authentication:** Standard Bearer JWT (`Authorization: Bearer <accessToken>`) with automatic 401 token refresh queue.
> - **State Management:** TanStack React Query (`@tanstack/react-query`) with custom typed hooks, automatic cache invalidation, and React Context.
> - **Backend Synchronization:** Audited and verified against Spring Boot controllers on the `dev` branch.

---

## 1. Architecture Overview

```
Frontend UI Components & Routes
               │
               ▼
   TanStack Query Hooks (`src/hooks/api/*`)
               │
               ▼
   API Service Layer (`src/services/*`)
               │
               ▼
   Central API Client (`src/lib/api-client.ts`)
      ├── JWT Token Header Injection
      ├── Concurrency-Locked 401 Token Refresh
      ├── FormData Multipart Uploads & Blob Stream Downloads
      └── Standardized ApiError Parsing
               │
               ▼
   SkillBridge Spring Boot REST API (`dev` branch)
```

---

## 2. Global Conventions & Error Protocol

### Standard Error Handling (`ApiError`)

When the backend returns an error payload, `apiClient` parses it into an `ApiError` instance:

```typescript
interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
```

### Standard Pagination (`PageResponse<T>`)

Endpoints that return paginated collections use:

```typescript
interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

---

## 3. Comprehensive Frontend Endpoint Reference

### 3.1 Authentication & User Profile

**Service:** `src/services/auth.service.ts`  
**Hooks:** `src/hooks/api/use-auth.ts`, `src/context/auth-context.tsx`

| Method  | Endpoint                         | Description                        | Service Function               | React Query Hook                     |
| :------ | :------------------------------- | :--------------------------------- | :----------------------------- | :----------------------------------- |
| `POST`  | `/api/v1/auth/register`          | Register new user account          | `authService.register`         | `useRegisterMutation()`              |
| `POST`  | `/api/v1/auth/login`             | Log in with email and password     | `authService.login`            | `useLoginMutation()`                 |
| `POST`  | `/api/v1/auth/refresh`           | Refresh expired access token       | `authService.refresh`          | Handled automatically by `apiClient` |
| `POST`  | `/api/v1/auth/logout`            | Revoke refresh token family        | `authService.logout`           | `useLogoutMutation()`                |
| `GET`   | `/api/v1/me`                     | Get authenticated user profile     | `authService.getProfile`       | `useProfileQuery()`                  |
| `PATCH` | `/api/v1/me`                     | Update authenticated user profile  | `authService.updateProfile`    | `useUpdateProfileMutation()`         |
| `GET`   | `/api/v1/me/dashboard`           | Get aggregated dashboard metrics   | `authService.getDashboard`     | `useProfileQuery()` / Dashboard view |
| `GET`   | `/api/v1/users/{userId}/profile` | Get public profile of another user | `authService.getPublicProfile` | `usePublicProfileQuery(userId)`      |
| `GET`   | `/api/v1/users/{userId}/skills`  | Get public skills of another user  | `authService.getPublicSkills`  | `usePublicSkillsQuery(userId)`       |

---

### 3.2 User Skills & Certificates

**Service:** `src/services/skills.service.ts`  
**Hooks:** `src/hooks/api/use-skills.ts`

| Method   | Endpoint                                              | Description                              | Service Function                    | React Query Hook                   |
| :------- | :---------------------------------------------------- | :--------------------------------------- | :---------------------------------- | :--------------------------------- |
| `GET`    | `/api/v1/me/skills`                                   | List user's skills (`TEACH` / `LEARN`)   | `skillsService.getUserSkills`       | `useUserSkillsQuery(direction?)`   |
| `POST`   | `/api/v1/me/skills`                                   | Add skill to user portfolio              | `skillsService.addUserSkill`        | `useAddUserSkillMutation()`        |
| `PATCH`  | `/api/v1/me/skills/{id}`                              | Update skill level proficiency           | `skillsService.updateUserSkill`     | `useUpdateUserSkillMutation()`     |
| `DELETE` | `/api/v1/me/skills/{id}`                              | Delete skill from portfolio              | `skillsService.deleteUserSkill`     | `useDeleteUserSkillMutation()`     |
| `POST`   | `/api/v1/me/skills/{skillId}/certificate`             | Upload certificate PDF/Image (multipart) | `skillsService.uploadCertificate`   | `useUploadCertificateMutation()`   |
| `GET`    | `/api/v1/me/certificates`                             | Get all uploaded certificates            | `skillsService.getMyCertificates`   | `useUserSkillsQuery()`             |
| `GET`    | `/api/v1/users/{userId}/skills/{skillId}/certificate` | Download PDF stream                      | `skillsService.downloadCertificate` | `useDownloadCertificateMutation()` |
| `DELETE` | `/api/v1/me/skills/{skillId}/certificate`             | Delete skill certificate                 | `skillsService.deleteCertificate`   | `useDeleteCertificateMutation()`   |

---

### 3.3 Global Skills Catalog

**Service:** `src/services/skills.service.ts`  
**Hooks:** `src/hooks/api/use-skills.ts`

| Method | Endpoint                          | Description                      | Service Function              | React Query Hook                     |
| :----- | :-------------------------------- | :------------------------------- | :---------------------------- | :----------------------------------- |
| `GET`  | `/api/skills` or `/api/v1/skills` | List catalog skills              | `skillsService.getCatalog`    | `useCatalogSkillsQuery()`            |
| `GET`  | `/api/skills/search?q={query}`    | Search catalog skills by keyword | `skillsService.searchCatalog` | `useSearchCatalogSkillsQuery(query)` |
| `GET`  | `/api/skills/{id}`                | Get skill details by ID          | `skillsService.getSkillById`  | `useSkillDetailQuery(id)`            |
| `GET`  | `/api/v1/skills/categories`       | Get all skill categories         | `skillsService.getCategories` | `useSkillCategoriesQuery()`          |
| `POST` | `/api/skills`                     | Create new catalog skill         | `skillsService.createSkill`   | Custom creation mutation             |

---

### 3.4 Mentors & Offerings

**Service:** `src/services/mentors.service.ts`  
**Hooks:** `src/hooks/api/use-mentors.ts`

| Method   | Endpoint                                  | Description                           | Service Function                  | React Query Hook                  |
| :------- | :---------------------------------------- | :------------------------------------ | :-------------------------------- | :-------------------------------- |
| `GET`    | `/api/v1/mentors`                         | Search and filter mentors             | `mentorsService.searchMentors`    | `useMentorsSearchQuery(filters)`  |
| `GET`    | `/api/v1/mentors/{mentorId}`              | Get mentor profile details            | `mentorsService.getMentorDetail`  | `useMentorDetailQuery(mentorId)`  |
| `GET`    | `/api/v1/mentors/{mentorId}/availability` | Get mentor calendar availability      | `mentorsService.getAvailability`  | `useMentorDetailQuery(mentorId)`  |
| `GET`    | `/api/v1/mentors/{mentorId}/reviews`      | Get public mentor reviews             | `mentorsService.getMentorReviews` | `useMentorReviewsQuery(mentorId)` |
| `GET`    | `/api/v1/me/mentor-offerings`             | List authenticated mentor's offerings | `mentorsService.getMyOfferings`   | `useMyOfferingsQuery()`           |
| `POST`   | `/api/v1/me/mentor-offerings`             | Create offering                       | `mentorsService.createOffering`   | `useCreateOfferingMutation()`     |
| `PATCH`  | `/api/v1/me/mentor-offerings/{id}`        | Update offering                       | `mentorsService.updateOffering`   | `useUpdateOfferingMutation()`     |
| `DELETE` | `/api/v1/me/mentor-offerings/{id}`        | Delete offering                       | `mentorsService.deleteOffering`   | `useDeleteOfferingMutation()`     |

---

### 3.5 Swap Proposals & Barter

**Service:** `src/services/swaps.service.ts`  
**Hooks:** `src/hooks/api/use-swaps.ts`

| Method | Endpoint                                   | Description                        | Service Function                   | React Query Hook                   |
| :----- | :----------------------------------------- | :--------------------------------- | :--------------------------------- | :--------------------------------- |
| `POST` | `/api/swaps/proposals`                     | Create swap proposal               | `swapsService.createProposal`      | `useCreateSwapProposalMutation()`  |
| `POST` | `/api/swaps/proposals/{id}/accept`         | Accept swap proposal               | `swapsService.acceptProposal`      | `useAcceptSwapProposalMutation()`  |
| `POST` | `/api/swaps/proposals/{id}/reject`         | Reject proposal (escrow refunded)  | `swapsService.rejectProposal`      | `useRejectSwapProposalMutation()`  |
| `POST` | `/api/swaps/proposals/{id}/counter`        | Counter proposal                   | `swapsService.counterProposal`     | `useCounterSwapProposalMutation()` |
| `POST` | `/api/requests/swaps/{id}/cancel`          | Cancel outgoing proposal           | `swapsService.cancelProposal`      | `useCancelSwapProposalMutation()`  |
| `GET`  | `/api/swaps/history/me`                    | Get swap history                   | `swapsService.getSwapHistory`      | Swaps list view                    |
| `GET`  | `/api/requests/swaps/pending/incoming`     | Get incoming pending swap requests | `swapsService.getPendingIncoming`  | Dashboard notifications/requests   |
| `POST` | `/api/swaps/sessions/{sessionId}/complete` | Complete swap session              | `swapsService.completeSwapSession` | Session completion modal           |

---

### 3.6 Peer Sessions & Double Confirmation

**Service:** `src/services/sessions.service.ts`  
**Hooks:** `src/hooks/api/use-sessions.ts`

| Method  | Endpoint                      | Description                            | Service Function                   | React Query Hook               |
| :------ | :---------------------------- | :------------------------------------- | :--------------------------------- | :----------------------------- |
| `GET`   | `/api/sessions/active/me`     | List active sessions                   | `sessionsService.listSessions`     | `useSessionsQuery(status?)`    |
| `GET`   | `/api/sessions/{id}`          | Get session details                    | `sessionsService.getSessionDetail` | `useSessionDetailQuery(id)`    |
| `POST`  | `/api/sessions/{id}/start`    | Start scheduled session                | `sessionsService.startSession`     | `useStartSessionMutation()`    |
| `POST`  | `/api/sessions/{id}/complete` | Double-confirmation session completion | `sessionsService.completeSession`  | `useCompleteSessionMutation()` |
| `PATCH` | `/api/sessions/{id}`          | Update meeting URL and notes           | `sessionsService.updateSession`    | `useUpdateSessionMutation()`   |
| `POST`  | `/api/sessions/{id}/dispute`  | File dispute (freezes escrow)          | `sessionsService.disputeSession`   | `useDisputeSessionMutation()`  |

---

### 3.7 Reviews & Ratings

**Service:** `src/services/reviews.service.ts`  
**Hooks:** `src/hooks/api/use-reviews.ts`

| Method | Endpoint                            | Description                         | Service Function                   | React Query Hook                    |
| :----- | :---------------------------------- | :---------------------------------- | :--------------------------------- | :---------------------------------- |
| `POST` | `/api/reviews/sessions/{sessionId}` | Submit review for completed session | `reviewsService.submitReview`      | `useSubmitReviewMutation()`         |
| `GET`  | `/api/reviews/sessions/{sessionId}` | Get reviews for session             | `reviewsService.getSessionReviews` | `useSessionReviewsQuery(sessionId)` |

---

### 3.8 Wallet & Points Ledger

**Service:** `src/services/wallet.service.ts`  
**Hooks:** `src/hooks/api/use-wallet.ts`

| Method | Endpoint                             | Description                              | Service Function                      | React Query Hook                      |
| :----- | :----------------------------------- | :--------------------------------------- | :------------------------------------ | :------------------------------------ |
| `GET`  | `/api/v1/me/wallet`                  | Get balance (available, held, total)     | `walletService.getBalance`            | `useWalletBalanceQuery()`             |
| `GET`  | `/api/v1/me/wallet/transactions`     | Paginated transaction history ledger     | `walletService.getTransactions`       | `useWalletTransactionsQuery(params?)` |
| `GET`  | `/api/v1/me/wallet/transactions.csv` | Download transaction history as CSV      | `walletService.exportTransactionsCsv` | Export button trigger                 |
| `POST` | `/api/wallet/transfer`               | Direct point transfer to another student | `walletService.transferPoints`        | `useTransferPointsMutation()`         |

---

### 3.9 Community Volunteer Forum & Leaderboard

**Service:** `src/services/forum.service.ts`  
**Hooks:** `src/hooks/api/use-forum.ts`

| Method         | Endpoint                                          | Description                           | Service Function                | React Query Hook                        |
| :------------- | :------------------------------------------------ | :------------------------------------ | :------------------------------ | :-------------------------------------- |
| `GET`          | `/api/v1/forum/posts`                             | List posts (with skill/query filters) | `forumService.getPosts`         | `useForumPostsQuery(skillId?, search?)` |
| `POST`         | `/api/v1/forum/posts`                             | Create new forum post                 | `forumService.createPost`       | `useCreateForumPostMutation()`          |
| `GET`          | `/api/v1/forum/posts/{postId}`                    | Get full post detail                  | `forumService.getPost`          | Post detail view                        |
| `PATCH`        | `/api/v1/forum/posts/{postId}`                    | Edit forum post                       | `forumService.updatePost`       | Post edit modal                         |
| `DELETE`       | `/api/v1/forum/posts/{postId}`                    | Delete forum post                     | `forumService.deletePost`       | Post delete button                      |
| `PUT` / `POST` | `/api/v1/forum/posts/{postId}/like`               | Like post                             | `forumService.likePost`         | `useLikeForumPostMutation()`            |
| `DELETE`       | `/api/v1/forum/posts/{postId}/like`               | Unlike post                           | `forumService.unlikePost`       | `useUnlikeForumPostMutation()`          |
| `GET`          | `/api/v1/forum/posts/{postId}/comments`           | List comments on a post               | `forumService.getComments`      | Thread comments view                    |
| `POST`         | `/api/v1/forum/posts/{postId}/comments`           | Add comment                           | `forumService.addComment`       | `useAddForumCommentMutation()`          |
| `DELETE`       | `/api/v1/forum/comments/{commentId}`              | Delete comment                        | `forumService.deleteComment`    | Comment delete button                   |
| `POST`         | `/api/v1/forum/comments/{commentId}/mark-helpful` | Reward comment author with points     | `forumService.rewardComment`    | `useRewardForumCommentMutation()`       |
| `GET`          | `/api/v1/forum/top-volunteers?week={date}`        | Weekly top volunteer leaderboard      | `forumService.getTopVolunteers` | Volunteer leaderboard widget            |

---

### 3.10 Notifications

**Service:** `src/services/notifications.service.ts`  
**Hooks:** `src/hooks/api/use-notifications.ts`

| Method           | Endpoint                           | Description                       | Service Function                          | React Query Hook                        |
| :--------------- | :--------------------------------- | :-------------------------------- | :---------------------------------------- | :-------------------------------------- |
| `GET`            | `/api/notifications/me`            | List user notifications           | `notificationsService.getNotifications`   | `useNotificationsQuery()`               |
| `POST` / `PATCH` | `/api/notifications/{id}/read`     | Mark single notification as read  | `notificationsService.markAsRead`         | `useMarkNotificationReadMutation()`     |
| `POST`           | `/api/notifications/mark-all-read` | Mark all notifications as read    | `notificationsService.markAllAsRead`      | `useMarkAllNotificationsReadMutation()` |
| `GET`            | `/api/notifications/unread-count`  | Get count of unread notifications | `notificationsService.getUnreadCount`     | `useUnreadNotificationsCountQuery()`    |
| `DELETE`         | `/api/notifications/{id}`          | Delete notification               | `notificationsService.deleteNotification` | `useDeleteNotificationMutation()`       |

---

### 3.11 Admin Portal & Moderation (`ROLE_ADMIN`)

**Service:** `src/services/admin.service.ts`  
**Hooks:** `src/hooks/api/use-admin.ts`

| Method  | Endpoint                                          | Description                                                          | Service Function                     | React Query Hook                                   |
| :------ | :------------------------------------------------ | :------------------------------------------------------------------- | :----------------------------------- | :------------------------------------------------- |
| `GET`   | `/api/v1/admin/dashboard`                         | High-level metrics & stats                                           | `adminService.getDashboardMetrics`   | `useAdminMetricsQuery()`                           |
| `GET`   | `/api/v1/admin/users`                             | Paginated platform users list                                        | `adminService.getUsers`              | `useAdminUsersQuery(params?)`                      |
| `POST`  | `/api/v1/admin/users/{userId}/wallet-adjustments` | Point balance manual adjustment                                      | `adminService.adjustUserPoints`      | `useAdjustUserPointsMutation()`                    |
| `POST`  | `/api/v1/admin/users/{userId}/warnings`           | Issue official policy warning                                        | `adminService.issueWarning`          | User moderation modal                              |
| `PATCH` | `/api/v1/admin/users/{userId}/status`             | Status update (`ACTIVE`, `WARNED`, `SUSPENDED`, `DISABLED`)          | `adminService.updateStatus`          | `useFreezeUserMutation()` / `useBanUserMutation()` |
| `GET`   | `/api/v1/admin/disputes`                          | List open/resolved disputes                                          | `adminService.getDisputes`           | `useAdminDisputesQuery()`                          |
| `POST`  | `/api/v1/admin/disputes/{disputeId}/resolve`      | Arbitrate dispute (`REFUND_REQUESTER`, `RELEASE_RESPONDER`, `SPLIT`) | `adminService.resolveDispute`        | `useResolveDisputeMutation()`                      |
| `GET`   | `/api/v1/admin/reports`                           | Paginated reported content queue                                     | `adminService.getReports`            | Moderation queue tab                               |
| `POST`  | `/api/v1/admin/reports/{reportId}/dismiss`        | Dismiss report                                                       | `adminService.dismissReport`         | Moderation action                                  |
| `POST`  | `/api/v1/admin/reports/{reportId}/remove-content` | Soft-delete reported content                                         | `adminService.removeReportedContent` | Moderation action                                  |
| `GET`   | `/api/v1/admin/settings`                          | Get system reward parameters                                         | `adminService.getSettings`           | `useAdminSettingsQuery()`                          |
| `PATCH` | `/api/v1/admin/settings`                          | Update system reward parameters                                      | `adminService.updateSettings`        | `useUpdateAdminSettingsMutation()`                 |
| `GET`   | `/api/v1/admin/audit-events`                      | Paginated immutable audit trail                                      | `adminService.getAuditLogs`          | `useAdminAuditLogsQuery(params?)`                  |

---

## 4. Backend Synchronization & Audit Summary

1. **Dual Routing & Forward Compatibility**:
   - The frontend services natively support both `/api/v1/me` and `/api/v1/me/profile`, `/api/skills` and `/api/v1/skills`, `POST` and `PATCH` variations found in Spring Boot controller mappings on `dev`.
2. **Double Confirmation & Escrow Protocol**:
   - Sessions handle double confirmation where the first confirmation initiates the 18-hour auto-release timer and the second confirmation releases held escrow points.
3. **Optimistic Caching & Cache Keys**:
   - Queries automatically invalidate associated collections upon mutation (e.g. creating a forum comment updates the post count, completing a session updates wallet balance and disputes).
4. **Resilience**:
   - UI components feature graceful fallbacks to maintain interactive layout previews if the backend server is offline.
