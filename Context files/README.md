# SkillBridge Context Index

Read these files before implementation. Each file is authoritative for its own concern:

1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) — product goal, actors, MVP, and success criteria.
2. [BACKEND_CONTEXT.md](BACKEND_CONTEXT.md) — business workflow, database, Supabase, and system-of-record decisions.
3. [API_STANDARDS.md](API_STANDARDS.md) — HTTP-wide conventions.
4. [API_CONTRACT.md](API_CONTRACT.md) — complete endpoint inventory and endpoint-level requirements.
5. [DTO_CATALOG.md](DTO_CATALOG.md) — request/response fields and validation.
6. [DTO_MAPPING.md](DTO_MAPPING.md) — entity, DTO, projection, and derived-field mapping rules.
7. [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md) — token flow and permission matrix.
8. [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) — modules, layers, transactions, and dependencies.
9. [CONTROLLER_SERVICE_MAP.md](CONTROLLER_SERVICE_MAP.md) — controller and application-service ownership.
10. [CLEAN_CODE_STANDARDS.md](CLEAN_CODE_STANDARDS.md) — implementation quality rules.
11. [TESTING_MATRIX.md](TESTING_MATRIX.md) — required automated coverage and release gates.
12. [REQUIRED_SKILLS.md](REQUIRED_SKILLS.md) — contributor knowledge requirements.

When a concern overlaps, use the concern-specific file: business rules come from `BACKEND_CONTEXT`, wire formats from `API_CONTRACT` and `DTO_CATALOG`, access decisions from `AUTHENTICATION_AUTHORIZATION`, and verification requirements from `TESTING_MATRIX`.

No implementation should introduce an endpoint, DTO field, state transition, point event, or permission that is absent from these files. Update the relevant context and OpenAPI contract first.
