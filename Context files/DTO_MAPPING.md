# DTO Mapping Rules

## Boundary

Controllers accept and return DTOs only. Entities, password data, token hashes, private keys, admin notes, and unauthorized URLs never cross the API boundary.

Feature-local mappers handle mechanical conversions. Application assemblers add caller-aware fields, aggregates, authorized URLs, snapshots, and projections. Mappers do not access repositories, security context, clocks, storage, or networks.

## Write rules

- Map only client-owned fields from request DTOs.
- Derive owner, author, participant, role, price, reward, balance, counts, rating, timestamps, status, and version from authenticated or persisted state.
- Resolve UUID relationships and validate ownership before writing.
- Apply Bean Validation at the API boundary and domain validation in the application layer.
- Reject or ignore unknown server-owned fields according to the API contract.
- Use one application command and transaction for each state-changing request.

## Read rules

- Use dedicated response DTOs and projections for dashboard, mentor, session, wallet, forum, notification, search, and admin views.
- Redact private fields by caller, role, account state, and participant relationship.
- Return page metadata for collections and stable sort values.
- Do not expose JPA entities or bidirectional object graphs.

## Snapshots and conversions

- Snapshot offering price, point deadlines, reward values, and reciprocal swap skills when the workflow begins.
- Convert Java enums to the exact uppercase tokens in DTO_CATALOG.
- Convert UUIDs to strings, timestamps to ISO-8601 UTC values, and PostgreSQL numeric values to the documented API types.
- Keep mapping deterministic and test unmapped fields.
