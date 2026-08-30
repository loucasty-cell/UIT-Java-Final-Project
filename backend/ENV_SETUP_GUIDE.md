# .env Setup Guide - SkillBridge Backend

## ✅ What Was Created

Your `.env` file is ready at: `backend/.env`

Contains all required configuration:
- ✅ Database connection (PostgreSQL)
- ✅ Flyway migrations (auto-managed)
- ✅ Server port 9095
- ✅ JWT security
- ✅ CORS enabled
- ✅ Logging & monitoring

---

## 🚀 Quick Setup (Choose One)

### Option 1: Local PostgreSQL

```sql
psql -U postgres

CREATE DATABASE skillbridge;
CREATE USER skillbridge WITH PASSWORD 'skillbridge';
GRANT ALL PRIVILEGES ON DATABASE skillbridge TO skillbridge;
\q
```

✅ .env already configured for this!

### Option 2: Neon Cloud (Recommended - Free)

1. Go to neon.tech
2. Sign up → Create project
3. Copy connection string from dashboard
4. Edit `backend/.env` lines 35-37:

```env
DATABASE_URL=jdbc:postgresql://ep-xxx-xxx.us-east-2.aws.neon.tech/skillbridge?sslmode=require
DATABASE_USERNAME=your_neon_user
DATABASE_PASSWORD=your_neon_password
```

### Option 3: Docker

```powershell
docker run --name skillbridge-db `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=skillbridge `
  -e POSTGRES_USER=skillbridge `
  -p 5432:5432 `
  -d postgres:16
```

✅ .env already configured for this!

---

## 📋 Key Settings in .env

| Setting | Value | Notes |
|---------|-------|-------|
| DATABASE_URL | jdbc:postgresql://localhost:5432/skillbridge | Connection string |
| DATABASE_USERNAME | skillbridge | DB user |
| DATABASE_PASSWORD | skillbridge | DB password |
| SERVER_PORT | 9095 | Backend port |
| JWT_SECRET | [development key] | Change in production |
| FLYWAY_ENABLED | true | Auto migrations |
| SKILLBRIDGE_CORS_ALLOWED_ORIGINS | http://localhost:* | Frontend access |

---

## ✅ Before Starting Backend

1. Create database (see options above)
2. PostgreSQL is running
3. Port 9095 is free
4. `.env` file exists in `backend/` folder

---

## 🎯 Start Backend

```powershell
cd backend

# Run tests (62 should pass)
.\mvnw.cmd clean test

# Start server
.\mvnw.cmd spring-boot:run

# Expected: "Tomcat started on port(s): 9095"
```

---

## ✅ Verify Working

```powershell
# Health check
curl http://localhost:9095/actuator/health

# API docs
http://localhost:9095/swagger-ui.html
```

---

## 🆘 Common Issues

| Issue | Fix |
|-------|-----|
| Connection refused | Start PostgreSQL |
| Bad credentials | Check DATABASE_USERNAME & PASSWORD |
| Port in use | Change SERVER_PORT to 9096 |
| Migration failed | Delete DB, recreate, restart |

---

**Status:** ✅ Ready to go!
