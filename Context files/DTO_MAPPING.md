# DTO Mapping Rules

## Mapping approach

- Feature-local mappers handle mechanical conversions; application assemblers handle caller-aware fields, aggregates, authorized URLs, snapshots, and multi-source projections.
- Mappers are pure: no repositories, security context, clock, storage, or network calls.
- Controllers accept/return DTOs only. JPA entities never cross the REST boundary.
- Compilation/tests fail on accidental unmapped fields.

## Write mapping matrix

| Request DTO | Target/use case | Server-owned or ignored fields |
|---|---|---|
| RegisterRequest | User, role, wallet, ledger | UUID, password hash, `USER`, `ACTIVE`, +50 setting, balances, timestamps |
| Login/Refresh request | authentication/token rotation | user lookup, hash verification, token IDs/family/expiry/revocation |
| ProfileUpdateRequest | existing User | ID, email, password, roles, account status, aggregates, timestamps/version |
| UserSkill create/update | UserSkill | user from principal, catalog facts, uniqueness, referenced-state checks |
| MentorOffering create/update | MentorOffering | mentor from principal, teach-skill ownership, allowed modes, snapshots/history |
| Certificate multipart | file object + Certificate | owner, generated object key, verified MIME/signature/size, status |
| LearningRequestCreateRequest | LearningRequest plus optional Escrow/SkillSwap | requester, mentor from offering, price snapshot, status, expiry, idempotency |
| RequestAcceptRequest | request/session/swap | mentor authorization, participants, state, session uniqueness |
| CompletionConfirmationRequest | confirmation plus optional Review | participant IDs, reviewee, state, release/swap completion, deadline |
| DisputeCreateRequest | Dispute plus Session/Escrow/Swap | opener, participants, initial status, release freeze |
| DisputeResolutionRequest | Dispute plus Session/Wallet/Swap/Audit | admin actor, valid mode resolution, ledger/refund/release, timestamps |
| Forum post/comment requests | Post/Comment | author, skills, active/deleted state, counts |
| ReportCreateRequest | Report | reporter, initial `OPEN`, assignment/resolution |
| Warning/status/settings requests | user/settings/audit | admin actor, old/new values, audit time/request ID |
| WalletAdjustmentRequest | Wallet, PointLedger, Audit | admin actor, event, balances after, idempotency |

Patch DTOs update only submitted fields. Null clears only explicitly nullable fields such as bio, avatar, meeting URL, or certificate skill.

## Read mapping matrix

| Source | Response | Mapping notes |
|---|---|---|
| User/roles | Auth/MyProfile | email only to owner/auth response; never hashes/token metadata |
| User/dashboard projections | DashboardResponse | server metrics, next sessions, skills, wallet, certificates, ledger activity |
| User projection | Mentor/public summary | remove email, account internals, private certificates, wallet, meeting links |
| Storage metadata | CertificateResponse | authorized temporary URL; never object secret/path when unnecessary |
| Skills/offer projection | mentor responses | IDs plus display values, active modes, price from offering, aggregate ratings |
| LearningRequest projection | LearningRequestResponse | caller summaries, price/skill snapshots, allowed actions, redacted private fields |
| SkillSwap | SkillSwapSummaryResponse | use immutable skill name/level snapshots for agreement history |
| Session projection | session responses | caller role, allowed actions, authoritative escrow/swap state; meeting link participant-only |
| Wallet/latest ledger | WalletResponse | stored balances and aggregate queries; never client arithmetic |
| PointLedger | PointTransactionResponse | safe description, signed deltas, balances after; hide idempotency/admin private notes |
| Review projection | ReviewResponse | public participant summaries and visible body only |
| Forum projections | forum responses | counts from database, `likedByMe` from principal, author from relation |
| Notification | NotificationResponse | allow-listed text/path; no arbitrary entity serialization |
| Report/dispute | participant/admin DTO | redact unrelated evidence and admin-only notes for ordinary users |
| Admin projections | admin DTOs | dedicated query projections; never load full tables to count in memory |

## Snapshot rules

- Point requests store offering price at request creation.
- Skill swaps store both skill names and levels plus original foreign keys.
- Session auto-release deadline is calculated from the setting active at first confirmation and does not shift after later setting edits.
- Historical responses prefer snapshots where current catalog/profile edits would change agreement meaning.

## Relationship and cycle rules

- Related resources use summaries, never recursively nested full resources.
- Entities do not generate `toString`, `equals`, or `hashCode` across relationships.
- Mappers do not trigger lazy loading; query the exact projection/fetch plan.
- Collections are paginated; no unbounded entity lists.

## Type conversions

- PostgreSQL UUID <-> JSON UUID string.
- `Instant`/`OffsetDateTime` <-> ISO-8601; store in UTC `timestamptz`.
- Java enums <-> exact uppercase tokens from [DTO_CATALOG.md](DTO_CATALOG.md).
- Point amounts remain integer; no floating point.
- File size uses non-negative 64-bit integer.
- `version` maps to response and `ETag`; `If-Match` maps to expected version.

## Security rules

- Never map request values into ID, owner, author, participant, role, status, balance, reward, price snapshot, aggregate count, audit actor, or timestamps.
- Never return password hashes, JWTs, refresh tokens/hashes, signing keys, Neon credentials, private object keys, meeting links to non-participants, or idempotency keys.
- Public, user, participant, and admin mappings are separate.
- Mapping tests prove private-field exclusion, snapshots, and caller-conditional fields.
