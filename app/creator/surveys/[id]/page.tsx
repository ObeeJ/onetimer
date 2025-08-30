"use client"

import { useState, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BarChart3, 
  Users, 
  Eye, 
  Calendar, 
  Download, 
  Pause, 
  Play, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useCreatorAuth } from "@/hooks/use-creator-auth"

export default function SurveyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isAuthenticated, isApproved } = useCreatorAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Mock survey data
  const survey = {
    id: id,
    title: "Consumer Behavior Study",
    description: "Understanding shopping patterns in urban areas to improve retail experiences",
    status: "active",
    responses: 89,
    target: 100,
    reward: 500,
    createdAt: "2024-01-15",
    expiresAt: "2024-02-15",
    questions: [
      {
        id: "1",
        type: "multiple-choice",
        question: "How often do you shop online?",
        options: ["Daily", "Weekly", "Monthly", "Rarely"]
      },
      {
        id: "2", 
        type: "rating",
        question: "Rate your satisfaction with online shopping",
        scale: 5
      },
      {
        id: "3",
        type: "text",
        question: "What improvements would you like to see in online shopping?"
      }
    ],
    responses_data: [
      {
        id: "1",
        respondent: "User #1247",
        completedAt: "2024-01-20 14:30",
        quality: "high",
        answers: {
          "1": "Weekly",
          "2": 4,
          "3": "Faster delivery and better customer service"
        }
      },
      {
        id: "2",
        respondent: "User #1248", 
        completedAt: "2024-01-20 15:45",
        quality: "medium",
        answers: {
          "1": "Monthly",
          "2": 3,
          "3": "More product variety"
        }
      }
    ]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>
      case "paused":
        return <Badge className="bg-gray-100 text-gray-700">Paused</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    // TODO: API call to update survey status
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const exportResponses = () => {
    // TODO: Export responses as CSV/Excel
    console.log("Exporting responses...")
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <EmptyState
            icon={BarChart3}
            title="Sign in required"
            description="Please sign in to view survey details."
            action={{ label: "Sign in", href: "/creator/auth/sign-in" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <Breadcrumb items={[
          { label: "Surveys", href: "/creator/surveys" },
          { label: survey.title }
        ]} />
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{survey.title}</h1>
              {getStatusBadge(survey.status)}
            </div>
            <p className="text-slate-600">{survey.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!isApproved}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusChange(survey.status === "active" ? "paused" : "active")}
              disabled={isLoading || !isApproved}
            >
              {survey.status === "active" ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Responses</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{survey.responses}/{survey.target}</div>
              <p className="text-xs text-slate-500 mt-1">{Math.round((survey.responses / survey.target) * 100)}% complete</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Reward</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">₦{survey.reward}</div>
              <p className="text-xs text-slate-500 mt-1">Per response</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Created</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{new Date(survey.createdAt).toLocaleDateString()}</div>
              <p className="text-xs text-slate-500 mt-1">Launch date</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Expires</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{new Date(survey.expiresAt).toLocaleDateString()}</div>
              <p className="text-xs text-slate-500 mt-1">End date</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="responses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Survey Responses</h3>
              <Button onClick={exportResponses} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Responses
              </Button>
            </div>

            {survey.responses_data.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No responses yet"
                description="Responses will appear here as users complete your survey."
              />
            ) : (
              <div className="space-y-4">
                {survey.responses_data.map((response) => (
                  <Card key={response.id} className="rounded-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base">{response.respondent}</CardTitle>
                          <Badge className={
                            response.quality === "high" ? "bg-green-100 text-green-700" :
                            response.quality === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }>
                            {response.quality} quality
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{response.completedAt}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {survey.questions.map((question) => (
                          <div key={question.id} className="border-l-2 border-slate-200 pl-4">
                            <p className="font-medium text-slate-900 text-sm">{question.question}</p>
                            <p className="text-slate-600 text-sm mt-1">
                              {response.answers[question.id] || "No answer"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <h3 className="text-lg font-semibold">Survey Questions</h3>
            <div className="space-y-4">
              {survey.questions.map((question, index) => (
                <Card key={question.id} className="rounded-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Q{index + 1}</Badge>
                      <CardTitle className="text-base">{question.question}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {question.type === "multiple-choice" && question.options && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600">Options:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {question.options.map((option, idx) => (
                            <li key={idx} className="text-sm text-slate-600">{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {question.type === "rating" && (
                      <p className="text-sm text-slate-600">Rating scale: 1-{question.scale}</p>
                    )}
                    {question.type === "text" && (
                      <p className="text-sm text-slate-600">Open-ended text response</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h3 className="text-lg font-semibold">Survey Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-[#C1654B] h-2 rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Response Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Quality</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium Quality</span>
                      <span className="font-medium">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Quality</span>
                      <span className="font-medium">4%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Response Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Response timeline chart would be displayed here</p>
                    <p className="text-sm text-slate-500">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}