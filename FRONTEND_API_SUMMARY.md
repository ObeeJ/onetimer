# Frontend API Requests - Complete Summary

## 📋 Overview

Your OneTimer backend is **running locally** on port **8080**. I've documented all frontend API endpoints with exact request/response formats.

**Backend Status:**
```
✅ Database connected successfully
✅ Database schema initialized successfully
✅ Email service initialized (SMTP configured)
✅ Storage service initialized successfully
✅ Rate limiter initialized successfully
✅ WebSocket hub initialized
🚀 Server running on http://127.0.0.1:8080
```

---

## 📚 Documentation Files Created

### 1. **API_ENDPOINTS_REFERENCE.md** (📄 Complete Reference)
- All 100+ endpoints documented with request/response formats
- Request payload examples for each endpoint
- Status codes and error handling
- Authentication and headers
- Best for: Complete reference, integration planning

### 2. **API_TESTING_GUIDE.md** (🧪 Testing Guide)
- Quick reference for manual testing
- cURL examples for common endpoints
- Debugging tips and troubleshooting
- Tools recommendations (Postman, HTTPie, etc.)
- Best for: Testing, debugging, development

### 3. **test_api.sh** (⚙️ Automated Test Script)
- Executable bash script testing all major endpoints
- Demonstrates proper request formats
- Shows response structures
- Auto-extracts JWT tokens for authenticated requests
- Run with: `./test_api.sh`

---

## 🚀 Quick Start

### Option 1: Run Full Test Suite
```bash
cd /home/obeej/Desktop/onetimer
./test_api.sh
```

### Option 2: Test Individual Endpoints

#### Health Check (No Auth)
```bash
curl http://localhost:8080/api/health | jq '.'
```

#### Register User (No Auth)
```bash
curl -X POST http://localhost:8080/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "role": "filler",
    "password": "SecurePass123!",
    "phone": "+1234567890"
  }'
```

#### Login (No Auth)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get Profile (Requires JWT)
```bash
# First get JWT token from login response
JWT_TOKEN="your-jwt-token-here"

curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

## 📑 All Frontend Endpoints by Category

### 1. **Authentication & User Management** (8 endpoints)
- `POST /user/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `POST /user/change-password` - Change password
- `POST /user/kyc` - Upload KYC documents
- `GET /user/kyc-status` - Get KYC status

### 2. **Onboarding** (3 endpoints)
- `POST /onboarding/filler` - Complete filler onboarding
- `POST /onboarding/creator` - Complete creator onboarding
- `PUT /onboarding/demographics` - Update demographics
- `GET /onboarding/surveys` - Get eligible surveys

### 3. **Surveys** (12+ endpoints)
- `GET /survey` - List all surveys
- `GET /survey/:id` - Get single survey
- `POST /survey` - Create survey (Creator only)
- `PUT /survey/:id` - Update survey (Creator only)
- `DELETE /survey/:id` - Delete survey (Creator only)
- `GET /survey/:id/questions` - Get survey questions
- `POST /survey/:id/start` - Start survey
- `POST /survey/:id/progress` - Save progress
- `POST /survey/:id/submit` - Submit response
- `POST /survey/:id/pause` - Pause survey
- `POST /survey/:id/resume` - Resume survey
- `POST /survey/:id/duplicate` - Duplicate survey
- `POST /survey/draft` - Save draft
- `GET /survey/templates` - Get templates
- `POST /survey/import` - Import survey

### 4. **Filler Operations** (4 endpoints)
- `GET /filler/dashboard` - Get dashboard
- `GET /filler/surveys` - Get available surveys
- `GET /filler/surveys/completed` - Get completed surveys
- `GET /filler/earnings` - Get earnings history

### 5. **Creator Operations** (4 endpoints)
- `GET /creator/dashboard` - Get dashboard
- `GET /creator/surveys` - Get creator surveys
- `GET /creator/surveys/:id/responses` - Get survey responses
- `GET /creator/surveys/:id/analytics` - Get survey analytics
- `GET /creator/surveys/:survey_id/responses/:response_id` - Get response details
- `POST /creator/surveys/:id/export` - Export responses
- `GET /creator/credits` - Get credits

### 6. **Credits & Billing** (5 endpoints)
- `GET /credits/packages` - List credit packages
- `POST /credits/purchase` - Purchase credits
- `POST /credits/purchase/custom` - Purchase custom credits
- `POST /billing/calculate` - Calculate survey cost
- `POST /billing/validate-reward` - Validate reward amount
- `GET /billing/pricing-tiers` - Get pricing tiers

