# Clean Coding Standards

## Structure

- Follow the package-by-feature scaffold under com.skillbridge.
- Keep controllers HTTP-only, application services use-case-focused, domain rules explicit, and infrastructure replaceable.
- Use constructor injection, immutable values where practical, clear names, and small cohesive methods.
- Do not add speculative abstractions, hidden controllers, direct repository calls from controllers, or cross-feature repository access.
- Do not copy client mock data into backend constants.

## Data and transactions

- Use PostgreSQL-compatible SQL, UUIDs, constraints, indexes, UTC timestamptz, and Flyway.
- Use JPA validation only; never Hibernate schema creation in shared environments.
- Keep point mutations behind WalletService.
- Use explicit transactions, row locks, optimistic versions, and idempotency for state-changing workflows.
- Keep external storage transfer outside long database transactions.

## API and security

- Validate transport input with Bean Validation and domain rules in services.
- Return DTOs and stable RFC 9457 problems; never entities, hashes, secrets, private keys, or unauthorized URLs.
- Use explicit CORS, rate limits, caller-aware redaction, and request IDs.
- Never log credentials, tokens, database URLs, meeting links, or file contents.

## Change discipline

When behavior changes, update API_CONTRACT, DTO_CATALOG, mapping/security rules, Flyway, OpenAPI, and tests together. Never edit an applied migration. Keep tests deterministic and independent.
