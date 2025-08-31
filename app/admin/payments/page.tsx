"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, Search, Filter, Download, Eye } from "lucide-react"

export default function AdminPaymentsPage() {
  const transactions = [
    { id: "TXN_001", amount: "₦15,000", status: "success", reason: "Survey completion payout", user: "John Doe", date: "2024-01-15" },
    { id: "TXN_002", amount: "₦25,000", status: "pending", reason: "Creator survey credits", user: "TechCorp Ltd", date: "2024-01-14" },
    { id: "TXN_003", amount: "₦8,500", status: "failed", reason: "Insufficient funds", user: "Jane Smith", date: "2024-01-14" },
    { id: "TXN_004", amount: "₦12,000", status: "success", reason: "Survey completion payout", user: "Mike Johnson", date: "2024-01-13" },
    { id: "TXN_005", amount: "₦50,000", status: "success", reason: "Creator survey credits", user: "StartupXYZ", date: "2024-01-12" },
  ]

  const stats = [
    { title: "Total Transactions", value: "1,247", color: "blue" },
    { title: "Successful", value: "1,089", color: "green" },
    { title: "Pending", value: "89", color: "yellow" },
    { title: "Failed", value: "69", color: "red" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Transactions</h1>
          <p className="text-slate-600">Monitor Paystack transactions and payouts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <CreditCard className="h-4 w-4 mr-2" />
            Process Payouts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <CreditCard className={`h-8 w-8 text-${stat.color}-600`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input placeholder="Search transactions..." className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Transaction ID</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Reason</th>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded">{txn.id}</code>
                    </td>
                    <td className="p-4 font-medium">{txn.amount}</td>
                    <td className="p-4">
                      <Badge className={
                        txn.status === "success" ? "bg-green-100 text-green-700" :
                        txn.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }>
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">{txn.reason}</td>
                    <td className="p-4">{txn.user}</td>
                    <td className="p-4 text-sm text-slate-600">{txn.date}</td>
                    <td className="p-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
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