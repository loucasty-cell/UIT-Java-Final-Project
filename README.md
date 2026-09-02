# JAVA-PROJECT - SkillBridge Platform

A full-stack peer-to-peer learning and skill exchange platform with clear separation between frontend and backend services.

## 🏗️ Project Structure

```
JAVA-PROJECT/
├── backend/                    # Java 25 + Spring Boot 3.5 REST API
│   ├── src/main/java/         # Backend source code
│   ├── src/test/java/         # Backend tests (62 tests, all passing)
│   ├── src/main/resources/    # DB migrations, config, static assets
│   ├── pom.xml                # Maven configuration
│   ├── README.md              # Backend setup & architecture
│   └── Context files/         # Backend technical documentation
├── src/                        # Frontend React/TypeScript code
│   ├── components/            # React components
│   ├── routes/                # TanStack Router pages
│   ├── services/              # API service layer
│   ├── hooks/                 # React custom hooks
│   ├── lib/                   # Utilities & API client
│   └── types/                 # TypeScript types & DTOs
├── public/                    # Static assets
├── package.json               # Frontend dependencies
├── vite.config.ts             # Frontend build config
├── tsconfig.json              # TypeScript config
└── .github/workflows/ci.yml   # CI/CD pipeline
```

## 🚀 Quick Start

### Run this folder on Windows

From the project root, start the frontend:

```powershell
npm install
npm run dev
```

Open **http://localhost:3000**. Keep the terminal open. If port 3000 is occupied,
stop your previous frontend instance or use `npm run dev -- --port 3001`.

In a second PowerShell terminal, start the Java API:

```powershell
cd backend
.\mvnw.cmd "-Dfrontend.skip=true" spring-boot:run
```

The API requires a running PostgreSQL database named `skillbridge` and a private
`backend/.env` containing `JWT_SECRET` (at least 32 characters).
On a new checkout, copy `backend/.env.example`
to `backend/.env`, fill in the database settings, and generate a fresh secret.
Keep `.env` private. Quote Maven `-D` arguments in PowerShell as shown above.

API: **http://localhost:9095**. Health check: **http://localhost:9096/actuator/health**.
`-Dfrontend.skip=true` avoids reinstalling/building the frontend when running the
API alongside Vite.

The current route pages display demo data; starting the API does not automatically
wire those pages to live data. The API services and auth utilities are available
for that integration.

To run the compiled frontend locally:

```powershell
npm run build
npm start
```

Stop the dev server first, since both use port 3000 by default. The Node server
and its runtime dependencies are in `.output/server`, with assets in
`.output/public`; keep the entire `.output` folder together. This SSR frontend
runs separately from Spring Boot and cannot be served by copying assets into a JAR.

### Prerequisites

- **Java 25** (for backend): [Download from Adoptium](https://adoptium.net/)
- **Node.js 22.22.2+** (for frontend): [Download from nodejs.org](https://nodejs.org/)
- **PostgreSQL 16+** or **Neon serverless** (for database)

### Backend Setup

```bash
cd backend

# Create .env file with database credentials
# Copy from .env.example and add your Neon credentials

# Install dependencies & run tests
./mvnw clean test

# Start backend server (port 9095)
./mvnw spring-boot:run
# Or on Windows:
.\mvnw.cmd spring-boot:run
```

Backend runs on `http://localhost:9095`
API docs available at `http://localhost:9095/swagger-ui.html`
## 🔌 API Connectivity

The frontend and backend communicate via HTTP REST API:

| Component | Port | Purpose |
|-----------|------|---------|
| Frontend (Vite) | 3000 | React/TypeScript UI |
| Backend (Spring Boot) | 9095 | REST API, OpenAPI/Swagger docs |
| PostgreSQL | 5432 | Database (local or Neon cloud) |

**Connection Flow:**
```
Browser (localhost:3000)
    ↓
src/lib/api-client.ts (configures axios)
    ↓ VITE_API_BASE_URL=http://localhost:9095
src/services/*.ts (API calls)
    ↓
Backend /api/v1/* endpoints (port 9095)
    ↓
PostgreSQL database
```

### CORS Configuration

Backend accepts requests from any localhost port during development:
```yaml
# backend/src/main/resources/application.yml
skillbridge:
  cors:
    allowed-origins: "http://localhost:*"
```

For production, set `FRONTEND_ORIGINS` environment variable to specific domain.

## 📚 Documentation

| File | Purpose |
|------|---------|
| [backend/README.md](backend/README.md) | Backend architecture, setup, endpoints |
| [backend/forbackend.md](backend/forbackend.md) | Implementation guide for backend developers |
| [backend/requirements.md](backend/requirements.md) | Development environment setup |
| [backend/Context files/API_CONTRACT.md](backend/Context%20files/API_CONTRACT.md) | Full API endpoint reference |
| [frontREADME.md](frontREADME.md) | Frontend architecture & component guide |

## 🔐 Environment Variables

### Backend (.env in `backend/` folder)

```env
# Database (Neon or local PostgreSQL)
DATABASE_URL=jdbc:postgresql://[host]:5432/skillbridge
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# Server
SERVER_PORT=9095

# JWT Security (change in production!)
JWT_SECRET=your_256_bit_secret_key_here

# Frontend CORS (production)
FRONTEND_ORIGINS=https://your-frontend-domain.com

# Feature flags
FLYWAY_ENABLED=true
```

### Frontend (.env in root folder)

```env
VITE_API_BASE_URL=http://localhost:9095
```

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Backend health check
curl http://localhost:9096/actuator/health

# 2. Backend API accessible
curl http://localhost:9095/api/skills

# 3. Frontend runs
npm run dev

# 4. Frontend console shows no CORS errors
# (Open http://localhost:3000 in browser, check DevTools Console)

# 5. Make test API call from frontend
# (Try login/registration in UI)
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test          # Run all 62 tests
./mvnw test -Dtest=SkillControllerTest  # Run specific test
```

### Frontend Tests
```bash
npm run build        # Type check and build
npx tsc --noEmit     # Type check without building
```

## 📦 Building for Production

### Backend
```bash
cd backend
./mvnw clean package -DskipTests
# JAR file: backend/target/skillbridge-backend-*.jar
```

### Frontend
```bash
npm run build
# Built server and assets: .output/
```

## 🔄 CI/CD Pipeline

GitHub Actions automatically runs on push to `main` branch:
- Backend: Compiles, runs 62 tests, packages JAR
- Frontend: Type checks, builds, validates

See [.github/workflows/ci.yml](.github/workflows/ci.yml) for details.

## 📝 License

Apache 2.0 - See [LICENSE](LICENSE)

---

**Last Updated:** 2026-08-30
**Status:** Full-stack ready for development


**See [backend/README.md](backend/README.md) for detailed setup instructions.**

### Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file with API URL
echo "VITE_API_BASE_URL=http://localhost:9095" > .env

# Run development server (port 3000)
npm run dev

# Build for production
npm run build
```

Frontend runs on `http://localhost:3000`
