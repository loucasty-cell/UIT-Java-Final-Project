# Production Deployment Configuration Guide

**Status:** Ready for Production  
**Updated:** August 30, 2026

---

## GitHub Secrets Required

Set these in: `Settings → Secrets and variables → Actions`

### Frontend Secrets
```
VITE_API_BASE_URL = https://api.skillbridge.dev
```

### Backend Secrets (Staging)
```
STAGING_DATABASE_URL = postgresql://user:pass@host/db?sslmode=require
STAGING_JWT_SECRET = <generated-secure-key>
STAGING_HOST = staging-server.example.com
```

### Backend Secrets (Production - CRITICAL)
```
DATABASE_URL = postgresql://user:pass@host/db?sslmode=require
DATABASE_USERNAME = <prod-user>
DATABASE_PASSWORD = <prod-password>
JWT_SECRET = <generated-secure-key> (Change from default!)
CORS_ALLOWED_ORIGINS = https://skillbridge.dev,https://www.skillbridge.dev
```

### Deployment Secrets
```
AWS_ACCESS_KEY_ID = <aws-key>
AWS_SECRET_ACCESS_KEY = <aws-secret>
DEPLOY_KEY = <ssh-private-key>
PRODUCTION_HOST = production-server.example.com
SONAR_HOST_URL = https://sonarqube.example.com
SONAR_TOKEN = <sonar-token>
```

---

## Environment Configuration

### Frontend (.env / .env.production)
**Development:**
```env
VITE_API_BASE_URL=http://localhost:9095
NODE_ENV=development
```

**Production:**
```env
VITE_API_BASE_URL=https://api.skillbridge.dev
NODE_ENV=production
VITE_BUILD_MINIFY=true
```

### Backend (backend/.env / backend/.env.production)
**Development:**
```env
DATABASE_URL=postgresql://localhost:5432/skillbridge
SERVER_PORT=9095
JWT_SECRET=dev-key
SPRING_PROFILES_ACTIVE=development
```

**Production:**
```env
DATABASE_URL=${DATABASE_URL}
SERVER_PORT=9095
JWT_SECRET=${JWT_SECRET}
SPRING_PROFILES_ACTIVE=production
CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
```

---

## CI/CD Pipeline Rules

| Branch | Event | Action |
|--------|-------|--------|
| main | Push | Build → Test → Deploy Production |
| develop | Push | Build → Test → Deploy Staging |
| Any | PR | Build → Test → Quality Check |

---

## Port Configuration (LOCKED)

```
Frontend:  3000 (vite.config.ts)
Backend:   9095 (backend/.env.production)
API:       https://api.skillbridge.dev
Database:  5432 (PostgreSQL)
```

✅ ALWAYS CONSISTENT

---

## Security Checklist

✅ Store secrets in GitHub Secrets  
✅ Use environment variables for sensitive data  
✅ Rotate JWT secrets quarterly  
✅ Enable branch protection on main  
✅ Require PR reviews  
✅ Use HTTPS for all URLs  
✅ Never commit .env files  

---

## Deployment Flow

```
Push to main/develop
    ↓
GitHub Actions triggered
    ↓
Build Frontend + Backend
Test + Security Scan
    ↓
Deploy Staging (develop) OR Production (main)
    ↓
✅ Complete
```

---

## Health Check URLs

```bash
# Frontend
https://skillbridge.dev

# Backend Health
https://api.skillbridge.dev/actuator/health

# Backend Metrics
https://api.skillbridge.dev/actuator/metrics
```

---

**Ready for Production Deployment** ✅
