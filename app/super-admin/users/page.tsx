"use client"

import { useEffect, useState } from "react"
import { superAdminApi } from "@/lib/api/super-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveTable } from "@/components/ui/responsive-table"
import { Users, Search, Filter, MoreHorizontal, Shield, Ban } from "lucide-react"

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await superAdminApi.getAllUsers()
      setUsers(response.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    console.log("Opening add user dialog...")
    // TODO: Implement add user functionality
  }

  const handleFilter = () => {
    console.log("Opening filter options...")
    // TODO: Implement filter functionality
  }

  const handleShield = (userId: number) => {
    console.log("Managing permissions for user:", userId)
    // TODO: Implement permission management
  }

  const handleBan = (userId: number) => {
    console.log("Banning user:", userId)
    // TODO: Implement user ban functionality
  }

  const handleMore = (userId: number) => {
    console.log("More actions for user:", userId)
    // TODO: Show more actions menu
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Manage all platform users</p>
        </div>
        <Button variant="default" onClick={handleAddUser}>
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
                      <Button size="sm" variant="outline" onClick={() => handleShield(user.id)}>
                        <Shield className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBan(user.id)}>
                        <Ban className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleMore(user.id)}>
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