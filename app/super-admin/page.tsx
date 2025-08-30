"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Shield, 
  ListChecks, 
  CreditCard, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Server
} from "lucide-react"

export default function SuperAdminDashboard() {
  const globalStats = [
    { title: "Total Users", value: "12,847", change: "+18%", icon: Users, color: "blue" },
    { title: "Active Admins", value: "8", change: "+1", icon: Shield, color: "purple" },
    { title: "Total Surveys", value: "3,456", change: "+24%", icon: ListChecks, color: "green" },
    { title: "Total Revenue", value: "₦24.8M", change: "+32%", icon: CreditCard, color: "orange" },
  ]

  const systemHealth = [
    { metric: "API Uptime", value: "99.9%", status: "healthy", icon: Server },
    { metric: "Database", value: "Optimal", status: "healthy", icon: Activity },
    { metric: "Payment Gateway", value: "Active", status: "healthy", icon: CreditCard },
    { metric: "Failed Transactions", value: "0.2%", status: "warning", icon: AlertTriangle },
  ]

  const adminActivity = [
    { admin: "John Admin", action: "Approved survey #1234", time: "2 min ago", type: "approval" },
    { admin: "Jane Admin", action: "Processed payout ₦45,200", time: "8 min ago", type: "payout" },
    { admin: "Mike Admin", action: "Suspended user account", time: "15 min ago", type: "moderation" },
    { admin: "Sarah Admin", action: "Updated platform settings", time: "32 min ago", type: "config" },
  ]

  const criticalAlerts = [
    { type: "Security", message: "Multiple failed login attempts detected", severity: "high", time: "5 min ago" },
    { type: "Finance", message: "Large payout request pending review", severity: "medium", time: "12 min ago" },
    { type: "System", message: "Database backup completed successfully", severity: "low", time: "1 hour ago" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Super Admin Dashboard</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalStats.map((stat) => (
          <Card key={stat.title} className="rounded-xl bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  "bg-purple-100"
                }`}>
                  {activity.type === "approval" ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                   activity.type === "payout" ? <CreditCard className="h-4 w-4 text-blue-600" /> :
                   activity.type === "moderation" ? <Shield className="h-4 w-4 text-red-600" /> :
                   <Settings className="h-4 w-4 text-purple-600" />}
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