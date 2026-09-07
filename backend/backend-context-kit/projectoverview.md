# SkillBridge Backend — Project Overview

**Version**: 0.0.1 | **Last Updated**: August 31, 2026 | **Java**: 25 LTS | **Spring Boot**: 3.5.16

## 🎯 Project Summary

SkillBridge is a peer-to-peer collaborative learning platform that connects learners and mentors through a point-based economy. The backend orchestrates identity management, skill catalogs, swap proposals, escrow transactions, live sessions, peer reviews, notifications, community forums, and administrative moderation.

---

## 📋 Key Stakeholders

| Role | Primary Actions | Key Workflows |
|------|-----------------|--------------|
| **Learner** | Browse skills, create requests, accept swaps, attend sessions, leave reviews | Learning Request → Swap Acceptance → Session → Review |
| **Mentor** | Create offerings, respond to requests, propose swaps, schedule sessions | Offering Creation → Swap Proposal → Session Delivery |
| **Community Member** | Post/comment in forum, earn helpful rewards, build reputation | Forum Post → Helpful Flag → Point Reward |
| **Moderator** | Review flagged content, issue warnings, suspend users | Moderation Review → Action → User Notification |
| **Admin** | System configuration, user management, analytics, deployment | User Management → System Settings → Monitoring |

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Language** | Java 25 (Temurin LTS) | Modern JVM with virtual threads, records |
| **Framework** | Spring Boot 3.5.16 | Auto-configuration, embedded server |
| **Web** | Spring MVC + REST | RESTful API controllers |
| **Security** | Spring Security 6 + OAuth2 | Stateless JWT authentication |
| **Persistence** | Spring Data JPA + Hibernate 6 | Object-relational mapping |
| **Database** | PostgreSQL 17 (Neon) | ACID compliance, UUID keys |
| **Migrations** | Flyway 10.x | Versioned schema evolution |
| **Documentation** | SpringDoc OpenAPI 2.6.0 | Swagger UI at `/swagger-ui.html` |
| **Build** | Maven 3.9.x + Wrapper | Deterministic builds |
| **Testing** | JUnit 5 + Testcontainers | Unit and integration tests |
| **CI/CD** | GitHub Actions | Automated workflows |

---

## 🗺️ Module Architecture

```
com.skillbridge
├── auth/                    # JWT, registration, login
├── user/                    # User profiles, stats
├── skill/                   # Skill catalog, search
├── mentor/                  # Mentor profiles, offerings
├── learningrequest/         # Learning requests
├── swap/                    # Swap proposals, escrow
├── session/                 # Session scheduling
├── review/                  # Reviews, ratings
├── wallet/                  # Point ledger, transactions
├── notification/            # In-app notifications
├── forum/                   # Posts, comments, likes
├── moderation/              # Content moderation
├── admin/                   # System configuration
└── shared/                  # Cross-cutting concerns
```

---

## 📊 Database Overview

**Total Migrations**: 19 (V1 → V19)  
**Total Tables**: ~25  
**Primary Keys**: UUID (uuid-ossp)  
**Timestamps**: TIMESTAMPTZ UTC  
**Connection Pool**: HikariCP (10 max, 2 min idle)

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | User identity and auth |
| `user_skills` | User-skill associations |
| `skills` | Skill catalog |
| `wallets` | Point balances |
| `swap_requests` | Peer learning proposals |
| `learning_sessions` | Scheduled sessions |
| `reviews` | Post-session feedback |
| `notifications` | In-app alerts |
| `forum_posts` | Community discussions |
| `forum_comments` | Post replies |
| `moderation_logs` | Admin actions |

---

## 🧪 Test Coverage

**62 Passing Tests**

Module breakdown:
- Auth Tests: 8
- User Tests: 6
- Skill Tests: 5
- Swap Tests: 8
- Session Tests: 7
- Review Tests: 6
- Wallet Tests: 7
- Forum Tests: 4
- Integration Tests: 5

---

## 📌 Current Status

✅ All core features implemented and tested  
✅ 19 Flyway migrations deployed  
✅ 62 passing tests with good coverage  
✅ GitHub Actions CI/CD workflows  

---

## 🔗 Quick Links

- **Architecture**: See `architecture.md`
- **API Standards**: See `apistandards.md`
- **Database Schema**: See `databaseschema.md`
- **Code Standards**: See `codestandards.md`
- **Build & Deployment**: See `../rules.md`
- **Business Logic**: See `logics.md`
- **Development Tracker**: See `projecttracker.md`
