# SkillBridge Backend API Endpoints Documentation

> **Base URL:** `http://localhost:9095`  
> **OpenAPI / Swagger UI:** `http://localhost:9095/swagger-ui/index.html`  
> **OpenAPI JSON Spec:** `http://localhost:9095/v3/api-docs`  
> **Health Check:** `http://localhost:9095/actuator/health`

---

## 1. Authentication & Security Conventions

### Headers

- **Content-Type:** `application/json` (except file uploads which use `multipart/form-data`)
- **Authorization:** `Bearer <accessToken>` (Required for all protected endpoints)

### Standard Error Response Format

All errors return a consistent JSON payload:

```json
{
    "timestamp": "2026-08-29T16:30:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Validation failed: Email must be valid",
    "path": "/api/v1/auth/register"
}
```

### Standard Pagination Wrapper (`PageResponse<T>`)

Endpoints that return paginated collections use:

```json
{
  "content": [ ... ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 142,
  "totalPages": 8,
  "last": false
}
```

---

## 2. Authentication & Profile (`/api/v1/auth`, `/api/v1/me`, `/api/v1/users`)

### 2.1 Register New Account

- **`POST /api/v1/auth/register`**
- **Auth:** Public
- **Request Body:**

```json
{
    "email": "student@university.edu",
    "password": "Password123!",
    "firstName": "Alex",
    "lastName": "Rivera",
    "displayName": "Alex R.",
    "major": "Computer Science",
    "yearOfStudy": 3
}
```

- **Success Response (201 Created):**

```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "accessTokenExpiresAt": "2026-08-30T04:30:00Z",
    "refreshToken": "7a8b9c0d1e2f3a4b5c6d7e8f...",
    "user": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "email": "student@university.edu",
        "firstName": "Alex",
        "lastName": "Rivera",
        "displayName": "Alex R.",
        "roles": ["USER"],
        "status": "ACTIVE"
    }
}
```

### 2.2 Login

- **`POST /api/v1/auth/login`**
- **Auth:** Public
- **Request Body:**

```json
{
    "email": "student@university.edu",
    "password": "Password123!"
}
```

- **Success Response (200 OK):** Same schema as Register (`AuthResponse`).

### 2.3 Refresh Access Token

- **`POST /api/v1/auth/refresh`**
- **Auth:** Public
- **Request Body:**

```json
{
    "refreshToken": "7a8b9c0d1e2f3a4b5c6d7e8f..."
}
```

- **Success Response (200 OK):** `AuthResponse` with newly rotated tokens.

### 2.4 Logout

- **`POST /api/v1/auth/logout`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "refreshToken": "7a8b9c0d1e2f3a4b5c6d7e8f..."
}
```

- **Success Response (204 No Content)**

### 2.5 Get Authenticated User Profile

- **`GET /api/v1/me/profile`**
- **Auth:** Bearer Token
- **Success Response (200 OK):**

```json
{
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "student@university.edu",
    "firstName": "Alex",
    "lastName": "Rivera",
    "displayName": "Alex R.",
    "bio": "Passionate about algorithms and web dev.",
    "major": "Computer Science",
    "yearOfStudy": 3,
    "timezone": "Asia/Yangon",
    "avatarObjectKey": "avatars/alex.png",
    "status": "ACTIVE"
}
```

### 2.6 Update Authenticated User Profile

- **`PUT /api/v1/me/profile`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "firstName": "Alexander",
    "lastName": "Rivera",
    "displayName": "Alex Rivera",
    "bio": "Updated bio text",
    "major": "Software Engineering",
    "yearOfStudy": 4,
    "timezone": "UTC"
}
```

- **Success Response (200 OK):** Returns updated `UserProfileResponse`.

### 2.7 Get Public User Profile & Skills

- **`GET /api/v1/users/{userId}/profile`** (Auth: Bearer Token) -> Returns public user profile.
- **`GET /api/v1/users/{userId}/skills`** (Auth: Bearer Token) -> Returns list of user's teaching/learning skills.

