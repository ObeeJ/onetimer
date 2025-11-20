# OneTimer API Endpoints Reference
## All Frontend Requests - Complete List

**Base URL:** `http://localhost:8080/api`

---

## 1. AUTHENTICATION & USER MANAGEMENT

### Register User
- **Endpoint:** `POST /user/register`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "filler",  // or "creator"
  "password": "SecurePassword123!",
  "phone": "+1234567890"
}
```
- **Response:** `201 Created`
```json
{
  "ok": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "filler",
    "is_verified": false,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Login
- **Endpoint:** `POST /auth/login`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
- **Response:** `200 OK`
```json
{
  "ok": true,
  "token": "jwt_token_string",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "filler",
    "is_verified": false,
    "is_active": true
  }
}
```

### Logout
- **Endpoint:** `POST /auth/logout`
- **Auth Required:** Yes (JWT)
- **Request Body:** `{}`
- **Response:** `200 OK`

### Send OTP
- **Endpoint:** `POST /auth/send-otp`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Get User Profile
- **Endpoint:** `GET /user/profile`
- **Auth Required:** Yes (JWT)
- **Query Parameters:** None
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "filler",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "location": "Lagos, Nigeria",
    "is_verified": false,
    "is_active": true,
    "kyc_status": "pending",
    "profile_picture_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update User Profile
- **Endpoint:** `PUT /user/profile`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+9876543210",
  "gender": "male",
  "location": "Abuja, Nigeria",
  "date_of_birth": "1990-01-01"
}
```

### Change Password
- **Endpoint:** `POST /user/change-password`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "old_password": "OldPassword123!",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

### Upload KYC Documents
- **Endpoint:** `POST /user/kyc`
- **Auth Required:** Yes (JWT)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `document_type`: "passport" | "driver_license" | "national_id"
  - `file`: Binary file

### Get KYC Status
- **Endpoint:** `GET /user/kyc-status`
- **Auth Required:** Yes (JWT)
- **Response:** `200 OK`
```json
{
  "success": true,
  "status": "pending",  // pending, approved, rejected
  "message": "KYC verification in progress"
}
```

---

## 2. ONBOARDING

### Complete Filler Onboarding
- **Endpoint:** `POST /onboarding/filler`
- **Auth Required:** No
- **Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "profile": {
    "age_range": "25-34",
    "gender": "male",
    "country": "Nigeria",
    "state": "Lagos",
    "education": "bachelor",
    "employment": "employed",
    "income_range": "100000-200000",
    "interests": ["technology", "sports", "music"]
  }
}
```

### Complete Creator Onboarding
- **Endpoint:** `POST /onboarding/creator`
- **Auth Required:** No
- **Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "company_name": "My Research Company",
  "company_website": "https://example.com",
  "profile": {
    "industry": "technology",
    "company_size": "50-100",
    "experience_years": 5
  }
}
```

### Update Demographics
- **Endpoint:** `PUT /onboarding/demographics`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "age_range": "25-34",
  "gender": "male",
  "country": "Nigeria",
  "state": "Lagos",
  "education": "bachelor",
  "employment": "employed",
  "income_range": "100000-200000",
  "interests": ["technology", "sports"]
}
```

### Get Eligible Surveys
- **Endpoint:** `GET /onboarding/surveys`
- **Auth Required:** Yes (JWT)
- **Query Parameters:**
  - `limit`: number (default: 10)
  - `offset`: number (default: 0)

---

## 3. SURVEYS

