# SUPER ADMIN API REFERENCE

## Quick Reference: All Endpoints

### Dashboard Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/super-admin/dashboard/stats` | Get platform statistics | `{ totalUsers, activeAdmins, totalSurveys, totalRevenue, changes }` |
| GET | `/api/super-admin/system-health` | Get system health metrics | `[{ metric, value, status }]` |
| GET | `/api/super-admin/activity-feed` | Get recent admin activities | `[{ admin, action, time, type }]` |
| GET | `/api/super-admin/alerts` | Get critical alerts | `[{ type, message, severity, time }]` |

### Analytics Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/super-admin/analytics/monthly` | Get 6-month growth data | `[{ month, users, surveys, revenue }]` |
| GET | `/api/super-admin/analytics/user-distribution` | Get user type breakdown | `[{ name, value, color }]` |
| GET | `/api/super-admin/analytics/revenue-trends` | Get revenue trends | `[{ month, revenue, profit }]` |

### Survey Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/super-admin/surveys/stats` | Get survey statistics | `{ total, active, pending, suspended }` |
| GET | `/api/super-admin/surveys/list` | Get all surveys | `[{ id, title, creator, status, responses, reward, created }]` |

### Finance Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/super-admin/financials/metrics` | Get financial metrics | `{ totalRevenue, pendingPayouts, processingFees, netProfit, changes }` |
| GET | `/api/super-admin/financials/payouts` | Get payout queue | `[{ id, amount, users, status, priority, submittedBy }]` |
| GET | `/api/super-admin/financials/reconciliation` | Get daily reconciliation | `[{ date, expected, processed, variance, status }]` |
| POST | `/api/super-admin/financials/approve-payout/:id` | Approve a payout | `{ success, message }` |

### User & Admin Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/super-admin/users` | Get all users | `{ users: [], total }` |
| GET | `/api/super-admin/admins` | Get all admins | `{ data: [], count }` |
| POST | `/api/super-admin/admins` | Create new admin | `{ ok, message, admin }` |
| POST | `/api/super-admin/admins/:id/suspend` | Suspend an admin | `{ success, message }` |

---

## Frontend Usage Examples

### 1. Fetch Dashboard Stats

```typescript
import { superAdminApi } from '@/lib/api/super-admin'

const stats = await superAdminApi.getDashboardStats()
console.log(stats.totalUsers) // 12847
console.log(stats.userChange) // "+18%"
```

### 2. Fetch System Health

```typescript
const health = await superAdminApi.getSystemHealth()
health.forEach(h => {
  console.log(`${h.metric}: ${h.value} (${h.status})`)
})
```

### 3. Fetch Activity Feed

```typescript
const activities = await superAdminApi.getActivityFeed()
activities.forEach(a => {
  console.log(`${a.admin} - ${a.action} (${a.time})`)
})
```

### 4. Approve Payout

```typescript
try {
  await superAdminApi.approvePayout('payout-id-123')
  console.log('Payout approved!')
} catch (error) {
  console.error('Failed to approve payout')
}
```

### 5. Create Admin

```typescript
try {
  await superAdminApi.createAdmin({
    email: 'newadmin@example.com',
    name: 'New Admin',
    password: 'SecurePassword123!'
  })
  console.log('Admin created!')
} catch (error) {
  console.error('Failed to create admin')
}
```

---

## Database Tables Used

### Primary Tables:
- `users` - User accounts (all roles)
- `surveys` - Survey data
- `earnings` - Payment/earnings records
- `audit_logs` - Admin activity logs
- `survey_responses` - Survey response data

### Key Columns:

**users table:**
- `id`, `email`, `name`, `role`, `is_active`, `is_verified`, `kyc_status`, `created_at`

**surveys table:**
- `id`, `title`, `creator_id`, `status`, `reward_amount`, `created_at`

**earnings table:**
- `id`, `user_id`, `amount`, `status`, `created_at`

**audit_logs table:**
- `id`, `user_id`, `action`, `details`, `created_at`

---

## Response Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Data retrieved successfully |
| 201 | Created | Admin created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not super admin role |
| 500 | Server Error | Database or server error |

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message here",
  "success": false
}
```

Frontend should handle errors:

```typescript
try {
  const data = await superAdminApi.getDashboardStats()
  // Use data
} catch (error) {
  console.error('API Error:', error)
  // Show error toast/message to user
}
```

---

## Authentication

All endpoints require:
1. Valid JWT token in Authorization header
2. User role must be `super_admin`

The `apiClient` automatically includes the JWT token from cookies.

---

## Rate Limiting

All endpoints are rate-limited to:
- 100 requests per minute per IP
- Applied at the API gateway level

---

## Caching

Some endpoints use Redis caching:
- Dashboard stats: 5 minutes
- System health: 1 minute
- Analytics: 15 minutes

Cache is automatically invalidated on data changes.

---

## Testing Endpoints

Use curl to test:

```bash
# Get dashboard stats
curl -X GET http://localhost:8081/api/super-admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get system health
curl -X GET http://localhost:8081/api/super-admin/system-health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create admin
curl -X POST http://localhost:8081/api/super-admin/admins \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","name":"Test Admin","password":"Password123!"}'
```

---

## Migration Checklist

For each frontend page:

1. ✅ Remove hardcoded data arrays
2. ✅ Add `useState` for data storage
3. ✅ Add `useEffect` to fetch data on mount
4. ✅ Add loading state
5. ✅ Add error handling
6. ✅ Update JSX to use state data
7. ✅ Add refresh functionality
8. ✅ Test with real backend

---

## Performance Tips

1. **Batch requests:** Use `Promise.all()` to fetch multiple endpoints simultaneously
2. **Add loading skeletons:** Show skeleton UI while data loads
3. **Implement pagination:** For large lists (users, surveys)
4. **Add refresh button:** Allow manual data refresh
5. **Cache on frontend:** Use React Query or SWR for automatic caching

---

## Next Steps

1. Update all 7 frontend pages (see SUPER_ADMIN_IMPLEMENTATION_GUIDE.md)
2. Test each page individually
3. Add error boundaries
4. Add loading states
5. Test with real data
6. Deploy to production

**Estimated Time:** 2-3 hours for complete integration