---

## 3. User Skills & Certificates (`/api/v1/me/skills`)

### 3.1 Get User Skills Portfolio

- **`GET /api/v1/me/skills?direction=TEACH`**
- **Query Params:** `direction` (Optional: `TEACH` or `LEARN`)
- **Auth:** Bearer Token
- **Success Response (200 OK):**

```json
[
    {
        "id": "c1a2b3c4-d5e6-7f80-1a2b-3c4d5e6f7081",
        "skill": {
            "id": "9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e",
            "name": "Java",
            "category": "Programming",
            "description": "Java development"
        },
        "direction": "TEACH",
        "level": "ADVANCED",
        "createdAt": "2026-08-29T10:00:00Z",
        "updatedAt": "2026-08-29T10:00:00Z"
    }
]
```

### 3.2 Add Skill to Portfolio

- **`POST /api/v1/me/skills`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "skillId": "9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e",
    "direction": "TEACH",
    "level": "ADVANCED"
}
```

- **Success Response (200 OK):** `UserSkillResponse`

### 3.3 Update Skill Proficiency

- **`PUT /api/v1/me/skills/{id}`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "level": "EXPERT"
}
```

- **Success Response (200 OK):** Updated `UserSkillResponse`

### 3.4 Delete Skill from Portfolio

- **`DELETE /api/v1/me/skills/{id}`**
- **Auth:** Bearer Token
- **Success Response (204 No Content)**

### 3.5 Upload Skill Certificate (PDF / Image)

- **`POST /api/v1/me/skills/{skillId}/certificate`**
- **Auth:** Bearer Token
- **Content-Type:** `multipart/form-data`
- **Form Field:** `file` (Binary file, max 10MB)
- **Success Response (200 OK):**

```json
{
    "id": "7b8c9d0e-1f2a-3b4c-5d6e-7f801a2b3c4d",
    "skillId": "9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e",
    "fileName": "oracle_java_cert.pdf",
    "fileSize": 1048576,
    "contentType": "application/pdf",
    "createdAt": "2026-08-29T12:00:00Z"
}
```

### 3.6 Download Skill Certificate

- **`GET /api/v1/users/{userId}/skills/{skillId}/certificate`**
- **Auth:** Bearer Token
- **Success Response (200 OK):** Returns binary stream with headers `Content-Type` and `Content-Disposition`.

---

## 4. Global Skills Catalog (`/api/v1/skills`)

| Method | Endpoint                          | Auth   | Description                           |
| :----- | :-------------------------------- | :----- | :------------------------------------ |
| `GET`  | `/api/v1/skills`                  | Public | List all global skills in the catalog |
| `GET`  | `/api/v1/skills/search?q={query}` | Public | Search catalog skills by keyword      |
| `GET`  | `/api/v1/skills/categories`       | Public | Get list of distinct skill categories |
| `GET`  | `/api/v1/skills/{id}`             | Public | Get skill detail by ID                |

---

## 5. Mentors & Offerings (`/api/v1/mentors`, `/api/v1/me/mentor-offerings`)

### 5.1 Search Mentors

- **`GET /api/v1/mentors?skillId={}&search={}&minRating={}`**
- **Auth:** Public
- **Success Response (200 OK):**

```json
[
    {
        "mentorId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Sarah Connor",
        "avatarUrl": "avatars/sarah.jpg",
        "bio": "Senior Backend Engineer & Mentor",
        "averageRating": 4.9,
        "reviewCount": 24,
        "skills": ["Java", "Spring Boot", "PostgreSQL"],
        "hourlyRatePoints": 50
    }
]
```

### 5.2 Get Mentor Detail

- **`GET /api/v1/mentors/{mentorId}`**
- **Auth:** Public
- **Success Response (200 OK):** Detailed profile, offered skills, hourly rates, and ratings breakdown.

