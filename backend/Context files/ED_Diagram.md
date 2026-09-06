# SkillBridge — Database ER Diagram (ED_Diagram)

Single source of truth for the **actual** PostgreSQL schema. Every table, column,
key, and relationship below is taken from the Flyway migrations
(`backend/src/main/resources/db/migration/V1`–`V33` + valid parts of `V34`).
The stale `backend-context-kit/databaseschema.md` does **not** match the real
schema and is intentionally ignored here.

## Conventions

- `UUID` primary keys on (almost) every table.
- `TIMESTAMPTZ` for all timestamps (UTC).
- `version BIGINT` = optimistic locking, incremented by JPA on update.
- **FK (db)** = enforced in the DB via `REFERENCES`.
- **FK (logical)** = column exists and JPA maps the association, but the DDL has
  no `REFERENCES` clause, so integrity is enforced by application code.

---

## 1. Overview — how the domains connect

```mermaid
flowchart LR
    U[IDENTITY\nusers / user_roles / refresh_tokens] --> S[SKILLS\nskills / user_skills / certificates / skill_progress]
    U --> W[WALLET & ESCROW\nwallets / point_ledger / escrows]
    U --> X[SWAPS & SESSIONS\nswap_requests / swap_sessions / session_confirmations / reviews]
    U --> L[MENTOR & NOTICEBOARD\nmentor_offerings / learning_requests / learning_needs / learning_need_offers]
    U --> F[FORUM\nforum_posts / forum_comments / forum_likes / forum_post_skills]
    U --> R[REWARDS\nmilestones / user_milestones / referral_rewards / user_activity_log / watchlist_items]
    U --> A[ADMIN & MODERATION\nreports / account_warnings / disputes / platform_settings / admin_audit_events]
    S --> X
    S --> L
    S --> F
    W --> X
    L --> X
    F --> L
    X --> R
    X --> A
    F --> A
```

---

## 2. Identity & Access

```mermaid
erDiagram
    users ||--o{ user_roles : "has roles"
    users ||--o{ refresh_tokens : "owns sessions"
    users ||--o| users : "referred_by"

    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar status
        varchar display_name
        varchar major
        int year_of_study
        varchar bio
        varchar timezone
        varchar avatar_object_key
        varchar referral_code UK
        uuid referred_by FK
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    user_roles {
        uuid user_id PK "FK (db) to users"
        varchar role PK
    }
    refresh_tokens {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        uuid family_id
        timestamptz expires_at
        timestamptz created_at
        boolean revoked
    }
```

- `users.referred_by` → `users.id` — self FK (db), nullable; set when a new user
  signs up with a referral code.
- `users.referral_code` — UNIQUE, nullable (generated after registration).
- `user_roles(user_id, role)` — composite PK; `user_id` FK (db) `ON DELETE CASCADE`.
- `refresh_tokens` — JWT rotation family: `family_id` groups generations;
  reuse of an old token revokes the whole family. `user_id` FK (db) CASCADE.
- Active trigger state: none (the `trg_auto_assign_roles` trigger from V19 was
  dropped in V24; roles are assigned by authorized service workflows only).

---

## 3. Skills, User Skills, Certificates, Progress

```mermaid
erDiagram
    users ||--o{ user_skills : "declares"
    users ||--o{ certificates : "owns"
    users ||--o{ skill_progress : "tracks"
    skills ||--o{ user_skills : "catalogued in"
    skills ||--o{ certificates : "certifies"
    user_skills ||--o{ skill_progress : "measured by"

    skills {
        uuid id PK
        varchar name
        varchar category
        text description
        timestamptz created_at
        timestamptz updated_at
    }
    user_skills {
        uuid id PK
        uuid user_id FK
        uuid skill_id FK
        varchar direction
        varchar level
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    certificates {
        uuid id PK
        uuid user_id FK
        uuid skill_id FK
        varchar file_name
        varchar storage_key UK
        varchar content_type
        bigint file_size
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    skill_progress {
        uuid id PK
        uuid user_id FK
        uuid skill_id FK "-> user_skills.id"
        int progress_percentage
        decimal hours_learned
        int sessions_completed
        timestamptz last_activity_at
        timestamptz created_at
        timestamptz updated_at
    }
```

