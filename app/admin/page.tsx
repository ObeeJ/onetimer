"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  ListChecks, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye
} from "lucide-react"

export default function AdminDashboard() {
  const stats = [
    { title: "Total Users", value: "2,847", change: "+12%", icon: Users, color: "blue" },
    { title: "Active Surveys", value: "156", change: "+8%", icon: ListChecks, color: "green" },
    { title: "Pending Payouts", value: "₦847,200", change: "-3%", icon: CreditCard, color: "orange" },
    { title: "Revenue (30d)", value: "₦2.4M", change: "+24%", icon: TrendingUp, color: "blue" },
  ]

  const pendingTasks = [
    { type: "KYC Approval", count: 23, priority: "high", icon: Users },
    { type: "Survey Review", count: 8, priority: "medium", icon: ListChecks },
    { type: "Withdrawal Requests", count: 15, priority: "high", icon: CreditCard },
    { type: "User Reports", count: 4, priority: "low", icon: AlertTriangle },
  ]

  const recentActivity = [
    { action: "New user registered", user: "John Doe", time: "2 min ago", status: "success" },
    { action: "Survey submitted for review", user: "TechCorp Ltd", time: "5 min ago", status: "pending" },
    { action: "Payout processed", user: "Jane Smith", time: "12 min ago", status: "success" },
    { action: "KYC document uploaded", user: "Mike Johnson", time: "18 min ago", status: "pending" },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Monitor and manage your survey platform</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Last updated</p>
          <p className="font-medium">{new Date().toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <task.icon className="h-4 w-4 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">{task.type}</p>
                    <p className="text-sm text-slate-600">{task.count} items pending</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={
                      task.priority === "high" ? "bg-red-100 text-red-700" :
                      task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }
                  >
                    {task.priority}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`p-1 rounded-full ${
                  activity.status === "success" ? "bg-green-100" : "bg-yellow-100"
                }`}>
                  {activity.status === "success" ? 
                    <CheckCircle className="h-3 w-3 text-green-600" /> :
                    <Clock className="h-3 w-3 text-yellow-600" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-600">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}