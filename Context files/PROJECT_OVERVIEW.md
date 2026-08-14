# SkillBridge Project Overview

## Purpose

SkillBridge helps students learn from one another without real-money payments. One account may learn, teach, volunteer, earn points, and offer a reciprocal skill swap.

## Actors

- `USER`: manages their profile, learn/teach skills, requests, sessions, reviews, wallet, certificates, forum activity, and notifications.
- `MENTOR`: the same user identity with permission to publish active teaching offers; it is not a separate account table.
- `ADMIN`: manages moderation, users, disputes, platform settings, skill catalog entries, and audited point adjustments.
- Lovable/React frontend: presentation and interaction only; it never owns identity, balances, prices, ratings, or workflow state.
- Spring Boot API: authentication, authorization, REST workflow, persistence, validation, transactions, and background jobs.
- Neon PostgreSQL: system of record for users, refresh-token hashes, skills, requests, sessions, swaps, wallets, ledger, forum, and audit history.

## Current frontend routes

- `/`: authenticated profile, dashboard metrics, teach/learn skills, certificates, wallet summary, escrow summary, and activity.
- `/mentors`: mentor search and filters plus `POINTS`, `SKILL_SWAP`, and `VOLUNTEER` request creation.
- `/sessions`: pending requests, scheduled sessions, completion confirmation, optional reviews, disputes, and historical sessions.
- `/forum`: volunteer posts, comments, likes, weekly volunteer leaderboard, and free session requests.
- `/admin`: platform statistics, moderation queue, reported users, warnings, settings, and disputes.
- Top navigation: authenticated user summary, wallet, notifications, and global mentor/skill/forum search.

## MVP capabilities

- Registration, login, 30-minute JWT access tokens, rotating refresh tokens, logout, and account status enforcement.
- Profile, avatar metadata, teaching skills, learning interests, mentor offerings, and PDF certificates.
- Mentor discovery by name, major, skill, level, and supported mode.
- Learning requests using `POINTS`, `SKILL_SWAP`, or `VOLUNTEER`.
- Session scheduling and optional Google Meet links.
- Point escrow, two-party completion, configurable 18-hour auto-release, payout, refund, and immutable wallet history.
- Reciprocal skill-swap validation and immutable skill snapshots without point movement.
- Optional session reviews and aggregate mentor ratings.
- Volunteer posts, comments, likes, leaderboard, and free-session requests.
- Notifications, reports, disputes, warnings, settings, and admin audit events.

## Core workflows

Point session:

`register -> create wallet/+50 once -> add skills -> find mentor -> request -> hold points -> mentor accepts -> conduct session -> confirm/auto-release -> payout or dispute/refund -> optional review`

Skill swap:

`add teach and learn skills -> choose mentor skill -> offer matching owned teach skill -> backend validates reciprocity -> mentor accepts -> session -> both confirm -> complete with no wallet changes`

Volunteer session:

`find volunteer mentor or forum post -> request free session -> mentor accepts -> session -> completion with zero points`

## Product rules

- Registration bonus defaults to 50 points and is granted once.
- A helpful forum contribution reward defaults to 5 points and is granted only by a defined, idempotent server action.
- Escrow auto-release defaults to 18 hours after the first valid completion confirmation; the setting snapshot for an existing session does not change later.
- The server owns all roles, prices, balances, reward amounts, ratings, timestamps, and state transitions.
- Point sessions cannot overdraw a wallet. Skill swaps and volunteer sessions never create escrow or point-ledger movement.
- Historical financial, request, session, review, moderation, and audit records are not hard-deleted.
- Users cannot request themselves as mentors or access resources solely by guessing UUIDs.

## Out of scope

In-app video, real-money payments, AI matching, mobile applications, direct chat, referrals, and advanced milestones are outside the current frontend-backed MVP.

## Definition of success

The MVP is successful when every current frontend workflow runs against the REST API twice under retries/concurrency without duplicate users, requests, swaps, sessions, holds, payouts, refunds, rewards, reviews, or admin actions.

See [BACKEND_CONTEXT.md](BACKEND_CONTEXT.md) for authoritative product/database decisions and [API_CONTRACT.md](API_CONTRACT.md) for the integration contract.
