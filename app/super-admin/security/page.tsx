"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Shield,
  AlertTriangle,
  Search,
  Eye,
  Lock,
  Activity,
  Server,
  Database,
  Globe,
  Users,
  FileText,
  Key,
  RefreshCw,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  Bug,
  Target,
  Cpu,
  HardDrive
} from "lucide-react"

interface SecurityAlert {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: string
  title: string
  description: string
  timestamp: string
  status: 'new' | 'investigating' | 'resolved' | 'false_positive'
  affectedSystems: string[]
  source: string
  ipAddress?: string
  userId?: string
  details: {
    riskScore: number
    confidence: number
    impact: string
    recommendation: string
  }
}

interface SecurityAudit {
  id: string
  name: string
  type: 'automated' | 'manual' | 'compliance'
  status: 'running' | 'completed' | 'failed' | 'scheduled'
  progress: number
  startedAt: string
  completedAt?: string
  findings: {
    critical: number
    high: number
    medium: number
    low: number
  }
  score: number
}

interface FraudPattern {
  id: string
  name: string
  description: string
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  detectionRate: number
  falsePositiveRate: number
  enabled: boolean
  lastTriggered?: string
  triggerCount: number
}

interface AWSSecurityMetrics {
  iamPolicies: {
    total: number
    compliant: number
    violations: number
  }
  secretsManager: {
    totalSecrets: number
    rotationEnabled: number
    expired: number
  }
  cloudTrail: {
    enabled: boolean
    logIntegrity: boolean
    events24h: number
  }
  guardDuty: {
    enabled: boolean
    findings: number
    threatScore: number
  }
}