- `user_skills` — FK (db) CASCADE on both sides; UNIQUE
  `(user_id, skill_id, direction)` where `direction` ∈ `TEACH | LEARN`.
- `certificates` — FK (db) CASCADE on both sides; UNIQUE `(user_id, skill_id)`,
  UNIQUE `storage_key`.
- ⚠️ `skill_progress.skill_id` → **`user_skills(id)`**, not `skills(id)`
  (FK (db) CASCADE). UNIQUE `(user_id, skill_id)` on that pair.

---

## 4. Wallet, Ledger, Escrow

```mermaid
erDiagram
    users ||--o| wallets : "owns one"
    users ||--o{ point_ledger : "moves points"
    users ||--o{ escrows : "locks as learner"
    users ||--o{ escrows : "receives as mentor"
    wallets ||--o{ point_ledger : "records"

    wallets {
        uuid id PK
        uuid user_id UK "FK (logical), one per user"
        int available_points
        int held_points
        int total_earned
        int total_spent
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    point_ledger {
        uuid id PK
        uuid wallet_id "FK (logical) to wallets"
        uuid user_id "FK (logical) to users"
        varchar event_type
        int available_delta
        int held_delta
        int balance_after_available
        int balance_after_held
        varchar description
        varchar reference_type
        uuid reference_id
        varchar idempotency_key UK
        timestamptz created_at
    }
    escrows {
        uuid id PK
        uuid learner_id "FK (logical) to users"
        uuid mentor_id "FK (logical) to users"
        varchar reference_type
        uuid reference_id
        int amount
        varchar status
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
```

- `wallets.user_id` — UNIQUE (one wallet per user); `available_points`,
  `held_points` non-negative CHECKs.
- `point_ledger` — append-only: one row per balance change; UNIQUE
  `idempotency_key`; polymorphic `(reference_type, reference_id)` points at
  e.g. `SWAP_REQUEST` / `LEARNING_REQUEST` / forum rewards.
- `escrows` — point holds between learner and mentor for one session:
  polymorphic `(reference_type, reference_id)` (re-pointed to `SWAP_REQUEST`
  on acceptance, V26). `status` default `HELD`.

---

## 5. Swap Requests, Sessions, Confirmations, Reviews

```mermaid
erDiagram
    swap_requests ||--o| swap_sessions : "becomes"
    users ||--o{ swap_requests : "requests"
    users ||--o{ swap_requests : "responds"
    users ||--o{ swap_sessions : "attends"
    skills ||--o{ swap_requests : "offered/requested"
    skills ||--o{ swap_sessions : "offered/requested"
    swap_sessions ||--o{ session_confirmations : "confirmed by"
    swap_sessions ||--o{ reviews : "reviewed after"
    users ||--o{ session_confirmations : "confirms"
    users ||--o{ reviews : "writes/receives"
    skills ||--o{ reviews : "about"

    swap_requests {
        uuid id PK
        uuid requester_id FK
        uuid responder_id FK
        uuid offered_skill_id FK
        uuid requested_skill_id FK
        int point_cost
        boolean points_held
        varchar message
        varchar status
        timestamptz accepted_at
        timestamptz rejected_at
        timestamptz completed_at
        timestamptz cancelled_at
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    swap_sessions {
        uuid id PK
        uuid swap_request_id UK "FK, one session per request"
        uuid requester_id FK
        uuid responder_id FK
        uuid offered_skill_id FK
        uuid requested_skill_id FK
        int point_cost
        varchar status
        varchar mode
        timestamptz accepted_at
        timestamptz started_at
        timestamptz completed_at
        timestamptz scheduled_at
        timestamptz scheduled_end
        timestamptz auto_release_at
        int duration_minutes
        varchar meeting_url
        varchar recording_url
        varchar notes
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    session_confirmations {
        uuid id PK
        uuid session_id FK
        uuid confirmed_by FK
        timestamptz confirmed_at
    }
    reviews {
        uuid id PK
        uuid session_id FK
        uuid reviewer_id FK
        uuid reviewee_id FK
        uuid skill_id FK
        int rating
        varchar feedback
        timestamptz created_at
        bigint version
    }
```

