"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { surveyStore } from "@/lib/survey-store"
import { 
  PlusCircle, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard
} from "lucide-react"
import Link from "next/link"

export default function CreatorDashboard() {
  const surveys = surveyStore.getAll()
  const totalResponses = surveys.reduce((sum, survey) => sum + survey.responses, 0)
  const completionRate = surveys.length > 0 ? Math.round((surveys.filter(s => s.status === 'completed').length / surveys.length) * 100) : 0
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Dashboard" 
          description="Welcome back! Here's your survey overview."
        >
          <Link href="/creator/surveys/create">
            <Button className="inline-flex items-center justify-center bg-[#013f5c] hover:bg-[#024a6b] text-white font-medium px-6 py-3 rounded-lg transition-all duration-200">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Survey
            </Button>
          </Link>
        </PageHeader>
        
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 py-4">
                <CardTitle className="text-sm font-medium text-slate-600">Total Surveys</CardTitle>
                <BarChart3 className="h-5 w-5 text-slate-400" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl font-bold text-slate-900">{surveys.length}</div>
                <p className="text-xs text-slate-500 mt-1">+2 from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 py-4">
                <CardTitle className="text-sm font-medium text-slate-600">Total Responses</CardTitle>
                <Users className="h-5 w-5 text-slate-400" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl font-bold text-slate-900">{totalResponses.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">+180 from last week</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 py-4">
                <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
                <TrendingUp className="h-5 w-5 text-slate-400" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl font-bold text-slate-900">{completionRate}%</div>
                <p className="text-xs text-slate-500 mt-1">+5% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 py-4">
                <CardTitle className="text-sm font-medium text-slate-600">Credits Remaining</CardTitle>
                <AlertCircle className="h-5 w-5 text-slate-400" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-2xl font-bold text-slate-900">1,250</div>
                <p className="text-xs text-slate-500 mt-1">Enough for ~125 responses</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Surveys */}
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-slate-200">
              <CardTitle className="text-xl font-bold text-slate-900">Recent Surveys</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
            <div className="space-y-4">
              {surveys.slice(0, 3).map((survey, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {survey.status === "live" && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                      {survey.status === "draft" && <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
                      {survey.status === "completed" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      <span className="font-medium">{survey.title}</span>
                    </div>
                    <Badge variant="secondary" className={
                      survey.status === "live" ? "bg-green-100 text-green-800" :
                      survey.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                      "bg-blue-100 text-blue-800"
                    }>
                      {survey.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-600">
                      {survey.responses}/{survey.maxResponses} responses
                    </span>
                    {survey.status !== "draft" && (
                      <Link href={`/creator/surveys/${survey.id}`}>
                        <Button className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-4 py-2 rounded-lg transition-all duration-200" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    )}
                    {survey.status === "draft" && (
                      <Link href={`/creator/surveys/${survey.id}/edit`}>
                        <Button className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-4 py-2 rounded-lg transition-all duration-200" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-[#013f5c]/30">
              <Link href="/creator/surveys/create">
                <CardContent className="p-6 text-center">
                  <div className="bg-[#013f5c] rounded-xl p-3 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <PlusCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-[#013f5c]">Create Survey</h3>
                  <p className="text-slate-500 text-sm">Build new surveys</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-[#013f5c]/30">
              <Link href="/creator/analytics">
                <CardContent className="p-6 text-center">
                  <div className="bg-[#013f5c] rounded-xl p-3 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-[#013f5c]">Analytics</h3>
                  <p className="text-slate-500 text-sm">View insights</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-[#013f5c]/30">
              <Link href="/creator/billing">
                <CardContent className="p-6 text-center">
                  <div className="bg-[#013f5c] rounded-xl p-3 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-[#013f5c]">Billing</h3>
                  <p className="text-slate-500 text-sm">Manage credits</p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}