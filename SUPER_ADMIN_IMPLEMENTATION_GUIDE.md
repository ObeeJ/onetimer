# SUPER ADMIN IMPLEMENTATION GUIDE

## ✅ COMPLETED: Backend API Endpoints

### New Controllers Created:
1. `backend/api/controllers/super_admin_dashboard.go`
2. `backend/api/controllers/super_admin_analytics.go`
3. `backend/api/controllers/super_admin_finance.go`

### New Routes Added to `routes.go`:

```
GET  /api/super-admin/dashboard/stats
GET  /api/super-admin/system-health
GET  /api/super-admin/activity-feed
GET  /api/super-admin/alerts
GET  /api/super-admin/analytics/monthly
GET  /api/super-admin/analytics/user-distribution
GET  /api/super-admin/analytics/revenue-trends
GET  /api/super-admin/surveys/stats
GET  /api/super-admin/surveys/list
GET  /api/super-admin/financials/metrics
GET  /api/super-admin/financials/payouts
GET  /api/super-admin/financials/reconciliation
POST /api/super-admin/financials/approve-payout/:id
```

### Frontend API Client Created:
- `lib/api/super-admin.ts` - TypeScript client with type definitions

---

## 🔧 NEXT STEPS: Frontend Integration

### 1. Update Dashboard Page

**File:** `app/super-admin/page.tsx`

Replace hardcoded data with API calls:

```typescript
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { superAdminApi, DashboardStats, SystemHealth, Activity, Alert } from "@/lib/api/super-admin"

export default function SuperAdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "super_admin")) {
      router.push("/super-admin/auth/login")
      return
    }

    if (isAuthenticated && user?.role === "super_admin") {
      fetchDashboardData()
    }
  }, [isAuthenticated, isLoading, user?.role, router])

  const fetchDashboardData = async () => {
    try {
      const [statsData, healthData, activityData, alertsData] = await Promise.all([
        superAdminApi.getDashboardStats(),
        superAdminApi.getSystemHealth(),
        superAdminApi.getActivityFeed(),
        superAdminApi.getCriticalAlerts(),
      ])
      
      setStats(statsData)
      setSystemHealth(healthData)
      setActivities(activityData)
      setAlerts(alertsData)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return <SuperAdminDashboardSkeleton />
  }

  if (!isAuthenticated || user?.role !== "super_admin") {
    return null
  }

  const globalStats = [
    { 
      title: "Total Users", 
      value: stats?.totalUsers.toLocaleString() || "0", 
      change: stats?.userChange || "+0%", 
      icon: Users, 
      color: "blue" 
    },
    { 
      title: "Active Admins", 
      value: stats?.activeAdmins.toString() || "0", 
      change: stats?.adminChange || "+0", 
      icon: Shield, 
      color: "blue" 
    },
    { 
      title: "Total Surveys", 
      value: stats?.totalSurveys.toLocaleString() || "0", 
      change: stats?.surveyChange || "+0%", 
      icon: ListChecks, 
      color: "green" 
    },
    { 
      title: "Total Revenue", 
      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`, 
      change: stats?.revenueChange || "+0%", 
      icon: CreditCard, 
      color: "orange" 
    },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Rest of JSX using globalStats, systemHealth, activities, alerts */}
    </div>
  )
}
```

---

### 2. Update Users Page

**File:** `app/super-admin/users/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { superAdminApi } from "@/lib/api/super-admin"

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await superAdminApi.getAllUsers()
      setUsers(response.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  // Rest of component...
}
```

---

### 3. Update Admins Page

**File:** `app/super-admin/admins/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { superAdminApi } from "@/lib/api/super-admin"

export default function AdminsPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const data = await superAdminApi.getAdmins()
      setAdmins(data.data || [])
    } catch (error) {
      console.error("Failed to fetch admins:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (email: string, name: string, password: string) => {
    try {
      await superAdminApi.createAdmin({ email, name, password })
      fetchAdmins() // Refresh list
    } catch (error) {
      console.error("Failed to create admin:", error)
    }
  }

  // Rest of component...
}
```

---

### 4. Update Surveys Page

**File:** `app/super-admin/surveys/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { superAdminApi } from "@/lib/api/super-admin"

