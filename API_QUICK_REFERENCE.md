# API Quick Reference Card

**Base URL:** `http://localhost:8080/api`
**Auth Header:** `Authorization: Bearer {jwt_token}`
**Content-Type:** `application/json`

---

## 🔓 PUBLIC ENDPOINTS (No Auth Required)

### Health
```
GET /health                           → Server health status
GET /healthz                          → Readiness check
```

### Authentication
```
POST /user/register                   → Register new user
POST /auth/login                      → Login (returns JWT)
POST /auth/logout                     → Logout
POST /auth/send-otp                   → Send OTP
POST /auth/verify-otp                 → Verify OTP
```

### Surveys (Read-only)
```
GET /survey                           → List all surveys
GET /survey/:id                       → Get single survey
GET /survey/:id/questions             → Get survey questions
GET /survey/templates                 → Get survey templates
```

### Credits & Billing
```
GET /credits/packages                 → List credit packages
GET /billing/pricing-tiers            → Get pricing tiers
POST /billing/calculate               → Calculate survey cost
POST /billing/validate-reward         → Validate reward
```

### Other
```
GET /withdrawal/banks                 → Get banks list
POST /waitlist/join                   → Join waitlist
GET /waitlist/stats                   → Get waitlist stats
```

---

## 🔐 PROTECTED ENDPOINTS (Require JWT)

### User Profile & Management
```
GET /user/profile                     → Get user profile
PUT /user/profile                     → Update profile
POST /user/change-password            → Change password
POST /user/kyc                        → Upload KYC document
GET /user/kyc-status                  → Get KYC status
```

### Onboarding
```
POST /onboarding/filler               → Complete filler onboarding
POST /onboarding/creator              → Complete creator onboarding
PUT /onboarding/demographics          → Update demographics
GET /onboarding/surveys               → Get eligible surveys
```

### Surveys (Write Operations)
```
POST /survey                          → Create survey
PUT /survey/:id                       → Update survey
DELETE /survey/:id                    → Delete survey
POST /survey/:id/start                → Start survey
POST /survey/:id/submit               → Submit response
POST /survey/:id/progress             → Save progress
POST /survey/:id/pause                → Pause survey
POST /survey/:id/resume               → Resume survey
POST /survey/:id/duplicate            → Duplicate survey
POST /survey/draft                    → Save draft
POST /survey/import                   → Import survey
```

### Filler (Survey Taker)
```
GET /filler/dashboard                 → Filler dashboard
GET /filler/surveys                   → Available surveys
GET /filler/surveys/completed         → Completed surveys
GET /filler/earnings                  → Earnings history
```

### Creator
```
GET /creator/dashboard                → Creator dashboard
GET /creator/surveys                  → Creator surveys
GET /creator/surveys/:id/responses    → Survey responses
GET /creator/surveys/:id/analytics    → Survey analytics
GET /creator/surveys/:survey_id/responses/:response_id → Response details
POST /creator/surveys/:id/export      → Export responses
GET /creator/credits                  → Get credits
```

### Credits & Purchase
```
POST /credits/purchase                → Purchase credits
POST /credits/purchase/custom         → Purchase custom credits
POST /payment/purchase                → Purchase via payment
```

### Earnings & Withdrawals
```
GET /earnings                         → Get earnings
POST /earnings/withdraw               → Withdraw earnings
POST /withdrawal/request              → Request withdrawal
GET /withdrawal/history               → Withdrawal history
POST /withdrawal/verify-account       → Verify account
```

### Payments
```
GET /payment/verify/:reference        → Verify payment
GET /payment/methods                  → Get payment methods
POST /payment/methods                 → Add payment method
GET /payment/history                  → Transaction history
POST /payment/payouts                 → Process batch payouts
POST /payment/refund/:id              → Refund transaction
```

### Referrals
```
GET /referral                         → Get referrals
POST /referral/code                   → Generate referral code
GET /referral/stats                   → Referral stats
```

### Eligibility
```
GET /eligibility/check                → Check eligibility
```

### Uploads
```
POST /upload/kyc                      → Upload KYC
POST /upload/survey-media             → Upload survey media
POST /upload/response-image/:survey_id → Upload response image
```

### Analytics
```
GET /analytics/filler/dashboard       → Filler analytics
GET /analytics/filler/earnings        → Earnings breakdown
GET /analytics/creator/dashboard      → Creator analytics
GET /analytics/creator/surveys/:id    → Survey analytics
GET /analytics/creator/trends         → Response trends
GET /analytics/admin/dashboard        → Admin analytics
POST /analytics/admin/cache/invalidate → Invalidate cache
```

### Notifications
```
GET /notifications                    → Get notifications
POST /notifications/mark-read         → Mark as read
```

