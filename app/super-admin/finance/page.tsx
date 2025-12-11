"use client"

import { useEffect, useState } from "react"
import { superAdminApi } from "@/lib/api/super-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  Download,
  RefreshCw,
  DollarSign,
  PieChart
} from "lucide-react"

export default function FinancePage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [payoutQueue, setPayoutQueue] = useState<any[]>([])
  const [reconciliation, setReconciliation] = useState<any[]>([])
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
      setPayoutQueue(payoutsData.data || [])
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
      fetchFinancialData()
    } catch (error) {
      console.error("Failed to approve payout:", error)
    }
  }

  const financialMetrics = [
    { title: "Total Revenue", value: `₦${(metrics?.totalRevenue || 0).toLocaleString()}`, change: metrics?.revenueChange || "+0%", period: "This month" },
    { title: "Pending Payouts", value: `₦${(metrics?.pendingPayouts || 0).toLocaleString()}`, change: metrics?.payoutChange || "+0%", period: "Awaiting approval" },
    { title: "Processing Fees", value: `₦${(metrics?.processingFees || 0).toLocaleString()}`, change: metrics?.feeChange || "+0%", period: "This month" },
    { title: "Net Profit", value: `₦${(metrics?.netProfit || 0).toLocaleString()}`, change: metrics?.profitChange || "+0%", period: "After fees" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>
      case "review":
        return <Badge className="bg-orange-100 text-orange-700">Review</Badge>
      case "matched":
        return <Badge className="bg-green-100 text-green-700">Matched</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Oversight</h1>
          <p className="text-slate-600">Monitor revenue, payouts, and financial health</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconcile
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialMetrics.map((metric) => (
          <Card key={metric.title} className="rounded-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{metric.title}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
              <div className="flex items-center justify-between mt-1">
                <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </p>
                <p className="text-xs text-slate-500">{metric.period}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payout Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payoutQueue.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900">{payout.id}</p>
                      {getStatusBadge(payout.status)}
                    </div>
                    <p className="text-sm text-slate-600">{payout.amount} • {payout.users} users</p>
                    <p className="text-xs text-slate-500">By {payout.submittedBy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={
                      payout.priority === "high" ? "bg-red-100 text-red-700" :
                      payout.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }
                  >
                    {payout.priority}
                  </Badge>
                  {payout.status === "pending" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Revenue breakdown chart</p>
                <p className="text-sm text-slate-500">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Daily Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Expected</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Processed</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Variance</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reconciliation.map((record, index) => (
                  <tr key={index} className="border-b hover:bg-slate-50">
                    <td className="py-4 px-4 text-slate-900">{record.date}</td>
                    <td className="py-4 px-4 text-slate-900">{record.expected}</td>
                    <td className="py-4 px-4 text-slate-900">{record.processed}</td>
                    <td className={`py-4 px-4 ${
                      record.variance.startsWith('+') ? 'text-green-600' : 
                      record.variance.startsWith('-') ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {record.variance}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {record.status === "review" && (
                        <Button size="sm" variant="outline">
                          Investigate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}