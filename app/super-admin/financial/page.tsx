"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  CreditCard,
  Server,
  Database,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Banknote,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Cpu,
  HardDrive,
  Network
} from "lucide-react"

interface FinancialMetrics {
  revenue: {
    total: number
    monthly: number
    daily: number
    growth: number
    projectedYearly: number
  }
  payouts: {
    total: number
    pending: number
    processed: number
    failed: number
    totalAmount: number
  }
  transactions: {
    successful: number
    failed: number
    volume: number
    averageAmount: number
  }
  fees: {
    platform: number
    paystack: number
    withdrawal: number
    total: number
  }
}

interface PaystackTransaction {
  id: string
  reference: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'pending'
  customer: {
    email: string
    id: string
  }
  channel: string
  gateway_response: string
  paid_at?: string
  created_at: string
  fees: number
  authorization: {
    brand: string
    last4: string
    bank: string
  }
}

interface AWSCostMetrics {
  total: number
  services: {
    name: string
    cost: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }[]
  recommendations: {
    id: string
    service: string
    recommendation: string
    potentialSavings: number
    effort: 'low' | 'medium' | 'high'
  }[]
  forecast: {
    nextMonth: number
    confidence: number
  }
}

export default function SuperAdminFinancialPage() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    revenue: { total: 0, monthly: 0, daily: 0, growth: 0, projectedYearly: 0 },
    payouts: { total: 0, pending: 0, processed: 0, failed: 0, totalAmount: 0 },
    transactions: { successful: 0, failed: 0, volume: 0, averageAmount: 0 },
    fees: { platform: 0, paystack: 0, withdrawal: 0, total: 0 }
  })
  
  const [transactions, setTransactions] = useState<PaystackTransaction[]>([])
  const [awsCosts, setAwsCosts] = useState<AWSCostMetrics>({
    total: 0,
    services: [],
    recommendations: [],
    forecast: { nextMonth: 0, confidence: 0 }
  })
  
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [dateRange, setDateRange] = useState("30d")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulate loading financial data
    const timer = setTimeout(() => {
      setMetrics({
        revenue: {
          total: 45600000, // ₦45.6M
          monthly: 8420000, // ₦8.42M
          daily: 275000, // ₦275K
          growth: 23.8,
          projectedYearly: 102000000 // ₦102M
        },
        payouts: {
          total: 1847,
          pending: 45,
          processed: 1785,
          failed: 17,
          totalAmount: 32100000 // ₦32.1M
        },
        transactions: {
          successful: 15847,
          failed: 234,
          volume: 16081,
          averageAmount: 2850
        },
        fees: {
          platform: 6840000, // ₦6.84M (15%)
          paystack: 684000, // ₦684K (1.5%)
          withdrawal: 642000, // ₦642K (2%)
          total: 8166000 // ₦8.166M
        }
      })

      setTransactions([
        {
          id: 'txn-001',
          reference: 'REF_123456789',
          amount: 25000,
          currency: 'NGN',
          status: 'success',
          customer: { email: 'user@example.com', id: 'cust-001' },
          channel: 'card',
          gateway_response: 'Successful',
          paid_at: '2025-08-23T14:30:00Z',
          created_at: '2025-08-23T14:29:45Z',
          fees: 375,
          authorization: { brand: 'visa', last4: '1234', bank: 'First Bank' }
        },
        {
          id: 'txn-002',
          reference: 'REF_987654321',
          amount: 15000,
          currency: 'NGN',
          status: 'failed',
          customer: { email: 'another@example.com', id: 'cust-002' },
          channel: 'bank',
          gateway_response: 'Insufficient funds',
          created_at: '2025-08-23T13:15:30Z',
          fees: 0,
          authorization: { brand: 'mastercard', last4: '5678', bank: 'GTBank' }
        },
        {
          id: 'txn-003',
          reference: 'REF_555777999',
          amount: 50000,
          currency: 'NGN',
          status: 'pending',
          customer: { email: 'pending@example.com', id: 'cust-003' },
          channel: 'ussd',
          gateway_response: 'Pending confirmation',
          created_at: '2025-08-23T15:20:15Z',
          fees: 750,
          authorization: { brand: 'verve', last4: '9012', bank: 'Access Bank' }
        }
      ])

      setAwsCosts({
        total: 2850.75, // $2,850.75
        services: [
          { name: 'Amazon EC2', cost: 1280.50, percentage: 44.9, trend: 'up' },
          { name: 'Amazon RDS', cost: 485.25, percentage: 17.0, trend: 'stable' },
          { name: 'Amazon S3', cost: 325.80, percentage: 11.4, trend: 'down' },
          { name: 'AWS Lambda', cost: 215.45, percentage: 7.6, trend: 'up' },
          { name: 'Amazon CloudFront', cost: 184.20, percentage: 6.5, trend: 'stable' },
          { name: 'Amazon SES', cost: 125.30, percentage: 4.4, trend: 'up' },
          { name: 'AWS CloudWatch', cost: 95.75, percentage: 3.4, trend: 'stable' },
          { name: 'Other Services', cost: 138.50, percentage: 4.8, trend: 'stable' }
        ],
        recommendations: [
          {
            id: 'rec-001',
            service: 'Amazon EC2',
            recommendation: 'Right-size underutilized instances to save 30% on compute costs',
            potentialSavings: 384.15,
            effort: 'medium'
          },
          {
            id: 'rec-002',
            service: 'Amazon RDS',
            recommendation: 'Enable automated backups and use reserved instances',
            potentialSavings: 145.58,
            effort: 'low'
          },
          {
            id: 'rec-003',
            service: 'Amazon S3',
            recommendation: 'Implement lifecycle policies for infrequently accessed data',
            potentialSavings: 97.74,
            effort: 'low'
          },
          {
            id: 'rec-004',
            service: 'AWS Lambda',
            recommendation: 'Optimize memory allocation and execution time',
            potentialSavings: 64.64,
            effort: 'high'
          }
        ],
        forecast: {
          nextMonth: 3125.80,
          confidence: 85
        }
      })

      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [dateRange])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-slate-500" />
    }
  }

  const exportFinancialReport = (type: string) => {
    // Simulate report export
    console.log(`Exporting ${type} report for ${dateRange}`)
    alert(`${type} report exported successfully!`)
  }

  const syncPaystackData = async () => {
    // Simulate Paystack data sync
    alert('Syncing with Paystack...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('Paystack data synchronized successfully!')
  }

  const refreshAWSCosts = async () => {
    // Simulate AWS Cost Explorer refresh
    alert('Refreshing AWS cost data...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    alert('AWS cost data updated successfully!')
  }

  const filteredTransactions = transactions.filter(transaction => 
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.gateway_response.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-slate-900">Financial Overview</h1>
          <p className="text-slate-600">Comprehensive revenue tracking and cost analysis</p>
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
          <Button variant="outline" size="sm" onClick={syncPaystackData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Paystack
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportFinancialReport('Comprehensive')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">₦{(metrics.revenue.total / 1000000).toFixed(1)}M</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+{metrics.revenue.growth}% this month</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-blue-900">₦{(metrics.revenue.monthly / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-blue-600">Daily avg: ₦{(metrics.revenue.daily / 1000).toFixed(0)}K</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Payouts</p>
                <p className="text-2xl font-bold text-purple-900">₦{(metrics.payouts.totalAmount / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-purple-600">{metrics.payouts.pending} pending</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Platform Fees</p>
                <p className="text-2xl font-bold text-orange-900">₦{(metrics.fees.total / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-orange-600">Net profit margin</p>
              </div>
              <Banknote className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="transactions">Paystack Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="aws-costs">AWS Costs</TabsTrigger>
        </TabsList>

        {/* Financial Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Platform Revenue</span>
                  <span className="font-semibold">₦{(metrics.revenue.total / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">User Payouts</span>
                  <span className="font-semibold text-red-600">-₦{(metrics.payouts.totalAmount / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Platform Fees</span>
                  <span className="font-semibold text-green-600">₦{(metrics.fees.platform / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Payment Gateway Fees</span>
                  <span className="font-semibold text-red-600">-₦{(metrics.fees.paystack / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-medium">Net Profit</span>
                  <span className="font-bold text-green-600">₦{((metrics.fees.total - metrics.fees.paystack) / 1000000).toFixed(1)}M</span>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Transaction Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Transactions</span>
                  <span className="font-semibold">{metrics.transactions.volume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Successful</span>
                  <span className="font-semibold text-green-600">{metrics.transactions.successful.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Failed</span>
                  <span className="font-semibold text-red-600">{metrics.transactions.failed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Success Rate</span>
                  <span className="font-semibold">{((metrics.transactions.successful / metrics.transactions.volume) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Average Amount</span>
                  <span className="font-semibold">₦{metrics.transactions.averageAmount.toLocaleString()}</span>
                </div>
                <Progress value={(metrics.transactions.successful / metrics.transactions.volume) * 100} className="w-full" />
              </CardContent>
            </Card>

            {/* Payout Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payout Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{metrics.payouts.pending}</p>
                    <p className="text-xs text-slate-500">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{metrics.payouts.processed}</p>
                    <p className="text-xs text-slate-500">Processed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{metrics.payouts.failed}</p>
                    <p className="text-xs text-slate-500">Failed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{metrics.payouts.total}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  View Payout Details
                </Button>
              </CardContent>
            </Card>

            {/* Financial Projections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Projections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Projected Yearly Revenue</span>
                  <span className="font-bold text-green-600">₦{(metrics.revenue.projectedYearly / 1000000).toFixed(0)}M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Growth Rate</span>
                  <span className="font-semibold text-blue-600">{metrics.revenue.growth}% monthly</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Revenue Target</span>
                  <span className="font-semibold">₦120M yearly</span>
                </div>
                <Progress value={(metrics.revenue.projectedYearly / 120000000) * 100} className="w-full" />
                <p className="text-xs text-slate-500 text-center">
                  {((metrics.revenue.projectedYearly / 120000000) * 100).toFixed(1)}% of yearly target
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Paystack Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => exportFinancialReport('Transactions')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-semibold text-slate-900">{transaction.reference}</span>
                        <Badge variant={getStatusColor(transaction.status) as any}>
                          {transaction.status}
                        </Badge>
                        <Badge variant="outline">{transaction.channel}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-500">Amount & Fees</p>
                          <p className="font-bold text-lg">₦{transaction.amount.toLocaleString()}</p>
                          <p className="text-sm text-slate-600">Fees: ₦{transaction.fees.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-500">Customer</p>
                          <p className="font-medium">{transaction.customer.email}</p>
                          <p className="text-sm text-slate-600">ID: {transaction.customer.id}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-500">Payment Details</p>
                          <p className="font-medium">{transaction.authorization.brand.toUpperCase()} *{transaction.authorization.last4}</p>
                          <p className="text-sm text-slate-600">{transaction.authorization.bank}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Created: {new Date(transaction.created_at).toLocaleString()}</span>
                        {transaction.paid_at && (
                          <span>Paid: {new Date(transaction.paid_at).toLocaleString()}</span>
                        )}
                        <span>Response: {transaction.gateway_response}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
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

        {/* Revenue Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <div className="text-center text-slate-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                    <p>Revenue trend chart would render here</p>
                    <p className="text-sm">Monthly growth: +{metrics.revenue.growth}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <div className="text-center text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                    <p>Transaction volume chart would render here</p>
                    <p className="text-sm">Total: {metrics.transactions.volume.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <div className="text-center text-slate-500">
                    <PieChart className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                    <p>Success rate pie chart would render here</p>
                    <p className="text-sm">Current rate: {((metrics.transactions.successful / metrics.transactions.volume) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payout Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <div className="text-center text-slate-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                    <p>Payout trends chart would render here</p>
                    <p className="text-sm">Total payouts: ₦{(metrics.payouts.totalAmount / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AWS Costs Tab */}
        <TabsContent value="aws-costs" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">AWS Cost Analysis</h3>
            <Button variant="outline" onClick={refreshAWSCosts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Cost Data
            </Button>
          </div>

          {/* AWS Cost Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Monthly Cost</p>
                    <p className="text-2xl font-bold text-red-900">${awsCosts.total.toLocaleString()}</p>
                    <p className="text-xs text-red-600">Current period</p>
                  </div>
                  <Server className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Forecasted</p>
                    <p className="text-2xl font-bold text-orange-900">${awsCosts.forecast.nextMonth.toLocaleString()}</p>
                    <p className="text-xs text-orange-600">{awsCosts.forecast.confidence}% confidence</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Potential Savings</p>
                    <p className="text-2xl font-bold text-green-900">
                      ${awsCosts.recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-green-600">Through optimization</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Costs Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Service Costs Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {awsCosts.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(service.trend)}
                          <span className="font-medium">{service.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${service.cost.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">{service.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Optimization Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {awsCosts.recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-slate-900">{rec.service}</h5>
                          <Badge variant="outline" className="mt-1">
                            {rec.effort} effort
                          </Badge>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ${rec.potentialSavings.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{rec.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Trend Alert */}
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Cost Alert:</strong> Your AWS costs have increased by 15% compared to last month. 
              Consider implementing the optimization recommendations above to reduce expenses.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
