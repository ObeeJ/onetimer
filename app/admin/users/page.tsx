"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ResponsiveTable } from "@/components/ui/responsive-table"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/hooks/use-api"
import { 
  Search, 
  Filter, 
  Eye, 
  Ban, 
  CheckCircle,
  MoreHorizontal,
  Download
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  is_active: boolean
  kyc_status: string
  created_at: string
  total_earnings: number
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Connect to backend API
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get<{users: User[], total: number}>('/admin/users')
  })

  const users = usersData?.users || []

  if (isLoading) {
    return <div className="p-6">Loading users...</div>
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/users/export', {
        credentials: 'include'
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleFilter = () => {
    console.log("Opening filter...")
    // TODO: Implement filter functionality
  }

  const handleViewUser = (userId: string) => {
    window.open(`/admin/users/${userId}`, '_blank')
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'suspend' : 'activate'
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST'
      })
      if (response.ok) {
        // Refresh data
        window.location.reload()
      }
    } catch (error) {
      console.error('Status toggle failed:', error)
    }
  }

  const handleMoreActions = (userId: string) => {
    console.log("More actions for user:", userId)
    // TODO: Show more actions menu
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case "Suspended":
        return <Badge className="bg-yellow-100 text-yellow-700">Suspended</Badge>
      case "Banned":
        return <Badge className="bg-red-100 text-red-700">Banned</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getKycBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge className="bg-green-100 text-green-700">Verified</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Manage users, KYC approvals, and account status</p>
        </div>
        <Button variant="default" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Users
        </Button>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            columns={[
              { key: "user", label: "User", mobileLabel: "User" },
              { key: "role", label: "Role", mobileLabel: "Role" },
              { key: "status", label: "Status", mobileLabel: "Status" },
              { key: "kyc", label: "KYC", mobileLabel: "KYC Status" },
              { key: "joined", label: "Joined", mobileLabel: "Join Date" },
              { key: "earnings", label: "Earnings/Surveys", mobileLabel: "Earnings" },
              { key: "actions", label: "Actions", className: "text-right", mobileLabel: "Actions" },
            ]}
            data={users}
            renderCell={(user, column) => {
              switch (column.key) {
                case "user":
                  return (
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  )
                case "role":
                  return (
                    <Badge variant={user.role === "Creator" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  )
                case "status":
                  return getStatusBadge(user.status)
                case "kyc":
                  return getKycBadge(user.kycStatus)
                case "joined":
                  return <span className="text-slate-600">{new Date(user.joinDate).toLocaleDateString()}</span>
                case "earnings":
                  return <span className="text-slate-600">{user.earnings || `${user.surveys} surveys`}</span>
                case "actions":
                  return (
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewUser(user.id)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      {user.is_active ? (
                        <Button size="sm" variant="outline" className="text-yellow-600" onClick={() => handleToggleUserStatus(user.id, user.is_active)}>
                          <Ban className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleToggleUserStatus(user.id, user.is_active)}>
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleMoreActions(user.id)}>
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                default:
                  return null
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}