### 7. **Earnings & Withdrawals** (5 endpoints)
- `GET /earnings` - Get earnings
- `POST /earnings/withdraw` - Withdraw earnings
- `POST /withdrawal/request` - Request withdrawal
- `GET /withdrawal/history` - Get withdrawal history
- `GET /withdrawal/banks` - Get banks list
- `POST /withdrawal/verify-account` - Verify account

### 8. **Payments (Paystack)** (6 endpoints)
- `POST /payment/purchase` - Purchase via payment
- `GET /payment/verify/:reference` - Verify payment
- `GET /payment/methods` - Get payment methods
- `POST /payment/methods` - Add payment method
- `GET /payment/history` - Get transaction history
- `POST /payment/payouts` - Process batch payouts
- `POST /payment/refund/:id` - Refund transaction

### 9. **Referrals** (3 endpoints)
- `GET /referral` - Get referrals
- `POST /referral/code` - Generate referral code
- `GET /referral/stats` - Get referral stats

### 10. **Eligibility** (1 endpoint)
- `GET /eligibility/check` - Check survey eligibility

### 11. **Uploads** (3 endpoints)
- `POST /upload/kyc` - Upload KYC document
- `POST /upload/survey-media` - Upload survey media
- `POST /upload/response-image/:survey_id` - Upload response image

### 12. **Analytics** (6 endpoints)
- `GET /analytics/filler/dashboard` - Filler analytics
- `GET /analytics/filler/earnings` - Earnings breakdown
- `GET /analytics/creator/dashboard` - Creator analytics
- `GET /analytics/creator/surveys/:id` - Survey analytics
- `GET /analytics/creator/trends` - Response trends
- `GET /analytics/admin/dashboard` - Admin analytics (Admin only)
- `POST /analytics/admin/cache/invalidate` - Invalidate cache (Admin only)

### 13. **Admin Endpoints** (9 endpoints)
- `GET /admin/users` - Get users
- `GET /admin/users/:id` - Get user details
- `POST /admin/users/:id/approve` - Approve user
- `POST /admin/users/:id/reject` - Reject user
- `POST /admin/users/:id/suspend` - Suspend user
- `POST /admin/users/:id/activate` - Activate user
- `GET /admin/surveys` - Get surveys
- `POST /admin/surveys/:id/approve` - Approve survey
- `GET /admin/payments` - Get payments
- `GET /admin/reports` - Get reports
- `POST /admin/payouts` - Process payouts
- `GET /admin/export/users` - Export users

### 14. **Super Admin Endpoints** (5 endpoints)
- `GET /super-admin/admins` - Get admins
- `POST /super-admin/admins` - Create admin
- `GET /super-admin/financials` - Get financials
- `GET /super-admin/settings` - Get settings
- `PUT /super-admin/settings` - Update settings
- `POST /super-admin/audit-logs` - Log audit action
- `GET /super-admin/audit-logs` - Get audit logs

### 15. **Notifications** (2 endpoints)
- `GET /notifications` - Get notifications
- `POST /notifications/mark-read` - Mark as read

### 16. **Waitlist** (2 endpoints)
- `POST /waitlist/join` - Join waitlist
- `GET /waitlist/stats` - Get stats

### 17. **WebSocket** (1 endpoint)
- `WS /ws` - WebSocket connection

### 18. **Health Checks** (3 endpoints)
- `GET /health` - Health check (root)
- `GET /api/health` - API health
- `GET /api/healthz` - Readiness check

---

## 🔐 Authentication

### JWT Token Structure
Token obtained from login response contains:
```json
{
  "user_id": "uuid",
  "role": "filler|creator|admin|super_admin",
  "exp": "unix_timestamp"
}
```

