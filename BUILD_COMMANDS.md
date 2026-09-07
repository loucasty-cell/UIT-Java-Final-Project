# Build & Setup Commands Guide

Complete reference for all build and setup commands needed in the SkillBridge project.

---

## Quick Start

After cloning or pulling the repository, run:

```powershell
.\post-pull.ps1
```

This script automatically:
- ✅ Installs/updates frontend dependencies if `package.json` changed
- ✅ Installs/updates backend dependencies if `pom.xml` changed
- ✅ Verifies TypeScript compilation
- ✅ Verifies Java compilation

---

## Frontend Commands

### Install Dependencies

```powershell
npm install
npm ci --force  # Clean install
```

### Development

```powershell
npm run dev              # Start dev server on http://localhost:3000
npm run type-check       # Check TypeScript
npm run lint             # Lint code
npm run format           # Format code
```

### Building

```powershell
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build
```

### Verify

```powershell
npm list --depth=0       # List dependencies
npm audit                # Check vulnerabilities
npm outdated             # Check outdated packages
```

---

## Backend Commands

### Install Dependencies

```powershell
cd backend
.\mvnw.cmd clean install              # Full build with tests
.\mvnw.cmd clean install -DskipTests  # Skip tests (faster)
.\mvnw.cmd dependency:resolve         # Dependencies only
```

### Compilation

```powershell
cd backend
.\mvnw.cmd compile        # Compile source
.\mvnw.cmd test-compile   # Compile tests
```

### Running

```powershell
cd backend
.\mvnw.cmd spring-boot:run  # Run on port 9095
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=9096"
```

### Testing

```powershell
cd backend
.\mvnw.cmd test                                    # Run all tests
.\mvnw.cmd test -Dtest=DashboardQueryServiceTest  # Specific test
.\mvnw.cmd clean test jacoco:report               # With coverage
```

### Building

```powershell
cd backend
.\mvnw.cmd clean package                           # Build JAR
.\mvnw.cmd clean package -Dfrontend.skip=false    # With embedded frontend
```

### Database Migrations

```powershell
cd backend
.\mvnw.cmd flyway:info     # Check status
.\mvnw.cmd flyway:migrate  # Apply migrations
.\mvnw.cmd flyway:repair   # Repair if corrupted
```

---

## Development Setup

### One-Time Setup

```powershell
npm install
cd backend && .\mvnw.cmd clean install -DskipTests && cd ..
cp backend\.env.example backend\.env
# Edit backend\.env with database credentials
npm run type-check
cd backend && .\mvnw.cmd compile && cd ..
```

### After Git Pull

```powershell
.\post-pull.ps1
```

### Running Both Servers

**Terminal 1 - Backend:**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

---

## Production Build

### Single JAR with Embedded Frontend

```powershell
cd backend
.\mvnw.cmd clean package -Dfrontend.skip=false
java -jar target/skillbridge-backend-0.0.1-SNAPSHOT.jar
```

---

## Troubleshooting

### npm install fails

```powershell
npm cache clean --force
npm install
```

### Maven downloads fail

```powershell
cd backend
rmdir -Recurse -Force $HOME\.m2\repository\com\skillbridge
.\mvnw.cmd clean install -U -DskipTests
```

### Flyway migration fails

```powershell
cd backend
.\mvnw.cmd flyway:info
.\mvnw.cmd flyway:repair
.\mvnw.cmd flyway:migrate
```

### Port already in use

```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :9095
taskkill /PID <PID> /F
```

---

## Command Quick Reference

| Task | Command |
|------|---------|
| Setup (first time) | `npm install && cd backend && .\mvnw.cmd clean install -DskipTests` |
| After pull | `.\post-pull.ps1` |
| Start frontend | `npm run dev` |
| Start backend | `cd backend && .\mvnw.cmd spring-boot:run` |
| Type check | `npm run type-check` |
| Build frontend | `npm run build` |
| Build backend JAR | `cd backend && .\mvnw.cmd clean package` |
| Run tests | `cd backend && .\mvnw.cmd test` |
| Format code | `npm run format` |
| Check deps | `npm list --depth=0` |
| Database status | `cd backend && .\mvnw.cmd flyway:info` |

---

*Last Updated: 2026-09-03*

# Build & Setup Commands Guide