- `swap_requests` — both participants FK (db) to `users`; both skill columns
  FK (db) to `skills`. Status ∈ `PENDING, ACCEPTED, REJECTED, CANCELLED,
  EXPIRED, COMPLETED` (CHECK).
- `swap_sessions` — `swap_request_id` FK (db) UNIQUE (one session per
  request); both participants FK (db); status ∈ `ACCEPTED, SCHEDULED, STARTED,
  AWAITING_CONFIRMATION, COMPLETED, CANCELLED, DISPUTED` (CHECK, V23);
  `mode` ∈ `SKILL_SWAP | POINTS | VOLUNTEER` (V12).
- `session_confirmations` — FK (db) CASCADE on both; UNIQUE
  `(session_id, confirmed_by)`.
- `reviews` — all FK (db) to `swap_sessions` / `users` / `skills`; rating
  1–5 CHECK; UNIQUE `(session_id, reviewer_id)` = one review per side;
  self-review blocked (`reviewer_id != reviewee_id`).

---

## 6. Mentor Offerings, Learning Requests, Noticeboard

```mermaid
erDiagram
    users ||--o{ mentor_offerings : "offers"
    mentor_offerings ||--o{ learning_requests : "requested through"
    users ||--o{ learning_requests : "learns"
    users ||--o{ learning_requests : "teaches"
    user_skills ||--o{ learning_requests : "offered via"
    forum_posts ||--o{ learning_requests : "triggered from"
    users ||--o{ learning_needs : "posts need"
    skills ||--o{ learning_needs : "wants"
    learning_needs ||--o{ learning_need_offers : "receives"
    users ||--o{ learning_need_offers : "offers to teach"
    learning_need_offers ||--o| learning_requests : "converted to"
    skills ||--o{ learning_requests : "requested"

    mentor_offerings {
        uuid id PK
        uuid mentor_id "FK (logical) to users"
        uuid teach_user_skill_id "FK (logical) to user_skills"
        int point_cost
        boolean points_enabled
        boolean skill_swap_enabled
        boolean volunteer_enabled
        int duration_minutes
        varchar availability_text
        boolean active
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    learning_requests {
        uuid id PK
        uuid learner_id FK
        uuid mentor_id FK
        uuid mentor_offering_id FK
        uuid requested_skill_id FK
        uuid offered_user_skill_id FK
        uuid source_forum_post_id FK
        uuid learning_need_offer_id UK "FK, set on conversion"
        varchar mode
        int point_cost
        boolean points_held
        timestamptz scheduled_start
        int duration_minutes
        text message
        varchar status
        uuid session_id FK
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    learning_needs {
        uuid id PK
        uuid learner_id FK
        uuid skill_id FK
        varchar title
        varchar description
        varchar availability_text
        int duration_minutes
        varchar allowed_modes
        uuid exchange_user_skill_id FK
        boolean active
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    learning_need_offers {
        uuid id PK
        uuid learning_need_id FK
        uuid teacher_id FK
        varchar message
        timestamptz proposed_start
        timestamptz created_at
    }
```

- `learning_requests` — learner/mentor FK (db); `mentor_offering_id`,
  `requested_skill_id`, `offered_user_skill_id` (→ `user_skills`),
  `source_forum_post_id` (→ `forum_posts`), `session_id` (→ `swap_sessions`)
  all FK (db), nullable where optional; `mode` ∈ `POINTS, SKILL_SWAP,
  VOLUNTEER`; status ∈ `PENDING, ACCEPTED, REJECTED, CANCELLED, EXPIRED`.
- `learning_needs` — learner FK (db) CASCADE; `skill_id` FK (db);
  `exchange_user_skill_id` → `user_skills` FK (db); duration 15–480 CHECK.
