"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Eye, DollarSign, Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { useCreatorDashboard, useCreatorSurveys } from "@/hooks/use-creator"

export default function CreatorDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { data: dashboard, isLoading: dashboardLoading } = useCreatorDashboard()
  const { data: surveysData, isLoading: surveysLoading } = useCreatorSurveys()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "creator")) {
      router.push("/creator/auth/sign-in")
    }
  }, [isAuthenticated, isLoading, user?.role, router])

  if (isLoading || dashboardLoading) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "creator") {
    return null
  }

  // Use current user data from API
  const currentCreator = {
    name: user?.name || "Creator",
    email: user?.email || "",
    credits: dashboard?.credits_balance || 0,
    hasCreatedSurvey: (dashboard?.total_surveys || 0) > 0
  }
  const isNewUser = (dashboard?.total_surveys || 0) === 0
  const stats = {
    totalSurveys: dashboard?.total_surveys || 0,
    activeSurveys: dashboard?.active_surveys || 0,
    totalResponses: dashboard?.total_responses || 0,
    creditsRemaining: dashboard?.credits_balance || 0
  }

  const recentSurveys = surveysData?.surveys?.slice(0, 3).map(survey => ({
    id: survey.id,
    title: survey.title,
    status: survey.status,
    responses: survey.responses,
    target: survey.target
  })) || []

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
          <div className="relative">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {isNewUser ? `Welcome to Onetime Survey, ${currentCreator?.name}!` : `Welcome back, ${currentCreator?.name}!`}
            </h1>
            <p className="text-slate-600 text-lg">
              {isNewUser ? 'Ready to create your first survey and collect valuable insights?' : 'Ready to create surveys and collect insights.'}
            </p>
          </div>
        </div>



        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Surveys</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100/80 group-hover:bg-blue-200/80 transition-colors">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalSurveys}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <p className="text-xs text-slate-500">{isNewUser ? 'Start creating' : '+2 this month'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Active Surveys</CardTitle>
              <div className="p-2 rounded-lg bg-green-100/80 group-hover:bg-green-200/80 transition-colors">
                <Eye className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.activeSurveys}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <p className="text-xs text-slate-500">{isNewUser ? 'No active surveys' : 'Currently collecting'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Responses</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100/80 group-hover:bg-blue-200/80 transition-colors">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalResponses}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <p className="text-xs text-slate-500">{isNewUser ? 'No responses yet' : '+89 this week'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Credits</CardTitle>
              <div className="p-2 rounded-lg bg-orange-100/80 group-hover:bg-orange-200/80 transition-colors">
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.creditsRemaining}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <p className="text-xs text-slate-500">Available balance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {isNewUser && (
          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                  <Plus className="h-8 w-8 text-[#C1654B]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to create your first survey?</h2>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Start collecting valuable insights from our community. You have {stats.creditsRemaining} free credits to get started!
                </p>
                <Button asChild variant="creator" size="lg" className="px-8">
                  <Link href="/creator/surveys/create" className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create Your First Survey
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                <div className="p-2 rounded-lg bg-[#C1654B]/10">
                  <Plus className="h-5 w-5 text-[#C1654B]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 lg:px-6">
              <Button asChild variant="creator" className="w-full h-10 lg:h-12 text-sm lg:text-base">
                <Link href="/creator/surveys/create">
                  <Plus className="h-4 w-4" />
                  Create New Survey
                </Link>
              </Button>
              <Button asChild variant="accent" className="w-full h-9 lg:h-11 text-sm lg:text-base">
                <Link href="/creator/analytics">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button asChild variant="accent" className="w-full h-9 lg:h-11 text-sm lg:text-base">
                <Link href="/creator/credits">
                  <DollarSign className="h-4 w-4" />
                  Purchase Credits
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSurveys.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-slate-100/80 w-fit mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">No surveys yet</h3>
                  <p className="text-sm text-slate-500 mb-4">Create your first survey to start collecting insights.</p>
                  <Button asChild size="sm" variant="accent">
                    <Link href="/creator/surveys/create">Get Started</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSurveys.map((survey) => (
                    <div key={survey.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-sm transition-all duration-200">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate mb-1">{survey.title}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-24">
                            <div className="bg-[#C1654B] h-1.5 rounded-full" style={{ width: `${(survey.responses / survey.target) * 100}%` }}></div>
                          </div>
                          <p className="text-xs text-slate-500 whitespace-nowrap">{survey.responses}/{survey.target}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {survey.status === "active" && <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>}
                        {survey.status === "pending" && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>}
                        {survey.status === "completed" && <Badge className="bg-blue-100 text-blue-700 border-blue-200">Completed</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  )
}