"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { EmptyState } from "@/components/ui/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Eye, Download, Calendar } from "lucide-react"
import { useCreatorAuth } from "@/hooks/use-creator-auth"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

export default function CreatorAnalyticsPage() {
  console.log("CreatorAnalyticsPage rendering")
  const { isAuthenticated, isApproved } = useCreatorAuth()
  const [selectedSurvey, setSelectedSurvey] = useState("all")
  const [timeRange, setTimeRange] = useState("30d")
  console.log("Analytics page auth state:", { isAuthenticated, isApproved })

  // Mock analytics data
  const surveys = [
    { id: "1", title: "Consumer Behavior Study" },
    { id: "2", title: "Product Feedback Survey" },
    { id: "3", title: "Market Research Q4" }
  ]

  const overviewStats = {
    totalResponses: 1247,
    activesurveys: 3,
    completionRate: 87,
    avgResponseTime: "4.2 min"
  }

  const responseData = [
    { date: "Jan 1", responses: 45 },
    { date: "Jan 8", responses: 67 },
    { date: "Jan 15", responses: 89 },
    { date: "Jan 22", responses: 123 },
    { date: "Jan 29", responses: 156 }
  ]

  const demographicData = [
    { category: "18-24", percentage: 32, count: 399 },
    { category: "25-34", percentage: 28, count: 349 },
    { category: "35-44", percentage: 24, count: 299 },
    { category: "45+", percentage: 16, count: 200 }
  ]

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <EmptyState
            icon={BarChart3}
            title="Sign in required"
            description="Please sign in to view analytics."
            action={{ label: "Sign in", href: "/creator/auth/sign-in" }}
          />
        </div>
      </div>
    )
  }

  // All authenticated users can access analytics

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <Breadcrumb items={[{ label: "Analytics" }]} />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600">Track survey performance and insights</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select survey" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Surveys</SelectItem>
              {surveys.map((survey) => (
                <SelectItem key={survey.id} value={survey.id}>
                  {survey.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{overviewStats.totalResponses}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Surveys</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{overviewStats.activesurveys}</div>
              <p className="text-xs text-slate-500 mt-1">Currently collecting</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{overviewStats.completionRate}%</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Response Time</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{overviewStats.avgResponseTime}</div>
              <p className="text-xs text-slate-500 mt-1">Per survey</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="responses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="responses">Response Trends</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Response Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={responseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="responses" stroke="#2563eb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demographicData.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-sm font-medium">{item.category}</div>
                        <div className="flex-1 bg-slate-200 rounded-full h-2 min-w-32">
                          <div 
                            className="bg-[#C1654B] h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.percentage}%</div>
                        <div className="text-xs text-slate-500">{item.count} responses</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Top Performing Surveys</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {surveys.map((survey, index) => (
                      <div key={survey.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium text-slate-900">{survey.title}</p>
                            <p className="text-sm text-slate-500">89% completion rate</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">156</p>
                          <p className="text-sm text-slate-500">responses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Response Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">High Quality</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                        <span className="text-sm text-slate-600">78%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Medium Quality</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "18%" }}></div>
                        </div>
                        <span className="text-sm text-slate-600">18%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Low Quality</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: "4%" }}></div>
                        </div>
                        <span className="text-sm text-slate-600">4%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}