### List All Surveys
- **Endpoint:** `GET /survey`
- **Auth Required:** No
- **Query Parameters:**
  - `limit`: number (default: 100)
  - `offset`: number (default: 0)
  - `status`: string (optional)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "creator_id": "uuid",
      "title": "Customer Satisfaction Survey",
      "description": "We would like to know your feedback",
      "category": "customer-experience",
      "reward_amount": 500,
      "estimated_duration": 10,
      "target_responses": 100,
      "current_responses": 45,
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Single Survey
- **Endpoint:** `GET /survey/:id`
- **Auth Required:** No
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "survey": {
      "id": "uuid",
      "creator_id": "uuid",
      "title": "Customer Satisfaction Survey",
      "description": "We would like to know your feedback",
      "category": "customer-experience",
      "reward_amount": 500,
      "estimated_duration": 10,
      "target_responses": 100,
      "current_responses": 45,
      "status": "active"
    },
    "questions": [
      {
        "id": "uuid",
        "type": "single",
        "title": "How satisfied are you?",
        "required": true,
        "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]
      }
    ]
  },
  "reward": 500
}
```

### Create Survey
- **Endpoint:** `POST /survey`
- **Auth Required:** Yes (JWT) - Creator role
- **Request Body:**
```json
{
  "title": "Customer Satisfaction Survey",
  "description": "We would like to know your feedback",
  "category": "customer-experience",
  "reward_amount": 500,
  "target_count": 100,
  "estimated_duration": 10,
  "questions": [
    {
      "id": "q1",
      "type": "single",
      "title": "How satisfied are you?",
      "description": "Rate your satisfaction",
      "required": true,
      "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"],
      "order": 0
    },
    {
      "id": "q2",
      "type": "text",
      "title": "What can we improve?",
      "required": false,
      "order": 1
    },
    {
      "id": "q3",
      "type": "rating",
      "title": "Overall experience",
      "required": true,
      "scale": 5,
      "order": 2
    }
  ],
  "priority_placement": false,
  "demographic_filters": ["age_group", "location"],
  "demographics": {
    "age_groups": ["25-34", "35-44"],
    "genders": ["male", "female"],
    "locations": ["Lagos", "Abuja"],
    "education": ["bachelor", "master"],
    "employment": ["employed"],
    "income_ranges": ["100000-200000"]
  }
}
```
- **Response:** `201 Created`

### Update Survey
- **Endpoint:** `PUT /survey/:id`
- **Auth Required:** Yes (JWT) - Creator role
- **Request Body:** (Same structure as Create Survey)

### Delete Survey
- **Endpoint:** `DELETE /survey/:id`
- **Auth Required:** Yes (JWT) - Creator role

### Get Survey Questions
- **Endpoint:** `GET /survey/:id/questions`
- **Auth Required:** No

### Start Survey
- **Endpoint:** `POST /survey/:id/start`
- **Auth Required:** Yes (JWT)
- **Request Body:** `{}`

### Save Progress
- **Endpoint:** `POST /survey/:id/progress`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "current_question": 5,
  "responses": {
    "q1": "Very Satisfied",
    "q2": "Great service",
    "q3": 5
  }
}
```

### Submit Response
- **Endpoint:** `POST /survey/:id/submit`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "responses": {
    "q1": "Very Satisfied",
    "q2": "Great service",
    "q3": 5,
    "q4": ["Option 1", "Option 2"]
  },
  "time_spent": 600  // in seconds
}
```

### Pause Survey
- **Endpoint:** `POST /survey/:id/pause`
- **Auth Required:** Yes (JWT)

### Resume Survey
- **Endpoint:** `POST /survey/:id/resume`
- **Auth Required:** Yes (JWT)

### Duplicate Survey
- **Endpoint:** `POST /survey/:id/duplicate`
- **Auth Required:** Yes (JWT)

### Save Survey Draft
- **Endpoint:** `POST /survey/draft`
- **Auth Required:** Yes (JWT)
- **Request Body:** (Same as Create Survey)

### Get Survey Templates
- **Endpoint:** `GET /survey/templates`
- **Auth Required:** No

### Import Survey
- **Endpoint:** `POST /survey/import`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "template_id": "uuid",
  "title": "My Imported Survey"
}
```

---

## 4. FILLER (SURVEY TAKER) ENDPOINTS

