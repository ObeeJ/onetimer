# OneTimer - Quick Reference Guide

## 🚀 System Status

```
✅ All Containers Running
   - PostgreSQL: Port 5432
   - Redis: Port 6379
   - Backend (Fiber/Go): Port 8081 (Internal)
   - Frontend (Next.js): Port 3001
   - Nginx Proxy: Port 80 → localhost:3000

✅ Database Connected
   - Tables: users, surveys, questions, responses, earnings
   - Seed Data: Loaded
   - User Count: 1

✅ API Responding
   - Health: /api/health (✓)
   - Endpoints: 125 handlers registered
```

---

## 🔐 Authentication Status by Role

### Filler (Survey Respondent)
```
Registration  ✅ Works (not saved to DB)
Login         ❌ Broken (TODO: fetch from DB)
OTP Send      ❌ Crashes (nil pointer)
OTP Verify    ✅ Works (dev bypass: "123456")
Dashboard     ❌ Endpoint missing
```

### Creator (Survey Creator)
```
Registration  ⚠️  Not tested
Login         ⚠️  Needs implementation
Dashboard     ✅ Page exists, no API
```

### Admin
```
Login         ❌ Not implemented
Dashboard     ✅ Page exists, no API
```

### Super Admin
```
Login         ❌ Not implemented (MFA required)
Dashboard     ✅ Page exists, no API
```

---

## 📊 API Endpoint Status

### Working ✅
- `GET /api/health` - Health check
- `POST /api/user/register` - User registration (response only)
- `POST /api/auth/verify-otp` - OTP verification (dev bypass)
- `GET /api/user/profile` - Mock profile
- `GET /api/auth/login` - Endpoint exists (returns invalid creds)

### Broken ❌
- `POST /api/auth/send-otp` - Crashes (nil pointer)
- `GET /api/survey` - Returns error
- `GET /api/filler/dashboard` - Not found
- `POST /api/auth/login` - Always invalid (no DB query)

### Not Implemented ⚠️
- Creator auth endpoints
- Admin routes
- Super admin routes
- Most dashboard endpoints

---

## 🗄️ Database Status

### Connected ✅
```
URL: postgresql://user:password@postgres:5432/onetimer
Status: Connected
Migrations: Applied
Seed Data: Loaded
```

### Data Persistence Issues ❌
```
User Registration:  Doesn't save to DB ❌
User Login:         Doesn't query DB ❌
Survey Queries:     Incomplete queries ❌
```

---

## 🔧 Quick Test Commands

### Test Health
```bash
curl http://localhost:3000/api/health | jq .
```

### Register User
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"Pass123!"}'
```

### Verify OTP (Dev)
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Get Surveys
```bash
curl http://localhost:3000/api/survey | jq .
```

### Check DB
```bash
docker exec onetimer_postgres_1 psql -U user -d onetimer -c "SELECT * FROM users;"
```

---

## 📁 Key Files to Modify

### Backend Controllers (Go)

| File | Issue | Priority |
|------|-------|----------|
| `/backend/api/controllers/login.controller.go` | Line 36: TODO fetch from DB | 🔴 HIGH |
| `/backend/api/controllers/user.controller.go` | Line 62: No DB save | 🔴 HIGH |
| `/backend/api/controllers/auth.controller.go` | Line 63: Nil config | 🔴 HIGH |
| `/backend/api/controllers/survey.controller.go` | Query errors | 🟡 MEDIUM |

### Frontend Pages

| Path | Status | Notes |
|------|--------|-------|
| `/filler/auth/sign-in` | ✅ Complete | Needs working backend |
| `/creator/auth/sign-in` | ✅ Complete | No API endpoints |
| `/admin/dashboard` | ✅ Complete | Mock data only |
| `/super-admin/dashboard` | ✅ Complete | Mock data only |

---

## 🎯 Implementation Checklist

### Phase 1: Fix Login (HIGH PRIORITY)
- [ ] Update LoginController to query database
- [ ] Implement password hash verification
- [ ] Return JWT token on success
- [ ] Test with seed user: john@example.com

### Phase 2: Fix Registration (HIGH PRIORITY)
- [ ] Save user to database in UserController
- [ ] Hash password before storing
- [ ] Check for duplicate emails
- [ ] Test with new user creation

### Phase 3: Fix OTP (HIGH PRIORITY)
- [ ] Fix nil pointer in SendOTP
- [ ] Properly initialize EmailService
- [ ] Store OTP in Redis cache
- [ ] Test OTP flow

### Phase 4: Complete Survey Features (MEDIUM)
- [ ] Fix survey queries
- [ ] Implement survey submission
- [ ] Add response handling
- [ ] Fix survey analytics

### Phase 5: Implement Missing APIs (MEDIUM)
- [ ] Creator authentication
- [ ] Admin dashboard API
- [ ] Super Admin endpoints
- [ ] Filler dashboard API

---

## 📈 System Load Info

```
Frontend Build Time:  ~125 seconds
Backend Start Time:   ~3 seconds
Database Init:        ~5 seconds
Total Startup:        ~2 minutes

Fiber Handlers:       125
Active Connections:   3 (frontend, backend, db)
Memory Usage:         ~300MB total
Database Tables:      5
```

---

## 🔗 Important URLs

```
Frontend:     http://localhost:3000
Backend API:  http://localhost:3000/api
Health:       http://localhost:3000/api/health
Database:     localhost:5432
Redis:        localhost:6379

API Docs:     /swagger (if implemented)
```

---

## 📋 Test Report Summary

**Total Tests Run:** 10
**Passed:** 4 ✅
**Failed:** 4 ❌
**Partial:** 2 ⚠️

**Success Rate:** 40%

---

## 🐛 Known Issues

1. **Login Controller Has Hardcoded Mock Password**
   - Location: `/backend/api/controllers/login.controller.go:38`
   - Impact: All logins fail with "Invalid credentials"

2. **Send OTP Crashes with Nil Pointer**
   - Location: `/backend/api/controllers/auth.controller.go:63`
   - Impact: OTP flow broken in production

3. **User Registration Doesn't Save to Database**
   - Location: `/backend/api/controllers/user.controller.go:62`
   - Impact: New users not persisted

4. **Survey Query Returns Error**
   - Location: `/backend/api/controllers/survey.controller.go`
   - Impact: Cannot list surveys

5. **Missing Filler Dashboard Endpoint**
   - Impact: Frontend shows 404

---

## 📞 Support

For issues:
1. Check backend logs: `docker logs onetimer_onetimer_1`
2. Check database: `docker exec onetimer_postgres_1 psql -U user -d onetimer`
3. Review SYSTEM_ANALYSIS_REPORT.md for detailed analysis
4. Check test results: `/test_auth_flows.sh`

---

**Last Updated:** November 2, 2025
**Status:** Development
**Uptime:** 100%
