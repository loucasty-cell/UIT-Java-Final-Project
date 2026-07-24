# DTO Mapping Rules

## Mapping approach

- Use feature-local MapStruct mappers for mechanical field conversion.
- Use application assemblers for signed URLs, caller-specific fields, aggregates, and values from more than one entity/projection.
- Mappers are pure: no repository, storage, clock, security-context, or network access.
- Controllers accept request DTOs and return response DTOs only. JPA entities never cross the API boundary.
- Ignore unmapped target properties only when documented; compilation should fail for accidental unmapped fields.

## Write mapping matrix

| Request DTO | Target/use case | Server-owned or ignored fields |
|---|---|---|
| OnboardingRequest | new Profile | ID/email from verified token; role `USER`; status `ACTIVE`; wallet/reward from configuration |
| ProfileUpdateRequest | existing Profile | ID, email, role, status, timestamps, version |
| FileUploadIntentRequest | storage upload intent | owner ID, bucket, object path, expiry, allowed policy |
| FileConfirmRequest | Avatar metadata | owner, verified object facts, storage path |
| CertificateCreateRequest | Certificate | owner, verification state, verified object metadata |
| SkillCreate/UpdateRequest | SkillCatalog | ID, slug normalization, audit timestamps/version |
| UserSkillCreate/UpdateRequest | UserSkill | user from principal; catalog details; conditional mode/price validation |
| LearningRequestCreateRequest | LearningRequest | learner, mentor from offering, price snapshot, status, expiry, escrow, version |
| VolunteerRequestCreateRequest | LearningRequest | mentor/skill from post; mode `VOLUNTEER`; price zero |
| MeetLinkUpdateRequest | existing Session | participants, times, status, completion fields |
| DisputeCreateRequest | Dispute | opener from principal; session/participants; initial state |
| DisputeResolutionRequest | Dispute plus Session/Wallet | admin actor, resolved time, payout/refund ledger types |
| ReviewCreateRequest | Review | reviewer/reviewee from session; reward decision and amount |
| ForumPost/Comment requests | Post/Comment | author from principal; counters and status |
| ReportCreateRequest | Report | reporter from principal; initial state and assignment |
| Admin status/role requests | Profile audit change | admin actor, audit time; never trust target from body |
| WalletAdjustmentRequest | Wallet and PointLedger | admin actor, event type, resulting balances, idempotency record |

Patch DTOs update only non-null submitted fields. A missing field means unchanged; explicit clearing is allowed only for documented nullable fields such as bio, phone, certificate skill, or Meet URL.

## Read mapping matrix

| Source | Response | Mapping notes |
|---|---|---|
| Profile plus auth claims | MyProfileResponse | email comes from verified identity/Auth lookup, not duplicated profile storage |
| Profile projection | PublicProfileResponse | remove email, phone, role internals, account state, private files |
| Storage metadata | Avatar/CertificateResponse | replace object path with an authorized short-lived URL; never expose service credentials |
| SkillCatalog | SkillResponse | stable slug and explicit enabled/version fields |
| UserSkill plus SkillCatalog | UserSkillResponse | flatten catalog summary; do not serialize lazy entity graph |
| Mentor search projection | MentorSummaryResponse | rating/count/session aggregates computed in query; offers limited to enabled matches |
| LearningRequest projection | LearningRequestResponse | participant summaries and skill snapshots; caller cannot alter quoted price/state |
| Session projection | SessionSummary/SessionResponse | include caller role and escrow state derived from mode/status/ledger, not UI assumptions |
| Wallet plus latest ledger | WalletResponse | total is available plus held; ledger remains source of audit truth |
| PointLedger projection | PointTransactionResponse | safe description from event type; no internal idempotency key or admin-only notes |
| Review projection | ReviewResponse | public participant summaries; reward flag visible only as boolean |
| Forum projections | Forum responses | counts computed by query; `likedByMe` uses principal ID |
| Notification | NotificationResponse | payload is allow-listed into safe fields; no arbitrary entity serialization |
| Report/Dispute | participant/admin response | redact admin-only notes and unrelated evidence for ordinary users |
| Aggregate projections | AdminDashboardResponse | query projections only; never load every entity to count in memory |

## Relationship and cycle rules

- Responses use summaries for related users and skills; never nest full resources recursively.
- Entities do not use Lombok-generated `toString`, `equals`, or `hashCode` across relationships.
- Mappers must not trigger lazy loading. Query the exact projection or fetch plan required by the response.
- Collections are mapped through paginated projections, never unbounded entity lists.
- Historical responses use request-time skill/price snapshots where later catalog edits would change meaning.

## Type conversions

- Database UUID <-> JSON string UUID.
- `Instant` <-> ISO-8601 UTC with `Z`; reject ambiguous local timestamps.
- Enums <-> exact uppercase tokens from `DTO_CATALOG.md`; unknown values fail validation.
- Point amounts remain integers; no floating-point conversion.
- Phone remains text. File size is a non-negative 64-bit integer.
- `version` maps to response body and `ETag`; `If-Match` maps back to the expected version.

## Security rules

- Never map request values into ID, owner, role, status, balance, reward, aggregate count, audit actor, or timestamps.
- Never return password hashes, JWTs, refresh tokens, database credentials, storage service keys, private object paths, or idempotency keys.
- Admin mappings are separate from public/user mappings; adding a field to one must not automatically expose it in another.
- Mapping tests must prove private-field exclusion and conditional field behavior.
