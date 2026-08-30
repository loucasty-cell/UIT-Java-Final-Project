# backendchanges.md — SkillBridge Backend Requirements & Changes

> **Stack:** Spring Boot 3.x + Spring Security + Neon PostgreSQL + JWT  
> **Frontend:** TanStack Start (React 19) + Vite (`VITE_API_BASE_URL=http://localhost:9095`)  
> **Date:** 2026-08-29  
> **Purpose:** This document lists ALL backend API changes, new endpoints, database migrations, and business logic needed to fully support the frontend features.

---

## Table of Contents

1. [Critical Fixes (Blocking Frontend)](#1-critical-fixes-blocking-frontend)
2. [Learning Requests Service (NEW)](#2-learning-requests-service-new)
3. [Session Scheduling & Conflict Detection](#3-session-scheduling--conflict-detection)
4. [Point System & Wallet Enhancements](#4-point-system--wallet-enhancements)
5. [Skill Swap Workflow Fixes](#5-skill-swap-workflow-fixes)
6. [Mentor Application & Admin Approval](#6-mentor-application--admin-approval)
7. [Google Meet Integration](#7-google-meet-integration)
8. [Referral System (NEW)](#8-referral-system-new)
9. [Milestone Points (NEW)](#9-milestone-points-new)
10. [Watchlist Persistence (Phase 2)](#10-watchlist-persistence-phase-2)
11. [Database Migrations Required](#11-database-migrations-required)
12. [API Endpoint Summary](#12-api-endpoint-summary)

---

## 1. Critical Fixes (Blocking Frontend)

These must be fixed before any new feature can work end-to-end.

### 1.1 Learning Request Creation Endpoint

**Problem:** Frontend has no way to actually book a session. The mentors page booking dialog only shows a toast — no API call exists to create a learning request.

**Required:** Ensure `POST /api/v1/learning-requests` is fully implemented with:

```java
// RequestBody
{
  "mentorId": "uuid",
  "mentorOfferingId": "uuid",
  "requestedSkillId": "uuid",
  "mode": "POINTS" | "SKILL_SWAP" | "VOLUNTEER",
  "offeredUserSkillId": "uuid | null",  // only for SKILL_SWAP
  "scheduledStart": "2026-09-01T10:00:00Z",
  "durationMinutes": 60,
  "message": "string"
}
```

**Business Logic:**
- For `POINTS` mode: Validate learner has `available_points >= offering.pointCost`, create escrow hold immediately
- For `SKILL_SWAP` mode: Validate reciprocal skill match (mentor has LEARN for offered skill), no point movement
- For `VOLUNTEER` mode: No point check needed, 0 cost
- Validate `scheduledStart` is in the future
- **Run conflict detection** (see Section 3)
- Create `learning_requests` record with `status = PENDING`
- Send notification to mentor

### 1.2 Mentor Availability Endpoint

**Problem:** `GET /api/v1/mentors/{mentorId}/availability` currently returns empty arrays (stub/placeholder).

**Required:** Implement real availability calculation:
- Query mentor's `availability_schedule` (recurring weekly slots)
- Subtract already-booked sessions (status = SCHEDULED, AWAITING_CONFIRMATION)
- Return available ISO time windows for the requested date range
- Response format:
```json
{
  "availableSlots": [
    { "start": "2026-09-01T09:00:00Z", "end": "2026-09-01T10:00:00Z" },
    { "start": "2026-09-01T11:00:00Z", "end": "2026-09-01T12:00:00Z" }
  ]
}
```

### 1.3 Session Auto-Creation on Accept

**Problem:** When mentor accepts a learning request, ensure a `sessions` record is automatically created.

**Required:** `POST /api/v1/learning-requests/{requestId}/accept` must:
- Update request status to `ACCEPTED`
- Create `sessions` record with `status = SCHEDULED`
- Copy `scheduledStart`, `durationMinutes`, `mode` from request
- For POINTS mode: escrow should already be held from request creation
- For SKILL_SWAP mode: update swap status to `ACCEPTED`
- Send notification to learner with session details
- Return created session ID in response

### 1.4 Registration Bonus Points

**Problem:** Your point flow diagram shows +30 for registration, but current backend awards +50. Need to decide and be consistent.

**Action:** Update `application.yml` or `admin_settings` table:
```yaml
skillbridge:
  registration-bonus-points: 30  # Changed from 50 to match spec
```
Or keep 50 if preferred — just ensure frontend and backend match.

---

## 2. Learning Requests Service (NEW)

The frontend needs a complete learning request lifecycle. Backend must support:

### 2.1 Endpoints Required

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| `POST` | `/api/v1/learning-requests` | Create new request (book session) | Authenticated |
| `GET` | `/api/v1/learning-requests` | List my requests (direction=INCOMING/OUTGOING, status filter) | Authenticated |
| `GET` | `/api/v1/learning-requests/{id}` | Get request detail | Authenticated (participant only) |
| `POST` | `/api/v1/learning-requests/{id}/accept` | Mentor accepts → creates session | MENTOR |
| `POST` | `/api/v1/learning-requests/{id}/reject` | Mentor rejects → refunds escrow | MENTOR |
| `POST` | `/api/v1/learning-requests/{id}/cancel` | Learner cancels → refunds escrow | Authenticated (requester) |

### 2.2 State Machine

```
PENDING → ACCEPTED (mentor accepts) → session created
PENDING → REJECTED (mentor rejects) → escrow refunded
PENDING → CANCELLED (learner cancels) → escrow refunded
PENDING → EXPIRED (auto after 48h) → escrow refunded
```

### 2.3 Notifications on State Change

Every state transition must emit a notification:
- `REQUEST_RECEIVED` → to mentor
- `REQUEST_ACCEPTED` → to learner (include session link)
- `REQUEST_REJECTED` → to learner (include refund confirmation)
- `REQUEST_CANCELLED` → to mentor
- `REQUEST_EXPIRED` → to both parties

---

## 3. Session Scheduling & Conflict Detection

This is the most critical business logic gap.

### 3.1 Conflict Detection Algorithm

Before creating ANY learning request or session, backend must check for time conflicts for BOTH the learner AND the mentor:

```java
@Service
public class ScheduleConflictService {
    
    /**
     * Check for scheduling conflicts for a user.
     * Must be called for BOTH learner and mentor when creating a request.
     *
     * @throws ConflictException if any overlap exists
     */
    public void validateNoConflict(UUID userId, Instant scheduledStart, int durationMinutes) {
        Instant scheduledEnd = scheduledStart.plus(durationMinutes, ChronoUnit.MINUTES);
        
        // Add buffer time (15 min before/after) to prevent back-to-back bookings
        Instant bufferStart = scheduledStart.minus(15, ChronoUnit.MINUTES);
        Instant bufferEnd = scheduledEnd.plus(15, ChronoUnit.MINUTES);
        
        // Query: find sessions where user is either mentor or learner
        // AND session status is SCHEDULED or AWAITING_CONFIRMATION
        // AND time ranges overlap
        List<Session> conflicts = sessionRepository.findConflicting(
            userId, 
            bufferStart, 
            bufferEnd,
            List.of(SessionStatus.SCHEDULED, SessionStatus.AWAITING_CONFIRMATION)
        );
        
        if (!conflicts.isEmpty()) {
            throw new ScheduleConflictException(
                "Time slot conflicts with existing session: " + conflicts.get(0).getId(),
                conflicts.get(0).getScheduledStart(),
                conflicts.get(0).getScheduledEnd()
            );
        }
    }
}
```

### 3.2 SQL Query for Conflict Detection

```sql
-- Migration: V11__schedule_conflict_index.sql
CREATE INDEX idx_sessions_schedule_conflict 
    ON sessions (scheduled_start, scheduled_end, status)
    WHERE status IN ('SCHEDULED', 'AWAITING_CONFIRMATION');

-- Query (called from repository)
SELECT s.* FROM sessions s
WHERE (s.mentor_id = :userId OR s.learner_id = :userId)
  AND s.status IN ('SCHEDULED', 'AWAITING_CONFIRMATION')
  AND s.scheduled_start < :bufferEnd
  AND s.scheduled_end > :bufferStart;
```

### 3.3 Where Conflict Checks Must Run

1. **`POST /api/v1/learning-requests`** — check BOTH learner AND mentor
2. **`POST /api/v1/learning-requests/{id}/accept`** — re-check mentor (may have accepted another session since)
3. **`PATCH /api/v1/sessions/{id}`** — if rescheduling, re-validate

### 3.4 Error Response Format

```json
{
  "status": 409,
  "error": "SCHEDULE_CONFLICT",
  "message": "This time slot conflicts with an existing session",
  "conflictingSession": {
    "sessionId": "uuid",
    "scheduledStart": "2026-09-01T10:00:00Z",
    "scheduledEnd": "2026-09-01T11:00:00Z"
  }
}
```

---

## 4. Point System & Wallet Enhancements

Based on the point flow specification:

![Point Flow](./point_flow.png)

### 4.1 Point Flow Rules (MUST MATCH)

| Action | Flow | Amount | Ledger Type |
|--------|------|--------|-------------|
| New registration | System → User | **+30** | `REGISTRATION_BONUS` |
| Skill Points payment | Learner −X → Mentor +X | Variable (offering price) | `ESCROW_HOLD` → `ESCROW_RELEASE` |
| Volunteer completed | System → Mentor | **+5** | `VOLUNTEER_REWARD` |
| Submit review | System → Reviewer | **+3** | `REVIEW_REWARD` |
| Skill Swap | **No points transferred** | 0 | No ledger entry |
| Referral signup | System → Referrer | **+5** | `REFERRAL_BONUS` |
| Milestone reached | System → User | **+5 to +10** | `MILESTONE_BONUS` |
| Helpful forum comment | System → Commenter | **+5** | `FORUM_REWARD` |

### 4.2 New Ledger Types Required

Add to `PointLedgerType` enum:
```java
public enum PointLedgerType {
    REGISTRATION_BONUS,
    ESCROW_HOLD,
    ESCROW_RELEASE,
    ESCROW_REFUND,
    FORUM_REWARD,
    ADMIN_ADJUSTMENT,
    // NEW:
    VOLUNTEER_REWARD,     // +5 for mentor after volunteer session completed
    REVIEW_REWARD,        // +3 for submitting a review
    REFERRAL_BONUS,       // +5 when referred user registers
    MILESTONE_BONUS,      // +5 to +10 for reaching milestones
    POINT_TRANSFER        // direct student-to-student transfer
}
```

### 4.3 Volunteer Reward Logic

When a VOLUNTEER session is completed (double-confirmed):
```java
// In SessionCompletionService.completeSession()
if (session.getMode() == SessionMode.VOLUNTEER && bothConfirmed) {
    walletService.creditPoints(
        session.getMentorId(), 
        5, 
        PointLedgerType.VOLUNTEER_REWARD,
        "session", 
        session.getId()
    );
}
```

### 4.4 Review Reward Logic

When a user submits a review after session completion:
```java
// In ReviewService.submitReview()
if (review.getRating() != null) {
    walletService.creditPoints(
        review.getReviewerId(),
        3,
        PointLedgerType.REVIEW_REWARD,
        "review",
        review.getId()
    );
}
```

### 4.5 Teaching Points (Skill Points Mode)

Teaching reward is variable (+10 to +50 based on offering price):
- This is already handled by escrow release (Learner pays X, Mentor receives X)
- No additional system reward needed for POINTS mode — the payment IS the reward

---

## 5. Skill Swap Workflow Fixes

### 5.1 Current Issues

- Offering creation doesn't validate `teachUserSkillId` ownership
- Reciprocal match validation is incomplete
- Swap status transitions not fully implemented

### 5.2 Required Validation Chain

```
1. Learner clicks "Request Session" with mode=SKILL_SWAP
2. Backend validates:
   a. Offering has skillSwapEnabled=true
   b. offeredUserSkillId belongs to requester, is TEACH, is visible
   c. Mentor has a LEARN skill matching the offered skill category
   d. No scheduling conflict exists
3. Creates learning_request (status=PENDING) + skill_swap (status=PROPOSED)
4. Mentor accepts:
   a. Re-validate skills still exist
   b. learning_request → ACCEPTED, skill_swap → ACCEPTED
   c. Session created (mode=SKILL_SWAP)
5. Both confirm completion:
   a. Session → COMPLETED, skill_swap → COMPLETED  
   b. NO point movements whatsoever
```

### 5.3 Counter-Proposal Support

```
POST /api/swaps/proposals/{id}/counter
{
  "alternativeSkillId": "uuid",
  "message": "I'd prefer to swap for TypeScript instead"
}
```

State: `PROPOSED` → `COUNTER_PROPOSED` → `ACCEPTED` or `REJECTED`

---

## 6. Mentor Application & Admin Approval

### 6.1 Current Flow (Self-Serve)

Currently, adding a TEACH skill or creating a mentor offering auto-promotes to MENTOR role. No admin gate.

### 6.2 Enhanced Flow (Admin Approval Required)

Add a new mentor application workflow:

**New Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v1/me/mentor-application` | Submit mentor application |
| `GET` | `/api/v1/me/mentor-application` | Check application status |
| `GET` | `/api/v1/admin/mentor-applications` | List pending applications (Admin) |
| `POST` | `/api/v1/admin/mentor-applications/{id}/approve` | Approve application (Admin) |
| `POST` | `/api/v1/admin/mentor-applications/{id}/reject` | Reject with reason (Admin) |

**Application Payload:**
```json
{
  "teachSkillIds": ["uuid1", "uuid2"],
  "experience": "2 years teaching Java...",
  "certificateIds": ["uuid"],
  "motivation": "I want to help students..."
}
```

**State Machine:**
```
NONE → PENDING (user applies)
PENDING → APPROVED (admin approves → insert MENTOR into user_roles)
PENDING → REJECTED (admin rejects with reason → user can re-apply)
```

**Database Migration:**
```sql
-- V12__mentor_applications.sql
CREATE TABLE mentor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    experience TEXT,
    motivation TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mentor_application_skills (
    application_id UUID NOT NULL REFERENCES mentor_applications(id),
    skill_id UUID NOT NULL REFERENCES skills(id),
    PRIMARY KEY (application_id, skill_id)
);
```

---

## 7. Google Meet Integration

### 7.1 Current State

Meeting URL is a manual text field — no automatic Google Meet room creation.

### 7.2 Option A: Manual URL (Keep Current)

- Mentor provides Google Meet URL when accepting or via session update
- Frontend displays "Join Google Meet" link
- **No backend changes needed**

### 7.3 Option B: Auto-Generate via Google Calendar API (Phase 2)

If auto-generation is desired:

**New Endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v1/integrations/google/connect` | OAuth2 flow start |
| `GET` | `/api/v1/integrations/google/callback` | OAuth2 callback |
| `POST` | `/api/v1/sessions/{id}/generate-meet-link` | Create Google Meet room |

**Dependencies:**
- Google Cloud Console project with Calendar API enabled
- OAuth2 client credentials
- `google-api-services-calendar` Java dependency
- Token storage per user (encrypted in DB)

**Recommendation:** Start with Option A (manual URL). Add Option B in a later phase.

---

## 8. Referral System (NEW)

### 8.1 Database Schema

```sql
-- V13__referral_system.sql
ALTER TABLE users ADD COLUMN referral_code VARCHAR(12) UNIQUE;
ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id);

CREATE TABLE referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID NOT NULL REFERENCES users(id),
    points_awarded INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(referrer_id, referred_id)
);
```

### 8.2 Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/me/referral-code` | Get or generate user's referral code |
| `POST` | `/api/v1/auth/register` | Accept optional `referralCode` field |
| `GET` | `/api/v1/me/referrals` | List my referred users and reward status |

### 8.3 Logic

1. On registration with valid `referralCode`:
   - Set `referred_by` on new user
   - Award +5 points to referrer (`REFERRAL_BONUS`)
   - Create `referral_rewards` record
   - Send notification to referrer
2. Referral codes: auto-generate 8-char alphanumeric on first request
3. Self-referral prevention: reject if `referralCode` belongs to the registering user

---

## 9. Milestone Points (NEW)

### 9.1 Milestone Definitions

```sql
-- V14__milestones.sql
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    condition_type VARCHAR(50) NOT NULL,  -- SESSIONS_COMPLETED, REVIEWS_GIVEN, SKILLS_TAUGHT, etc.
    condition_value INTEGER NOT NULL,
    points_reward INTEGER NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    milestone_id UUID NOT NULL REFERENCES milestones(id),
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    points_awarded INTEGER NOT NULL,
    UNIQUE(user_id, milestone_id)
);
```

### 9.2 Seed Milestones

| Code | Condition | Reward |
|------|-----------|--------|
| `FIRST_SESSION` | Complete 1 session | +5 pts |
| `FIVE_SESSIONS` | Complete 5 sessions | +10 pts |
| `TEN_SESSIONS` | Complete 10 sessions | +10 pts |
| `FIRST_TEACH` | Teach your first session | +5 pts |
| `FIVE_REVIEWS` | Submit 5 reviews | +5 pts |
| `FIRST_SWAP` | Complete first skill swap | +5 pts |
| `VOLUNTEER_HERO` | Complete 5 volunteer sessions | +10 pts |
| `PERFECT_RATING` | Maintain 5.0 rating for 10+ reviews | +10 pts |

### 9.3 Milestone Check Service

```java
@Service
public class MilestoneService {
    // Call after session completion, review submission, etc.
    public void checkAndAwardMilestones(UUID userId) {
        List<Milestone> unachieved = milestoneRepo.findUnachievedByUser(userId);
        for (Milestone m : unachieved) {
            int current = countProgress(userId, m.getConditionType());
            if (current >= m.getConditionValue()) {
                userMilestoneRepo.save(new UserMilestone(userId, m.getId(), m.getPointsReward()));
                walletService.creditPoints(userId, m.getPointsReward(), MILESTONE_BONUS, "milestone", m.getId());
                notificationService.send(userId, "🏆 Milestone achieved: " + m.getTitle());
            }
        }
    }
}
```

### 9.4 Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/me/milestones` | List all milestones with user progress |
| `GET` | `/api/v1/admin/milestones` | Admin: list/manage milestones |
| `POST` | `/api/v1/admin/milestones` | Admin: create new milestone |
| `PATCH` | `/api/v1/admin/milestones/{id}` | Admin: update milestone |

---

## 10. Watchlist Persistence (Phase 2)

Frontend will start with localStorage. When ready for server persistence:

```sql
-- V15__watchlist.sql
CREATE TABLE watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('SKILL', 'MENTOR')),
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, item_type, item_id)
);
```

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/me/watchlist` | List saved items |
| `POST` | `/api/v1/me/watchlist` | Add to watchlist |
| `DELETE` | `/api/v1/me/watchlist/{id}` | Remove from watchlist |

---

## 11. Database Migrations Required

| Migration | Purpose | Priority |
|-----------|---------|----------|
| `V11__schedule_conflict_index.sql` | Index for conflict detection query | 🔴 Critical |
| `V12__mentor_applications.sql` | Mentor application + review workflow | 🟡 High |
| `V13__referral_system.sql` | Referral codes, rewards tracking | 🟡 High |
| `V14__milestones.sql` | Achievement milestones + user progress | 🟡 High |
| `V15__watchlist.sql` | Server-persisted bookmarks | 🟢 Phase 2 |
| `V16__session_recording_urls.sql` | Add `recording_url` column to sessions | 🟢 Phase 2 |
| `V17__add_scheduled_end_column.sql` | Add `scheduled_end` computed column to sessions | 🔴 Critical |

### V17 Detail (Critical for Conflict Detection):
```sql
-- V17__add_scheduled_end_column.sql
ALTER TABLE sessions 
    ADD COLUMN scheduled_end TIMESTAMPTZ 
    GENERATED ALWAYS AS (scheduled_start + (duration_minutes * INTERVAL '1 minute')) STORED;

CREATE INDEX idx_sessions_time_range 
    ON sessions (scheduled_start, scheduled_end) 
    WHERE status IN ('SCHEDULED', 'AWAITING_CONFIRMATION');
```

---

## 12. API Endpoint Summary

### New Endpoints (Must Build)

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | `POST` | `/api/v1/learning-requests` | Create booking request |
| 2 | `GET` | `/api/v1/learning-requests` | List requests (direction + status filter) |
| 3 | `GET` | `/api/v1/learning-requests/{id}` | Request detail |
| 4 | `POST` | `/api/v1/learning-requests/{id}/accept` | Mentor accepts |
| 5 | `POST` | `/api/v1/learning-requests/{id}/reject` | Mentor rejects |
| 6 | `POST` | `/api/v1/learning-requests/{id}/cancel` | Learner cancels |
| 7 | `POST` | `/api/v1/me/mentor-application` | Submit mentor application |
| 8 | `GET` | `/api/v1/me/mentor-application` | Check application status |
| 9 | `GET` | `/api/v1/admin/mentor-applications` | List pending applications |
| 10 | `POST` | `/api/v1/admin/mentor-applications/{id}/approve` | Approve mentor |
| 11 | `POST` | `/api/v1/admin/mentor-applications/{id}/reject` | Reject mentor |
| 12 | `GET` | `/api/v1/me/referral-code` | Get referral code |
| 13 | `GET` | `/api/v1/me/referrals` | List referral rewards |
| 14 | `GET` | `/api/v1/me/milestones` | User milestone progress |
| 15 | `GET` | `/api/v1/admin/milestones` | Admin milestone management |
| 16 | `POST` | `/api/v1/admin/milestones` | Create milestone |
| 17 | `PATCH` | `/api/v1/admin/milestones/{id}` | Update milestone |
| 18 | `GET` | `/api/v1/me/watchlist` | Watchlist (Phase 2) |
| 19 | `POST` | `/api/v1/me/watchlist` | Add to watchlist (Phase 2) |
| 20 | `DELETE` | `/api/v1/me/watchlist/{id}` | Remove from watchlist (Phase 2) |

### Existing Endpoints (Must Fix/Enhance)

| # | Endpoint | Fix Needed |
|---|----------|------------|
| 1 | `GET /api/v1/mentors/{id}/availability` | Implement real availability calculation (currently returns empty) |
| 2 | `POST /api/v1/auth/register` | Add `referralCode` field, award +30 (not +50) registration bonus |
| 3 | `POST /api/sessions/{id}/complete` | Add VOLUNTEER_REWARD (+5) and REVIEW_REWARD (+3) point awards |
| 4 | `POST /api/v1/me/mentor-offerings` | Validate teachUserSkillId ownership, direction=TEACH, visible=true |
| 5 | `POST /api/reviews/sessions/{sessionId}` | Award +3 review points to reviewer |
| 6 | Escrow release | Call milestoneService.checkAndAwardMilestones() after completion |

### CORS Configuration

Ensure all new endpoints are covered:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "http://localhost:5173",
        "https://your-lovable-domain.lovable.app"
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return config;
}
```

---

> **Next Steps:** Backend team should implement in this order:
> 1. V17 migration (scheduled_end) + V11 (conflict index)
> 2. Learning requests service (Section 2) + conflict detection (Section 3)  
> 3. Point rewards (volunteer +5, review +3)
> 4. Mentor application workflow (Section 6)
> 5. Referral system (Section 8)
> 6. Milestones (Section 9)
> 7. Watchlist persistence (Phase 2)
