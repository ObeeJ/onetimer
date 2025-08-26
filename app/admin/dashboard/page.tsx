"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  UserCheck,
  CreditCard,
  BarChart3,
  Activity,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  pendingKyc: number
  totalSurveys: number
  pendingSurveys: number
  liveSurveys: number
  pendingWithdrawals: number
  totalRevenue: number
  monthlyRevenue: number
}

interface PendingTask {
  id: string
  type: 'kyc' | 'survey' | 'withdrawal'
  title: string
  user: string
  amount?: number
  priority: 'high' | 'medium' | 'low'
  createdAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingKyc: 0,
    totalSurveys: 0,
    pendingSurveys: 0,
    liveSurveys: 0,
    pendingWithdrawals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  })
  
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([])
  const [loading, setLoading] = useState(true)
  const [adminInfo, setAdminInfo] = useState<any>(null)

  useEffect(() => {
    // Load admin session
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth) {
      setAdminInfo(JSON.parse(adminAuth))
    }

    // Simulate API calls to load dashboard data
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 12847,
        activeUsers: 8923,
        pendingKyc: 47,
        totalSurveys: 1856,
        pendingSurveys: 23,
        liveSurveys: 156,
        pendingWithdrawals: 18,
        totalRevenue: 2847500,
        monthlyRevenue: 485200
      })

      setPendingTasks([
        {
          id: 'kyc-001',
          type: 'kyc',
          title: 'KYC Verification Required',
          user: 'John Doe',
          priority: 'high',
          createdAt: '2 hours ago'
        },
        {
          id: 'survey-001',
          type: 'survey',
          title: 'Market Research Survey - Tech Industry',
          user: 'TechCorp Ltd',
          priority: 'medium',
          createdAt: '4 hours ago'
        },
        {
          id: 'withdrawal-001',
          type: 'withdrawal',
          title: 'Withdrawal Request',
          user: 'Jane Smith',
          amount: 15000,
          priority: 'high',
          createdAt: '1 hour ago'
        }
      ])

      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'kyc':
        return <UserCheck className="h-4 w-4" />
      case 'survey':
        return <FileText className="h-4 w-4" />
      case 'withdrawal':
        return <CreditCard className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">
            Welcome back, {adminInfo?.email || 'Administrator'}. Here's what needs your attention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-blue-600">{stats.activeUsers.toLocaleString()} active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Surveys</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalSurveys.toLocaleString()}</p>
                <p className="text-xs text-green-600">{stats.liveSurveys} live</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Revenue (Total)</p>
                <p className="text-2xl font-bold text-purple-900">₦{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-purple-600">₦{(stats.monthlyRevenue / 1000).toFixed(0)}K this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-red-900">{pendingTasks.length}</p>
                <p className="text-xs text-red-600">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        {getTaskIcon(task.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{task.title}</h4>
                        <p className="text-sm text-slate-600">
                          {task.user} • {task.createdAt}
                          {task.amount && ` • ₦${task.amount.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getPriorityColor(task.priority) as any}>
                        {task.priority}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/surveys">
                    <FileText className="h-4 w-4 mr-2" />
                    Review Surveys
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/payments">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payments
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}