### Get Filler Dashboard
- **Endpoint:** `GET /filler/dashboard`
- **Auth Required:** Yes (JWT)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "filler"
    },
    "stats": {
      "active_surveys": 5,
      "completed_surveys": 15,
      "total_earnings": 7500
    },
    "recent_surveys": [
      {
        "id": "uuid",
        "title": "Customer Satisfaction Survey",
        "description": "Your feedback matters",
        "reward": 500
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Get Available Surveys
- **Endpoint:** `GET /filler/surveys`
- **Auth Required:** Yes (JWT)
- **Query Parameters:**
  - `limit`: number (default: 10)
  - `offset`: number (default: 0)
  - `category`: string (optional)
  - `min_reward`: number (optional)
  - `max_reward`: number (optional)

### Get Completed Surveys
- **Endpoint:** `GET /filler/surveys/completed`
- **Auth Required:** Yes (JWT)
- **Query Parameters:**
  - `limit`: number (default: 10)
  - `offset`: number (default: 0)

### Get Earnings History
- **Endpoint:** `GET /filler/earnings`
- **Auth Required:** Yes (JWT)
- **Query Parameters:**
  - `start_date`: ISO date string (optional)
  - `end_date`: ISO date string (optional)
  - `limit`: number (default: 20)

---

## 5. CREATOR ENDPOINTS

### Get Creator Dashboard
- **Endpoint:** `GET /creator/dashboard`
- **Auth Required:** Yes (JWT) - Creator role
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_surveys": 5,
    "active_surveys": 3,
    "total_responses": 450,
    "total_credits_used": 2500,
    "this_month_responses": 150,
    "this_month_earnings": 1500
  }
}
```

### Get Creator Surveys
- **Endpoint:** `GET /creator/surveys`
- **Auth Required:** Yes (JWT) - Creator role
- **Query Parameters:**
  - `status`: string (optional)
  - `limit`: number (default: 10)
  - `offset`: number (default: 0)

### Get Survey Responses
- **Endpoint:** `GET /creator/surveys/:id/responses`
- **Auth Required:** Yes (JWT) - Creator role
- **Query Parameters:**
  - `limit`: number (default: 50)
  - `offset`: number (default: 0)

### Get Response Details
- **Endpoint:** `GET /creator/surveys/:survey_id/responses/:response_id`
- **Auth Required:** Yes (JWT) - Creator role

### Get Survey Analytics
- **Endpoint:** `GET /creator/surveys/:id/analytics`
- **Auth Required:** Yes (JWT) - Creator role
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "survey_id": "uuid",
    "title": "Customer Survey",
    "total_responses": 150,
    "completion_rate": 75,
    "average_time": 480,
    "demographic_breakdown": {
      "age_groups": {"25-34": 50, "35-44": 100},
      "genders": {"male": 80, "female": 70}
    },
    "question_analysis": [
      {
        "question_id": "q1",
        "type": "single",
        "responses": {"Option 1": 50, "Option 2": 100}
      }
    ]
  }
}
```

### Export Survey Responses
- **Endpoint:** `POST /creator/surveys/:id/export`
- **Auth Required:** Yes (JWT) - Creator role
- **Request Body:**
```json
{
  "format": "csv",  // or "xlsx", "json"
  "include_metadata": true
}
```

---

## 6. CREDITS & BILLING

### Get Credit Packages
- **Endpoint:** `GET /credits/packages`
- **Auth Required:** No
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "pkg1",
      "name": "Starter",
      "credits": 100,
      "price": 5000,
      "currency": "NGN",
      "responses": 100,
      "bonus_credits": 0
    },
    {
      "id": "pkg2",
      "name": "Pro",
      "credits": 500,
      "price": 20000,
      "currency": "NGN",
      "responses": 500,
      "bonus_credits": 50
    }
  ]
}
```

### Purchase Credits
- **Endpoint:** `POST /credits/purchase`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "package_id": "pkg1",
  "quantity": 1
}
```

### Purchase Custom Credits
- **Endpoint:** `POST /credits/purchase/custom`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "credits": 250,
  "price": 10000
}
```

### Get Creator Credits
- **Endpoint:** `GET /creator/credits`
- **Auth Required:** Yes (JWT) - Creator role

### Calculate Billing Cost
- **Endpoint:** `POST /billing/calculate`
- **Auth Required:** No
- **Request Body:**
```json
{
  "target_responses": 100,
  "estimated_duration": 10,
  "priority_placement": false,
  "demographic_filters": ["age_group", "location"],
  "extra_days": 0,
  "data_export": false
}
```

### Validate Reward
- **Endpoint:** `POST /billing/validate-reward`
- **Auth Required:** No
- **Request Body:**
```json
{
  "reward_amount": 500,
  "target_responses": 100
}
```

### Get Pricing Tiers
- **Endpoint:** `GET /billing/pricing-tiers`
- **Auth Required:** No

---

## 7. EARNINGS & WITHDRAWALS

### Get Earnings
- **Endpoint:** `GET /earnings`
- **Auth Required:** Yes (JWT)
- **Query Parameters:**
  - `start_date`: ISO date (optional)
  - `end_date`: ISO date (optional)
  - `limit`: number (default: 20)

### Withdraw Earnings
- **Endpoint:** `POST /earnings/withdraw`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "amount": 5000,
  "bank_code": "011",
  "account_number": "1234567890",
  "account_name": "John Doe"
}
```

