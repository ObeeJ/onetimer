"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ListChecks, Search, Filter, Eye, Ban, CheckCircle } from "lucide-react"

export default function SuperAdminSurveysPage() {
  const surveys = [
    { id: 1, title: "Customer Satisfaction Survey", creator: "TechCorp Ltd", status: "active", responses: 245, reward: "₦500", created: "2024-01-15" },
    { id: 2, title: "Product Feedback Form", creator: "StartupXYZ", status: "pending", responses: 12, reward: "₦300", created: "2024-01-14" },
    { id: 3, title: "Market Research Study", creator: "BigBrand Inc", status: "completed", responses: 1000, reward: "₦750", created: "2024-01-10" },
    { id: 4, title: "User Experience Survey", creator: "DesignCo", status: "suspended", responses: 89, reward: "₦400", created: "2024-01-12" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Survey Management</h1>
          <p className="text-slate-600">Monitor and manage all platform surveys</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Data</Button>
          <Button>
            <ListChecks className="h-4 w-4 mr-2" />
            Review Queue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Surveys</p>
                <p className="text-2xl font-bold">3,456</p>
              </div>
              <ListChecks className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-green-600">2,134</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">23</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600">8</p>
              </div>
              <Ban className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Surveys</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input placeholder="Search surveys..." className="pl-9 w-64" />
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
                  <th className="text-left p-4">Survey</th>
                  <th className="text-left p-4">Creator</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Responses</th>
                  <th className="text-left p-4">Reward</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <tr key={survey.id} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium">{survey.title}</p>
                    </td>
                    <td className="p-4">{survey.creator}</td>
                    <td className="p-4">
                      <Badge className={
                        survey.status === "active" ? "bg-green-100 text-green-700" :
                        survey.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        survey.status === "completed" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }>
                        {survey.status}
                      </Badge>
                    </td>
                    <td className="p-4">{survey.responses}</td>
                    <td className="p-4">{survey.reward}</td>
                    <td className="p-4">{survey.created}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Ban className="h-3 w-3" />
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