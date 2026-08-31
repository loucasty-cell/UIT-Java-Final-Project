# SkillBridge Backend — Database Schema

## 📊 Entity-Relationship Overview

Core tables: users, skills, user_skills, wallets, swap_requests, learning_sessions, reviews, notifications, forum_posts, forum_comments, moderation_logs

All tables use UUID primary keys and TIMESTAMPTZ for timestamps (UTC).

---

## 🗄️ Core Tables

### users
Primary authentication and profile data.
```sql
id UUID PRIMARY KEY
username VARCHAR(255) UNIQUE
email VARCHAR(255) UNIQUE
password_hash VARCHAR(255)
role VARCHAR(50) - ROLE_USER, ROLE_MENTOR, ROLE_ADMIN, ROLE_MODERATOR
bio TEXT
avatar_url VARCHAR(500)
is_active BOOLEAN
version BIGINT - for optimistic locking
created_at, updated_at TIMESTAMPTZ
```

### skills
Skill catalog with categories.
```sql
id UUID PRIMARY KEY
name VARCHAR(255) UNIQUE
category VARCHAR(100) - indexed
description TEXT
difficulty_level VARCHAR(50)
created_at TIMESTAMPTZ
```

### user_skills
User-skill associations with proficiency levels.
```sql
id UUID PRIMARY KEY
user_id UUID - REFERENCES users(id) ON DELETE CASCADE
skill_id UUID - REFERENCES skills(id) ON DELETE CASCADE
proficiency_level VARCHAR(50)
years_experience INT
can_teach BOOLEAN
UNIQUE(user_id, skill_id)
```

### wallets
Point ledger for each user.
```sql
id UUID PRIMARY KEY
user_id UUID - UNIQUE, REFERENCES users(id)
total_points INT
available_points INT
locked_points INT (escrow)
version BIGINT - prevents concurrent conflicts
created_at, updated_at TIMESTAMPTZ
```

### wallet_transactions
Transaction history and audit trail.
```sql
id UUID PRIMARY KEY
wallet_id UUID - REFERENCES wallets(id)
amount INT
transaction_type VARCHAR(50) - EARN, SPEND, LOCK, RELEASE
reason VARCHAR(255)
swap_request_id UUID
created_at TIMESTAMPTZ
```

### swap_requests
Peer learning swap proposals.
```sql
id UUID PRIMARY KEY
learner_id UUID - REFERENCES users(id)
mentor_id UUID - REFERENCES users(id)
skill_id UUID - REFERENCES skills(id)
status VARCHAR(50) - PENDING, ACCEPTED, IN_PROGRESS, COMPLETED
points_required INT (default 50)
version BIGINT - optimistic locking
created_at, updated_at TIMESTAMPTZ
```

### learning_sessions
Scheduled learning sessions.
```sql
id UUID PRIMARY KEY
swap_request_id UUID - REFERENCES swap_requests(id)
scheduled_date TIMESTAMPTZ
status VARCHAR(50) - SCHEDULED, ONGOING, COMPLETED
duration_minutes INT
meeting_link VARCHAR(500)
version BIGINT
created_at TIMESTAMPTZ
```

### reviews
Post-session peer feedback and ratings.
```sql
id UUID PRIMARY KEY
session_id UUID - REFERENCES learning_sessions(id)
reviewer_id UUID - REFERENCES users(id)
rating INT - CHECK (1-5)
feedback TEXT
UNIQUE(session_id, reviewer_id)
created_at TIMESTAMPTZ
```

### notifications
In-app notification queue.
```sql
id UUID PRIMARY KEY
user_id UUID - REFERENCES users(id)
notification_type VARCHAR(100)
content TEXT
read BOOLEAN (indexed for unread count)
created_at TIMESTAMPTZ
```

### forum_posts
Community discussion posts.
```sql
id UUID PRIMARY KEY
user_id UUID - REFERENCES users(id)
title VARCHAR(255)
content TEXT
created_at, updated_at TIMESTAMPTZ
```

### forum_comments
Replies to forum posts.
```sql
id UUID PRIMARY KEY
post_id UUID - REFERENCES forum_posts(id)
user_id UUID - REFERENCES users(id)
content TEXT
helpful_count INT
created_at TIMESTAMPTZ
```

### moderation_logs
Admin/moderator action audit trail.
```sql
id UUID PRIMARY KEY
moderator_id UUID - REFERENCES users(id)
action_type VARCHAR(100)
target_user_id UUID - REFERENCES users(id)
reason VARCHAR(500)
created_at TIMESTAMPTZ
```

---

## 🔄 Flyway Migration Versions

| V | File | Purpose |
|---|------|---------|
| 1 | `V1__init_schema.sql` | Core users, roles, authentication |
| 2 | `V2__mentor_and_forum_schema.sql` | Mentor profiles, forum |
| 3 | `V3__forum_likes.sql` | Forum comment engagement |
| 4 | `V4__admin_and_moderation_schema.sql` | Admin tables, moderation |
| 4.1 | `V4.1__create_skills_table.sql` | Skills catalog (applied out-of-order) |
| 5 | `V5__user_profile_and_wallet_schema.sql` | Wallets, points |
| 6 | `V6__swap_request_session_schema.sql` | Swaps, sessions |
| 7 | `V7__reviews_schema.sql` | Reviews, ratings |
| 8 | `V8__notifications_schema.sql` | Notifications |
| 9-19 | Extended feature migrations | Milestones, watchlist, referral |

---

## 🔐 Constraints

**Foreign Keys**: All cascade on delete to maintain referential integrity

**Unique Constraints**:
- `users(email)` - One email per user
- `users(username)` - Unique usernames
- `user_skills(user_id, skill_id)` - Prevent duplicate user-skill pairs
- `reviews(session_id, reviewer_id)` - One review per reviewer per session

**Check Constraints**:
- `reviews.rating >= 1 AND rating <= 5`
- `wallet_transactions.amount` validation

**Optimistic Locking**:
- `users.version`, `wallets.version`, `swap_requests.version`
- Prevents lost updates in concurrent operations

---

## 📈 Indexes

```
idx_users_email
idx_users_username
idx_skills_category
idx_user_skills_user
idx_user_skills_skill
idx_swap_learner
idx_swap_mentor
idx_swap_status
idx_sessions_swap
idx_sessions_scheduled
idx_reviews_session
idx_reviews_reviewer
idx_notifications_user_unread (composite: user_id, read)
idx_forum_posts_user
idx_forum_comments_post
idx_moderation_logs_target
```

---

## 🌍 Data Types & Storage

- **UUID**: Primary keys, distributed uniqueness
- **TIMESTAMPTZ**: All timestamps in UTC
- **VARCHAR(n)**: Bounded strings (names, emails)
- **TEXT**: Unbounded text (content, descriptions)
- **INT**: Numeric values (points, counts)
- **BOOLEAN**: State flags
- **BIGINT**: Version numbers for locking

---

## 💾 Connection & Backup

**Neon PostgreSQL** (Serverless):
- Automated daily backups (7-day retention)
- Point-in-time recovery (PITR)
- Connection pooling via PgBouncer
- Read replicas available

**HikariCP Connection Pool**:
- Maximum: 10 connections
- Minimum idle: 2
- Connection timeout: 60 seconds
- Idle timeout: 1 hour
