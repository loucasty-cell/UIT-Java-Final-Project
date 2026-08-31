# SkillBridge Backend — Build & Deployment Rules

## 🏗️ Maven Build

```bash
./mvnw clean package              # Full build with tests
./mvnw clean package -DskipTests  # Skip tests
./mvnw test -Dtest=UserServiceTest  # Run specific test
chmod +x mvnw                     # Grant permissions
```

## 🚀 Running Locally

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/skillbridge
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export JWT_SECRET=your-256-bit-secret
export SPRING_PROFILES_ACTIVE=dev

./mvnw spring-boot:run
# Runs on http://localhost:9095
```

## 🗄️ Flyway Migrations

**Location**: `src/main/resources/db/migration/`  
**Format**: `V<VERSION>__<DESCRIPTION>.sql`

```bash
# Create new migration
touch src/main/resources/db/migration/V20__add_feature.sql
```

**Best Practices**:
- Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- Create indexes on frequently queried columns
- Use `TIMESTAMPTZ` for timestamps
- Test locally before pushing

## 🔐 Neon PostgreSQL

**Connection**: `postgresql://user:pass@host.neon.tech/db?sslmode=require`

**Setup**:
```bash
export DATABASE_URL="postgresql://..."
psql $DATABASE_URL -c "SELECT version();"
./mvnw spring-boot:run
```

**Backup**: Automated daily (7-day retention)

## 🔄 GitHub Actions

**Branches**:
- `develop` → Staging
- `main` → Production

**Required Secrets**:
```
DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD
JWT_SECRET, JWT_ACCESS_MINUTES, JWT_REFRESH_DAYS
SONARQUBE_TOKEN, NEON_DATABASE_URL
```

**Pipeline**:
1. Checkout
2. Java 25 setup
3. Run tests
4. Build JAR
5. Security scan
6. Deploy

## 💻 VS Code Setup

**Extensions**: Java, Spring Boot, Lombok, REST Client, GitLens

**Ports**:
- Backend: http://localhost:9095
- Swagger: http://localhost:9095/swagger-ui.html
- PostgreSQL: localhost:5432

## 🧪 Testing

```bash
./mvnw test                    # All tests
./mvnw test -Dtest=UserServiceTest  # Specific test
./mvnw test jacoco:report      # Coverage report
```

## 🔍 Health Check

```bash
curl http://localhost:9095/actuator/health
curl http://localhost:9095/actuator/metrics
```

## 🚨 Troubleshooting

**Port in use**: `lsof -i :9095` → `kill -9 <PID>`  
**DB connection**: `psql -U postgres -h localhost -c "SELECT 1;"`  
**Token expired**: POST `/api/v1/auth/refresh`