export default function SuperAdminSecurityPage() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [audits, setAudits] = useState<SecurityAudit[]>([])
  const [fraudPatterns, setFraudPatterns] = useState<FraudPattern[]>([])
  const [awsMetrics, setAwsMetrics] = useState<AWSSecurityMetrics>({
    iamPolicies: { total: 0, compliant: 0, violations: 0 },
    secretsManager: { totalSecrets: 0, rotationEnabled: 0, expired: 0 },
    cloudTrail: { enabled: false, logIntegrity: false, events24h: 0 },
    guardDuty: { enabled: false, findings: 0, threatScore: 0 }
  })
  
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("alerts")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null)
  const [alertDialog, setAlertDialog] = useState(false)

  useEffect(() => {
    // Simulate loading security data
    const timer = setTimeout(() => {
      setAlerts([
        {
          id: 'alert-001',
          severity: 'critical',
          type: 'Unauthorized Access Attempt',
          title: 'Multiple Failed Super Admin Login Attempts',
          description: 'Detected 15 failed login attempts to super admin panel from suspicious IP addresses',
          timestamp: '2025-08-23 16:45:23',
          status: 'new',
          affectedSystems: ['Authentication Service', 'Super Admin Panel'],
          source: 'AWS CloudWatch',
          ipAddress: '192.168.1.999',
          details: {
            riskScore: 95,
            confidence: 88,
            impact: 'Platform security compromise possible',
            recommendation: 'Immediately block IP range and review access logs'
          }
        },
        {
          id: 'alert-002',
          severity: 'high',
          type: 'Fraud Detection',
          title: 'Suspicious Survey Completion Pattern',
          description: 'AI fraud detection identified potential bot activity with unusually fast survey completions',
          timestamp: '2025-08-23 15:30:15',
          status: 'investigating',
          affectedSystems: ['Survey Platform', 'Payment System'],
          source: 'Fraud Detection Engine',
          userId: 'user-suspicious-001',
          details: {
            riskScore: 78,
            confidence: 92,
            impact: 'Revenue loss due to fraudulent completions',
            recommendation: 'Suspend affected accounts and implement CAPTCHA verification'
          }
        },
        {
          id: 'alert-003',
          severity: 'medium',
          type: 'API Rate Limit Violation',
          title: 'Excessive API Calls Detected',
          description: 'Multiple clients exceeding API rate limits, possible DDoS attempt or bot activity',
          timestamp: '2025-08-23 14:20:45',
          status: 'new',
          affectedSystems: ['API Gateway', 'Rate Limiter'],
          source: 'API Monitoring',
          details: {
            riskScore: 45,
            confidence: 75,
            impact: 'Service degradation for legitimate users',
            recommendation: 'Increase rate limiting strictness and monitor patterns'
          }
        },
        {
          id: 'alert-004',
          severity: 'low',
          type: 'Configuration Change',
          title: 'AWS IAM Policy Modified',
          description: 'IAM policy permissions were modified for payment processing service',
          timestamp: '2025-08-23 13:15:30',
          status: 'resolved',
          affectedSystems: ['AWS IAM', 'Payment Service'],
          source: 'AWS CloudTrail',
          details: {
            riskScore: 25,
            confidence: 95,
            impact: 'Authorized configuration change',
            recommendation: 'Verified as legitimate admin action'
          }
        }
      ])

      setAudits([
        {
          id: 'audit-001',
          name: 'Weekly Security Scan',
          type: 'automated',
          status: 'completed',
          progress: 100,
          startedAt: '2025-08-23 02:00:00',
          completedAt: '2025-08-23 03:45:00',
          findings: { critical: 1, high: 3, medium: 7, low: 12 },
          score: 87
        },
        {
          id: 'audit-002',
          name: 'Compliance Check (SOC 2)',
          type: 'compliance',
          status: 'running',
          progress: 65,
          startedAt: '2025-08-23 08:00:00',
          findings: { critical: 0, high: 1, medium: 2, low: 5 },
          score: 92
        },
        {
          id: 'audit-003',
          name: 'Penetration Test',
          type: 'manual',
          status: 'scheduled',
          progress: 0,
          startedAt: '2025-08-24 18:00:00',
          findings: { critical: 0, high: 0, medium: 0, low: 0 },
          score: 0
        }
      ])

      setFraudPatterns([
        {
          id: 'pattern-001',
          name: 'Rapid Survey Completion',
          description: 'Detects surveys completed in less than 30% of average time',
          riskLevel: 'high',
          detectionRate: 94.2,
          falsePositiveRate: 3.1,
          enabled: true,
          lastTriggered: '2025-08-23 15:30:15',
          triggerCount: 247
        },
        {
          id: 'pattern-002',
          name: 'Multiple Account Creation',
          description: 'Identifies users creating multiple accounts from same device/IP',
          riskLevel: 'medium',
          detectionRate: 89.7,
          falsePositiveRate: 5.8,
          enabled: true,
          lastTriggered: '2025-08-23 12:45:30',
          triggerCount: 156
        },
        {
          id: 'pattern-003',
          name: 'Unusual Payment Patterns',
          description: 'Flags suspicious withdrawal patterns and amounts',
          riskLevel: 'critical',
          detectionRate: 97.8,
          falsePositiveRate: 1.2,
          enabled: true,
          lastTriggered: '2025-08-23 11:20:45',
          triggerCount: 89
        },
        {
          id: 'pattern-004',
          name: 'Geographic Anomaly',
          description: 'Detects login attempts from unusual geographic locations',
          riskLevel: 'medium',
          detectionRate: 76.3,
          falsePositiveRate: 12.4,
          enabled: false,
          lastTriggered: '2025-08-22 16:30:00',
          triggerCount: 342
        }
      ])

      setAwsMetrics({
        iamPolicies: { total: 45, compliant: 42, violations: 3 },
        secretsManager: { totalSecrets: 23, rotationEnabled: 20, expired: 1 },
        cloudTrail: { enabled: true, logIntegrity: true, events24h: 15847 },
        guardDuty: { enabled: true, findings: 7, threatScore: 23 }
      })

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'destructive'
      case 'investigating':
        return 'default'
      case 'resolved':
        return 'outline'
      case 'false_positive':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleAlertAction = (alertId: string, action: 'investigate' | 'resolve' | 'false_positive') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: action === 'investigate' ? 'investigating' : action } : alert
    ))
    setAlertDialog(false)
  }

  const startSecurityAudit = (type: 'automated' | 'manual' | 'compliance') => {
    const newAudit: SecurityAudit = {
      id: `audit-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Security Audit`,
      type,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
      findings: { critical: 0, high: 0, medium: 0, low: 0 },
      score: 0
    }

    setAudits(prev => [newAudit, ...prev])

    // Simulate audit progress
    const interval = setInterval(() => {
      setAudits(prev => prev.map(audit => 
        audit.id === newAudit.id && audit.progress < 100
          ? { ...audit, progress: Math.min(audit.progress + 10, 100) }
          : audit
      ))
    }, 1000)

    setTimeout(() => {
      clearInterval(interval)
      setAudits(prev => prev.map(audit => 
        audit.id === newAudit.id
          ? { 
              ...audit, 
              status: 'completed',
              progress: 100,
              completedAt: new Date().toISOString(),
              findings: { critical: 0, high: 2, medium: 5, low: 8 },
              score: 85
            }
          : audit
      ))
    }, 12000)
  }

  const toggleFraudPattern = (patternId: string) => {
    setFraudPatterns(prev => prev.map(pattern => 
      pattern.id === patternId ? { ...pattern, enabled: !pattern.enabled } : pattern
    ))
  }

  const filteredAlerts = alerts.filter(alert => 
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-slate-900">Security Center</h1>
          <p className="text-slate-600">Monitor security threats, conduct audits, and manage fraud detection</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => startSecurityAudit('automated')}>
            <Search className="h-4 w-4 mr-2" />
            Run Security Scan
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Security Report
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(alert => alert.severity === 'critical' && alert.status === 'new').length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Security Alert:</strong> {alerts.filter(alert => alert.severity === 'critical' && alert.status === 'new').length} critical security issues require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Active Threats</p>
                <p className="text-2xl font-bold text-red-900">
                  {alerts.filter(a => a.status === 'new' && (a.severity === 'critical' || a.severity === 'high')).length}
                </p>
                <p className="text-xs text-red-600">Require attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Security Score</p>
                <p className="text-2xl font-bold text-orange-900">87%</p>
                <p className="text-xs text-orange-600">Overall platform</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">AWS GuardDuty</p>
                <p className="text-2xl font-bold text-blue-900">{awsMetrics.guardDuty.findings}</p>
                <p className="text-xs text-blue-600">Findings 24h</p>
              </div>
              <Server className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Fraud Patterns</p>
                <p className="text-2xl font-bold text-green-900">{fraudPatterns.filter(p => p.enabled).length}</p>
                <p className="text-xs text-green-600">Active detectors</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search security alerts and threats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Security Alerts ({alerts.filter(a => a.status === 'new').length})</TabsTrigger>
          <TabsTrigger value="audits">Security Audits ({audits.length})</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection ({fraudPatterns.filter(p => p.enabled).length})</TabsTrigger>
          <TabsTrigger value="aws">AWS Security</TabsTrigger>
        </TabsList>

        {/* Security Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusColor(alert.status) as any}>
                          {alert.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm text-slate-500">{alert.timestamp}</span>
                      </div>
                      
                      <h3 className="font-semibold text-slate-900 mb-2">{alert.title}</h3>
                      <p className="text-slate-700 mb-3">{alert.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-slate-500">Source & Details</p>
                          <p className="font-medium">{alert.source}</p>
                          {alert.ipAddress && <p className="text-sm">IP: {alert.ipAddress}</p>}
                          {alert.userId && <p className="text-sm">User: {alert.userId}</p>}
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Risk Assessment</p>
                          <p className="text-sm">Risk Score: <span className="font-semibold">{alert.details.riskScore}/100</span></p>
                          <p className="text-sm">Confidence: <span className="font-semibold">{alert.details.confidence}%</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-slate-500">Affected Systems:</span>
                        {alert.affectedSystems.map((system, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(alert)
                          setAlertDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {alert.status === 'new' && (
                        <Button 
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, 'investigate')}
                        >
                          Investigate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Audits Tab */}
        <TabsContent value="audits" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Security Audits</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => startSecurityAudit('automated')}>
                Automated Scan
              </Button>
              <Button variant="outline" onClick={() => startSecurityAudit('compliance')}>
                Compliance Check
              </Button>
              <Button variant="outline" onClick={() => startSecurityAudit('manual')}>
                Manual Audit
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {audits.map((audit) => (
              <Card key={audit.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">{audit.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline">{audit.type}</Badge>
                        <Badge variant={audit.status === 'completed' ? 'default' : audit.status === 'running' ? 'secondary' : 'outline'}>
                          {audit.status}
                        </Badge>
                        <span className="text-sm text-slate-500">Started: {audit.startedAt}</span>
                      </div>
                    </div>
                    {audit.score > 0 && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{audit.score}%</p>
                        <p className="text-sm text-slate-500">Security Score</p>
                      </div>
                    )}
                  </div>

                  {audit.status === 'running' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{audit.progress}%</span>
                      </div>
                      <Progress value={audit.progress} className="w-full" />
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{audit.findings.critical}</p>
                      <p className="text-xs text-slate-500">Critical</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{audit.findings.high}</p>
                      <p className="text-xs text-slate-500">High</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{audit.findings.medium}</p>
                      <p className="text-xs text-slate-500">Medium</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{audit.findings.low}</p>
                      <p className="text-xs text-slate-500">Low</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="space-y-4">
          <div className="space-y-4">
            {fraudPatterns.map((pattern) => (
              <Card key={pattern.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900">{pattern.name}</h4>
                        <Badge variant={getSeverityColor(pattern.riskLevel) as any}>
                          {pattern.riskLevel.toUpperCase()}
                        </Badge>
                        <Badge variant={pattern.enabled ? 'default' : 'secondary'}>
                          {pattern.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      
                      <p className="text-slate-700 mb-4">{pattern.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Detection Rate</p>
                          <p className="font-semibold text-green-600">{pattern.detectionRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">False Positive Rate</p>
                          <p className="font-semibold text-orange-600">{pattern.falsePositiveRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Triggers (30 days)</p>
                          <p className="font-semibold">{pattern.triggerCount}</p>
                        </div>
                      </div>
                      
                      {pattern.lastTriggered && (
                        <p className="text-sm text-slate-500 mt-2">
                          Last triggered: {pattern.lastTriggered}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant={pattern.enabled ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleFraudPattern(pattern.id)}
                      >
                        {pattern.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AWS Security Tab */}
        <TabsContent value="aws" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  IAM Policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Policies</span>
                    <span className="font-semibold">{awsMetrics.iamPolicies.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliant</span>
                    <span className="font-semibold text-green-600">{awsMetrics.iamPolicies.compliant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Violations</span>
                    <span className="font-semibold text-red-600">{awsMetrics.iamPolicies.violations}</span>
                  </div>
                  <Progress value={(awsMetrics.iamPolicies.compliant / awsMetrics.iamPolicies.total) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Secrets Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Secrets</span>
                    <span className="font-semibold">{awsMetrics.secretsManager.totalSecrets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotation Enabled</span>
                    <span className="font-semibold text-green-600">{awsMetrics.secretsManager.rotationEnabled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expired</span>
                    <span className="font-semibold text-red-600">{awsMetrics.secretsManager.expired}</span>
                  </div>
                  <Progress value={(awsMetrics.secretsManager.rotationEnabled / awsMetrics.secretsManager.totalSecrets) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  CloudTrail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant={awsMetrics.cloudTrail.enabled ? 'default' : 'destructive'}>
                      {awsMetrics.cloudTrail.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Log Integrity</span>
                    <Badge variant={awsMetrics.cloudTrail.logIntegrity ? 'default' : 'destructive'}>
                      {awsMetrics.cloudTrail.logIntegrity ? 'Valid' : 'Compromised'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Events (24h)</span>
                    <span className="font-semibold">{awsMetrics.cloudTrail.events24h.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  GuardDuty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant={awsMetrics.guardDuty.enabled ? 'default' : 'destructive'}>
                      {awsMetrics.guardDuty.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Findings</span>
                    <span className="font-semibold text-orange-600">{awsMetrics.guardDuty.findings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Threat Score</span>
                    <span className="font-semibold">{awsMetrics.guardDuty.threatScore}/100</span>
                  </div>
                  <Progress value={awsMetrics.guardDuty.threatScore} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      <Dialog open={alertDialog} onOpenChange={setAlertDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Alert Details</DialogTitle>
            <DialogDescription>
              Review alert information and take appropriate action.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={getSeverityColor(selectedAlert.severity) as any}>
                  {selectedAlert.severity.toUpperCase()}
                </Badge>
                <Badge variant={getStatusColor(selectedAlert.status) as any}>
                  {selectedAlert.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">{selectedAlert.title}</h4>
                <p className="text-slate-700 mb-4">{selectedAlert.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Risk Assessment</p>
                  <p>Risk Score: {selectedAlert.details.riskScore}/100</p>
                  <p>Confidence: {selectedAlert.details.confidence}%</p>
                  <p>Impact: {selectedAlert.details.impact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Source Information</p>
                  <p>Source: {selectedAlert.source}</p>
                  <p>Timestamp: {selectedAlert.timestamp}</p>
                  {selectedAlert.ipAddress && <p>IP: {selectedAlert.ipAddress}</p>}
                  {selectedAlert.userId && <p>User: {selectedAlert.userId}</p>}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Recommendation</p>
                <p className="text-slate-700">{selectedAlert.details.recommendation}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">Affected Systems</p>
                <div className="flex gap-2">
                  {selectedAlert.affectedSystems.map((system, index) => (
                    <Badge key={index} variant="secondary">
                      {system}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertDialog(false)}>
              Close
            </Button>
            {selectedAlert?.status === 'new' && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => selectedAlert && handleAlertAction(selectedAlert.id, 'false_positive')}
                >
                  Mark as False Positive
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => selectedAlert && handleAlertAction(selectedAlert.id, 'investigate')}
                >
                  Start Investigation
                </Button>
                <Button 
                  onClick={() => selectedAlert && handleAlertAction(selectedAlert.id, 'resolve')}
                >
                  Mark as Resolved
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
