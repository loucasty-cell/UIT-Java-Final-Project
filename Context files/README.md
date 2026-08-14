# SkillBridge Context Index

Read these files before backend implementation. They describe the current Lovable/React frontend contract and the Java 21 backend that must support it.

1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - product goal, actors, frontend routes, MVP, and success criteria.
2. [BACKEND_CONTEXT.md](BACKEND_CONTEXT.md) - authoritative business workflow, Neon PostgreSQL model, and system decisions.
3. [API_STANDARDS.md](API_STANDARDS.md) - HTTP-wide REST conventions.
4. [API_CONTRACT.md](API_CONTRACT.md) - complete frontend-facing endpoint inventory.
5. [DTO_CATALOG.md](DTO_CATALOG.md) - request, response, query, enum, and validation contract.
6. [DTO_MAPPING.md](DTO_MAPPING.md) - entity, DTO, projection, snapshot, and derived-field rules.
7. [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md) - Spring Security JWT flow and permission matrix.
8. [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) - modules, layers, transactions, Tomcat, Neon, and dependencies.
9. [CONTROLLER_SERVICE_MAP.md](CONTROLLER_SERVICE_MAP.md) - controller and application-service ownership.
10. [CLEAN_CODE_STANDARDS.md](CLEAN_CODE_STANDARDS.md) - implementation quality rules.
11. [TESTING_MATRIX.md](TESTING_MATRIX.md) - required automated coverage and release gates.
12. [REQUIRED_SKILLS.md](REQUIRED_SKILLS.md) - contributor knowledge requirements.

The root [forbackend.md](../forbackend.md) is the implementation guide that this context set expands. When concerns overlap, use the concern-specific file: business rules come from `BACKEND_CONTEXT`, HTTP routes from `API_CONTRACT`, wire fields from `DTO_CATALOG`, access decisions from `AUTHENTICATION_AUTHORIZATION`, and verification requirements from `TESTING_MATRIX`.

No implementation may introduce an endpoint, DTO field, state transition, point event, permission, or database table that conflicts with these files. Update this context set and the OpenAPI contract before changing behavior.
