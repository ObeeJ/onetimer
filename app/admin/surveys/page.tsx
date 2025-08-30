"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play,
  Clock,
  Users,
  Calendar
} from "lucide-react"

export default function SurveysPage() {
  const [activeTab, setActiveTab] = useState("pending")

  const surveys = [
    {
      id: "1",
      title: "Consumer Behavior Study",
      creator: "TechCorp Ltd",
      status: "pending",
      reward: "₦500",
      target: 100,
      responses: 0,
      createdAt: "2024-01-20",
      questions: 8
    },
    {
      id: "2",
      title: "Mobile App Usage Survey", 
      creator: "StartupXYZ",
      status: "active",
      reward: "₦300",
      target: 200,
      responses: 89,
      createdAt: "2024-01-18",
      questions: 12
    },
    {
      id: "3",
      title: "Food Delivery Preferences",
      creator: "FoodTech Inc",
      status: "rejected",
      reward: "₦750",
      target: 150,
      responses: 0,
      createdAt: "2024-01-19",
      questions: 6,
      rejectionReason: "Inappropriate content in question 3"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending Review</Badge>
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case "paused":
        return <Badge className="bg-blue-100 text-blue-700">Paused</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      case "completed":
        return <Badge className="bg-slate-100 text-slate-700">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredSurveys = surveys.filter(survey => {
    if (activeTab === "all") return true
    return survey.status === activeTab
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Survey Management</h1>
          <p className="text-slate-600">Review and manage survey submissions</p>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {["pending", "active", "paused", "rejected", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab 
                ? "text-red-600 border-b-2 border-red-600" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab} ({surveys.filter(s => tab === "all" || s.status === tab).length})
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {filteredSurveys.map((survey) => (
          <Card key={survey.id} className="rounded-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    {getStatusBadge(survey.status)}
                  </div>
                  <p className="text-slate-600">Created by {survey.creator}</p>
                  {survey.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {survey.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                  {survey.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {survey.status === "active" && (
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  {survey.status === "paused" && (
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Responses</p>
                    <p className="font-semibold">{survey.responses}/{survey.target}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Reward</p>
                    <p className="font-semibold">{survey.reward}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Questions</p>
                    <p className="font-semibold">{survey.questions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created</p>
                    <p className="font-semibold">{new Date(survey.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(survey.responses / survey.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}