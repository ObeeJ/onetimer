"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Download, 
  Shield, 
  CreditCard, 
  Users, 
  ListChecks,
  AlertTriangle,
  Calendar,
  Settings
} from "lucide-react"

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const auditLogs = [
    {
      id: "1",
      timestamp: "2024-01-20 14:30:25",
      admin: "John Admin",
      action: "Approved Survey",
      target: "Survey #1234 - Consumer Behavior Study",
      type: "approval",
      ip: "192.168.1.100",
      details: "Survey approved after content review"
    },
    {
      id: "2",
      timestamp: "2024-01-20 14:25:12",
      admin: "Jane Admin",
      action: "Processed Payout",
      target: "User: user123@onetimesurvey.com - ₦45,200",
      type: "payout",
      ip: "192.168.1.101",
      details: "Payout processed via Paystack"
    },
    {
      id: "3",
      timestamp: "2024-01-20 14:20:45",
      admin: "Mike Admin",
      action: "Suspended User",
      target: "User: suspicious@example.com",
      type: "moderation",
      ip: "192.168.1.102",
      details: "User suspended for policy violation"
    },
    {
      id: "4",
      timestamp: "2024-01-20 14:15:33",
      admin: "Sarah Admin",
      action: "Updated Settings",
      target: "Platform Configuration",
      type: "config",
      ip: "192.168.1.103",
      details: "Updated minimum payout threshold"
    },
    {
      id: "5",
      timestamp: "2024-01-20 14:10:18",
      admin: "System",
      action: "Failed Login Attempt",
      target: "admin@suspicious.com",
      type: "security",
      ip: "203.0.113.1",
      details: "Multiple failed login attempts detected"
    }
  ]

  const getActionIcon = (type: string) => {
    switch (type) {
      case "approval":
        return <ListChecks className="h-4 w-4 text-green-600" />
      case "payout":
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case "moderation":
        return <Shield className="h-4 w-4 text-red-600" />
      case "config":
        return <Settings className="h-4 w-4 text-purple-600" />
      case "security":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <Users className="h-4 w-4 text-slate-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      approval: "bg-green-100 text-green-700",
      payout: "bg-blue-100 text-blue-700",
      moderation: "bg-red-100 text-red-700",
      config: "bg-purple-100 text-purple-700",
      security: "bg-orange-100 text-orange-700"
    }
    return <Badge className={colors[type as keyof typeof colors] || "bg-slate-100 text-slate-700"}>{type}</Badge>
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.target.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === "all" || log.type === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-600">Track all critical system actions and security events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Actions</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Security Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-slate-500">Requires attention</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Approvals</CardTitle>
            <ListChecks className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-slate-500">This month</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Payouts</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-slate-500">Processed</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Config Changes</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-slate-500">System updates</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search logs..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="p-2 border rounded-lg"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="approval">Approvals</option>
                <option value="payout">Payouts</option>
                <option value="moderation">Moderation</option>
                <option value="config">Configuration</option>
                <option value="security">Security</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getActionIcon(log.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{log.action}</h3>
                    {getTypeBadge(log.type)}
                    <span className="text-xs text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{log.target}</p>
                  <p className="text-xs text-slate-500">{log.details}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>Admin: {log.admin}</span>
                    <span>•</span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}