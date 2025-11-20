"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveTable } from "@/components/ui/responsive-table"
import { Users, Search, Filter, MoreHorizontal, Shield, Ban } from "lucide-react"

export default function SuperAdminUsersPage() {
  const users = [
    { id: 1, name: "User One", email: "user1@onetimesurvey.com", role: "filler", status: "active", surveys: 45, earnings: "₦12,500" },
    { id: 2, name: "User Two", email: "user2@onetimesurvey.com", role: "creator", status: "active", surveys: 12, earnings: "₦8,200" },
    { id: 3, name: "User Three", email: "user3@onetimesurvey.com", role: "filler", status: "suspended", surveys: 23, earnings: "₦5,800" },
    { id: 4, name: "User Four", email: "user4@onetimesurvey.com", role: "admin", status: "active", surveys: 0, earnings: "₦0" },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Manage all platform users</p>
        </div>
        <Button variant="default">
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input placeholder="Search users..." className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="sm">
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
              { key: "surveys", label: "Surveys", mobileLabel: "Surveys" },
              { key: "earnings", label: "Earnings", mobileLabel: "Earnings" },
              { key: "actions", label: "Actions", mobileLabel: "Actions" },
            ]}
            data={users}
            renderCell={(user, column) => {
              switch (column.key) {
                case "user":
                  return (
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  )
                case "role":
                  return <Badge variant="outline">{user.role}</Badge>
                case "status":
                  return (
                    <Badge className={user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {user.status}
                    </Badge>
                  )
                case "surveys":
                  return <span>{user.surveys}</span>
                case "earnings":
                  return <span>{user.earnings}</span>
                case "actions":
                  return (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Shield className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Ban className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
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