- `learning_need_offers` — FK (db) CASCADE both sides; UNIQUE
  `(learning_need_id, teacher_id)`; `proposed_start` NOT NULL.
- Accepted offer → auto-created `VOLUNTEER` `learning_request` linked via
  UNIQUE `learning_need_offer_id` (V32: one request per offer).

---

## 7. Mentor Applications

```mermaid
erDiagram
    users ||--o{ mentor_applications : "applies"
    users ||--o{ mentor_applications : "reviews"
    skills ||--o{ mentor_application_skills : "covers"
    mentor_applications ||--o{ mentor_application_skills : "lists"

    mentor_applications {
        uuid id PK
        uuid user_id FK
        varchar status
        text experience
        text motivation
        text admin_notes
        uuid reviewed_by FK
        timestamptz reviewed_at
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    mentor_application_skills {
        uuid application_id PK "FK (db) CASCADE"
        uuid skill_id PK "FK (db)"
    }
```

- Status ∈ `PENDING, APPROVED, REJECTED` (CHECK). Composite PK
  `(application_id, skill_id)`.

---

## 8. Forum & Community

```mermaid
erDiagram
    users ||--o{ forum_posts : "authors"
    users ||--o{ forum_comments : "writes"
    users ||--o{ forum_likes : "likes"
    forum_posts ||--o{ forum_comments : "has"
    forum_posts ||--o{ forum_likes : "liked by"
    forum_posts ||--o{ forum_post_skills : "tagged"
    skills ||--o{ forum_post_skills : "tags"

    forum_posts {
        uuid id PK
        uuid author_id "FK (logical) to users"
        varchar title
        varchar description
        varchar availability_text
        int duration_minutes
        boolean active
        int like_count
        int comment_count
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    forum_comments {
        uuid id PK
        uuid post_id "FK (logical) to forum_posts"
        uuid author_id "FK (logical) to users"
        varchar body
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    forum_likes {
        uuid id PK
        uuid post_id FK
        uuid user_id "FK (logical) to users"
        timestamptz created_at
    }
    forum_post_skills {
        uuid post_id PK "FK (db) CASCADE"
        uuid skill_id PK "FK (db)"
    }
```

- `forum_likes` — `post_id` FK (db) CASCADE; UNIQUE `(post_id, user_id)` =
  one like per user per post.
- `forum_post_skills` — composite PK `(post_id, skill_id)`; `post_id` FK (db)
  CASCADE, `skill_id` FK (db).
- `forum_posts.duration_minutes` — NOT NULL, 15–480 CHECK.
- `like_count` / `comment_count` are denormalized counters maintained by the
  service layer.

---

## 9. Rewards: Notifications, Milestones, Referrals, Activity, Watchlist

```mermaid
erDiagram
    users ||--o{ notifications : "receives"
    users ||--o{ user_milestones : "earns"
    milestones ||--o{ user_milestones : "awarded as"
    users ||--o{ referral_rewards : "refers"
    users ||--o{ referral_rewards : "is referred"
    users ||--o{ user_activity_log : "logs daily"
    users ||--o{ watchlist_items : "bookmarks"

    notifications {
        uuid id PK
        uuid user_id FK
        varchar type
        varchar title
        varchar message
        varchar reference_type
        uuid reference_id
        timestamptz read_at
        timestamptz created_at
    }
    milestones {
        uuid id PK
        varchar code UK
        varchar title
        text description
        varchar condition_type
        int condition_value
        int points_reward
        varchar icon
        timestamptz created_at
    }
    user_milestones {
        uuid id PK
        uuid user_id FK
        uuid milestone_id FK
        timestamptz achieved_at
        int points_awarded
    }
    referral_rewards {
        uuid id PK
        uuid referrer_id FK
        uuid referred_id FK
        int points_awarded
        timestamptz created_at
    }
    user_activity_log {
        uuid id PK
        uuid user_id FK
        date activity_date
        int login_count
        int sessions_attended
        decimal hours_learned
        int points_earned
        timestamptz created_at
        timestamptz updated_at
    }
    watchlist_items {
        uuid id PK
        uuid user_id FK
        varchar item_type
        uuid item_id
        timestamptz created_at
    }
```

