# SkillBridge Frontend-Backend Connection Troubleshooting Guide

## 🔴 Problem: "Failed to Fetch" Error on Login/Registration

If you encounter "Failed to fetch" errors when testing login or registration, follow this guide.

---

## ✅ SOLUTION 1: CORS Configuration (ALREADY FIXED!)

**What was changed:**
- Backend now accepts connections from **ANY localhost port** during development
- Uses wildcard pattern: `http://localhost:*`

**Files modified:**
1. `backend/src/main/resources/application.yml` - Added CORS wildcard pattern
2. `backend/src/main/java/.../SecurityConfig.java` - Changed to `setAllowedOriginPatterns`

---

## 🚀 SETUP INSTRUCTIONS

### **Step 1: Start PostgreSQL Database**

```bash
# Ensure PostgreSQL is running on localhost:5432
# Default credentials: postgres/postgres
# Database name: skillbridge
```

### **Step 2: Start Backend (Terminal 1)**

```bash
cd c:\Users\ASUS\Downloads\UIT-Java-Final-Project

# Run Spring Boot backend
.\mvnw.cmd spring-boot:run

# Wait for:
# "Started SkillBridgeApplication in X.XXX seconds"
# "Tomcat started on port 9095"
```

**✅ Backend should be accessible at:** `http://localhost:9095`

**Verify backend is running:**
```bash
curl http://localhost:9095/actuator/health
# Should return: {"status":"UP"}
```

### **Step 3: Start Frontend (Terminal 2)**

```bash
cd c:\Users\ASUS\Downloads\UIT-Java-Frontend

# Install dependencies (first time only)
npm install
# OR if using bun:
bun install

# Start development server
npm run dev
# OR:
bun dev
```

**✅ Note the port** where frontend starts (e.g., `http://localhost:5173`)

### **Step 4: Test Login/Registration**

Open browser to frontend URL and try creating an account or logging in.

---

## 🔍 TROUBLESHOOTING

### **Error: "Failed to fetch"**

**Check 1: Is backend running?**
```bash
curl http://localhost:9095/actuator/health
```
- ✅ If returns `{"status":"UP"}` → Backend is running
- ❌ If "Connection refused" → Start backend first!

**Check 2: Check browser DevTools**
1. Press F12 to open DevTools
2. Go to **Console** tab
3. Try login again
4. Look for error message:

**If error says "CORS policy":**
- Backend CORS should now accept any localhost port
- Restart backend to apply the fix
- Clear browser cache (Ctrl+Shift+Delete)

**If error says "net::ERR_CONNECTION_REFUSED":**
- Backend is not running on port 9095
- Start backend first (see Step 2)

**If error says "404 Not Found":**
- API endpoint mismatch (unlikely - endpoints are correct)
- Check Network tab to see what URL was called

### **Error: "Schedule conflict" or "Time slot conflicts"**

✅ **This is WORKING AS INTENDED!**

The frontend has **15-minute buffer** conflict detection:
- You cannot book back-to-back sessions
- 15-minute break required between sessions
- Choose a different time slot

### **Error: "Insufficient points"**

✅ **This is WORKING AS INTENDED!**

New accounts start with **30 points** (registration bonus).
- Check your wallet balance
- Earn more points by teaching sessions
- Use referral code for bonus points

---

## 📋 ENVIRONMENT VARIABLES (Optional)

### **Frontend (.env file in UIT-Java-Frontend/):**
```env
VITE_API_BASE_URL=http://localhost:9095
```

### **Backend (.env file in UIT-Java-Final-Project/):**
```env
# Only needed if changing defaults
SERVER_PORT=9095
FRONTEND_ORIGINS=http://localhost:*
DATABASE_URL=jdbc:postgresql://localhost:5432/skillbridge
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
```

---

## ✅ VERIFICATION CHECKLIST

Before testing, ensure:
- [ ] PostgreSQL is running (port 5432)
- [ ] Backend is running (port 9095)
- [ ] Frontend is running (any localhost port)
- [ ] Backend shows "Started SkillBridgeApplication" message
- [ ] `curl http://localhost:9095/actuator/health` returns UP
- [ ] Browser DevTools Console shows no CORS errors

---

## 🎯 WHAT'S BEEN FIXED

### ✅ **API Endpoints - 100% Match**
- All frontend API calls match backend endpoints perfectly
- Authentication: `/api/v1/auth/login`, `/api/v1/auth/register`
- Profile: `/api/v1/me`
- Sessions, mentors, wallet, admin - all correct

### ✅ **Schedule Conflict Detection - Implemented**
- Client-side validation with 15-minute buffer
- Prevents double-booking
- Checks only active sessions (SCHEDULED, AWAITING_CONFIRMATION, IN_PROGRESS)
- User-friendly error messages

### ✅ **Status Handling - Comprehensive**
- Learning requests: PENDING, ACCEPTED, REJECTED, CANCELLED, EXPIRED
- Sessions: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- Proper error handling for conflicts (HTTP 409)
- Real-time updates via React Query

### ✅ **CORS Configuration - Fixed**
- Backend now accepts **any localhost port** during development
- Wildcard pattern: `http://localhost:*`
- Production-ready: Set `FRONTEND_ORIGINS` env var for specific domains

---

## 🚨 PRODUCTION DEPLOYMENT

**⚠️ IMPORTANT:** Before deploying to production:

1. **Change CORS configuration:**
```env
FRONTEND_ORIGINS=https://your-frontend-domain.com
```

2. **Change JWT secret:**
```env
JWT_SECRET=your_very_secure_random_secret_key_here
```

3. **Update database credentials:**
```env
DATABASE_URL=jdbc:postgresql://your-db-host:5432/skillbridge?ssl=true
DATABASE_USERNAME=production_user
DATABASE_PASSWORD=secure_password
```

4. **Update frontend API URL:**
```env
VITE_API_BASE_URL=https://your-backend-api.com
```

---

## 📞 STILL HAVING ISSUES?

If problems persist after following this guide:

1. **Check Backend Logs:**
   - Look for exception stack traces in backend console
   - Check for database connection errors

2. **Check Frontend Logs:**
   - Browser DevTools → Console tab
   - Look for red error messages

3. **Restart Everything:**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Clear browser cache
   - Restart backend, then frontend

4. **Verify Ports:**
   - Backend must be on port 9095
   - Frontend can be on any localhost port
   - PostgreSQL must be on port 5432

---

**Last Updated:** 2026-08-29
**Version:** 1.0.0