### Request Withdrawal
- **Endpoint:** `POST /withdrawal/request`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "amount": 5000,
  "bank_code": "011",
  "account_number": "1234567890"
}
```

### Get Withdrawal History
- **Endpoint:** `GET /withdrawal/history`
- **Auth Required:** Yes (JWT)
- **Query Parameters:**
  - `status`: string (optional)
  - `limit`: number (default: 20)
  - `offset`: number (default: 0)

### Get Banks List
- **Endpoint:** `GET /withdrawal/banks`
- **Auth Required:** No

### Verify Account
- **Endpoint:** `POST /withdrawal/verify-account`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "bank_code": "011",
  "account_number": "1234567890"
}
```

---

## 8. PAYMENT & PAYSTACK

### Purchase Credits (via Payment)
- **Endpoint:** `POST /payment/purchase`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "package_id": "pkg1",
  "quantity": 1,
  "payment_method": "card"
}
```

### Verify Payment
- **Endpoint:** `GET /payment/verify/:reference`
- **Auth Required:** Yes (JWT)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reference": "PAY123456",
    "status": "success",
    "amount": 5000,
    "currency": "NGN",
    "paid_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get Payment Methods
- **Endpoint:** `GET /payment/methods`
- **Auth Required:** Yes (JWT)

### Add Payment Method
- **Endpoint:** `POST /payment/methods`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "type": "card",
  "card_number": "4111111111111111",
  "expiry_month": "12",
  "expiry_year": "25",
  "cvv": "123",
  "cardholder_name": "John Doe"
}
```

### Get Transaction History
- **Endpoint:** `GET /payment/history`
- **Auth Required:** Yes (JWT)

### Process Batch Payouts
- **Endpoint:** `POST /payment/payouts`
- **Auth Required:** Yes (JWT) - Admin only
- **Request Body:**
```json
{
  "payouts": [
    {
      "user_id": "uuid",
      "amount": 5000,
      "bank_code": "011",
      "account_number": "1234567890"
    }
  ]
}
```

### Refund Transaction
- **Endpoint:** `POST /payment/refund/:id`
- **Auth Required:** Yes (JWT) - Admin only
- **Request Body:**
```json
{
  "reason": "User requested refund"
}
```

---

## 9. REFERRALS

