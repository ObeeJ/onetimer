# Frontend API Requests Analysis

## Complete List of Frontend API Calls

### 🔐 Authentication & User Management
- `POST /user/register` - User registration
- `POST /user/profile` - Update user profile
- `PUT /user/profile` - Update user profile (alternative)
- `POST /user/change-password` - Change user password
- `GET /user/preferences` - Get user preferences
- `POST /user/preferences` - Update user preferences

### 📋 Survey Operations
- `GET /survey` - Get surveys (paginated: `/survey?page=${pageParam}&limit=10`)
- `GET /survey/${id}` - Get specific survey
- `POST /survey` - Create new survey
- `PUT /survey/${id}` - Update survey
- `DELETE /survey/${id}` - Delete survey
- `POST /survey/${surveyId}/progress` - Save survey progress
- `POST /survey/${surveyId}/submit` - Submit survey responses

### 👤 Onboarding
- `POST /onboarding/filler` - Complete filler onboarding
- `PUT /onboarding/demographics` - Update demographics

### 🎯 Creator Operations
- `GET /creator/dashboard` - Get creator dashboard
- `GET /creator/credits` - Get creator credits
- `GET /creator/surveys` - Get creator's surveys
- `GET /creator/surveys/${surveyId}/analytics` - Get survey analytics

### 💰 Earnings & Payments
- `GET /earnings` - Get user earnings
- `POST /earnings/withdraw` - Request withdrawal

### 👥 Admin Operations
- `GET /admin/users` - Get all users (admin)
- `POST /admin/users/${userId}/approve` - Approve user
- `POST /admin/users/${userId}/reject` - Reject user
- `POST /admin/surveys/${surveyId}/approve` - Approve survey

### 🔧 Super Admin Operations
- `POST /super-admin/admins` - Create admin
- `POST /super-admin/admins/${adminId}/suspend` - Suspend admin
- `POST /super-admin/audit-logs` - Log audit action

### 📊 Analytics & Referrals
- `GET /referral/stats` - Get referral statistics
- `POST /eligibility` - Check eligibility

### 🧪 Testing
- `GET test.endpoint` - Test endpoint (from test integration page)
- `POST test.endpoint` - Test endpoint (from test integration page)

## Summary by HTTP Method

### GET Requests (9 endpoints)
1. `/survey` (with pagination)
2. `/survey/${id}`
3. `/user/preferences`
4. `/creator/dashboard`
5. `/creator/credits`
6. `/creator/surveys`
7. `/creator/surveys/${surveyId}/analytics`
8. `/earnings`
9. `/admin/users`
10. `/referral/stats`

### POST Requests (15 endpoints)
1. `/user/register`
2. `/user/profile`
3. `/user/change-password`
4. `/user/preferences`
5. `/survey`
6. `/survey/${surveyId}/progress`
7. `/survey/${surveyId}/submit`
8. `/onboarding/filler`
9. `/earnings/withdraw`
10. `/admin/users/${userId}/approve`
11. `/admin/users/${userId}/reject`
12. `/admin/surveys/${surveyId}/approve`
13. `/super-admin/admins`
14. `/super-admin/admins/${adminId}/suspend`
15. `/super-admin/audit-logs`
16. `/eligibility`

### PUT Requests (2 endpoints)
1. `/onboarding/demographics`
2. `/survey/${id}`

### DELETE Requests (1 endpoint)
1. `/survey/${id}`

## Total Frontend API Requests: 27 unique endpoints

## Backend Compatibility Check
- ✅ Most endpoints match backend routes
- ⚠️ Some endpoints may need verification:
  - `/eligibility` vs `/eligibility/check`
  - `/earnings` vs `/analytics/filler/earnings`
  - Survey analytics endpoints structure

## Role-Based Usage
- **Filler**: User management, onboarding, earnings, survey submission
- **Creator**: Dashboard, surveys, credits, analytics
- **Admin**: User management, survey approval
- **Super Admin**: Admin management, audit logs
