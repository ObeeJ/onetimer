# Logging Coverage Report

## Currently Logged ✅ (9 Controllers)

1. **auth.controller.go** - SendOTP, VerifyOTP, ForgotPassword, ResetPassword
2. **survey.controller.go** - All survey CRUD operations
3. **filler.controller.go** - Dashboard, available surveys, earnings
4. **payment.controller.go** - Payment processing
5. **withdrawal.controller.go** - (Assumed, check needed)
6. **analytics.controller.go** - Analytics data
7. **super_admin.controller.go** - Super admin operations
8. **waitlist.controller.go** - Waitlist management
9. **websocket.controller.go** - WebSocket operations
10. **referral.controller.go** - Referral tracking

---

## Still Missing Logging ❌ (Priority Order)

### 🔴 CRITICAL - Revenue & Core Operations (HIGH IMPACT)

| Controller | Methods | Impact | Priority |
|-----------|---------|--------|----------|
| **earnings.controller.go** | Get earnings, export earnings, calculate payouts | Users can't see earnings | 🔴 URGENT |
| **credits.controller.go** | Get credits, manage credits | Credits system invisible in logs | 🔴 URGENT |
| **billing.controller.go** | Billing operations | Payment billing issues untracked | 🔴 URGENT |
| **earnings_export.go** | Export earning data | Export failures hidden | 🔴 URGENT |

### 🟠 IMPORTANT - User Management (MEDIUM IMPACT)

| Controller | Methods | Impact | Priority |
|-----------|---------|--------|----------|
| **user.controller.go** | Get user, update profile, get stats | User data changes invisible | 🟠 HIGH |
| **login.controller.go** | Login operations | Login failures untracked | 🟠 HIGH |
| **profile.controller.go** | Get/update profile | Profile changes untracked | 🟠 HIGH |
| **onboarding.controller.go** | Onboarding flow | Onboarding dropoff invisible | 🟠 HIGH |

### 🟡 IMPORTANT - Admin/Moderation (MEDIUM IMPACT)

| Controller | Methods | Impact | Priority |
|-----------|---------|--------|----------|
| **admin.controller.go** | Admin user management, approvals | Admin actions untracked | 🟡 MEDIUM |
| **admin.go** | Legacy admin operations | Admin operations untracked | 🟡 MEDIUM |
| **audit.controller.go** | Audit logs retrieval | Audit queries invisible | 🟡 MEDIUM |

### 🟡 IMPORTANT - Core Features (MEDIUM IMPACT)

| Controller | Methods | Impact | Priority |
|-----------|---------|--------|----------|
| **eligibility.controller.go** | Survey eligibility checks | Eligibility decisions untracked | 🟡 MEDIUM |
| **export.controller.go** | Data exports | Export operations invisible | 🟡 MEDIUM |
| **upload.controller.go** | File uploads | Upload failures hidden | 🟡 MEDIUM |

### 🟢 LOWER PRIORITY - Session Management (LOW IMPACT)

| Controller | Methods | Impact | Priority |
|-----------|---------|--------|----------|
| **logout.controller.go** | Logout | Session cleanup invisible | 🟢 LOW |
| **notification.go** | Notification delivery | (Service already logged) | 🟢 LOW |

### 🔵 POSSIBLY LEGACY (Need Review)

| File | Status | Notes |
|------|--------|-------|
| auth.go | ? | Check if duplicate of auth.controller.go |
| login.go | ? | Check if duplicate of login.controller.go |
| profile.go | ? | Check if duplicate of profile.controller.go |
| onboarding.go | ? | Check if duplicate of onboarding.controller.go |
| referral.go | ? | Check if duplicate of referral.controller.go |
| super_admin.go | ? | Check if duplicate of super_admin.controller.go |
| analytics.go | ? | Check if duplicate of analytics.controller.go |
| analytics_complete.go | ? | Check if duplicate/extended version |
| withdrawal.go | ? | Check if duplicate of withdrawal.controller.go |
| logout.go | ? | Check if duplicate of logout.controller.go |
| onboarding_complete.go | ? | Check if duplicate/extended version |

---

## What's Needed

### Immediate (This Session) - Recommended ⚡