### Get Referrals
- **Endpoint:** `GET /referral`
- **Auth Required:** Yes (JWT)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "referral_code": "REF123456",
    "referred_users": 10,
    "total_earnings": 5000,
    "referrals": [
      {
        "referred_user": "uuid",
        "referred_email": "friend@example.com",
        "status": "active",
        "earnings": 500,
        "referred_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Generate Referral Code
- **Endpoint:** `POST /referral/code`
- **Auth Required:** Yes (JWT)

### Get Referral Stats
- **Endpoint:** `GET /referral/stats`
- **Auth Required:** Yes (JWT)

---

## 10. ELIGIBILITY

### Check Eligibility
- **Endpoint:** `GET /eligibility/check`
- **Auth Required:** Yes (JWT)
- **Query Parameters:**
  - `survey_id`: uuid (optional)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "is_eligible": true,
    "reasons": [],
    "survey_id": "uuid"
  }
}
```

---

## 11. UPLOADS

### Upload KYC Document
- **Endpoint:** `POST /upload/kyc`
- **Auth Required:** No (Can be with JWT)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `document_type`: string
  - `user_id`: uuid (if not authenticated)
  - `file`: binary

### Upload Survey Media
- **Endpoint:** `POST /upload/survey-media`
- **Auth Required:** Yes (JWT)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `survey_id`: uuid
  - `file`: binary

### Upload Response Image
- **Endpoint:** `POST /upload/response-image/:survey_id`
- **Auth Required:** Yes (JWT)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `file`: binary

---

## 12. ANALYTICS

### Get Filler Dashboard Analytics
- **Endpoint:** `GET /analytics/filler/dashboard`
- **Auth Required:** Yes (JWT)

### Get Earnings Breakdown
- **Endpoint:** `GET /analytics/filler/earnings`
- **Auth Required:** Yes (JWT)

### Get Creator Dashboard Analytics
- **Endpoint:** `GET /analytics/creator/dashboard`
- **Auth Required:** Yes (JWT)

### Get Survey Analytics
- **Endpoint:** `GET /analytics/creator/surveys/:id`
- **Auth Required:** Yes (JWT)

### Get Response Trends
- **Endpoint:** `GET /analytics/creator/trends`
- **Auth Required:** Yes (JWT)

### Get Admin Dashboard
- **Endpoint:** `GET /analytics/admin/dashboard`
- **Auth Required:** Yes (JWT) - Admin only

### Invalidate Cache
- **Endpoint:** `POST /analytics/admin/cache/invalidate`
- **Auth Required:** Yes (JWT) - Admin only
- **Request Body:**
```json
{
  "keys": ["analytics:*", "survey:*"]
}
```

---

## 13. ADMIN ENDPOINTS

### Get Users
- **Endpoint:** `GET /admin/users`
- **Auth Required:** Yes (JWT) - Admin only
- **Query Parameters:**
  - `status`: string (optional)
  - `role`: string (optional)
  - `limit`: number (default: 50)

### Get User Details
- **Endpoint:** `GET /admin/users/:id`
- **Auth Required:** Yes (JWT) - Admin only

### Approve User
- **Endpoint:** `POST /admin/users/:id/approve`
- **Auth Required:** Yes (JWT) - Admin only
- **Request Body:**
```json
{
  "notes": "User documents verified"
}
```

### Reject User
- **Endpoint:** `POST /admin/users/:id/reject`
- **Auth Required:** Yes (JWT) - Admin only
- **Request Body:**
```json
{
  "reason": "Invalid documents"
}
```

### Suspend User
- **Endpoint:** `POST /admin/users/:id/suspend`
- **Auth Required:** Yes (JWT) - Admin only
- **Request Body:**
```json
{
  "reason": "Suspicious activity"
}
```

### Activate User
- **Endpoint:** `POST /admin/users/:id/activate`
- **Auth Required:** Yes (JWT) - Admin only

### Get Surveys
- **Endpoint:** `GET /admin/surveys`
- **Auth Required:** Yes (JWT) - Admin only

### Approve Survey
- **Endpoint:** `POST /admin/surveys/:id/approve`
- **Auth Required:** Yes (JWT) - Admin only
- **Request Body:**
```json
{
  "notes": "Survey approved for publication"
}
```

### Get Payments
- **Endpoint:** `GET /admin/payments`
- **Auth Required:** Yes (JWT) - Admin only

### Get Reports
- **Endpoint:** `GET /admin/reports`
- **Auth Required:** Yes (JWT) - Admin only

### Process Payouts
- **Endpoint:** `POST /admin/payouts`
- **Auth Required:** Yes (JWT) - Admin only
- **Request Body:**
```json
{
  "batch_id": "uuid",
  "payouts": [
    {
      "user_id": "uuid",
      "amount": 5000
    }
  ]
}
```

### Export Users
- **Endpoint:** `GET /admin/export/users`
- **Auth Required:** Yes (JWT) - Admin only
- **Query Parameters:**
  - `format`: "csv" | "xlsx" | "json"

---

## 14. SUPER ADMIN ENDPOINTS

### Get Admins
- **Endpoint:** `GET /super-admin/admins`
- **Auth Required:** Yes (JWT) - Super Admin only

### Create Admin
- **Endpoint:** `POST /super-admin/admins`
- **Auth Required:** Yes (JWT) - Super Admin only
- **Request Body:**
```json
{
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",
  "permissions": ["users_management", "surveys_management"]
}
```

### Get Financials
- **Endpoint:** `GET /super-admin/financials`
- **Auth Required:** Yes (JWT) - Super Admin only

### Get System Settings
- **Endpoint:** `GET /super-admin/settings`
- **Auth Required:** Yes (JWT) - Super Admin only

### Update System Settings
- **Endpoint:** `PUT /super-admin/settings`
- **Auth Required:** Yes (JWT) - Super Admin only
- **Request Body:**
```json
{
  "platform_fee": 0.1,
  "min_withdrawal": 1000,
  "max_daily_withdrawals": 100000
}
```

### Log Audit Action
- **Endpoint:** `POST /super-admin/audit-logs`
- **Auth Required:** Yes (JWT) - Super Admin only
- **Request Body:**
```json
{
  "action": "user_deleted",
  "user_id": "uuid",
  "details": "User account permanently deleted"
}
```

### Get Audit Logs
- **Endpoint:** `GET /super-admin/audit-logs`
- **Auth Required:** Yes (JWT) - Super Admin only
- **Query Parameters:**
  - `action`: string (optional)
  - `user_id`: uuid (optional)
  - `limit`: number (default: 50)

---

## 15. NOTIFICATIONS

### Get Notifications
- **Endpoint:** `GET /notifications`
- **Auth Required:** Yes (JWT)
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "survey_available",
      "title": "New Survey Available",
      "message": "A new survey matching your interests is now available",
      "read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Mark Notifications as Read
- **Endpoint:** `POST /notifications/mark-read`
- **Auth Required:** Yes (JWT)
- **Request Body:**
```json
{
  "notification_ids": ["uuid1", "uuid2"],
  "mark_all": false
}
```

---

## 16. WAITLIST

### Join Waitlist
- **Endpoint:** `POST /waitlist/join`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "user@example.com",
  "user_type": "filler"  // or "creator"
}
```