Complete reference for all build and setup commands needed in the SkillBridge project.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Frontend Commands](#frontend-commands)
- [Backend Commands](#backend-commands)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Development Setup](#development-setup)
- [Production Build](#production-build)
- [Troubleshooting](#troubleshooting)
- [Automation](#automation)

---

## Quick Start

After cloning or pulling the repository, run this automated script:

```powershell
# Windows PowerShell
.\post-pull.ps1
```

This script automatically:
- ✅ Installs/updates frontend dependencies if `package.json` changed
- ✅ Installs/updates backend dependencies if `pom.xml` changed
- ✅ Verifies TypeScript compilation
- ✅ Verifies Java compilation
- ✅ Alerts about new database migrations

**Manual equivalent:**
```powershell
npm install
cd backend && .\mvnw.cmd clean install -DskipTests && cd ..
npm run type-check
cd backend && .\mvnw.cmd compile && cd ..
```

---

## Frontend Commands

### Install Dependencies

```powershell
# Initial setup or after package.json changes
npm install

# Clean install (nuclear option for dependency issues)
npm ci --force
```

### Development

```powershell
# Start dev server (hot reload)
npm run dev

# Open browser: http://localhost:3000
```

### Type Checking

```powershell
# Check TypeScript without emitting
npm run type-check

# Run with watch mode (optional - not in package.json)
# tsc --noEmit --watch
```

### Building

```powershell
# Production build (includes type-check)
npm run build

# Build in development mode (faster, less optimization)
npm run build:dev

# Preview production build locally
npm run preview
```

### Code Quality

```powershell
# Linting
npm run lint

# Format code
npm run format
```

### Verify Installation

```powershell
# List top-level dependencies
npm list --depth=0

# Check for security vulnerabilities
npm audit

# Check for outdated packages
npm outdated
```

---

## Backend Commands

### Install Dependencies

```powershell
cd backend

# Full build with tests
.\mvnw.cmd clean install

# Fast install (skip tests)
.\mvnw.cmd clean install -DskipTests

# Fast install (quiet mode, skip tests)
.\mvnw.cmd clean install -DskipTests -q

# Dependency only (no compilation)
.\mvnw.cmd dependency:resolve
```

### Compilation

```powershell
cd backend

# Compile source code
.\mvnw.cmd compile

# Compile including tests
.\mvnw.cmd test-compile

# Clean compiled classes
.\mvnw.cmd clean
```

### Running

```powershell
cd backend

# Run with Spring Boot Maven plugin
.\mvnw.cmd spring-boot:run

# Run with custom port (if needed to override application.yml)
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=9096"
```

### Testing

```powershell
cd backend

# Run all tests
.\mvnw.cmd test

# Run specific test class
.\mvnw.cmd test -Dtest=DashboardQueryServiceTest

# Run with coverage
.\mvnw.cmd clean test jacoco:report

# Skip tests (for faster builds)
.\mvnw.cmd clean install -DskipTests
```

### Building

```powershell
cd backend

# Build JAR (includes frontend if frontend.skip=false)
.\mvnw.cmd clean package

# Build without frontend
.\mvnw.cmd clean package -Dfrontend.skip=true

# Build with frontend embedded (single JAR)
.\mvnw.cmd clean package -Dfrontend.skip=false
```

### Dependency Management

```powershell
cd backend

# Show dependency tree
.\mvnw.cmd dependency:tree

# Check for outdated dependencies
.\mvnw.cmd versions:display-dependency-updates

# Update plugin versions
.\mvnw.cmd versions:display-plugin-updates
```

### Database Migrations

```powershell
cd backend

# Check migration status
.\mvnw.cmd flyway:info

# Apply pending migrations manually
.\mvnw.cmd flyway:migrate

# Repair migration history (if corrupted)
.\mvnw.cmd flyway:repair
```

---

## Database Setup

### Prerequisites

- PostgreSQL 15+ running (locally or Neon serverless)
- `backend/.env` configured with connection details

### Automatic Setup (Recommended)

Migrations run automatically on backend startup:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
# Flyway applies all pending migrations automatically
```

### Manual Setup

```powershell
cd backend

# Check what needs to be migrated
.\mvnw.cmd flyway:info

# Apply migrations
.\mvnw.cmd flyway:migrate

# View migration status
# Log into database and run:
# SELECT * FROM flyway_schema_history;
```

### Clean Database (Development Only)

```powershell
cd backend

# Clean and re-migrate (DESTROYS DATA - dev only!)
.\mvnw.cmd flyway:clean flyway:migrate
```

---

## Environment Variables

### Frontend (.env)

Create `c:\Users\ASUS\Downloads\UIT-Java-Frontend\.env`:

```env
# Backend API
VITE_API_BASE_URL=http://localhost:9095

# Optional: Debug mode
DEBUG=false
```

### Backend (.env)

Located at `backend/.env`. Copy from `backend/.env.example`:

```bash
# Database (Neon PostgreSQL)
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-xyz.neon.tech:5432/skillbridge
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password

# JWT
JWT_SECRET_KEY=your-secret-key-min-32-chars-long
JWT_EXPIRATION_HOURS=0.25
JWT_REFRESH_EXPIRATION_DAYS=7

# Environment
SPRING_PROFILES_ACTIVE=dev
SPRING_JPA_HIBERNATE_DDL_AUTO=validate

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**⚠️ SECURITY:**
- Never commit `.env` files
- Rotate credentials if exposed in git history
- Use secrets management in production

---

## Development Setup

### One-Time Setup

```powershell
# 1. Clone repository
git clone https://github.com/yourusername/UIT-Java-Frontend.git
cd UIT-Java-Frontend

# 2. Install frontend
npm install

# 3. Install backend
cd backend
.\mvnw.cmd clean install -DskipTests
cd ..

# 4. Configure environment
cp backend\.env.example backend\.env
# Edit backend\.env with your database credentials
```