### 5.3 Get Mentor Public Reviews

- **`GET /api/v1/mentors/{mentorId}/reviews?page=0&size=10`**
- **Auth:** Public
- **Success Response (200 OK):** `PageResponse<ReviewResponse>`

### 5.4 Manage Authenticated Mentor Offerings

- **`GET /api/v1/me/mentor-offerings`** (Auth: Bearer Token) -> List my offerings
- **`POST /api/v1/me/mentor-offerings`** (Auth: Bearer Token) -> Create offering:

```json
{
    "skillId": "9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e",
    "hourlyRatePoints": 50,
    "description": "1-on-1 Spring Boot microservices coaching",
    "available": true
}
```

- **`PUT /api/v1/me/mentor-offerings/{id}`** (Auth: Bearer Token) -> Update offering
- **`DELETE /api/v1/me/mentor-offerings/{id}`** (Auth: Bearer Token) -> Delete offering (204 No Content)

---

## 6. Swap Proposals & Barter (`/api/swaps/proposals`)

### 6.1 Create Swap Proposal

- **`POST /api/swaps/proposals`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "responderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "offeredSkillId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "requestedSkillId": "9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e",
    "pointCost": 0,
    "message": "Hey! Let's swap 1 hour of React for 1 hour of Java."
}
```

- **Success Response (200 OK):**

```json
{
    "id": "5f6e7d8c-9b0a-1a2b-3c4d-5e6f7a8b9c0d",
    "requesterId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "responderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "offeredSkillId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "requestedSkillId": "9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e",
    "pointCost": 0,
    "pointsHeld": 0,
    "status": "PENDING",
    "message": "Hey! Let's swap 1 hour of React for 1 hour of Java.",
    "createdAt": "2026-08-29T14:00:00Z"
}
```

### 6.2 Accept Proposal

- **`POST /api/swaps/proposals/{id}/accept`**
- **Auth:** Bearer Token
- **Success Response (200 OK):** Status becomes `ACCEPTED`, returns `sessionId`.

### 6.3 Reject Proposal

- **`POST /api/swaps/proposals/{id}/reject`**
- **Auth:** Bearer Token
- **Request Body:** `{ "reason": "Busy schedule this week" }`
- **Success Response (200 OK):** Status becomes `REJECTED`, held escrow points refunded.

### 6.4 Counter Proposal

- **`POST /api/swaps/proposals/{id}/counter`**
- **Auth:** Bearer Token
- **Request Body:** `{ "offeredSkillId": "...", "requestedSkillId": "...", "pointCost": 20, "message": "..." }`
- **Success Response (200 OK):** Status becomes `COUNTERED`.

### 6.5 Cancel Proposal

- **`POST /api/swaps/proposals/{id}/cancel`**
- **Auth:** Bearer Token
- **Success Response (200 OK):** Status becomes `CANCELLED`.

---

## 7. Sessions & Double-Confirmation (`/api/sessions`)

### 7.1 List User Sessions

- **`GET /api/sessions?status=ACCEPTED,STARTED,COMPLETED`**
- **Auth:** Bearer Token
- **Success Response (200 OK):** List of `SessionResponse`.

### 7.2 Get Session Detail

- **`GET /api/sessions/{id}`**
- **Auth:** Bearer Token
- **Success Response (200 OK):** `SessionResponse`.

### 7.3 Start Session

- **`POST /api/sessions/{id}/start`**
- **Auth:** Bearer Token
- **Success Response (200 OK):** Session status becomes `STARTED`, records `startedAt`.

### 7.4 Double-Confirmation Complete Session

- **`POST /api/sessions/{id}/complete`**
- **Auth:** Bearer Token
- **Behavior:**
    1. **First Party Confirms:** Creates confirmation record in `session_confirmations`, sets `autoReleaseAt` = `now + 18 hours`, status remains `STARTED`.
    2. **Second Party Confirms (or 18h auto-release fires):** Marks status `COMPLETED`, releases held escrow points to mentor.
- **Success Response (200 OK):** Updated `SessionResponse`.

### 7.5 Update Session Notes / Meeting URL

- **`PATCH /api/sessions/{id}`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "meetingUrl": "https://meet.google.com/xyz-abcd-efg",
    "notes": "Covered Chapter 3 and completed practice problems."
}
```

