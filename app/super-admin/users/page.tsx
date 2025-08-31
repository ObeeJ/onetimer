"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Filter, MoreHorizontal, Shield, Ban } from "lucide-react"

export default function SuperAdminUsersPage() {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "filler", status: "active", surveys: 45, earnings: "₦12,500" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "creator", status: "active", surveys: 12, earnings: "₦8,200" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "filler", status: "suspended", surveys: 23, earnings: "₦5,800" },
    { id: 4, name: "Sarah Wilson", email: "sarah@example.com", role: "admin", status: "active", surveys: 0, earnings: "₦0" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Manage all platform users</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Surveys</th>
                  <th className="text-left p-4">Earnings</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4">{user.surveys}</td>
                    <td className="p-4">{user.earnings}</td>
                    <td className="p-4">
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