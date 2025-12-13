"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SuperAdminDashboardSkeleton } from "@/components/ui/skeleton-loader"
import { useAuth } from "@/providers/auth-provider"
import { superAdminApi } from "@/lib/api/super-admin"
import {
  Users,
  Shield,
  ListChecks,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Settings
} from "lucide-react"

export default function SuperAdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [systemHealth, setSystemHealth] = useState<any[]>([])
  const [adminActivity, setAdminActivity] = useState<any[]>([])
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "super_admin")) {
      router.push("/super-admin/auth/login")
      return
    }
    if (isAuthenticated && user?.role === "super_admin") {
      fetchData()
    }
  }, [isAuthenticated, isLoading, user?.role, router])

  const fetchData = async () => {
    try {
      const [statsData, healthData, activityData, alertsData] = await Promise.all([
        superAdminApi.getDashboardStats(),
        superAdminApi.getSystemHealth(),
        superAdminApi.getActivityFeed(),
        superAdminApi.getCriticalAlerts(),
      ])
      setStats(statsData)
      setSystemHealth(healthData)
      setAdminActivity(activityData)
      setCriticalAlerts(alertsData)
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
    { title: "Total Users", value: stats?.totalUsers?.toLocaleString() || "0", change: stats?.userChange || "+0%", icon: Users, color: "blue" },
    { title: "Active Admins", value: stats?.activeAdmins?.toString() || "0", change: stats?.adminChange || "+0", icon: Shield, color: "blue" },
    { title: "Total Surveys", value: stats?.totalSurveys?.toLocaleString() || "0", change: stats?.surveyChange || "+0%", icon: ListChecks, color: "green" },
    { title: "Total Revenue", value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`, change: stats?.revenueChange || "+0%", icon: CreditCard, color: "orange" },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Super Admin Dashboard</h1>
          <p className="text-slate-600">System-wide oversight and control</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="font-medium text-green-600">All Systems Operational</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {globalStats.map((stat) => (
          <Card key={stat.title} className="rounded-xl bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((health) => (
              <div key={health.metric} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <health.icon className="h-4 w-4 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">{health.metric}</p>
                    <p className="text-sm text-slate-600">{health.value}</p>
                  </div>
                </div>
                <Badge 
                  className={
                    health.status === "healthy" ? "bg-green-100 text-green-700" :
                    health.status === "warning" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }
                >
                  {health.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalAlerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`p-1 rounded-full ${
                  alert.severity === "high" ? "bg-red-100" : 
                  alert.severity === "medium" ? "bg-yellow-100" : "bg-green-100"
                }`}>
                  <AlertTriangle className={`h-3 w-3 ${
                    alert.severity === "high" ? "text-red-600" : 
                    alert.severity === "medium" ? "text-yellow-600" : "text-green-600"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900">{alert.type}</p>
                    <Badge 
                      className={
                        alert.severity === "high" ? "bg-red-100 text-red-700" :
                        alert.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Admin Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className={`p-2 rounded-full ${
                  activity.type === "approval" ? "bg-green-100" :
                  activity.type === "payout" ? "bg-blue-100" :
                  activity.type === "moderation" ? "bg-red-100" :
                  "bg-blue-100"
                }`}>
                  {activity.type === "approval" ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                   activity.type === "payout" ? <CreditCard className="h-4 w-4 text-blue-600" /> :
                   activity.type === "moderation" ? <Shield className="h-4 w-4 text-red-600" /> :
                   <Settings className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{activity.admin}</p>
                  <p className="text-sm text-slate-600">{activity.action}</p>
                </div>
                <p className="text-xs text-slate-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}