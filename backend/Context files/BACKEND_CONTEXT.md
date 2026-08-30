# SkillBridge Backend Context

This file records the business invariants that implementation must preserve. The root [forbackend.md](../forbackend.md) defines the stack, source layout, implementation order, and definition of done.

## Domain modes

Implemented today: the swap-request flow implements **POINTS-style semantics** — a positive point cost is escrowed on accept and released/refunded atomically. The SKILL_SWAP and VOLUNTEER modes below are designed but not yet built (see [API_CONTRACT.md](API_CONTRACT.md) Part 2):

- POINTS: the requester pays the server-snapshotted offering price through wallet and escrow.
- SKILL_SWAP: the requester offers an owned visible TEACH skill; the mentor must own a matching visible LEARN skill. Both are snapshotted and no financial rows are written.
- VOLUNTEER: zero-point learning or forum-linked work with no wallet, escrow, or ledger rows.

One account may be both learner and mentor. MENTOR is a role granted on the first eligible active offering; it is not a separate identity.

## Workflow invariants

### Registration and authentication

Registration creates one user, USER role, wallet, and +50 starter ledger award atomically. Login verifies the password and account state. Refresh rotates the token family; reuse revokes that family. Logout revokes the current family.

### Offerings and requests

An offering must use an owned visible TEACH skill and an enabled mode. A request stores UUID relationships and server-owned snapshots. A selected mentor alone is not enough; the requested skill is required. Skill swaps also require offeredUserSkillId.

Accept creates at most one session and transitions the request atomically. Only the selected mentor accepts or rejects; only the requester cancels before acceptance. Reject, cancel, expiry, and invalidated holds refund once.

### Sessions and completion

Only participants can read private meeting data, change a session under its allowed state, or complete it. Completion is currently **single-action**: a participant completes the session/swap, escrow is released exactly once, and both parties are notified. The planned double-confirmation model (second confirmation or snapshotted auto-release deadline releases escrow) and user-facing disputes are not built yet — see [API_CONTRACT.md](API_CONTRACT.md) Part 2.

Admin dispute queues exist for moderation/admin flows; resolution is mode-specific, idempotent, and audited. Reviews are created only by an eligible participant after completion and are unique per reviewer/session.

### Forum and rewards

Authors own their posts and comments. Deletion is soft when moderation history can reference content. Likes are unique per user and counts are server-derived. A post author may mark one eligible comment helpful; the configured +5 reward is granted once and cannot reward the comment author.

## Persistence invariants

Neon PostgreSQL is the business-data system of record. Use UUID keys, foreign keys, check and unique constraints, UTC timestamptz, version columns, and indexes. Tables that exist today are listed under "Implemented migrations" below; still-planned tables (`user_skills`, `learning_requests`, `skill_swaps`, `session_confirmations`, `forum_post_skills`) arrive with their features in [API_CONTRACT.md](API_CONTRACT.md) Part 2.

Flyway owns schema changes and Hibernate is validation-only. Runtime and migration roles should be separate. Credentials remain in environment variables or a secret manager and never cross the API boundary.

### Implemented migrations (current dev state)

- `V1` init schema, `V2` mentor/forum, `V3` forum likes, `V4` admin/moderation, `V5` user profile + wallet.
- `V4.1` skills catalog table.
- `V6` swap requests and sessions (`swap_requests`, `swap_sessions`) with FK/CHECK constraints and version columns; escrow is tracked via `points_held` plus wallet holds.
- `V7` reviews (unique per session+reviewer), `V8` notifications (indexed for newest-first and unread counts).

Note: the implemented swap flow models proposals directly as `swap_requests` rather than the planned `learning_requests` + `skill_swaps` split; POINTS-mode semantics are covered by the wallet hold/release/refund coordination inside `SwapService`.

## Transaction boundaries

- Registration: user, role, wallet, and starter award.
- Point request: wallet lock, price snapshot, request, escrow, and ledger hold.
- Skill swap: reciprocal ownership checks and both snapshots without wallet writes.
- Acceptance: request transition and one session.
- Completion: session, confirmation, review, and point release or swap completion.
- Refund, reward, dispute resolution, and audit event.

Every retry-sensitive command must be idempotent. Lock order and version checks must prevent double spending, duplicate sessions, duplicate rewards, and conflicting terminal states.