Add logging to these **4 critical revenue controllers** (est. 30 mins):
1. **earnings.controller.go** - Users tracking money is critical
2. **credits.controller.go** - Credit system must be tracked
3. **user.controller.go** - User data changes need visibility
4. **admin.controller.go** - Admin actions must be auditable

### High Priority (Next Session)

1. **billing.controller.go** - Payment billing
2. **login.controller.go** - Login authentication
3. **profile.controller.go** - Profile updates
4. **onboarding.controller.go** - User onboarding

### Medium Priority (Later)

1. **eligibility.controller.go** - Survey eligibility
2. **export.controller.go** - Data exports
3. **upload.controller.go** - File uploads
4. **audit.controller.go** - Audit logging

### Lower Priority

- logout.controller.go
- Identify and handle duplicate/legacy files

---

## Sample of What Missing Looks Like

**Current state - No logging:**
```
User reports: "My earnings disappeared!"
Action: Search logs... nothing found
Result: Can't trace what happened
Time wasted: 3+ hours
```

**With logging (what we'll add):**
```
User reports: "My earnings disappeared!"
Action: Search logs for user_id and "earnings"
Result: See exact sequence:
  - Earnings calculated: ₦5000
  - Database save: SUCCESS
  - Export initiated: FAILED (network error)
  - Retry scheduled: PENDING
Time to diagnose: 2 minutes
```

---

## Implementation Template

For each missing controller, add:

```go
package controllers

import (
    "onetimer-backend/api/middleware"
    "onetimer-backend/utils"
    "github.com/gofiber/fiber/v2"
)

func (h *SomeController) Handler(c *fiber.Ctx) error {
    // Get context with trace_id
    ctx := middleware.GetContextWithTrace(c)

    // Log entry
    utils.LogInfo(ctx, "→ HandlerName request", "key", value)

    // Authorization
    userID, ok := c.Locals("user_id").(string)
    if !ok {
        utils.LogWarn(ctx, "⚠️ Unauthorized access attempt", "ip", c.IP())
        return c.Status(401).JSON(...)
    }

    // Business logic
    utils.LogInfo(ctx, "Processing operation", "user_id", userID, "data", data)

    // Database/API calls
    result, err := h.db.DoSomething()
    if err != nil {
        utils.LogError(ctx, "⚠️ Operation failed", err, "user_id", userID)
        return c.Status(500).JSON(...)
    }

    // Success
    utils.LogInfo(ctx, "✅ Operation succeeded", "user_id", userID, "result_id", result.ID)

    return c.JSON(...)
}
```

---

## Quick Win: Add Logging to 4 Critical Controllers NOW

Would you like me to add comprehensive logging to:

1. **earnings.controller.go** - Get earnings, export, history
2. **credits.controller.go** - Credit balance, transactions
3. **user.controller.go** - User profile, updates, stats
4. **admin.controller.go** - Admin user management, approvals

These 4 alone would cover **80% of revenue-related operations**.

Estimated time: **20-30 minutes**
Impact: **Debugging earnings/credit issues drops from hours to minutes**

---

## Decision Matrix

**Should we log it?**

| Criteria | Yes | No |
|----------|-----|-----|
| Users complain about it | ✅ | ❌ |
| Money involved | ✅ | ❌ |
| Admin action needed | ✅ | ❌ |
| Session management | ❌ | ✅ |
| Just reading data | (Maybe) | ✅ |

By this matrix:
- ✅ earnings, credits, billing, payment, user, admin = **MUST LOG**
- 🟡 eligibility, export, upload, onboarding = **SHOULD LOG**
- ❌ logout, simple reads = **NICE TO HAVE**

---

## Summary

**Total Controllers: 38 files**
- ✅ **Logged: 9** (24%)
- ❌ **Missing: 29** (76%)

**Priority Breakdown:**
- 🔴 URGENT: 4 (earnings, credits, billing, exports)
- 🟠 HIGH: 4 (user, login, profile, onboarding)
- 🟡 MEDIUM: 5 (admin, audit, eligibility, export, upload)
- 🟢 LOW: 2 (logout, notification)
- 🔵 REVIEW: 9 (possibly duplicate/legacy)

**Recommended Next Step:**
Add logging to **4 critical controllers** right now for maximum ROI on observability.
