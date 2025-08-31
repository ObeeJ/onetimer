"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { Download, TrendingUp, Users, DollarSign, Activity } from "lucide-react"

export default function SuperAdminReportsPage() {
  const monthlyData = [
    { month: "Jan", users: 1200, surveys: 450, revenue: 125000 },
    { month: "Feb", users: 1450, surveys: 520, revenue: 145000 },
    { month: "Mar", users: 1680, surveys: 610, revenue: 168000 },
    { month: "Apr", users: 1920, surveys: 720, revenue: 192000 },
    { month: "May", users: 2150, surveys: 840, revenue: 215000 },
    { month: "Jun", users: 2380, surveys: 950, revenue: 238000 },
  ]

  const userTypeData = [
    { name: "Fillers", value: 8500, color: "#3b82f6" },
    { name: "Creators", value: 1200, color: "#f59e0b" },
    { name: "Admins", value: 45, color: "#10b981" },
  ]

  const revenueData = [
    { month: "Jan", revenue: 125000, profit: 25000 },
    { month: "Feb", revenue: 145000, profit: 29000 },
    { month: "Mar", revenue: 168000, profit: 33600 },
    { month: "Apr", revenue: 192000, profit: 38400 },
    { month: "May", revenue: 215000, profit: 43000 },
    { month: "Jun", revenue: 238000, profit: 47600 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-600">Platform performance insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold">₦24.8M</p>
                <p className="text-xs text-green-600">+32% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold">12,847</p>
                <p className="text-xs text-blue-600">+18% from last month</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Surveys</p>
                <p className="text-2xl font-bold">3,456</p>
                <p className="text-xs text-blue-600">+24% from last month</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Growth Rate</p>
                <p className="text-2xl font-bold">28%</p>
                <p className="text-xs text-green-600">+5% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" radius={4} />
                <Bar dataKey="surveys" fill="#f59e0b" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}