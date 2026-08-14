# SkillBridge Project Overview

## Purpose

SkillBridge is a peer-learning platform. One account can learn, teach, volunteer, use points, participate in reciprocal skill swaps, post in the forum, and receive notifications. Real-money payments are out of scope.

## Actors

- USER: owns a profile, skills, certificates, requests, sessions, reviews, wallet, and community activity.
- MENTOR: the same user identity with permission to publish eligible teaching offerings.
- ADMIN: manages moderation, account status, disputes, settings, catalog data, and audited adjustments.

## Core capabilities

- Registration, login, refresh-token rotation, logout, profile, certificates, and notifications.
- Skill catalog, owned TEACH/LEARN skills, mentor offerings, availability, and search.
- Learning requests in POINTS, SKILL_SWAP, and VOLUNTEER modes.
- Sessions, meeting access, completion confirmations, reviews, disputes, escrow, refunds, and rewards.
- Forum posts, comments, likes, volunteer linkage, rankings, reports, warnings, settings, and audit history.

## Product rules

- Server owns identity, roles, prices, balances, rewards, counts, ratings, timestamps, and workflow states.
- POINTS uses wallet locking, immutable ledger entries, and escrow.
- SKILL_SWAP validates reciprocal skills from PostgreSQL, stores both snapshots, and moves no points.
- VOLUNTEER uses zero points and no financial rows.
- Account state overrides roles; ownership and participant checks use persisted relationships.
- Registration and helpful-comment rewards are configurable defaults, currently +50 and +5.
- Point auto-release uses a snapshotted 18-hour default when no dispute exists.

## Scope

In scope are the capabilities above, REST integration, Neon PostgreSQL persistence, JWT security, Flyway migrations, storage metadata, and automated tests. Real-money payments, direct chat, AI matching, mobile apps, and advanced milestone systems are out of scope until explicitly added to the contracts.
