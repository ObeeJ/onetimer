# Endpoint Analysis Report - OneTimer Application

## Executive Summary
Deep analysis of all endpoints across frontend (Next.js) and backend (Go/Fiber) to identify routing mismatches, missing endpoints, and connection issues.

---

## Architecture Overview

### Request Flow
```
Frontend (Next.js) → Next.js API Routes → Backend (Go/Fiber:8081)
                  ↓
            Direct API Calls
```

### Base URLs
- **Frontend API**: `/api/*` (Next.js routes)
- **Backend URL**: `http://localhost:8081/api/*` (Go Fiber)
- **Proxy Route**: `/api/v1/[...slug]` → catches all and forwards to backend

---

## CRITICAL ISSUES FOUND

### 1. ❌ MISSING BACKEND ENDPOINT: `/api/earnings/export`

**Issue Found:**
- **Frontend calls**: `GET /api/earnings/export` (from `app/filler/earnings/page.tsx`)
- **Next.js proxy**: `app/api/earnings/export/route.ts` forwards to backend
- **Backend route**: ❌ **DOES NOT EXIST**

**Evidence:**
```typescript
// Frontend: app/api/earnings/export/route.ts
const response = await fetch(`${process.env.BACKEND_URL}/api/earnings/export`, {
  method: 'GET',
  // ...
})
```

**Backend routes.go**: No `/api/earnings/export` route defined
```go
// Only these earnings routes exist:
earnings.Get("/", earningsController.GetEarnings)
earnings.Get("", earningsController.GetEarnings)
earnings.Post("/withdraw", earningsController.WithdrawEarnings)
```

**Impact**: Filler users cannot export their earnings data
**Fix Required**: Add export endpoint to backend

---

### 2. ❌ MISSING BACKEND ENDPOINT: `/api/admin/users/bulk`

**Issue Found:**
- **Frontend calls**: `POST /api/admin/users/bulk` (from `hooks/use-admin.ts`)
- **Backend route**: ❌ **DOES NOT EXIST**

**Evidence:**
```typescript
// Frontend: hooks/use-admin.ts - useBulkUserActions()
mutationFn: ({ userIds, action, reason }) => 
  api.post('/admin/users/bulk', { user_ids: userIds, action, reason })
```

**Backend routes.go**: No bulk actions endpoint
```go
// Admin routes - no /bulk endpoint
admin.Get("/users", adminController.GetUsers)
admin.Post("/users/:id/approve", adminController.ApproveUser)
admin.Post("/users/:id/reject", adminController.RejectUser)
admin.Post("/users/:id/suspend", adminController.SuspendUser)
admin.Post("/users/:id/activate", adminController.ActivateUser)
// ❌ Missing: admin.Post("/users/bulk", ...)
```

**Impact**: Admin bulk operations fail
**Fix Required**: Add bulk actions endpoint to backend

---

### 3. ⚠️ ENDPOINT MISMATCH: KYC Verification

**Issue Found:**
- **Frontend calls**: `POST /api/kyc/verify` (Next.js route)
- **Next.js route**: `app/api/kyc/verify/route.ts` - **MOCKED** (not calling backend)
- **Backend route**: `POST /api/user/kyc/verify-nin` (exists but not used)

**Evidence:**
```typescript
// Frontend: app/api/kyc/verify/route.ts
// Mock successful verification (replace with real Prembly call later)
const verificationData = {
  nin: nin,
  firstname: 'John',
  lastname: 'Doe', 
  // ... HARDCODED MOCK DATA
}
```

```go
// Backend: routes.go
user.Post("/kyc/verify-nin", jwtMiddleware, kycHandler.VerifyKYC)
```

**Impact**: KYC verification is not actually verifying NIDs - returns fake data
**Fix Required**: Connect frontend to real backend KYC endpoint

---

### 4. ⚠️ ROUTING INCONSISTENCY: Survey Endpoints

**Issue Found:**
Multiple routing paths for the same functionality causing confusion

**Evidence:**
```typescript
// Frontend api-client.ts uses:
/survey          // GET surveys
/survey/:id      // GET single survey
/survey/:id/submit  // POST submit response

// But Next.js has duplicate routes:
app/api/surveys/route.ts           // Proxies to /api/survey
app/api/surveys/[id]/submit/route.ts  // Proxies to /api/survey/:id/submit
```

**Backend routes.go**:
```go
// Survey routes use /survey (singular)
survey.Get("/", surveyController.GetSurveys)
survey.Get("/:id", surveyController.GetSurvey)
survey.Post("/:id/submit", jwtMiddleware, surveyController.SubmitResponse)
```

