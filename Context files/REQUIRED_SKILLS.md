# Required Skills

These are contributor competencies for implementing the planned backend.

- Java 21: records, enums, validation types, time, exceptions, collections, and concurrency.
- Spring Boot 3.x: MVC, dependency injection, validation, configuration, Actuator, testing, and Tomcat 10.1+.
- Jakarta APIs: use jakarta.* and never legacy javax.servlet.
- Spring Security: password hashing, JWT validation, refresh rotation, roles, account states, ownership, CORS, and method security.
- REST: resource methods/statuses, pagination, idempotency, RFC 9457, multipart, CSV, and OpenAPI 3.1.
- PostgreSQL/Neon: UUIDs, constraints, indexes, timestamptz, transactions, row locks, query plans, SSL, pooled connections, and environment isolation.
- Spring Data JPA: entity mapping, projections, optimistic versions, and locking queries without exposing entities.
- Flyway: forward-only PostgreSQL migrations, seed data, indexes, and upgrade validation.
- Testing: JUnit 5, AssertJ, MockMvc, Testcontainers, contract tests, concurrency tests, and isolated fixtures.
- Engineering: clean boundaries, DTO mapping, secure logging, observability, Git discipline, and incremental contract-first delivery.

## Spring Boot features to use

Use these Spring Boot features when implementing the backend:

| Backend need | Spring Boot feature | Expected location or use |
|---|---|---|
| REST endpoints | Spring MVC, `@RestController`, `@RequestMapping` | `api/controller` |
| Input validation | Bean Validation, `@Valid`, `@Validated` | request DTOs and controller boundary |
| Use-case logic | Dependency injection and `@Service` | `application/command` and `application/query` |
| Database transactions | `@Transactional` | command services; read-only queries where appropriate |
| Authentication | Spring Security filter chain and JWT resource-server validation | `shared/security` |
| Authorization | method security such as `@PreAuthorize` plus service ownership checks | controllers and application services |
| Persistence | Spring Data JPA repositories and projections | `infrastructure/persistence` |
| Error responses | `@RestControllerAdvice` and RFC 9457 `ProblemDetail` | `shared/error` and `shared/web` |
| Database changes | Flyway migrations; Hibernate `ddl-auto=validate` | `src/main/resources/db/migration` |
| Scheduled work | `@EnableScheduling` and repeat-safe scheduled services | `shared/scheduling` |
| Domain notifications | Spring application events and event listeners | `shared/events` and feature application code |
| Monitoring | Spring Boot Actuator and structured logging | `shared/observability` |
| API documentation | OpenAPI 3.1 / springdoc configuration | `src/main/resources/openapi` and shared configuration |
| Testing | Spring Boot Test, MockMvc, Testcontainers, JUnit 5 | `src/test/java/com/skillbridge` |

Keep controllers HTTP-only, keep business rules in application/domain layers,
and keep repositories, storage clients, schedulers, and external APIs out of
controllers. Do not expose JPA entities directly in REST responses.

Before implementing points, escrow, swaps, disputes, or completion, understand idempotency, locking, snapshots, state transitions, and audit requirements.