---

## 👨‍💼 ADMIN ENDPOINTS (Require Admin JWT)

```
GET /admin/users                      → Get users
GET /admin/users/:id                  → Get user details
POST /admin/users/:id/approve         → Approve user
POST /admin/users/:id/reject          → Reject user
POST /admin/users/:id/suspend         → Suspend user
POST /admin/users/:id/activate        → Activate user
GET /admin/surveys                    → Get surveys
POST /admin/surveys/:id/approve       → Approve survey
GET /admin/payments                   → Get payments
GET /admin/reports                    → Get reports
POST /admin/payouts                   → Process payouts
GET /admin/export/users               → Export users
```

---

## 🚀 SUPER ADMIN ENDPOINTS (Require Super Admin JWT)

```
GET /super-admin/admins               → Get admins
POST /super-admin/admins              → Create admin
GET /super-admin/financials           → Get financials
GET /super-admin/settings             → Get settings
PUT /super-admin/settings             → Update settings
POST /super-admin/audit-logs          → Log audit action
GET /super-admin/audit-logs           → Get audit logs
```

---

## 💬 WEBSOCKET

```
WS /ws                                → WebSocket connection
  Query param: ?token={jwt_token}
```

---

## 📊 COMMON PAYLOADS

### Register
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "filler",
  "password": "SecurePass123!",
  "phone": "+1234567890"
}
```

### Login
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Create Survey
```json
{
  "title": "Survey Title",
  "description": "Description",
  "category": "customer-experience",
  "reward_amount": 500,
  "target_count": 100,
  "estimated_duration": 15,
  "questions": [
    {
      "type": "single|multi|text|rating|matrix",
      "title": "Question?",
      "required": true,
      "options": ["Option1", "Option2"],
      "order": 0
    }
  ]
}
```

### Submit Survey Response
```json
{
  "responses": {
    "q1": "Answer",
    "q2": ["Option1", "Option2"],
    "q3": 5
  },
  "time_spent": 600
}
```

### Complete Filler Onboarding
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "profile": {
    "age_range": "25-34",
    "gender": "male",
    "country": "Nigeria",
    "state": "Lagos",
    "education": "bachelor",
    "employment": "employed",
    "income_range": "100000-200000",
    "interests": ["tech", "sports"]
  }
}
```

### Withdraw Earnings
```json
{
  "amount": 5000,
  "bank_code": "011",
  "account_number": "1234567890"
}
```

---

## 🔄 REQUEST/RESPONSE FLOW

### Typical User Journey
1. **Register** `POST /user/register` → Returns user object
2. **Login** `POST /auth/login` → Returns JWT token
3. **Get Profile** `GET /user/profile` (with JWT) → Returns user details
4. **Browse Surveys** `GET /filler/surveys` (with JWT) → Returns available surveys
5. **Submit Response** `POST /survey/:id/submit` (with JWT) → Returns confirmation
6. **Check Earnings** `GET /earnings` (with JWT) → Returns earnings
7. **Withdraw** `POST /withdrawal/request` (with JWT) → Returns withdrawal ID

---

## ✅ RESPONSE FORMAT

### Success (200/201)
```json
{
  "success": true,
  "ok": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error (400/401/404/500)
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional info",
  "message": "User-friendly message"
}
```

---

## 📝 HTTP METHODS QUICK LOOKUP

| Method | Purpose |
|--------|---------|
| GET | Retrieve data (no side effects) |
| POST | Create new resource or action |
| PUT | Update existing resource |
| DELETE | Remove resource |

---

## 🎯 TESTING EXAMPLES

### List Surveys
```bash
curl http://localhost:8080/api/survey
```

### Login & Store Token
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' | jq -r '.token')
```

### Use Token
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/user/profile
```

### Create Survey
```bash
curl -X POST http://localhost:8080/api/survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Survey","description":"Test","category":"experience","reward_amount":500,"target_count":100,"estimated_duration":15,"questions":[]}'
```

---

## 🔑 KEY INFO

- **JWT Expiry:** 24 hours
- **Rate Limit:** 100 req/min per IP
- **Response Time:** ~100-200ms typical
- **Authentication Header:** `Authorization: Bearer {token}`
- **Content-Type:** Always `application/json` (except file uploads)
- **UUIDs:** Used for all resource IDs
- **Currency:** NGN (Nigerian Naira)
- **Timestamps:** ISO 8601 format

---

## 📚 Full Documentation

- **Complete Reference:** `API_ENDPOINTS_REFERENCE.md`
- **Testing Guide:** `API_TESTING_GUIDE.md`
- **Test Suite:** `test_api.sh`

---

**Quick Reference Version 1.0**
Last Updated: 2024-11-19
