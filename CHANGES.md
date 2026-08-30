# CHANGES.md — SkillBridge Frontend RBAC & Netflix-Inspired Feature Plan (v2)

> **Stack:** TanStack Start (React 19) + Vite + Neon PostgreSQL + Spring Boot 3.x REST (`VITE_API_BASE_URL=http://localhost:9095`)  
> **Pattern:** `One login page → One set of shared pages → Role-guarded routes + Role-conditioned UI`  
> **Authority:** Backend JWT `roles` claim is truth; frontend only hides/shows + redirects. Never trust `localStorage` alone.  
> **Date:** 2026-08-29 (Updated)  
> **Companion Docs:** [`backendchanges.md`](./backendchanges.md) (backend API requirements), [`implementation_plan.md`](./implementation_plan.md) (execution plan)

---

## Table of Contents

1. [Decision Summary](#1-decision-summary)
2. [Role Model (Traced from Backend)](#2-role-model-traced-from-backend)
3. [Auth Workflow (Single Login)](#3-auth-workflow-single-login)
4. [Route & Guard Strategy](#4-route--guard-strategy)
5. [Page Inventory — Existing vs New](#5-page-inventory--existing-vs-new)
6. [Netflix-Inspired UX Mapping](#6-netflix-inspired-ux-mapping)
7. [Learning Request & Session Booking Flow (NEW — Critical Fix)](#7-learning-request--session-booking-flow-new--critical-fix)
8. [Schedule Conflict Detection](#8-schedule-conflict-detection)
9. [Point System & Wallet Workflow](#9-point-system--wallet-workflow)
10. [Skill Swap Workflow](#10-skill-swap-workflow)
11. [Mentor Application & Admin Approval](#11-mentor-application--admin-approval)
12. [Referral System](#12-referral-system)
13. [Milestone & Achievement System](#13-milestone--achievement-system)
14. [Component & Hook Changes](#14-component--hook-changes)
15. [Data Fetching & State](#15-data-fetching--state)
16. [Backend Sync Checklist](#16-backend-sync-checklist)
17. [Implementation Phases](#17-implementation-phases)
18. [File-Level Change Map](#18-file-level-change-map)
19. [Verification & Acceptance](#19-verification--acceptance)

---

## 1. Decision Summary

**Question:** Create 3 parallel page trees for Learner / Instructor / Admin?

**Answer: No.**

| Approach | Maintenance | Security | UX | Verdict |
|---|---|---|---|---|
| **A. 3x page trees** (`/learner/*`, `/instructor/*`, `/admin/*`) | 3x duplication, 3x `routeTree.gen.ts` drift | 3 token issuers, refresh family broken | Deep-link chaos, SEO duplication | ❌ Rejected |
| **B. One tree + guards + conditional UI (Chosen)** | 1 tree, DRY | Single JWT issuer, `user_roles` as source | One login, role-aware redirect | ✅ Adopted |

Justification verified in code: `src/routeTree.gen.ts:44` already has 5 routes, none guarded; `src/context/auth-context.tsx:131` only knows `ADMIN`; `src/components/app-sidebar.tsx:38` bug `auth.isAdmin || true` exposes admin to all. Fixing guards is cheaper and safer than cloning pages (see `forbackend.md:155` — single `users` table is intended).

---

## 2. Role Model (Traced from Backend)

```
Neon PostgreSQL
  users(id, email, display_name, ...)
  user_roles(user_id FK, role CHECK IN ('USER','MENTOR','ADMIN'), PK(user_id,role))
  user_skills, mentor_offerings, wallets ...

Spring Security
  JwtAuthFilter → Authentication { authorities: ROLE_USER | ROLE_MENTOR | ROLE_ADMIN }
  @PreAuthorize("hasRole('ADMIN')") on /api/v1/admin/**
  @PreAuthorize("hasRole('MENTOR')") on POST /api/v1/me/mentor-offerings
  @PreAuthorize("isAuthenticated()") on /api/v1/me, /api/v1/skills, /api/sessions

JWT (access 30m, refresh 30d, rotated)
  { sub: uuid, roles: ["USER"] | ["USER","MENTOR"] | ["ADMIN"], exp }

Frontend (TanStack Start)
  AuthContext { isLearner, isInstructor, isAdmin, hasRole(), isLoading }
  localStorage STORAGE_KEYS USER + ACCESS_TOKEN + REFRESH_TOKEN (src/lib/api-client.ts:7)
```

**Mapping:**

| Product Role | DB Role | JWT Claim | Frontend Helper | Capabilities |
|---|---|---|---|---|
| **Learner** | `USER` | `USER` | `isLearner` (default, everyone authed) | Browse mentors, book POINTS/VOLUNTEER, forum, sessions as learner, wallet |
| **Instructor** | `MENTOR` | `MENTOR` (implies `USER`) | `isInstructor` | Everything learner can + manage TEACH skills, CRUD `mentor_offerings`, receive escrow, handle skill-swap proposals, see incoming requests |
| **Admin** | `ADMIN` | `ADMIN` | `isAdmin` | Full moderation: `GET /api/v1/admin/**`, disputes, reports, user status, reward settings, audit log |

Promotion: `USER` on `POST /api/v1/auth/register`. Becoming Instructor = submit mentor application → admin approves → `MENTOR` inserted into `user_roles`. No role picker at signup.

---

## 3. Auth Workflow (Single Login)

```
[ /login page ] → authService.login({email,password}) → POST /api/v1/auth/login
  → AuthResponse { accessToken, refreshToken, user:{roles[]} } (src/types/api.ts:66)
  → setAccessToken / setRefreshToken / localStorage USER (src/lib/api-client.ts:21)
  → fetchCurrentProfile() → GET /api/v1/me (src/context/auth-context.tsx:45)
  → normalize roles (strip ROLE_ prefix, upper-case)
  → redirect by role:
      ADMIN  → /admin
      MENTOR → /  (dashboard with instructor section)
      USER   → /  (dashboard)
```

**Registration** includes optional `referralCode` field → referrer gets +5 points.

**Refresh:** `src/lib/api-client.ts:173` concurrency-locked `401 → POST /api/v1/auth/refresh` with queue. Keep as is. Add `403 → toast "Permission denied" + redirect /` (not logout).

**Logout:** `POST /api/v1/auth/logout` → `clearAuth()` → `Navigate /login`.

**Instructor upgrade CTA** (gated by admin approval): When `isLearner && !isInstructor`, show banner on `/` and `/mentors`: *"Teach what you know — Become an Instructor"* → navigate to `/mentor-application`.

---

## 4. Route & Guard Strategy

**Principle:** TanStack Router `beforeLoad` throws `redirect`. No component-level `if (!isAdmin) return null` as sole gate.

```ts
// src/lib/route-guards.ts (new)
export const requireAuth = () => { if(!getAccessToken()) throw redirect({to:"/login"}) }
export const requireRole = (...roles: AppRole[]) => () => {
  const u = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "null");
  if(!hasRole(u,...roles)) throw redirect({to:"/"});
}
```

| Route | File | Guard | Who Sees |
|---|---|---|---|
| `/login` | `src/routes/login.tsx` **(new)** | `guestOnly` (authed → redirect by role) | Guest only |
| `/` Dashboard | `src/routes/index.tsx:41` | `requireAuth` | All authed (UI adapts by role) |
| `/mentors` Browse Mentors | `src/routes/mentors.tsx:46` | `requireAuth` | All authed |
| **`/browse` Netflix Browse** | `src/routes/browse.tsx` **(new)** | `requireAuth` | All authed — Netflix rails |
| **`/skill/$skillId` Skill Detail** | `src/routes/skill.$skillId.tsx` **(new)** | `requireAuth` | All authed — Netflix title page |
| `/forum` | `src/routes/forum.tsx:34` | `requireAuth` | All authed |
| `/sessions` My Sessions | `src/routes/sessions.tsx:30` | `requireAuth` | All authed (tabs filter by role) |
| **`/instructor`** Dashboard | `src/routes/instructor.tsx` **(new)** | `requireRole("MENTOR","ADMIN")` | Instructor/Admin |
| **`/mentor-application`** | `src/routes/mentor-application.tsx` **(new)** | `requireAuth` | USER without MENTOR |
| `/admin` | `src/routes/admin.tsx:39` | `requireRole("ADMIN")` | Admin only |
| **`/watchlist` My List** | `src/routes/watchlist.tsx` **(new)** | `requireAuth` | All authed |

Layout `src/routes/__root.tsx:142` keeps `AuthProvider` as outermost; add `PendingAuth` skeleton while `isLoading` to avoid guard flash.

---

## 5. Page Inventory — Existing vs New

### 5.1 Existing Pages (Keep, Fix Guards + Wire to Real API)

**CRITICAL: All 5 existing pages currently use 100% mock/hardcoded data. Every page must be rewired to real API hooks.**

| Page | Current State | Change |
|---|---|---|
| `/` Dashboard `src/routes/index.tsx` | Mock metrics, skills, certificates, activity log | Wire to `useWalletBalanceQuery`, `useUserSkillsQuery`, `useProfileQuery`, `useWalletTransactionsQuery`; add Continue Learning rail; add Instructor section when `isInstructor`; add milestones + referral sections |
| `/mentors` `src/routes/mentors.tsx` | Mock array of 6 mentors, booking only shows toast | **CRITICAL FIX:** Wire to `useMentorsSearchQuery` + `useMentorAvailabilityQuery`; replace toast-only booking with `useCreateLearningRequestMutation`; add conflict detection |
| `/forum` `src/routes/forum.tsx` | Mock posts, likes, comments — all local state | Wire to `useForumPostsQuery`, `useForumTopVolunteersQuery`, `useCreateForumPostMutation`, like/unlike/comment mutations; wire "Request Free Session" to learning request |
| `/sessions` `src/routes/sessions.tsx` | Mock hardcoded session arrays | **CRITICAL FIX:** Wire to `useSessionsQuery(status)` per tab + `useLearningRequestsQuery` for pending; wire completion/dispute/review actions |
| `/admin` `src/routes/admin.tsx` | Mock stats, flagged content, settings — all local state | Wire to `useAdminMetricsQuery`, `useAdminReportsQuery`, `useAdminSettingsQuery`; add mentor application review tab; add dispute resolution; add `beforeLoad` guard |

### 5.2 New Pages

| # | Route | Netflix Analog | Purpose | Key Features | Backend Source |
|---|---|---|---|---|---|
| **N1** | `/login` | Netflix Gate | Auth entry for all 3 roles | Single form, registration with referral code, "+30 starter points" preview, role-aware redirect | `POST /api/v1/auth/login/register` |
| **N2** | `/browse` | Netflix Home / Browse | Immersive skill discovery | Hero banner, category rails, Top 10 Mentors, hover preview card, quick Request modal | `GET /api/v1/skills/categories` + `GET /api/v1/mentors` |
| **N3** | `/skill/$skillId` | Netflix Title Detail | Deep dive on a skill | Skill header, mentor rail, forum threads, Add to My List, avg rating | `GET /api/skills/{id}`, `GET /api/v1/mentors?skillId` |
| **N4** | `/watchlist` (My List) | My List | Bookmark skills/mentors | Grid of saved items, remove, move to request | localStorage → future `POST /api/v1/me/watchlist` |
| **N5** | `/instructor` | Creator Studio | Instructor home | Stats, offerings CRUD, incoming requests/swaps, earnings, session calendar | `/api/v1/me/mentor-offerings`, `/api/v1/learning-requests`, wallet |
| **N6** | `/mentor-application` | — | Become an Instructor | Skill selection, certificate upload, experience, submit for admin review | `POST /api/v1/me/mentor-application` |

---

## 6. Netflix-Inspired UX Mapping

| Netflix Pattern | SkillBridge Translation | Component (New/Reuse) |
|---|---|---|
| Hero billboard + `Play`/`My List` | Featured Skill hero + `Find Mentors` + `Add to My List` | `src/components/browse/hero-banner.tsx` (new) |
| Horizontal rails + left/right chevrons | Category rails (`Programming · Design · Languages`) scroll with `embla-carousel-react` | `src/components/browse/skill-rail.tsx` (new) |
| Hover preview (enlarges, auto-play) | Hover mentor card: expands to show modes, cost, `Request` CTA | Extend `MentorCard` + `src/components/browse/mentor-preview-card.tsx` (new) |
| My List (bookmark) | Bookmark skill/mentor for later — heart icon on card | `useWatchlist()` hook (localStorage) + `src/routes/watchlist.tsx` |
| Continue Watching progress bar | Escrow countdown bar: 18h auto-release thin progress | `src/components/sessions/escrow-progress.tsx` (new) |
| Top 10 row with big numbers | Top Volunteer Mentors this week with ranking numbers | Reuse `TOP_MENTORS` → `useForumTopVolunteersQuery` |
| Categories dropdown + search | Sticky `TopNav` search drives global `?q` → `/browse?q=` | Enhance search in `src/components/top-nav.tsx` |
| Profile gate (Who's watching) | Role badges in dropdown: `Learner · Instructor · Admin` | Add role badges in `src/components/top-nav.tsx` |

Design tokens: keep existing `tailwindcss 4.2.1` + `shadcn` (`components.json`), reuse `Card rounded-xl`, `Badge rounded-full`, `Avatar`.

---

## 7. Learning Request & Session Booking Flow (NEW — Critical Fix)

**This is the most critical gap.** Currently, clicking "Send Request" on `/mentors` only shows a toast. No API call. No session created. No update to `/sessions`.

### 7.1 End-to-End Flow (Fixed)

```
LEARNER: /mentors → selects mentor → opens RequestSessionDialog
  → picks date/time from REAL availability (GET /api/v1/mentors/{id}/availability)
  → selects mode: POINTS | SKILL_SWAP | VOLUNTEER
  → frontend conflict check (hasConflict())
  → "Send Request" → POST /api/v1/learning-requests
  → backend validates: balance, conflict (both users), skill match
  → status = PENDING, escrow held (if POINTS)
  → notification sent to mentor
  → learner redirected to /sessions (Pending tab)

MENTOR: /instructor → Incoming Requests tab
  → sees pending request with details
  → "Accept" → POST /api/v1/learning-requests/{id}/accept
  → backend: re-checks conflict, creates session (SCHEDULED), optionally sets meetingUrl
  → notification sent to learner
  → session now appears in BOTH users' /sessions (Active tab)

  OR "Reject" → POST /api/v1/learning-requests/{id}/reject
  → escrow refunded to learner, notification sent

SESSION: /sessions → Active tab
  → "Join Google Meet" → opens meetingUrl in new tab
  → "Mark Complete" → POST /api/sessions/{id}/complete (1st confirmation)
  → OTHER party also confirms (2nd confirmation)
  → Points released (POINTS mode), or +5 mentor (VOLUNTEER), or nothing (SWAP)
  → +3 review points if review submitted
  → milestone check triggered
```

### 7.2 New Service & Hooks Required

```
NEW: src/services/learning-requests.service.ts
  createRequest(data)  → POST /api/v1/learning-requests
  listRequests(params) → GET /api/v1/learning-requests
  getRequest(id)       → GET /api/v1/learning-requests/{id}
  acceptRequest(id)    → POST /api/v1/learning-requests/{id}/accept
  rejectRequest(id)    → POST /api/v1/learning-requests/{id}/reject
  cancelRequest(id)    → POST /api/v1/learning-requests/{id}/cancel

NEW: src/hooks/api/use-learning-requests.ts
  useLearningRequestsQuery(direction, status)
  useCreateLearningRequestMutation()  ← THE KEY MISSING MUTATION
  useAcceptRequestMutation()
  useRejectRequestMutation()
  useCancelRequestMutation()
```

---

## 8. Schedule Conflict Detection

### 8.1 Frontend-Side (Defense-in-Depth)

```ts
// src/lib/schedule-conflict.ts (new)
interface TimeSlot { start: Date; end: Date; }

export function hasConflict(
  newSlot: TimeSlot,
  existingSessions: Session[],
  bufferMinutes: number = 15
): { hasConflict: boolean; conflictingSession?: Session } {
  const bufferedStart = subMinutes(newSlot.start, bufferMinutes);
  const bufferedEnd = addMinutes(newSlot.end, bufferMinutes);
  
  for (const session of existingSessions) {
    const sessionStart = new Date(session.scheduledStart);
    const sessionEnd = addMinutes(sessionStart, session.durationMinutes);
    
    // Overlap check: two intervals overlap if start1 < end2 AND start2 < end1
    if (bufferedStart < sessionEnd && sessionStart < bufferedEnd) {
      return { hasConflict: true, conflictingSession: session };
    }
  }
  return { hasConflict: false };
}

export function getAvailableSlots(
  date: Date,
  existingSessions: Session[],
  mentorAvailability: TimeSlot[],
  durationMinutes: number,
  bufferMinutes: number = 15
): TimeSlot[] {
  // For each mentor availability window:
  //   1. Subtract already-booked sessions (with buffer)
  //   2. Split remaining into slots of durationMinutes
  //   3. Return only slots that don't conflict with LEARNER's sessions too
}
```

### 8.2 Where Conflict Checks Run

| Location | What's Checked | Who |
|---|---|---|
| `/mentors` booking dialog (frontend) | Check learner's existing sessions against selected time | Learner |
| `POST /api/v1/learning-requests` (backend) | Check BOTH learner AND mentor sessions | Server (authoritative) |
| `POST /api/v1/learning-requests/{id}/accept` (backend) | Re-check mentor (may have accepted another since) | Server |
| `PATCH /api/sessions/{id}` (backend) | If rescheduling, re-validate both users | Server |

### 8.3 Error Handling

```
409 SCHEDULE_CONFLICT response:
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

Frontend: Show conflict dialog with details + "Choose Another Time" button
```

---

## 9. Point System & Wallet Workflow

### 9.1 Point Flow Rules

| Action | Flow | Amount | Ledger Type | Frontend Display |
|---|---|---|---|---|
| New registration | System → User | **+30** | `REGISTRATION_BONUS` | Welcome toast: "You got 30 starter points!" |
| Skill Points payment | Learner −X → Escrow → Mentor +X | Variable | `ESCROW_HOLD` → `ESCROW_RELEASE` | Escrow progress bar |
| Volunteer completed | System → Mentor | **+5** | `VOLUNTEER_REWARD` | Completion toast: "+5 pts for volunteering!" |
| Submit review | System → Reviewer | **+3** | `REVIEW_REWARD` | Review toast: "+3 pts for your review!" |
| Skill Swap | **No points** | 0 | None | "No points exchanged — knowledge swap!" |
| Referral signup | System → Referrer | **+5** | `REFERRAL_BONUS` | Notification: "Your friend joined! +5 pts" |
| Milestone reached | System → User | **+5 to +10** | `MILESTONE_BONUS` | Achievement popup with badge |
| Helpful forum comment | System → Commenter | **+5** | `FORUM_REWARD` | Toast: "+5 pts for helpful answer!" |

### 9.2 Escrow Lifecycle (POINTS mode only)

```
1. Learner books session → price locked from available_points to held_points
2. Mentor accepts → session SCHEDULED, escrow HELD
3a. BOTH confirm completion → held_points released to mentor (ESCROW_RELEASE)
3b. 18h auto-release → same as 3a (if no dispute)
3c. Dispute filed → escrow frozen, admin arbitrates
3d. Request rejected/cancelled → held_points returned to learner (ESCROW_REFUND)
```

### 9.3 Transaction History UI

Dashboard `/` will show:
- **Wallet card:** Available pts | Held in escrow | Total earned | Total spent
- **Transaction table:** Date | Activity | Type badge (Earned/Spent/Held/Refund/Bonus) | Points delta
- **CSV export button** → `walletService.exportTransactionsCsv()`
- **Filter by type** dropdown

---

## 10. Skill Swap Workflow

### 10.1 How It Works

Skill swap = "I know Java, you know Python, let's teach each other." **No points are transferred.**

```
1. LEARNER browses mentors → finds mentor offering with skillSwapEnabled=true
2. LEARNER selects "Skill Exchange" mode in booking dialog
3. Frontend checks: does learner have a TEACH skill that mentor wants to LEARN?
   → If match found: shows matching skill selector
   → If no match: shows "No compatible skills" alert
4. LEARNER submits swap proposal → POST /api/v1/learning-requests (mode=SKILL_SWAP)
5. Backend validates reciprocal match:
   a. Learner's offeredUserSkillId is TEACH + visible + owned by learner
   b. Mentor has a LEARN skill matching the offered skill
6. MENTOR sees proposal in /instructor → Incoming Swaps tab
   → Can Accept, Reject, or Counter-Propose (suggest different skill)
7. On accept: session created (mode=SKILL_SWAP), swap status=ACCEPTED
8. Session happens → both confirm completion → swap status=COMPLETED
9. NO point movements at any step
```

### 10.2 Counter-Proposal

Mentor can suggest a different skill: "Instead of Java, can you teach me TypeScript?"
- State: `PROPOSED` → `COUNTER_PROPOSED` → `ACCEPTED` or `REJECTED`

---

## 11. Mentor Application & Admin Approval

### 11.1 Flow

```
USER sees "Become an Instructor" CTA on dashboard/mentors page
  → navigates to /mentor-application
  → selects TEACH skills from catalog
  → uploads certificates (optional)
  → writes experience & motivation
  → submits application → POST /api/v1/me/mentor-application
  → status = PENDING

ADMIN sees pending applications in /admin → Mentor Applications tab
  → reviews application, certificates, experience
  → "Approve" → inserts MENTOR into user_roles
  → "Reject" → sends rejection reason to user
  → notification sent to applicant either way

USER receives notification
  → if approved: sidebar gains Instructor group, can create offerings
  → if rejected: can re-apply with improvements
```

---

## 12. Referral System

### 12.1 Flow

```
1. Every user has a unique referral code (auto-generated 8-char alphanumeric)
2. User shares: "skillbridge.app/register?ref=ABC12345"
3. New user registers with referral code
4. Backend awards +5 to referrer (REFERRAL_BONUS)
5. Referrer gets notification: "Your friend joined! +5 pts"
```

### 12.2 Dashboard UI

- Referral code with copy button
- Share via link generator
- List of referred users
- Total referral earnings

---

## 13. Milestone & Achievement System

### 13.1 Milestone Definitions

| Code | Condition | Reward | Icon |
|------|-----------|--------|------|
| `FIRST_SESSION` | Complete 1 session | +5 pts | 🎯 |
| `FIVE_SESSIONS` | Complete 5 sessions | +10 pts | ⭐ |
| `TEN_SESSIONS` | Complete 10 sessions | +10 pts | 🏆 |
| `FIRST_TEACH` | Teach your first session | +5 pts | 👩‍🏫 |
| `FIVE_REVIEWS` | Submit 5 reviews | +5 pts | 📝 |
| `FIRST_SWAP` | Complete first skill swap | +5 pts | 🔄 |
| `VOLUNTEER_HERO` | Complete 5 volunteer sessions | +10 pts | ❤️ |
| `PERFECT_RATING` | 5.0 rating for 10+ reviews | +10 pts | 💯 |

### 13.2 UI

- Dashboard section: milestone badges grid with progress bars
- Achievement popup notification when unlocked
- Profile badge display

---

## 14. Component & Hook Changes

**New libs (no new npm deps needed):**
* `src/lib/rbac.ts` — `normalize`, `hasRole`, `AppRole` type.
* `src/lib/route-guards.ts` — `requireAuth`, `requireRole`, `guestOnly`.
* `src/lib/schedule-conflict.ts` — `hasConflict`, `getAvailableSlots`.
* `src/hooks/use-role.ts` — `useHasRole(...roles)`.
* `src/hooks/use-watchlist.ts` — localStorage list for My List.
* `src/components/require-role.tsx` — `<RequireRole roles={["ADMIN"]}>`.
* `src/services/learning-requests.service.ts` — full request lifecycle.
* `src/hooks/api/use-learning-requests.ts` — booking mutations + queries.
* `src/hooks/api/use-referrals.ts` — referral code + list.
* `src/hooks/api/use-milestones.ts` — milestone progress.
* `src/hooks/api/use-mentor-application.ts` — application workflow.
* `src/components/browse/hero-banner.tsx`, `skill-rail.tsx`, `mentor-preview-card.tsx` — Netflix rails.
* `src/components/sessions/escrow-progress.tsx` — thin countdown bar.
* `src/components/wallet/point-transaction-history.tsx` — rich transaction history.

**Modified:**
* `src/context/auth-context.tsx` — add `isLearner/isInstructor/hasRole`; normalize `ROLE_` prefix.
* `src/components/app-sidebar.tsx` — **remove `|| true` bug**, conditional nav groups.
* `src/components/top-nav.tsx` — role badges, "Become Instructor" CTA, global search.
* `src/routes/__root.tsx` — `PendingAuth` skeleton, 403 handler.
* `src/routes/index.tsx` — wire to real API, add instructor section, referrals, milestones.
* `src/routes/mentors.tsx` — **CRITICAL:** wire booking to `useCreateLearningRequestMutation`, real availability, conflict check.
* `src/routes/sessions.tsx` — **CRITICAL:** wire to `useSessionsQuery`, show booked sessions, completion flow.
* `src/routes/forum.tsx` — wire to forum API hooks, real posts/comments/likes.
* `src/routes/admin.tsx` — wire to admin API hooks, add mentor applications tab, disputes, guard.
* `src/hooks/api/use-mentors.ts` — add `useMentorAvailabilityQuery`.
* `src/hooks/api/use-swaps.ts` — add `useSwapHistoryQuery`, `usePendingSwapsQuery`.
* `src/hooks/api/query-keys.ts` — add keys for learning requests, referrals, milestones, mentor applications.
* `src/services/index.ts` — export new services.
* `src/hooks/api/index.ts` — export new hooks.
* `src/types/api.ts` — add `LearningRequest`, `MentorApplication`, `Milestone`, `Referral`, `WatchlistItem` types.

---

## 15. Data Fetching & State

Stay on `@tanstack/react-query:5.101.1` + typed hooks `src/hooks/api/*`.

| Feature | Hook / Service | Cache Key |
|---|---|---|
| Auth + profile | `useAuth().login/register/logout`, `authService.getProfile` | `["auth","profile"]` |
| Learning requests | `useLearningRequestsQuery(direction, status)` | `["learning-requests", direction, status]` |
| Mentor browse | `useMentorsSearchQuery(filters)` + `useCatalogSkillsQuery` | `["mentors", "list", filters]`, `["skills","catalog"]` |
| Mentor availability | `useMentorAvailabilityQuery(id, from, to)` | `["mentors", "availability", id, from, to]` |
| Sessions + escrow | `useSessionsQuery(status)` | `["sessions", "list", status]` |
| Wallet | `useWalletBalanceQuery` + `useWalletTransactionsQuery` | `["wallet","balance"]`, `["wallet","transactions"]` |
| Forum | `useForumPostsQuery(skillId, search)` | `["forum","posts", {skillId, search}]` |
| Skill swap | `useSwapHistoryQuery()`, `usePendingSwapsQuery()` | `["swaps", "history"]`, `["swaps", "pending"]` |
| Mentor application | `useMentorApplicationQuery()` | `["mentor-application", "me"]` |
| Referrals | `useReferralCodeQuery()`, `useMyReferralsQuery()` | `["referrals", "code"]`, `["referrals", "list"]` |
| Milestones | `useMyMilestonesQuery()` | `["milestones", "me"]` |
| Admin | `useAdminMetricsQuery`, etc. | `["admin","metrics"]` |
| Watchlist (client) | `useWatchlist()` localStorage | `["watchlist"]` (local) |

**Invalidation on booking:**
- `useCreateLearningRequestMutation` invalidates: `["learning-requests"]`, `["sessions"]`, `["wallet","balance"]`
- `useAcceptRequestMutation` invalidates: `["learning-requests"]`, `["sessions"]`, `["mentors","availability"]`
- `useCompleteSessionMutation` invalidates: `["sessions"]`, `["wallet","balance"]`, triggers milestone check

---

## 16. Backend Sync Checklist

See full details in [`backendchanges.md`](./backendchanges.md).

**Critical (must exist before frontend can work):**
- [ ] `POST /api/v1/learning-requests` — create booking request with escrow
- [ ] `GET /api/v1/mentors/{id}/availability` — real availability (not empty stub)
- [ ] Schedule conflict detection for BOTH learner and mentor
- [ ] `POST /api/v1/learning-requests/{id}/accept` — auto-create session
- [ ] Session double-confirmation completion
- [ ] Escrow release/refund on state transitions

**High priority (new features):**
- [ ] `POST /api/v1/me/mentor-application` — mentor application workflow
- [ ] `GET/POST /api/v1/admin/mentor-applications` — admin review
- [ ] Referral system endpoints
- [ ] Milestone system endpoints
- [ ] Volunteer +5 reward on completion
- [ ] Review +3 reward on submission

**Phase 2 (can launch without):**
- [ ] Server-side watchlist persistence
- [ ] Session recording URL storage
- [ ] Google Calendar/Meet API integration

---

## 17. Implementation Phases

**Phase 0 — RBAC foundation (1 day)**
- Create `rbac.ts`, `route-guards.ts`, `use-role.ts`, `require-role.tsx`.
- Fix `auth-context.tsx` with `isLearner/isInstructor/hasRole`.
- Fix `app-sidebar.tsx:38` bug + conditional groups.
- Add `login.tsx` + `beforeLoad` guards on all routes.

**Phase 1 — Learning Requests & Booking Fix (2 days)** ⚠️ MOST CRITICAL
- Create `learning-requests.service.ts` + `use-learning-requests.ts`.
- Create `schedule-conflict.ts` + `useMentorAvailabilityQuery`.
- Rewrite `/mentors` booking to call real API with conflict detection.
- Wire `/sessions` to `useSessionsQuery` — booked sessions now appear.
- Add completion, dispute, and review flows.

**Phase 2 — Wire all pages to real API (2 days)**
- Dashboard: wallet, profile, skills, transactions, certificates.
- Forum: real posts, comments, likes, top volunteers.
- Admin: metrics, reports, settings, disputes, audit log.
- Add "Become Instructor" CTA.

**Phase 3 — Netflix browse experience (2 days)**
- Build `/browse` + hero banner + category rails + preview cards.
- Build `/skill/$skillId` detail page.
- Build `/watchlist` + `useWatchlist`.
- Add "Continue Learning" and "Because you learned X" rails.

**Phase 4 — Instructor Dashboard & Mentor Application (1 day)**
- Build `/instructor` with offerings CRUD, incoming requests/swaps, earnings.
- Build `/mentor-application` page + admin review tab.

**Phase 5 — Points, Referrals & Milestones (1 day)**
- Referral code UI + registration integration.
- Milestone badges grid + progress + achievement popups.
- Rich transaction history with filters.
- Escrow progress bar component.

**Phase 6 — Polish & Verify (1 day)**
- 403/401/409 error handling with user-friendly messages.
- Skeleton loading states for all pages.
- Responsive mobile layout.
- Full end-to-end test flow for all 3 roles.

---

## 18. File-Level Change Map

| Action | File |
|---|---|
| **CREATE** | `src/routes/login.tsx` |
| **CREATE** | `src/routes/browse.tsx` |
| **CREATE** | `src/routes/skill.$skillId.tsx` |
| **CREATE** | `src/routes/watchlist.tsx` |
| **CREATE** | `src/routes/instructor.tsx` |
| **CREATE** | `src/routes/mentor-application.tsx` |
| **CREATE** | `src/lib/rbac.ts` |
| **CREATE** | `src/lib/route-guards.ts` |
| **CREATE** | `src/lib/schedule-conflict.ts` |
| **CREATE** | `src/hooks/use-role.ts` |
| **CREATE** | `src/hooks/use-watchlist.ts` |
| **CREATE** | `src/hooks/api/use-learning-requests.ts` |
| **CREATE** | `src/hooks/api/use-referrals.ts` |
| **CREATE** | `src/hooks/api/use-milestones.ts` |
| **CREATE** | `src/hooks/api/use-mentor-application.ts` |
| **CREATE** | `src/services/learning-requests.service.ts` |
| **CREATE** | `src/components/require-role.tsx` |
| **CREATE** | `src/components/browse/hero-banner.tsx` |
| **CREATE** | `src/components/browse/skill-rail.tsx` |
| **CREATE** | `src/components/browse/mentor-preview-card.tsx` |
| **CREATE** | `src/components/sessions/escrow-progress.tsx` |
| **CREATE** | `src/components/wallet/point-transaction-history.tsx` |
| **EDIT** | `src/context/auth-context.tsx` (add role helpers, normalize) |
| **EDIT** | `src/types/api.ts` (add LearningRequest, MentorApplication, Milestone, Referral, WatchlistItem types) |
| **EDIT** | `src/components/app-sidebar.tsx` (remove `\|\| true`, conditional groups) |
| **EDIT** | `src/components/top-nav.tsx` (role badges, search, CTA) |
| **EDIT** | `src/routes/__root.tsx` (auth loading shell, 403 handler) |
| **EDIT** | `src/routes/admin.tsx` (beforeLoad guard, wire to API, mentor apps tab) |
| **EDIT** | `src/routes/index.tsx` (wire to real API, instructor section, milestones, referrals) |
| **EDIT** | `src/routes/mentors.tsx` (wire booking to real API, conflict detection, real availability) |
| **EDIT** | `src/routes/sessions.tsx` (wire to real API, show booked sessions, completion/review flow) |
| **EDIT** | `src/routes/forum.tsx` (wire to real API, real posts/comments/likes) |
| **EDIT** | `src/hooks/api/use-mentors.ts` (add availability query) |
| **EDIT** | `src/hooks/api/use-swaps.ts` (add history + pending queries) |
| **EDIT** | `src/hooks/api/query-keys.ts` (add learning-requests, referrals, milestones keys) |
| **EDIT** | `src/services/index.ts` (export learning-requests service) |
| **EDIT** | `src/hooks/api/index.ts` (export new hooks) |
| **EDIT** | `src/routeTree.gen.ts` (auto-generated after new routes) |

No change to `src/lib/api-client.ts:173` refresh logic; extend only 403 handler.

---

## 19. Verification & Acceptance

### Build Checks
- [ ] `bun run lint` + `bun run build` + `bun run typecheck` pass.

### Role-Based Access
- [ ] Login as Learner (`USER`) → `/` shows learner dashboard, `/instructor` redirects `/`, `/admin` 403 toast.
- [ ] Login as Instructor (`USER+MENTOR`) → sidebar shows Instructor group, `/instructor` loads offerings, can manage.
- [ ] Login as Admin → `/admin` loads metrics, can approve/reject mentors, resolve disputes.

### Session Booking (Critical Path)
- [ ] Book session on `/mentors` → request created → appears in `/sessions` Pending tab.
- [ ] Mentor accepts → session moves to Active tab with Google Meet link.
- [ ] Try booking conflicting time → 409 error shown with conflict details.
- [ ] Learner cancels pending request → escrow refunded.
- [ ] Mentor rejects request → escrow refunded.

### Session Completion & Points
- [ ] Complete POINTS session → escrow released to mentor, learner sees deduction.
- [ ] Complete VOLUNTEER session → mentor gets +5 points.
- [ ] Submit review → reviewer gets +3 points.
- [ ] Complete SKILL_SWAP session → no point movement.

### Skill Swap
- [ ] Select Skill Exchange mode → only shows matching skills.
- [ ] No matching skills → shows "incompatible" alert.
- [ ] Swap proposal → counter-proposal → accept flow works.

### Referrals & Milestones
- [ ] Register with referral code → referrer gets +5 points.
- [ ] Complete first session → milestone unlocked, +5 points.
- [ ] Milestone badges show progress on dashboard.

### Netflix Browse
- [ ] `/browse` loads rails with real skill data.
- [ ] Hover preview card shows mentor details.
- [ ] Watchlist persists across page refresh (localStorage).
- [ ] `/skill/$skillId` shows skill detail with mentor rail.

### Error Handling
- [ ] Unauthed → `/login`, `USER` → `/admin` 403, `MENTOR` → `/instructor` 200.
- [ ] `/browse` loads gracefully when backend offline (fallback/skeleton).
- [ ] Wallet shows insufficient points error when booking exceeds balance.

---

## Appendix — Netflix Mental Model for SkillBridge

> **Netflix = content catalog + personalization + progress.** SkillBridge = skill catalog + mentorship + escrow progress. Same discovery physics.

- **Catalog breadth:** Netflix genres → `skills/categories`; cards → mentor cards.
- **Personalization:** `My List` + `Because you learned X` → watchlist + rec rails.
- **Progress:** `Continue Watching` bar → escrow auto-release 18h bar + session `SCHEDULED → AWAITING_CONFIRMATION → COMPLETED`.
- **Gate:** `Who's watching` → role badges (one identity, multiple roles — not separate accounts).

This doc is the build blueprint. Next action when approved: execute Phase 0 in order above.