export default function SuperAdminSurveysPage() {
  const [surveys, setSurveys] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, suspended: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [surveysList, surveyStats] = await Promise.all([
        superAdminApi.getSurveysList(),
        superAdminApi.getSurveyStats(),
      ])
      
      setSurveys(surveysList.data || [])
      setStats(surveyStats.data || { total: 0, active: 0, pending: 0, suspended: 0 })
    } catch (error) {
      console.error("Failed to fetch surveys:", error)
    } finally {
      setLoading(false)
    }
  }

  // Rest of component...
}
```

---

### 5. Update Finance Page

**File:** `app/super-admin/finance/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { superAdminApi } from "@/lib/api/super-admin"

export default function FinancePage() {
  const [metrics, setMetrics] = useState(null)
  const [payouts, setPayouts] = useState([])
  const [reconciliation, setReconciliation] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const [metricsData, payoutsData, reconciliationData] = await Promise.all([
        superAdminApi.getFinancialMetrics(),
        superAdminApi.getPayoutQueue(),
        superAdminApi.getReconciliation(),
      ])
      
      setMetrics(metricsData.data)
      setPayouts(payoutsData.data || [])
      setReconciliation(reconciliationData.data || [])
    } catch (error) {
      console.error("Failed to fetch financial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayout = async (payoutId: string) => {
    try {
      await superAdminApi.approvePayout(payoutId)
      fetchFinancialData() // Refresh data
    } catch (error) {
      console.error("Failed to approve payout:", error)
    }
  }

  // Rest of component...
}
```

---

### 6. Update Reports Page

**File:** `app/super-admin/reports/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { superAdminApi } from "@/lib/api/super-admin"

export default function SuperAdminReportsPage() {
  const [monthlyData, setMonthlyData] = useState([])
  const [userTypeData, setUserTypeData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      const [monthly, distribution, revenue] = await Promise.all([
        superAdminApi.getMonthlyAnalytics(),
        superAdminApi.getUserDistribution(),
        superAdminApi.getRevenueTrends(),
      ])
      
      setMonthlyData(monthly.data || [])
      setUserTypeData(distribution.data || [])
      setRevenueData(revenue.data || [])
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  // Rest of component with charts using real data...
}
```

---

## 📊 Database Queries Reference

### Dashboard Stats Query:
```sql
-- Total users
SELECT COUNT(*) FROM users;

-- Active admins
SELECT COUNT(*) FROM users 
WHERE role IN ('admin', 'super_admin') AND is_active = true;

-- Total surveys
SELECT COUNT(*) FROM surveys;

-- Total revenue
SELECT COALESCE(SUM(amount), 0) FROM earnings 
WHERE status = 'completed';
```

### System Health Query:
```sql
-- Failed transactions rate
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM earnings;
```

### Activity Feed Query:
```sql
SELECT 
  al.id,
  u.name as admin_name,
  al.action,
  al.details,
  al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY al.created_at DESC
LIMIT 10;
```

### Financial Metrics Query:
```sql
-- Total revenue this month
SELECT COALESCE(SUM(amount), 0) FROM earnings 
WHERE status = 'completed' 
AND created_at >= DATE_TRUNC('month', NOW());

-- Pending payouts
SELECT COALESCE(SUM(amount), 0) FROM earnings 
WHERE status = 'pending';
```

### Monthly Analytics Query:
```sql
SELECT 
  TO_CHAR(created_at, 'Mon') as month,
  COUNT(*) as users
FROM users
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
ORDER BY DATE_TRUNC('month', created_at);
```

---

## 🚀 Testing Checklist

- [ ] Backend compiles without errors
- [ ] All new routes are accessible
- [ ] Database queries return correct data
- [ ] Frontend fetches data successfully
- [ ] Loading states display correctly
- [ ] Error handling works properly
- [ ] Charts render with real data
- [ ] Payout approval functionality works
- [ ] Admin creation works
- [ ] User list displays correctly

---

## 🔒 Security Notes

All endpoints are protected by:
1. JWT authentication middleware
2. Super admin role requirement
3. Database queries use parameterized statements (SQL injection safe)

---

## 📝 Summary

**Backend:** ✅ Complete - 3 new controllers, 13 new endpoints  
**Frontend API Client:** ✅ Complete - TypeScript client with types  
**Frontend Integration:** ⏳ Pending - Update 7 pages to use API  

**Estimated Time:** 2-3 hours to update all frontend pages