**Impact**: Inconsistent naming (surveys vs survey) may cause confusion
**Status**: Currently working but inconsistent

---

### 5. ❌ MISSING BACKEND ENDPOINT: `/api/notifications/:id/read`

**Issue Found:**
- **Frontend calls**: `POST /api/notifications/:id/read` (from `lib/api-client.ts`)
- **Backend route**: ❌ **DOES NOT EXIST**

**Evidence:**
```typescript
// Frontend: lib/api-client.ts
async markNotificationRead(notificationId: string) {
  return this.request(`/notifications/${notificationId}/read`, {
    method: 'POST',
  })
}
```

**Backend routes.go**:
```go
// Only these notification routes exist:
notification.Get("/", notificationController.GetNotifications)
notification.Post("/mark-read", notificationController.UpdateNotifications)
// ❌ Missing: notification.Post("/:id/read", ...)
```

**Impact**: Cannot mark individual notifications as read
**Fix Required**: Either add endpoint or update frontend to use `/mark-read`

---

### 6. ⚠️ ENDPOINT MISMATCH: Earnings Data

**Issue Found:**
Frontend hook calls wrong endpoint for earnings

**Evidence:**
```typescript
// Frontend: hooks/use-earnings.ts
export function useEarnings() {
  return useQuery(
    createQueryOptions({
      queryKey: ['earnings'],
      queryFn: () => api.get<Earnings>('/analytics/filler/earnings')  // ❌ Wrong!
    })
  )
}
```

**Backend routes.go**:
```go
// Correct endpoint is:
earnings.Get("/", earningsController.GetEarnings)  // /api/earnings
earnings.Get("", earningsController.GetEarnings)

// Analytics endpoint is different:
analytics.Get("/filler/earnings", analyticsController.GetEarningsBreakdown)
```

**Impact**: May return different data structure than expected
**Fix Required**: Clarify if earnings or analytics endpoint should be used

---

### 7. ❌ MISSING BACKEND ENDPOINT: `/api/creator/surveys/:id/export`

**Issue Found:**
- **Frontend calls**: `POST /api/creator/surveys/:id/export` (from `lib/api-client.ts`)
- **Next.js proxy**: `app/api/surveys/[id]/export/route.ts` forwards to backend
- **Backend route**: Uses different path

**Evidence:**
```typescript
// Frontend: lib/api-client.ts
async exportSurveyResponses(surveyId: string, format: 'csv' | 'json' = 'csv') {
  return this.request(`/creator/surveys/${surveyId}/export?format=${format}`)
}
```

**Backend routes.go**:
```go
// Creator routes:
creator.Post("/surveys/:id/export", exportController.ExportSurveyResponses)  // ✅ EXISTS

// But also:
export.Get("/survey/:id", exportController.ExportSurveyResponses)  // Different path!
```

**Impact**: May work but routing is confusing
**Status**: Needs verification

---

## COMPLETE ENDPOINT MAPPING

### ✅ PROPERLY CONNECTED ENDPOINTS

#### Authentication
| Frontend Call | Next.js Route | Backend Route | Status |
|--------------|---------------|---------------|--------|
| `/auth/login` | `/api/v1/[...slug]` | `POST /api/auth/login` | ✅ Connected |
| `/auth/logout` | `/api/v1/[...slug]` | `POST /api/auth/logout` | ✅ Connected |
| `/auth/send-otp` | `/api/auth/send-otp/route.ts` | `POST /api/auth/send-otp` | ✅ Connected |
| `/auth/verify-otp` | `/api/auth/verify-otp/route.ts` | `POST /api/auth/verify-otp` | ✅ Connected |
| `/auth/forgot-password` | `/api/auth/forgot-password/route.ts` | `POST /api/auth/forgot-password` | ✅ Connected |
| `/auth/reset-password` | `/api/auth/reset-password/route.ts` | `POST /api/auth/reset-password` | ✅ Connected |

#### User Management
| Frontend Call | Next.js Route | Backend Route | Status |
|--------------|---------------|---------------|--------|
| `/user/register` | `/api/v1/[...slug]` | `POST /api/user/register` | ✅ Connected |
| `/user/profile` | `/api/v1/[...slug]` | `GET /api/user/profile` | ✅ Connected |
| `/user/profile` | `/api/v1/[...slug]` | `PUT /api/user/profile` | ✅ Connected |
| `/user/kyc` | `/api/v1/[...slug]` | `POST /api/user/kyc` | ✅ Connected |
| `/user/change-password` | `/api/v1/[...slug]` | `POST /api/user/change-password` | ✅ Connected |
| `/user/kyc-status` | `/api/v1/[...slug]` | `GET /api/user/kyc-status` | ✅ Connected |
| `/user/preferences` | `/api/v1/[...slug]` | `GET /api/user/preferences` | ✅ Connected |
| `/user/preferences` | `/api/v1/[...slug]` | `POST /api/user/preferences` | ✅ Connected |