- **Success Response (200 OK):** `SessionResponse`.

### 7.6 Dispute a Session

- **`POST /api/sessions/{id}/dispute`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "reason": "Mentor did not show up to the scheduled meeting."
}
```

- **Success Response (200 OK):** Session status transitions to `DISPUTED`, escrow is frozen pending admin resolution.

---

## 8. Reviews & Ratings (`/api/reviews`)

### 8.1 Submit Review for Completed Session

- **`POST /api/reviews/sessions/{sessionId}`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "revieweeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "skillId": "9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e",
    "rating": 5,
    "feedback": "Outstanding mentor! Explained Spring Boot internals thoroughly."
}
```

- **Success Response (201 Created):**

```json
{
    "id": "11223344-5566-7788-99aa-bbccddeeff00",
    "sessionId": "5f6e7d8c-9b0a-1a2b-3c4d-5e6f7a8b9c0d",
    "reviewerId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "revieweeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "skillId": "9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e",
    "rating": 5,
    "feedback": "Outstanding mentor! Explained Spring Boot internals thoroughly.",
    "createdAt": "2026-08-29T15:00:00Z"
}
```

### 8.2 Get Reviews for Session

- **`GET /api/reviews/sessions/{sessionId}`**
- **Auth:** Bearer Token
- **Success Response (200 OK):** `List<ReviewResponse>`

---

## 9. Wallet & Points (`/api/v1/me/wallet`, `/api/wallet`)

### 9.1 Get Wallet Balance

- **`GET /api/v1/me/wallet/balance`**
- **Auth:** Bearer Token
- **Success Response (200 OK):**

```json
{
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "availablePoints": 150,
    "heldPoints": 50,
    "totalEarned": 300,
    "totalSpent": 100
}
```

### 9.2 Get Wallet Transaction Ledger

- **`GET /api/v1/me/wallet/transactions?page=0&size=20`**
- **Auth:** Bearer Token
- **Success Response (200 OK):**

```json
{
    "content": [
        {
            "id": "a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d",
            "eventType": "SESSION_ESCROW_RELEASE",
            "availableDelta": 50,
            "heldDelta": -50,
            "balanceAfterAvailable": 150,
            "balanceAfterHeld": 0,
            "description": "Completed mentoring session",
            "createdAt": "2026-08-29T15:05:00Z"
        }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
}
```

### 9.3 Direct Points Transfer

- **`POST /api/wallet/transfer`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "recipientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "amount": 25,
    "reason": "Tip for great session"
}
```

- **Success Response (200 OK):** `WalletTransactionResponse`

---

## 10. Community Forum (`/api/v1/forum`)

### 10.1 List Forum Posts

- **`GET /api/v1/forum/posts?skillId={}&search={}`**
- **Auth:** Public
- **Success Response (200 OK):** `List<ForumPostSummaryResponse>`

### 10.2 Create Forum Post

- **`POST /api/v1/forum/posts`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "title": "Best practices for Spring Boot 3 Security filters",
    "description": "Looking for tips on configuring custom JWT Bearer auth converters.",
    "skillIds": ["9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e"],
    "availabilityText": "Available weekday evenings",
    "active": true
}
```

- **Success Response (201 Created):** `ForumPostResponse`

### 10.3 Like / Unlike Post

- **`POST /api/v1/forum/posts/{postId}/like`** (Auth: Bearer Token) -> Likes post.
- **`DELETE /api/v1/forum/posts/{postId}/like`** (Auth: Bearer Token) -> Unlikes post.
- **Success Response (200 OK):**