### Using JWT Token
```bash
# Store from login response
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use in protected endpoints
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Protected Endpoints (Require JWT)
- All `/user/*` endpoints (except register)
- All `/filler/*` endpoints
- All `/creator/*` endpoints
- All `/earnings/*` endpoints
- All `/withdrawal/*` endpoints (except GET /banks)
- All `/payment/*` endpoints
- All `/referral/*` endpoints
- All `/eligibility/*` endpoints
- All `/notifications/*` endpoints
- All `/admin/*` endpoints
- All `/super-admin/*` endpoints

### Public Endpoints (No Auth Required)
- `/user/register`
- `/auth/login`, `/auth/logout`, `/auth/send-otp`, `/auth/verify-otp`
- `GET /survey`, `GET /survey/:id`, `GET /survey/:id/questions`, `GET /survey/templates`
- `/credits/packages`
- `/billing/calculate`, `/billing/validate-reward`, `/billing/pricing-tiers`
- `GET /withdrawal/banks`
- `/waitlist/*`
- `/health`, `/api/health`, `/api/healthz`

---

## 📋 Request/Response Format Examples

### Success Response (200/201)
```json
{
  "success": true,
  "ok": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "filler"
  },
  "message": "Operation completed successfully"
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": "Invalid credentials",
  "details": "Email or password is incorrect",
  "message": "Authentication failed"
}
```

---

## 🛠️ Making Requests from Frontend

### 1. **Basic Fetch Example**
```javascript
// Register
const response = await fetch('http://localhost:8080/api/user/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    role: 'filler',
    password: 'SecurePass123!',
    phone: '+1234567890'
  })
});

const data = await response.json();
console.log(data);
```

### 2. **With Authentication**
```javascript
// Login first
const loginRes = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const { token } = await loginRes.json();

// Use token in subsequent requests
const profileRes = await fetch('http://localhost:8080/api/user/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await profileRes.json();
console.log(profile);
```

### 3. **With Axios**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Interceptor to add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const response = await api.get('/user/profile');
console.log(response.data);
```

---

## ⚡ Rate Limiting

- **Limit:** 100 requests per minute per IP/User
- **Headers in response:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 99`
  - `X-RateLimit-Reset: 1234567890`

---

## 🧪 Testing

### Run Test Suite
```bash
./test_api.sh
```

### Manual Testing with cURL
See `API_TESTING_GUIDE.md` for detailed cURL examples.

### Testing with Postman
1. Import the API endpoints reference
2. Create environment variables for `base_url` and `jwt_token`
3. Save requests in a collection
4. Use pre-request scripts to auto-extract tokens

### Testing with REST Client (VS Code)
Create a `.rest` file:
```rest
### Register
POST http://localhost:8080/api/user/register
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User",
  "role": "filler",
  "password": "Pass123!",
  "phone": "+1234567890"
}

### Get Profile
GET http://localhost:8080/api/user/profile
Authorization: Bearer {{token}}
```

---

## 🔍 Debugging

### Check if Backend is Running
```bash
curl http://localhost:8080/api/health
```

### Enable Verbose cURL
```bash
curl -v http://localhost:8080/api/health
```

### Pretty Print JSON
```bash
curl http://localhost:8080/api/survey | jq '.'
```

### Check JWT Token
Visit https://jwt.io and paste your token to decode it.

### Common Issues

**"Invalid request" error:**
- Check JSON syntax
- Verify Content-Type header is `application/json`
- Check required fields are present

**"Unauthorized" error:**
- JWT token is missing or invalid
- Token may be expired
- Check Authorization header format: `Bearer {token}`

**"Database unavailable" error:**
- Backend connection issue
- Check if backend is running: `curl http://localhost:8080/health`

**CORS errors (from browser):**
- Backend should have CORS headers configured
- Check if frontend origin is in allowed list

---

## 📱 Frontend Integration Checklist

- [ ] Store JWT token securely (httpOnly cookie recommended)
- [ ] Include `Authorization: Bearer {token}` header for protected routes
- [ ] Handle 401 errors by redirecting to login
- [ ] Handle rate limiting (100 req/min)
- [ ] Implement proper error handling with user feedback
- [ ] Use environment variables for API base URL
- [ ] Handle token expiration (24 hours)
- [ ] Validate input before sending to backend
- [ ] Handle CORS if frontend is on different origin
- [ ] Implement retry logic for failed requests
- [ ] Log errors for debugging
- [ ] Test with actual backend running locally

---

## 📞 Support

For detailed information:
- **Full API Reference:** `API_ENDPOINTS_REFERENCE.md`
- **Testing Guide:** `API_TESTING_GUIDE.md`
- **Automated Tests:** `test_api.sh`

---

## 🎯 Next Steps

1. **Review the documentation:**
   - Read `API_ENDPOINTS_REFERENCE.md` for complete endpoint details
   - Check `API_TESTING_GUIDE.md` for testing strategies

2. **Test the API:**
   - Run `./test_api.sh` to test all endpoints
   - Or manually test with cURL commands provided

3. **Integrate with Frontend:**
   - Use the request/response examples provided
   - Follow the authentication flow
   - Handle errors appropriately

4. **Deploy:**
   - When ready for production, update `BASE_URL` from `http://localhost:8080` to your production server
   - Ensure proper CORS configuration
   - Use environment variables for configuration

---

**Happy Testing! 🚀**