- `notifications` — `user_id` FK (db); polymorphic
  `(reference_type, reference_id)`; unread = `read_at IS NULL`.
- `milestones.code` — UNIQUE seeded catalog (e.g. `FIRST_SESSION`,
  `VOLUNTEER_HERO`); `user_milestones` UNIQUE `(user_id, milestone_id)`.
- `referral_rewards` — both sides FK (db); UNIQUE `(referrer_id, referred_id)`
  = one reward per pair.
- `user_activity_log` — FK (db) CASCADE; UNIQUE `(user_id, activity_date)` =
  one row per user per day (streaks/engagement).
- `watchlist_items` — `user_id` FK (db); polymorphic `item_id` where
  `item_type` ∈ `SKILL | MENTOR`; UNIQUE `(user_id, item_type, item_id)`.

---

## 10. Admin & Moderation

```mermaid
erDiagram
    users ||--o{ reports : "files"
    users ||--o{ reports : "resolves"
    users ||--o{ account_warnings : "receives/gets"
    users ||--o{ disputes : "opens/resolves"
    users ||--o{ admin_audit_events : "performs"

    reports {
        uuid id PK
        uuid reporter_id "FK (logical) to users"
        varchar target_type
        uuid target_id
        varchar reason
        varchar details
        varchar status
        varchar action_taken
        uuid resolved_by "FK (logical) to users"
        timestamptz resolved_at
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    account_warnings {
        uuid id PK
        uuid user_id "FK (logical) to users"
        uuid admin_id "FK (logical) to users"
        varchar reason
        varchar message
        timestamptz created_at
    }
    disputes {
        uuid id PK
        uuid session_id "FK (logical) to swap_sessions"
        varchar session_mode
        uuid opened_by "FK (logical) to users"
        varchar reason
        varchar details
        varchar status
        varchar resolution
        varchar resolution_note
        uuid resolved_by "FK (logical) to users"
        timestamptz resolved_at
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
    platform_settings {
        uuid id PK
        int registration_bonus
        int forum_contribution_reward
        int escrow_release_hours
        uuid updated_by "FK (logical) to users"
        timestamptz updated_at
        bigint version
    }
    admin_audit_events {
        uuid id PK
        uuid actor_id "FK (logical) to users"
        varchar action
        varchar target_type
        uuid target_id
        varchar before_summary
        varchar after_summary
        varchar reason
        varchar request_id
        timestamptz timestamp
    }
```

- `reports` — polymorphic `(target_type, target_id)`; `status` default `OPEN`.
- `disputes` — opened per session (`session_id` logical FK to
  `swap_sessions`); escrows cannot release while a session is `DISPUTED`.
- `platform_settings` — single seeded singleton row
  (`registration_bonus=30`, `forum_contribution_reward=5`,
  `escrow_release_hours=18`).
- `shedlock(name PK, lock_until, locked_at, locked_by)` — distributed
  scheduler lock, not related to any user. (Infra table, V23.)

---

## 11. Status & enum dictionary

| Where | Values |
|---|---|
| `users.status` | `ACTIVE` (default), `SUSPENDED`, `BANNED` |
| `user_roles.role` | `USER`, `MENTOR`, `ADMIN` (seeded by email pattern in V19 for demo) |
| `user_skills.direction` | `TEACH`, `LEARN` |
| `swap_requests.status` | `PENDING, ACCEPTED, REJECTED, CANCELLED, EXPIRED, COMPLETED` |
| `swap_sessions.status` | `ACCEPTED, SCHEDULED, STARTED, AWAITING_CONFIRMATION, COMPLETED, CANCELLED, DISPUTED` |
| `swap_sessions.mode` / `learning_requests.mode` | `POINTS`, `SKILL_SWAP`, `VOLUNTEER` |
| `learning_requests.status` | `PENDING, ACCEPTED, REJECTED, CANCELLED, EXPIRED` |
| `mentor_applications.status` | `PENDING, APPROVED, REJECTED` |
| `escrows.status` | `HELD` (default), `RELEASED`, `REFUNDED` |
| `reviews.rating` | 1–5 (CHECK) |
| `reports.status` / `disputes.status` | `OPEN` (default), `RESOLVED`, `DISMISSED` |
| `watchlist_items.item_type` | `SKILL`, `MENTOR` |
| `milestones.condition_type` | `SESSIONS_COMPLETED, SESSIONS_TAUGHT, REVIEWS_GIVEN, REVIEWS_RECEIVED, SKILL_SWAPS_COMPLETED, VOLUNTEER_SESSIONS` |
| Canonical values | registration bonus **30** pts · helpful-answer reward **5** pts · escrow auto-release **18** h |

