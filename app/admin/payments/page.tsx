"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  CreditCard,
  Download,
  Eye
} from "lucide-react"

export default function PaymentsPage() {
  const [selectedTab, setSelectedTab] = useState("pending")

  const withdrawals = [
    {
      id: "1",
      user: "John Doe",
      email: "john@example.com",
      amount: "₦45,200",
      method: "Bank Transfer",
      accountDetails: "GTBank - 0123456789",
      status: "pending",
      requestedAt: "2024-01-20 14:30",
      earnings: "₦50,000",
      fees: "₦4,800"
    },
    {
      id: "2",
      user: "Jane Smith", 
      email: "jane@example.com",
      amount: "₦28,500",
      method: "Paystack",
      accountDetails: "jane@example.com",
      status: "approved",
      requestedAt: "2024-01-19 16:45",
      processedAt: "2024-01-20 09:15",
      earnings: "₦30,000",
      fees: "₦1,500"
    },
    {
      id: "3",
      user: "Mike Johnson",
      email: "mike@example.com", 
      amount: "₦15,750",
      method: "Bank Transfer",
      accountDetails: "Access Bank - 9876543210",
      status: "rejected",
      requestedAt: "2024-01-18 11:20",
      rejectionReason: "Invalid account details",
      earnings: "₦17,500",
      fees: "₦1,750"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (selectedTab === "all") return true
    return withdrawal.status === selectedTab
  })

  const handleApprove = (id: string) => {
    console.log("Approving withdrawal:", id)
    // TODO: Integrate with Paystack API
  }

  const handleReject = (id: string) => {
    console.log("Rejecting withdrawal:", id)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Processing</h1>
          <p className="text-slate-600">Manage withdrawal requests and payouts</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦89,450</div>
            <p className="text-xs text-slate-500">3 requests</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦156,200</div>
            <p className="text-xs text-slate-500">8 payouts</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Processing Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦12,450</div>
            <p className="text-xs text-slate-500">This month</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b">
        {["pending", "approved", "rejected", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              selectedTab === tab 
                ? "text-red-600 border-b-2 border-red-600" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab} ({withdrawals.filter(w => tab === "all" || w.status === tab).length})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredWithdrawals.map((withdrawal) => (
          <Card key={withdrawal.id} className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900">{withdrawal.user}</h3>
                    <p className="text-sm text-slate-600">{withdrawal.email}</p>
                    <div className="mt-2">
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Amount & Method</p>
                    <p className="font-semibold text-lg">{withdrawal.amount}</p>
                    <p className="text-sm text-slate-600">{withdrawal.method}</p>
                    <p className="text-xs text-slate-500">{withdrawal.accountDetails}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Breakdown</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Earnings:</span>
                        <span>{withdrawal.earnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fees:</span>
                        <span className="text-red-600">-{withdrawal.fees}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Net:</span>
                        <span>{withdrawal.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-6">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  {withdrawal.status === "pending" && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(withdrawal.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600"
                        onClick={() => handleReject(withdrawal.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Requested: {withdrawal.requestedAt}</span>
                  {withdrawal.processedAt && <span>Processed: {withdrawal.processedAt}</span>}
                  {withdrawal.rejectionReason && (
                    <span className="text-red-600">Reason: {withdrawal.rejectionReason}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}