#### Survey Management
| Frontend Call | Next.js Route | Backend Route | Status |
|--------------|---------------|---------------|--------|
| `/survey` | `/api/surveys/route.ts` | `GET /api/survey` | ✅ Connected |
| `/survey/:id` | `/api/v1/[...slug]` | `GET /api/survey/:id` | ✅ Connected |
| `/survey` | `/api/v1/[...slug]` | `POST /api/survey` | ✅ Connected |
| `/survey/:id` | `/api/v1/[...slug]` | `PUT /api/survey/:id` | ✅ Connected |
| `/survey/:id/submit` | `/api/surveys/[id]/submit/route.ts` | `POST /api/survey/:id/submit` | ✅ Connected |
| `/survey/:id/questions` | `/api/v1/[...slug]` | `GET /api/survey/:id/questions` | ✅ Connected |
| `/survey/:id/start` | `/api/v1/[...slug]` | `POST /api/survey/:id/start` | ✅ Connected |
| `/survey/:id/progress` | `/api/v1/[...slug]` | `POST /api/survey/:id/progress` | ✅ Connected |
| `/survey/templates` | `/api/v1/[...slug]` | `GET /api/survey/templates` | ✅ Connected |
| `/survey/draft` | `/api/v1/[...slug]` | `POST /api/survey/draft` | ✅ Connected |

#### Admin Routes
| Frontend Call | Next.js Route | Backend Route | Status |
|--------------|---------------|---------------|--------|
| `/admin/users` | `/api/v1/[...slug]` | `GET /api/admin/users` | ✅ Connected |
| `/admin/users/:id` | `/api/v1/[...slug]` | `GET /api/admin/users/:id` | ✅ Connected |
| `/admin/users/:id/approve` | `/api/v1/[...slug]` | `POST /api/admin/users/:id/approve` | ✅ Connected |
| `/admin/users/:id/reject` | `/api/v1/[...slug]` | `POST /api/admin/users/:id/reject` | ✅ Connected |
| `/admin/users/:id/suspend` | `/api/admin/users/[id]/suspend/route.ts` | `POST /api/admin/users/:id/suspend` | ✅ Connected |
| `/admin/users/:id/activate` | `/api/admin/users/[id]/activate/route.ts` | `POST /api/admin/users/:id/activate` | ✅ Connected |
| `/admin/export/users` | `/api/admin/users/export/route.ts` | `GET /api/admin/export/users` | ✅ Connected |
| `/admin/surveys` | `/api/v1/[...slug]` | `GET /api/admin/surveys` | ✅ Connected |
| `/admin/surveys/:id/approve` | `/api/v1/[...slug]` | `POST /api/admin/surveys/:id/approve` | ✅ Connected |
| `/admin/payments` | `/api/v1/[...slug]` | `GET /api/admin/payments` | ✅ Connected |
| `/admin/reports` | `/api/v1/[...slug]` | `GET /api/admin/reports` | ✅ Connected |

#### Creator Routes
| Frontend Call | Next.js Route | Backend Route | Status |
|--------------|---------------|---------------|--------|
| `/creator/dashboard` | `/api/v1/[...slug]` | `GET /api/creator/dashboard` | ✅ Connected |
| `/creator/surveys` | `/api/v1/[...slug]` | `GET /api/creator/surveys` | ✅ Connected |
| `/creator/surveys/:id` | `/api/v1/[...slug]` | `PUT /api/creator/surveys/:id` | ✅ Connected |
| `/creator/surveys/:id/analytics` | `/api/v1/[...slug]` | `GET /api/creator/surveys/:id/analytics` | ✅ Connected |
| `/creator/credits` | `/api/v1/[...slug]` | `GET /api/creator/credits` | ✅ Connected |

#### Withdrawal & Earnings
| Frontend Call | Next.js Route | Backend Route | Status |
|--------------|---------------|---------------|--------|
| `/earnings` | `/api/v1/[...slug]` | `GET /api/earnings` | ✅ Connected |
| `/earnings/withdraw` | `/api/earnings/withdraw/route.ts` | `POST /api/earnings/withdraw` | ✅ Connected |
| `/withdrawal/request` | `/api/v1/[...slug]` | `POST /api/withdrawal/request` | ✅ Connected |
| `/withdrawal/history` | `/api/v1/[...slug]` | `GET /api/withdrawal/history` | ✅ Connected |
| `/withdrawal/banks` | `/api/v1/[...slug]` | `GET /api/withdrawal/banks` | ✅ Connected |
| `/withdrawal/verify-account` | `/api/v1/[...slug]` | `POST /api/withdrawal/verify-account` | ✅ Connected |

