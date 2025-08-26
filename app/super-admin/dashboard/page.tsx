"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  DollarSign,
  Server,
  Activity,
  Lock,
  Eye,
  Settings,
  BarChart3,
  Globe,
  Zap,
  Clock,
  Database,
  Cpu,
  HardDrive,
  Network,
  RefreshCw
} from "lucide-react"

interface PlatformMetrics {
  health: {
    overall: number
    api: number
    database: number
    payments: number
    security: number
  }
  security: {
    activeThreats: number
    blockedAttempts: number
    suspiciousActivity: number
    lastSecurityScan: string
  }
  financial: {
    totalRevenue: number
    monthlyRevenue: number
    totalPayouts: number
    pendingPayouts: number
    revenueGrowth: number
    profitMargin: number
  }
  infrastructure: {
    cpuUsage: number
    memoryUsage: number
    storageUsage: number
    bandwidth: number
    uptime: number
    responseTime: number
  }
  platform: {
    totalUsers: number
    activeUsers: number
    totalAdmins: number
    totalSurveys: number
    completionRate: number
    systemLoad: number
  }
}

interface SecurityAlert {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: string
  message: string
  timestamp: string
  status: 'new' | 'investigating' | 'resolved'
  affectedSystems: string[]
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    health: { overall: 0, api: 0, database: 0, payments: 0, security: 0 },
    security: { activeThreats: 0, blockedAttempts: 0, suspiciousActivity: 0, lastSecurityScan: '' },
    financial: { totalRevenue: 0, monthlyRevenue: 0, totalPayouts: 0, pendingPayouts: 0, revenueGrowth: 0, profitMargin: 0 },
    infrastructure: { cpuUsage: 0, memoryUsage: 0, storageUsage: 0, bandwidth: 0, uptime: 0, responseTime: 0 },
    platform: { totalUsers: 0, activeUsers: 0, totalAdmins: 0, totalSurveys: 0, completionRate: 0, systemLoad: 0 }
  })
  
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading comprehensive platform data
    const timer = setTimeout(() => {
      setMetrics({
        health: {
          overall: 98.5,
          api: 99.2,
          database: 97.8,
          payments: 99.1,
          security: 98.9
        },
        security: {
          activeThreats: 0,
          blockedAttempts: 1247,
          suspiciousActivity: 3,
          lastSecurityScan: '2025-08-23 14:30:00'
        },
        financial: {
          totalRevenue: 45600000, // ₦45.6M
          monthlyRevenue: 8420000, // ₦8.42M
          totalPayouts: 32100000, // ₦32.1M
          pendingPayouts: 890000, // ₦890K
          revenueGrowth: 23.8,
          profitMargin: 29.6
        },
        infrastructure: {
          cpuUsage: 34.2,
          memoryUsage: 67.8,
          storageUsage: 45.3,
          bandwidth: 23.7,
          uptime: 99.94,
          responseTime: 180
        },
        platform: {
          totalUsers: 18750,
          activeUsers: 12890,
          totalAdmins: 8,
          totalSurveys: 2134,
          completionRate: 84.7,
          systemLoad: 32.1
        }
      })

      setSecurityAlerts([
        {
          id: 'alert-001',
          severity: 'medium',
          type: 'Suspicious Login Pattern',
          message: 'Multiple failed login attempts detected from IP range 192.168.1.0/24',
          timestamp: '2025-08-23 15:45:23',
          status: 'investigating',
          affectedSystems: ['Authentication Service', 'User Management']
        },
        {
          id: 'alert-002',
          severity: 'low',
          type: 'Rate Limit Exceeded',
          message: 'API rate limits exceeded for survey completion endpoints',
          timestamp: '2025-08-23 14:12:45',
          status: 'new',
          affectedSystems: ['Survey API']
        },
        {
          id: 'alert-003',
          severity: 'high',
          type: 'Unusual Payment Activity',
          message: 'Potential fraud detected in withdrawal requests - pattern analysis flagged 5 accounts',
          timestamp: '2025-08-23 13:28:17',
          status: 'new',
          affectedSystems: ['Payment Processing', 'Fraud Detection']
        }
      ])

      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
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

  const getHealthColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600'
    if (percentage >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-96"></div>
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
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Super Admin Dashboard
          </h1>
          <p className="text-slate-600">Platform-wide control and monitoring center</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-green-500 text-green-700">
            System Status: Operational
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Platform Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Overall Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.health.overall)}`}>
                  {metrics.health.overall}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={metrics.health.overall} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">API Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.health.api)}`}>
                  {metrics.health.api}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={metrics.health.api} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Database</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.health.database)}`}>
                  {metrics.health.database}%
                </p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={metrics.health.database} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Payments</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.health.payments)}`}>
                  {metrics.health.payments}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={metrics.health.payments} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Security</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.health.security)}`}>
                  {metrics.health.security}%
                </p>
              </div>
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <Progress value={metrics.health.security} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {securityAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Alert:</strong> {securityAlerts.filter(alert => alert.severity === 'high').length} high-priority security issues require immediate attention.
            <Link href="/super-admin/security" className="ml-2 underline font-medium">
              View Details →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Revenue</span>
              <span className="font-bold text-lg">₦{(metrics.financial.totalRevenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Monthly Revenue</span>
              <span className="font-semibold">₦{(metrics.financial.monthlyRevenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Pending Payouts</span>
              <span className="font-semibold text-orange-600">₦{(metrics.financial.pendingPayouts / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Profit Margin</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-600">{metrics.financial.profitMargin}%</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/super-admin/financial">View Financial Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Platform Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Platform Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Users</span>
              <span className="font-bold text-lg">{metrics.platform.totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Active Users</span>
              <span className="font-semibold">{metrics.platform.activeUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Surveys</span>
              <span className="font-semibold">{metrics.platform.totalSurveys.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Completion Rate</span>
              <span className="font-semibold text-green-600">{metrics.platform.completionRate}%</span>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/super-admin/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Infrastructure Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Infrastructure Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">CPU Usage</span>
                <span className="font-semibold">{metrics.infrastructure.cpuUsage}%</span>
              </div>
              <Progress value={metrics.infrastructure.cpuUsage} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Memory Usage</span>
                <span className="font-semibold">{metrics.infrastructure.memoryUsage}%</span>
              </div>
              <Progress value={metrics.infrastructure.memoryUsage} className="h-2" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Uptime</span>
              <span className="font-semibold text-green-600">{metrics.infrastructure.uptime}%</span>
            </div>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/super-admin/infrastructure">View Infrastructure</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Security Alerts
            </div>
            <Badge variant="outline">
              {securityAlerts.filter(alert => alert.status === 'new').length} New
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{alert.type}</span>
                      <span className="text-sm text-slate-500">{alert.timestamp}</span>
                    </div>
                    <p className="text-slate-700 mb-2">{alert.message}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Affected:</span>
                      {alert.affectedSystems.map((system, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/super-admin/security">
                View All Security Alerts ({securityAlerts.length})
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/super-admin/admins">
            <Users className="h-6 w-6 mb-2" />
            Manage Admins
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/super-admin/settings">
            <Settings className="h-6 w-6 mb-2" />
            Platform Settings
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/super-admin/security">
            <Lock className="h-6 w-6 mb-2" />
            Security Center
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/super-admin/reports">
            <BarChart3 className="h-6 w-6 mb-2" />
            Advanced Reports
          </Link>
        </Button>
      </div>
    </div>
  )
}
