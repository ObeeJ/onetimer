"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  FileText,
  Download,
  Calendar,
  Eye,
  Server,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Award,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw
} from "lucide-react"

interface ReportMetrics {
  users: {
    total: number
    newThisMonth: number
    activeUsers: number
    retentionRate: number
    growth: number
  }
  surveys: {
    total: number
    published: number
    completed: number
    avgCompletionRate: number
    responseRate: number
  }
  revenue: {
    totalEarnings: number
    totalPayouts: number
    netRevenue: number
    avgRevenuePerUser: number
    monthlyGrowth: number
  }
  performance: {
    avgResponseTime: number
    uptime: number
    errorRate: number
    activeConnections: number
  }
}

interface UsageAnalytics {
  dailyActiveUsers: { date: string; count: number }[]
  surveyCompletions: { date: string; count: number }[]
  revenueFlow: { date: string; earnings: number; payouts: number }[]
  deviceStats: { device: string; percentage: number; count: number }[]
  locationStats: { state: string; users: number; percentage: number }[]
}

interface CloudWatchLog {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
  source: string
  userId?: string
  metadata?: any
}

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<ReportMetrics>({
    users: { total: 0, newThisMonth: 0, activeUsers: 0, retentionRate: 0, growth: 0 },
    surveys: { total: 0, published: 0, completed: 0, avgCompletionRate: 0, responseRate: 0 },
    revenue: { totalEarnings: 0, totalPayouts: 0, netRevenue: 0, avgRevenuePerUser: 0, monthlyGrowth: 0 },
    performance: { avgResponseTime: 0, uptime: 0, errorRate: 0, activeConnections: 0 }
  })
  const [analytics, setAnalytics] = useState<UsageAnalytics>({
    dailyActiveUsers: [],
    surveyCompletions: [],
    revenueFlow: [],
    deviceStats: [],
    locationStats: []
  })
  const [logs, setLogs] = useState<CloudWatchLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [dateRange, setDateRange] = useState("30d")

  useEffect(() => {
    // Simulate CloudWatch and analytics data loading
    const timer = setTimeout(() => {
      setMetrics({
        users: {
          total: 12847,
          newThisMonth: 2341,
          activeUsers: 8520,
          retentionRate: 76.3,
          growth: 18.5
        },
        surveys: {
          total: 1856,
          published: 1623,
          completed: 43201,
          avgCompletionRate: 84.2,
          responseRate: 91.7
        },
        revenue: {
          totalEarnings: 8420000,
          totalPayouts: 6230000,
          netRevenue: 2190000,
          avgRevenuePerUser: 655,
          monthlyGrowth: 23.8
        },
        performance: {
          avgResponseTime: 245,
          uptime: 99.8,
          errorRate: 0.12,
          activeConnections: 1247
        }
      })

      setAnalytics({
        dailyActiveUsers: [
          { date: '2025-01-15', count: 1200 },
          { date: '2025-01-16', count: 1350 },
          { date: '2025-01-17', count: 1180 },
          { date: '2025-01-18', count: 1420 },
          { date: '2025-01-19', count: 1650 },
          { date: '2025-01-20', count: 1380 },
          { date: '2025-01-21', count: 1520 },
          { date: '2025-01-22', count: 1680 }
        ],
        surveyCompletions: [
          { date: '2025-01-15', count: 450 },
          { date: '2025-01-16', count: 520 },
          { date: '2025-01-17', count: 380 },
          { date: '2025-01-18', count: 640 },
          { date: '2025-01-19', count: 720 },
          { date: '2025-01-20', count: 580 },
          { date: '2025-01-21', count: 690 },
          { date: '2025-01-22', count: 760 }
        ],
        revenueFlow: [
          { date: '2025-01-15', earnings: 280000, payouts: 190000 },
          { date: '2025-01-16', earnings: 320000, payouts: 220000 },
          { date: '2025-01-17', earnings: 240000, payouts: 180000 },
          { date: '2025-01-18', earnings: 380000, payouts: 290000 },
          { date: '2025-01-19', earnings: 420000, payouts: 310000 },
          { date: '2025-01-20', earnings: 350000, payouts: 250000 },
          { date: '2025-01-21', earnings: 410000, payouts: 320000 },
          { date: '2025-01-22', earnings: 460000, payouts: 340000 }
        ],
        deviceStats: [
          { device: 'Mobile', percentage: 68.5, count: 8800 },
          { device: 'Desktop', percentage: 24.2, count: 3100 },
          { device: 'Tablet', percentage: 7.3, count: 940 }
        ],
        locationStats: [
          { state: 'Lagos', users: 4250, percentage: 33.1 },
          { state: 'Abuja', users: 2180, percentage: 17.0 },
          { state: 'Kano', users: 1520, percentage: 11.8 },
          { state: 'Oyo', users: 1340, percentage: 10.4 },
          { state: 'Rivers', users: 980, percentage: 7.6 },
          { state: 'Kaduna', users: 820, percentage: 6.4 },
          { state: 'Others', users: 1757, percentage: 13.7 }
        ]
      })

      setLogs([
        {
          timestamp: '2025-01-22 16:45:23',
          level: 'INFO',
          message: 'User authentication successful',
          source: 'auth-service',
          userId: 'user-001',
          metadata: { ip: '192.168.1.100', userAgent: 'Chrome' }
        },
        {
          timestamp: '2025-01-22 16:44:18',
          level: 'WARN',
          message: 'High survey completion rate detected - possible bot activity',
          source: 'survey-service',
          userId: 'user-045',
          metadata: { completionTime: '15s', avgTime: '240s' }
        },
        {
          timestamp: '2025-01-22 16:43:52',
          level: 'ERROR',
          message: 'Payment processing failed - invalid account details',
          source: 'payment-service',
          userId: 'user-089',
          metadata: { amount: 25000, errorCode: 'INVALID_ACCOUNT' }
        },
        {
          timestamp: '2025-01-22 16:42:30',
          level: 'INFO',
          message: 'New survey published and approved',
          source: 'survey-service',
          metadata: { surveyId: 'survey-456', creatorId: 'creator-123' }
        },
        {
          timestamp: '2025-01-22 16:41:15',
          level: 'DEBUG',
          message: 'Database connection pool optimized',
          source: 'database-service',
          metadata: { activeConnections: 45, maxConnections: 100 }
        }
      ])

      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [dateRange])

  const exportReport = (type: string) => {
    // Simulate report export
    console.log(`Exporting ${type} report for ${dateRange}`)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'destructive'
      case 'WARN':
        return 'default'
      case 'INFO':
        return 'secondary'
      case 'DEBUG':
        return 'outline'
      default:
        return 'secondary'
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
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-600">Comprehensive insights powered by CloudWatch integration</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync CloudWatch
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport('full')}>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">CloudWatch Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">{metrics.users.total.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+{metrics.users.growth}% this month</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-900">₦{(metrics.revenue.netRevenue / 1000000).toFixed(1)}M</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+{metrics.revenue.monthlyGrowth}% this month</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Survey Completions</p>
                    <p className="text-2xl font-bold text-purple-900">{metrics.surveys.completed.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Target className="h-3 w-3 text-purple-600" />
                      <span className="text-xs text-purple-600">{metrics.surveys.avgCompletionRate}% avg rate</span>
                    </div>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">System Uptime</p>
                    <p className="text-2xl font-bold text-orange-900">{metrics.performance.uptime}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">{metrics.performance.avgResponseTime}ms avg</span>
                    </div>
                  </div>
                  <Server className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <div className="text-center text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                    <p>Chart visualization would render here</p>
                    <p className="text-sm">Latest: {analytics.dailyActiveUsers[analytics.dailyActiveUsers.length - 1]?.count.toLocaleString()} users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <div className="text-center text-slate-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                    <p>Revenue chart would render here</p>
                    <p className="text-sm">Today: ₦{analytics.revenueFlow[analytics.revenueFlow.length - 1]?.earnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Analytics Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Users</span>
                    <span className="font-semibold">{metrics.users.activeUsers.toLocaleString()}</span>
                  </div>
                  <Progress value={metrics.users.retentionRate} className="w-full" />
                  <p className="text-sm text-slate-600">{metrics.users.retentionRate}% retention rate</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.deviceStats.map((device) => (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                        {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                        {device.device === 'Tablet' && <Monitor className="h-4 w-4" />}
                        <span>{device.device}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{device.percentage}%</p>
                        <p className="text-xs text-slate-500">{device.count.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.locationStats.slice(0, 5).map((location) => (
                    <div key={location.state} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{location.state}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{location.percentage}%</p>
                        <p className="text-xs text-slate-500">{location.users.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Reports Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Earnings</span>
                    <span className="font-semibold">₦{(metrics.revenue.totalEarnings / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Payouts</span>
                    <span className="font-semibold">₦{(metrics.revenue.totalPayouts / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Net Revenue</span>
                    <span className="font-bold text-green-600">₦{(metrics.revenue.netRevenue / 1000000).toFixed(1)}M</span>
                  </div>
                  <Progress value={(metrics.revenue.netRevenue / metrics.revenue.totalEarnings) * 100} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Revenue Per User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">₦{metrics.revenue.avgRevenuePerUser}</p>
                  <p className="text-sm text-slate-600 mt-2">Per active user</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+{metrics.revenue.monthlyGrowth}% this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => exportReport('revenue')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Revenue Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => exportReport('transactions')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Transaction History
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => exportReport('tax')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tax Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Response Time</p>
                    <p className="text-2xl font-bold">{metrics.performance.avgResponseTime}ms</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Uptime</p>
                    <p className="text-2xl font-bold">{metrics.performance.uptime}%</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Error Rate</p>
                    <p className="text-2xl font-bold">{metrics.performance.errorRate}%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Connections</p>
                    <p className="text-2xl font-bold">{metrics.performance.activeConnections}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CloudWatch Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                CloudWatch Application Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={getLevelColor(log.level) as any}>
                            {log.level}
                          </Badge>
                          <span className="text-sm text-slate-500">{log.timestamp}</span>
                          <span className="text-sm font-medium text-slate-700">{log.source}</span>
                        </div>
                        <p className="text-slate-900 mb-2">{log.message}</p>
                        {log.userId && (
                          <p className="text-sm text-slate-600">User: {log.userId}</p>
                        )}
                        {log.metadata && (
                          <div className="mt-2 p-2 bg-slate-100 rounded text-xs">
                            <code>{JSON.stringify(log.metadata, null, 2)}</code>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
