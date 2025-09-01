"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Eye, DollarSign, Plus, Clock } from "lucide-react"
import Link from "next/link"
import { useCreatorAuth } from "@/hooks/use-creator-auth"

export default function CreatorDashboardPage() {
  console.log("CreatorDashboardPage rendering")
  const { creator, isAuthenticated, isApproved } = useCreatorAuth()
  console.log("Creator auth state:", { creator, isAuthenticated, isApproved })

  // TODO: Replace with actual API data
  const stats = {
    totalSurveys: 12,
    activeSurveys: 3,
    totalResponses: 1247,
    creditsRemaining: creator?.credits || 0
  }

  const recentSurveys = [
    { id: "1", title: "Consumer Behavior Study", status: "active", responses: 89, target: 100 },
    { id: "2", title: "Product Feedback Survey", status: "pending", responses: 0, target: 50 },
    { id: "3", title: "Market Research Q4", status: "completed", responses: 156, target: 150 }
  ]

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Sign in to access creator dashboard</h2>
          <p className="text-slate-600 mb-6">Create an account or sign in to start creating surveys and collecting insights.</p>
          <Button asChild variant="accent">
            <Link href="/creator/auth/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-r from-white/90 via-slate-50/50 to-white/90 backdrop-blur-sm p-8 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-500/5 to-transparent"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Welcome back, {creator?.name}!
            </h1>
            <p className="text-slate-600 text-lg">
              Ready to create surveys and collect insights.
            </p>
          </div>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-white/90 to-slate-50/50 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Surveys</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100/80 group-hover:bg-blue-200/80 transition-colors">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalSurveys}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs text-slate-500">+2 this month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-white/90 to-green-50/30 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Active Surveys</CardTitle>
              <div className="p-2 rounded-lg bg-green-100/80 group-hover:bg-green-200/80 transition-colors">
                <Eye className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.activeSurveys}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-xs text-slate-500">Currently collecting</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-white/90 to-blue-50/30 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Responses</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100/80 group-hover:bg-blue-200/80 transition-colors">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalResponses}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs text-slate-500">+89 this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-white/90 to-orange-50/30 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 group">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                <div className="p-2 rounded-lg bg-accent-500/10">
                  <Plus className="h-5 w-5 text-accent-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild variant="accent" className="w-full h-12">
                <Link href="/creator/surveys/create" className="flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Survey
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-11 border-slate-200 hover:bg-slate-50 rounded-xl">
                <Link href="/creator/analytics" className="flex items-center justify-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-11 border-slate-200 hover:bg-slate-50 rounded-xl">
                <Link href="/creator/credits" className="flex items-center justify-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Purchase Credits
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
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
                    <div key={survey.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/80 to-white/50 rounded-xl border border-slate-100 hover:shadow-sm transition-all duration-200">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate mb-1">{survey.title}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-24">
                            <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: `${(survey.responses / survey.target) * 100}%` }}></div>
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
  )
}