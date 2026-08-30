# SkillBridge Context Index

The root [forbackend.md](../forbackend.md) is the implementation guide; root-level [README.md](../README.md) covers setup and [PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md) is the technical deep-dive with the end-to-end flow diagram.

Current state of `dev`: **all feature domains are implemented** — auth, user profile/dashboard, skills, mentors and offerings, swap requests (+ request facade), sessions, reviews, wallet with escrow, notifications, forum, moderation, and admin. Flyway migrations run **V1–V8 plus V4.1** (skills catalog, applied out of order by design). The test suite runs **62 passing tests** via `mvnw test`.

Read the guide first, then use the focused files:

1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - product purpose, actors, capabilities, and scope.
2. [BACKEND_CONTEXT.md](BACKEND_CONTEXT.md) - domain modes, workflow invariants, and database rules.
3. [API_CONTRACT.md](API_CONTRACT.md) - canonical REST inventory: Part 1 live routes, Part 2 planned routes.
4. [DTO_CATALOG.md](DTO_CATALOG.md) - actual DTO classes, enum tokens, and validation rules.
5. [API_STANDARDS.md](API_STANDARDS.md) - HTTP, error, pagination, and reliability rules.
6. [AUTHENTICATION_AUTHORIZATION.md](AUTHENTICATION_AUTHORIZATION.md) - JWT, roles, account state, and ownership.
7. [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) - actual package layout and dependency direction.
8. [DTO_MAPPING.md](DTO_MAPPING.md) - entity, DTO, projection, snapshot, and redaction rules.
9. [CONTROLLER_SERVICE_MAP.md](CONTROLLER_SERVICE_MAP.md) - every live controller and its service.
10. [TESTING_MATRIX.md](TESTING_MATRIX.md) - current coverage plus required future layers.
11. [CLEAN_CODE_STANDARDS.md](CLEAN_CODE_STANDARDS.md) - implementation quality rules.
12. [REQUIRED_SKILLS.md](REQUIRED_SKILLS.md) - contributor competencies.

When documents overlap: API_CONTRACT is the single source of truth for routes, AUTHENTICATION_AUTHORIZATION for access decisions, TESTING_MATRIX for verification. Update the relevant contract documents before changing behavior.