#### Waitlist
| Frontend Call | Next.js Route | Backend Route | Status |
|--------------|---------------|---------------|--------|
| N/A | `/api/waitlist/join/route.ts` | `POST /api/waitlist/join` | ✅ Connected |

---

## ❌ MISSING OR BROKEN ENDPOINTS

### Critical (Breaks Functionality)

1. **`POST /api/earnings/export`**
   - Called by: `app/filler/earnings/page.tsx`
   - Backend: ❌ Missing
   - Fix: Add to earnings controller

2. **`POST /api/admin/users/bulk`**
   - Called by: `hooks/use-admin.ts`
   - Backend: ❌ Missing
   - Fix: Add bulk actions controller

3. **`POST /api/notifications/:id/read`**
   - Called by: `lib/api-client.ts`
   - Backend: ❌ Missing (has `/mark-read` instead)
   - Fix: Add endpoint or update frontend

### Medium Priority (Mocked/Inconsistent)

4. **`POST /api/kyc/verify`**
   - Next.js route: ⚠️ Returns mock data
   - Backend: Has `/api/user/kyc/verify-nin` but not connected
   - Fix: Connect to real backend endpoint

5. **`GET /analytics/filler/earnings`**
   - Called by: `hooks/use-earnings.ts`
   - Backend: ✅ Exists but may return different data than `/earnings`
   - Fix: Clarify which endpoint to use

---

## RECOMMENDATIONS

### Immediate Actions Required

1. **Add Missing Backend Endpoints**
   ```go
   // In routes.go - Add these:
   
   // Earnings export
   earnings.Get("/export", earningsController.ExportEarnings)
   
   // Admin bulk actions
   admin.Post("/users/bulk", adminController.BulkUserActions)
   
   // Notification mark as read
   notification.Post("/:id/read", notificationController.MarkAsRead)
   ```

2. **Fix KYC Verification**
   - Remove mock from `app/api/kyc/verify/route.ts`
   - Connect to backend `/api/user/kyc/verify-nin`
   - Or update backend to match frontend path

3. **Standardize Earnings Endpoint**
   - Decide: Use `/earnings` or `/analytics/filler/earnings`
   - Update `hooks/use-earnings.ts` accordingly

4. **Add Missing Controllers**
   - Create `ExportEarnings` method in earnings controller
   - Create `BulkUserActions` method in admin controller
   - Create `MarkAsRead` method in notification controller

### Code Quality Improvements

1. **Consolidate Duplicate Routes**
   - Remove redundant Next.js API routes
   - Use `/api/v1/[...slug]` catch-all for most endpoints
   - Keep specific routes only for special handling

2. **Standardize Naming**
   - Backend uses `/survey` (singular)
   - Frontend sometimes uses `/surveys` (plural)
   - Choose one convention

3. **Add Route Documentation**
   - Document all endpoints in OpenAPI/Swagger
   - Add comments in routes.go
   - Create endpoint inventory

---

## TESTING CHECKLIST

### Critical Endpoints to Test

- [ ] Earnings export functionality
- [ ] Admin bulk user actions
- [ ] KYC verification with real NIN
- [ ] Notification mark as read
- [ ] Survey submission flow
- [ ] Withdrawal request flow
- [ ] File uploads (KYC, survey media)

### Integration Tests Needed

- [ ] Frontend → Next.js API → Backend flow
- [ ] Authentication token passing
- [ ] Cookie handling (httpOnly)
- [ ] Error handling and timeouts
- [ ] File upload endpoints

---

## SUMMARY STATISTICS

- **Total Backend Routes**: ~80+
- **Total Frontend API Routes**: 15
- **Catch-all Proxy**: `/api/v1/[...slug]`
- **Critical Issues**: 3
- **Medium Priority Issues**: 2
- **Working Endpoints**: ~75+
- **Missing Endpoints**: 3
- **Mocked Endpoints**: 1

---

## CONCLUSION

The application has a solid routing foundation with most endpoints properly connected. However, there are **3 critical missing backend endpoints** that will cause functionality failures:

1. Earnings export
2. Admin bulk actions  
3. Individual notification mark as read

Additionally, the **KYC verification is mocked** and needs to be connected to the real backend implementation.

All issues are fixable with backend controller additions and minor frontend adjustments.