## 12. Workflow → entity map

| # | Workflow | Core path through entities |
|---|---|---|
| 1 | Registration & wallet onboarding | `users` → `user_roles(USER)` → `wallets(+30)` + `point_ledger(REGISTRATION_BONUS)` |
| 2 | Skill catalog & user skills | `skills` → `user_skills(TEACH/LEARN)` → optional `certificates`, `skill_progress` |
| 3 | Swap proposals | `swap_requests(PENDING → ACCEPTED/REJECTED/CANCELLED)` between `users`, over `skills` |
| 4 | Learning requests | `learning_requests` via `mentor_offerings` / `user_skills` / `forum_posts` / `learning_need_offers` → `swap_sessions` on accept |
| 5 | Escrow & points | `swap_requests.points_held` → `escrows(HELD)` → `RELEASED`/`REFUNDED` on completion/cancel, every move logged in `point_ledger` |
| 6 | Sessions | `swap_sessions(ACCEPTED → SCHEDULED → STARTED → AWAITING_CONFIRMATION → COMPLETED)` + `session_confirmations` (both parties) |
| 7 | Reviews & ratings | `reviews` per `swap_sessions` (one per side) → mentor aggregate rating |
| 8 | Notifications | `notifications` on proposal events, session events, forum replies, helpful marks |
| 9 | Forum & bounty | `forum_posts` (+`forum_post_skills`, `forum_comments`, `forum_likes`) → author marks one helpful → `+5` via `point_ledger` |
| 10 | Noticeboard | `learning_needs` ← `learning_need_offers` → auto `learning_requests(VOLUNTEER)` → sessions |
| 11 | Mentor onboarding | `mentor_applications` + `mentor_application_skills` → approval grants `MENTOR` role → `mentor_offerings` |
| 12 | Rewards & engagement | `milestones` → `user_milestones` (+points), `referral_rewards` via `users.referral_code/referred_by`, `user_activity_log` streaks, `watchlist_items` |
| 13 | Moderation & admin | `reports` → `account_warnings` / bans (`users.status`) / `disputes` (blocks escrow) → `admin_audit_events`; rules in `platform_settings` |

---

## Appendix A — unique constraints

`users(email)`, `users(referral_code)`, `wallets(user_id)`,
`point_ledger(idempotency_key)`, `user_skills(user_id, skill_id, direction)`,
`certificates(user_id, skill_id)`, `certificates(storage_key)`,
`reviews(session_id, reviewer_id)`, `session_confirmations(session_id, confirmed_by)`,
`swap_sessions(swap_request_id)`, `learning_requests(learning_need_offer_id)`,
`forum_likes(post_id, user_id)`, `milestones(code)`,
`user_milestones(user_id, milestone_id)`, `referral_rewards(referrer_id, referred_id)`,
`user_activity_log(user_id, activity_date)`,
`watchlist_items(user_id, item_type, item_id)`,
`learning_need_offers(learning_need_id, teacher_id)`.

## Appendix B — known schema issue (not part of the ER)

`V34__add_performance_indexes.sql` references objects that do not exist in the
migrations: tables `sessions` and `point_transactions`, column
`notifications(read)`, column `admin_audit_events(created_at)`. Those index
statements cannot apply to a fresh database and are excluded from this diagram.
