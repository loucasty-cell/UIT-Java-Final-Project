# SkillBridge Project Overview

## Purpose

SkillBridge helps students learn from one another without requiring money. A user can be both learner and mentor and can arrange learning through points, a skill swap, or volunteer teaching.

## Actors

- `USER`: manages a profile, skills, requests, sessions, reviews, wallet, and forum activity.
- `ADMIN`: manages accounts and skill catalog entries, reviews reports, and resolves disputes.
- Supabase Auth: registration, login, password reset, email verification, and access tokens.
- Spring Boot API: authorization, workflow rules, persistence, points, and file access.

## MVP capabilities

- Profile, avatar, teaching skills, learning interests, and certificates.
- Mentor discovery with search and filters.
- Learning requests using `POINTS`, `SWAP`, or `VOLUNTEER`.
- Session scheduling and external Google Meet links.
- Escrow, completion confirmation, timeout, payout, refund, and wallet history.
- Learner review and one-time review reward.
- Volunteer posts, comments, reactions, and free-session requests.
- Notifications, reports, disputes, and basic administration.

## Core workflow

Onboard -> create profile and wallet -> add skills -> find mentor -> send request -> hold points when needed -> mentor accepts -> conduct session -> confirm or auto-complete -> pay or refund -> review -> grant reward once.

## Out of scope for MVP

- In-app video calls, real-money payments, AI recommendations, mobile app, referrals, direct chat, and advanced milestones.
- Admin and Milestones frontend pages remain limited until their UI contracts are finalized.

## Product rules

- Starter points are granted once during onboarding, never at every login.
- The server owns all roles, prices, balances, rewards, and state transitions.
- A point session cannot spend more than the learner's available balance.
- Swap and volunteer sessions never transfer points.
- Historical financial and session records are never hard-deleted.
- A user cannot request themselves as mentor.

## Definition of success

The MVP succeeds when the complete workflow can be repeated safely without duplicate sessions, payments, refunds, or rewards, including retry and concurrent-request scenarios.

Start with [README.md](README.md). See [BACKEND_CONTEXT.md](BACKEND_CONTEXT.md) for authoritative product/database decisions and [API_CONTRACT.md](API_CONTRACT.md) for the complete integration contract.
