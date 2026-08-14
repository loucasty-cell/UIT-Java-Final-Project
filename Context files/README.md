# SkillBridge Context Index

The root [forbackend.md](../forbackend.md) is the authoritative implementation guide. This checkout contains documentation and a partial backend implementation. The context files describe the implemented mentor/forum behavior plus planned behavior and contracts for features not yet implemented.

Read the guide first, then use the focused files:

1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - product purpose, actors, capabilities, and scope.
2. [BACKEND_CONTEXT.md](BACKEND_CONTEXT.md) - domain modes, workflow invariants, and database rules.
3. [API_CONTRACT.md](API_CONTRACT.md) - complete REST route inventory.
4. [DTO_CATALOG.md](DTO_CATALOG.md) - complete request, response, enum, and validation inventory.
5. [API_STANDARDS.md](API_STANDARDS.md) - HTTP, error, pagination, and reliability rules.
6. [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md) - JWT, roles, account state, and ownership.
7. [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) - actual package layout and dependency direction.
8. [DTO_MAPPING.md](DTO_MAPPING.md) - entity, DTO, projection, snapshot, and redaction rules.
9. [CONTROLLER_SERVICE_MAP.md](CONTROLLER_SERVICE_MAP.md) - planned controller and application ownership.
10. [TESTING_MATRIX.md](TESTING_MATRIX.md) - required test layers and scenarios.
11. [CLEAN_CODE_STANDARDS.md](CLEAN_CODE_STANDARDS.md) - implementation quality rules.
12. [REQUIRED_SKILLS.md](REQUIRED_SKILLS.md) - contributor competencies.

When documents overlap, use the root guide for implementation decisions, API_CONTRACT and DTO_CATALOG for public interfaces, AUTHENTICATION_AUTHORIZATION for access decisions, and TESTING_MATRIX for verification. Update the relevant contract documents before changing behavior.
