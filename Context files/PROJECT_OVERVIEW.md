# SkillBridge Project Overview

## Purpose

SkillBridge is a peer-learning platform. One account can learn, teach, volunteer, use points, participate in skill-swap requests, post in the forum, and receive notifications. Real-money payments are out of scope.

## Actors

- USER: owns a profile, skills, requests, sessions, reviews, wallet, and community activity.
- MENTOR: the same user identity with permission to publish eligible teaching offerings (granted automatically on the first eligible offering).
- ADMIN: manages moderation, account status, disputes, settings, catalog data, and audited adjustments.

## Core capabilities — live today

All of the following are implemented on `dev` and covered by 62 passing tests:

- Registration (+50 starter points), login, refresh-token rotation, logout, profile editing, dashboard.
- Skill catalog with search; mentor discovery, availability views, and TEACH/LEARN-style offerings.
- Swap/learning requests: propose → accept (points escrowed atomically) → session → complete (escrow released exactly once), plus reject/cancel with refund.
- Session scheduling (date, duration, meeting URL, notes), start, completion.
- Reviews (1–5 ratings + feedback) with refreshed rating averages.
- Wallet: balance, held points, transaction history, CSV export; immutable point ledger.
- Notifications for proposal/session/forum events; read/delete.
- Volunteer forum: posts, comments, likes, weekly top-volunteer ranking, +5 helpful-comment rewards.
- Moderation reports and full admin surface: dashboard, platform settings, user warnings/status/wallet adjustments, report queue, dispute resolution, audit history.

## Planned capabilities

Designed in the contracts but not yet built (see [API_CONTRACT.md](API_CONTRACT.md) Part 2):

- Certificates (PDF upload/storage).
- Owned per-user TEACH/LEARN skill inventory (`user_skills`).
- Dedicated learning requests with SKILL_SWAP and VOLUNTEER modes.
- Double-confirmation completion with an 18-hour snapshotted auto-release deadline.
- User-facing disputes that block escrow release until admin resolution.
- Global search across mentors/skills/posts; paginated notifications.

## Product rules

- Server owns identity, roles, prices, balances, rewards, counts, ratings, timestamps, and workflow states.
- Point escrow uses wallet locking, immutable ledger entries, and release/refund inside one transaction.
- Account state overrides roles; ownership and participant checks use persisted relationships.
- Registration and helpful-comment rewards are configurable defaults, currently +50 and +5.

## Scope

In scope are the capabilities above, REST integration, Neon PostgreSQL persistence, JWT security, Flyway migrations, and automated tests. Real-money payments, direct chat, AI matching, mobile apps, and advanced milestone systems are out of scope until explicitly added to the contracts.
