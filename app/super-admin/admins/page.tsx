"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  Eye, 
  Ban, 
  CheckCircle, 
  Shield,
  Mail,
  Calendar
} from "lucide-react"

export default function AdminsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const admins = [
    {
      id: "1",
      name: "John Admin",
      email: "john.admin@example.com",
      role: "Finance Admin",
      status: "Active",
      lastLogin: "2024-01-20 14:30",
      permissions: ["payments", "reports"],
      createdAt: "2024-01-01"
    },
    {
      id: "2", 
      name: "Jane Admin",
      email: "jane.admin@example.com",
      role: "Survey Admin",
      status: "Active",
      lastLogin: "2024-01-20 16:45",
      permissions: ["surveys", "users"],
      createdAt: "2024-01-05"
    },
    {
      id: "3",
      name: "Mike Admin",
      email: "mike.admin@example.com",
      role: "User Admin",
      status: "Suspended",
      lastLogin: "2024-01-18 11:20",
      permissions: ["users", "kyc"],
      createdAt: "2024-01-10"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case "Suspended":
        return <Badge className="bg-yellow-100 text-yellow-700">Suspended</Badge>
      case "Inactive":
        return <Badge className="bg-red-100 text-red-700">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      "Finance Admin": "bg-blue-100 text-blue-700",
      "Survey Admin": "bg-green-100 text-green-700", 
      "User Admin": "bg-purple-100 text-purple-700",
      "General Admin": "bg-slate-100 text-slate-700"
    }
    return <Badge className={colors[role as keyof typeof colors] || "bg-slate-100 text-slate-700"}>{role}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-600">Manage admin accounts and permissions</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-slate-500">+1 this month</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-slate-500">87.5% active rate</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Online Now</CardTitle>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-slate-500">Currently active</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Actions Today</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-slate-500">Admin actions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Admins</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search admins..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{admin.name}</h3>
                      {getStatusBadge(admin.status)}
                      {getRoleBadge(admin.role)}
                    </div>
                    <p className="text-sm text-slate-600">{admin.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span>Last login: {admin.lastLogin}</span>
                      <span>•</span>
                      <span>Permissions: {admin.permissions.join(", ")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  {admin.status === "Active" ? (
                    <Button size="sm" variant="outline" className="text-yellow-600">
                      <Ban className="h-3 w-3 mr-1" />
                      Suspend
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="admin@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Finance Admin</option>
                  <option>Survey Admin</option>
                  <option>User Admin</option>
                  <option>General Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Send Invite
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}