### Get Waitlist Stats
- **Endpoint:** `GET /waitlist/stats`
- **Auth Required:** No

---

## 17. WEBSOCKET

### WebSocket Connection
- **Endpoint:** `WS /ws`
- **Auth Required:** Yes (JWT via query param or header)
- **Connection:** `ws://localhost:8080/ws?token=jwt_token`
- **Message Types:**
  - `survey_notification`: New survey available
  - `payment_status`: Payment confirmation
  - `withdrawal_status`: Withdrawal update
  - `chat_message`: Chat messages

---

## 18. HEALTH CHECKS

### Health Check (Root)
- **Endpoint:** `GET /health`
- **Auth Required:** No
- **Response:** `200 OK`
```json
{
  "status": "ok",
  "env": "production",
  "time": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### API Health Check
- **Endpoint:** `GET /api/health`
- **Auth Required:** No
- **Response:** `200 OK`
```json
{
  "status": "ok",
  "env": "production",
  "api": "ready",
  "ratelimit": true
}
```

### Readiness Check
- **Endpoint:** `GET /api/healthz`
- **Auth Required:** No
- **Response:** `200 OK`
```json
{
  "status": "ok",
  "ready": true
}
```

---

## Headers & Authentication

### Standard Headers
```
Content-Type: application/json
Authorization: Bearer {jwt_token}  // For protected endpoints
```

### JWT Token Claims
```json
{
  "user_id": "uuid",
  "role": "filler|creator|admin|super_admin",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### CSRF Protection
- CSRF token is set via cookie: `csrf_token`
- Include in request header: `X-CSRF-Token: {token}`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "details": "Field validation failed"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "The requested endpoint does not exist",
  "success": false
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Something went wrong on the server"
}
```

---

## Rate Limiting
- **Default:** 100 requests per minute per IP/User
- **Headers:** Check response headers for rate limit info
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Base Response Format
Most endpoints follow this structure:

### Success Response (200/201)
```json
{
  "success": true,
  "ok": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "message": "User-friendly error message"
}
```

---

## Testing Notes
- Base URL: `http://localhost:8080/api`
- Use JWT tokens from login response for authenticated requests
- All timestamps are in ISO 8601 format
- UUIDs are used for all resource IDs
- Currency is in NGN (Nigerian Naira)