```json
{
    "postId": "8c7b6a5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
    "likeCount": 12,
    "commentCount": 4,
    "likedByMe": true
}
```

### 10.4 Add Comment to Post

- **`POST /api/v1/forum/posts/{postId}/comments`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "body": "Use a SecurityFilterChain bean with OAuth2ResourceServerConfigurer."
}
```

- **Success Response (201 Created):** `ForumCommentResponse`

### 10.5 Reward Top Contributor / Best Answer

- **`POST /api/v1/forum/posts/{postId}/reward`**
- **Auth:** Bearer Token
- **Request Body:**

```json
{
    "commentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "points": 15
}
```

- **Success Response (200 OK):** Transfers reward points to comment author and updates ledger.

---

## 11. Notifications (`/api/notifications`)

| Method   | Endpoint                           | Auth         | Description                                             |
| :------- | :--------------------------------- | :----------- | :------------------------------------------------------ |
| `GET`    | `/api/notifications/me`            | Bearer Token | Get all notifications for current user                  |
| `PATCH`  | `/api/notifications/{id}/read`     | Bearer Token | Mark single notification as read                        |
| `POST`   | `/api/notifications/mark-all-read` | Bearer Token | Mark all notifications as read (204 No Content)         |
| `GET`    | `/api/notifications/unread-count`  | Bearer Token | Get count of unread notifications: `{"unreadCount": 3}` |
| `DELETE` | `/api/notifications/{id}`          | Bearer Token | Delete notification (204 No Content)                    |

---

## 12. Admin & Moderation (`/api/v1/admin`, `/api/v1/moderation`)

_(Requires user to have `ROLE_ADMIN`)_

### 12.1 Platform Metrics & Dashboard

- **`GET /api/v1/admin/dashboard/metrics`**
- **Auth:** Admin
- **Success Response (200 OK):**

```json
{
    "totalUsers": 1240,
    "activeSessions": 38,
    "pendingDisputes": 2,
    "totalPointsInCirculation": 65400,
    "newUsersLast24h": 15
}
```

### 12.2 User Moderation

- **`GET /api/v1/admin/users?page=0&size=20`** -> `PageResponse<AdminUserResponse>`
- **`POST /api/v1/admin/users/{id}/freeze`** -> Body: `{"reason": "Investigating suspicious activity"}`
- **`POST /api/v1/admin/users/{id}/unfreeze`** -> Body: `{"reason": "Cleared by support"}`
- **`POST /api/v1/admin/users/{id}/ban`** -> Body: `{"reason": "Repeated terms violation"}`
- **`POST /api/v1/admin/users/{id}/points/adjust`** -> Body: `{"delta": 100, "reason": "Hackathon prize"}`
- **`PATCH /api/v1/admin/users/{id}/role`** -> Body: `{"roles": ["USER", "ADMIN"]}`

### 12.3 Dispute Resolutions & Escrow Refunds

- **`GET /api/v1/admin/disputes`** -> List open/resolved disputes
- **`POST /api/v1/admin/disputes/{id}/resolve`**
- **Request Body:**

```json
{
    "resolution": "REFUND_REQUESTER",
    "adminNotes": "Mentor failed to provide session link. 100% points refunded to learner."
}
```

- **Supported Resolutions:**
    - `REFUND_REQUESTER`: 100% held points returned to learner
    - `RELEASE_RESPONDER`: 100% held points awarded to mentor
    - `SPLIT`: 50% refunded to learner, 50% awarded to mentor

### 12.4 Platform Settings

- **`GET /api/v1/admin/settings`** -> Get settings
- **`PUT /api/v1/admin/settings`** -> Update settings:

```json
{
    "escrowReleaseHours": 18,
    "registrationBonus": 100,
    "forumContributionReward": 10
}
```

### 12.5 Audit Logs

- **`GET /api/v1/admin/audit-logs?page=0&size=20`** -> `PageResponse<AdminAuditEventResponse>`
