"use client"

import React, { useEffect, useState } from "react"
import { fetchJSON } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Download, 
  ArrowLeft, 
  Users, 
  Clock, 
  BarChart3, 
  TrendingUp,
  Calendar,
  Edit3,
  Play,
  Pause,
  Settings,
  FileText,
  CheckCircle2,
  AlertCircle,
  Share2
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function CreatorSurveyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = (params as any)?.id
  const [survey, setSurvey] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const s = await fetchJSON(`/api/creator/surveys`)
        const found = (s as any).find((x: any) => String(x.id) === String(id))
        if (mounted) setSurvey(found)
        
        // load responses mock
        const r = await fetchJSON(`/api/creator/surveys/${id}/responses`)
        if (mounted) {
          setResponses(r || [])
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  const handleDownload = async () => {
    try {
      const csv = await fetchJSON(`/api/creator/surveys/${id}/export`)
      // simply open CSV in new tab as blob
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `survey-${id}-responses.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'live':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'draft':
        return <Edit3 className="h-5 w-5 text-amber-600" />
      case 'paused':
        return <Pause className="h-5 w-5 text-blue-600" />
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-slate-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'live':
        return "default"
      case 'draft':
        return "secondary"
      case 'paused':
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-64"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-40 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Survey not found</h3>
        <p className="text-slate-600 mb-6">The survey you're looking for doesn't exist or has been deleted.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/creator/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    )
  }

  const completionRate = responses.length > 0 ? Math.round((responses.filter(r => r.completed).length / responses.length) * 100) : 0
  const avgDuration = responses.length > 0 ? Math.round(responses.reduce((sum, r) => sum + (r.duration || 0), 0) / responses.length) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(survey.status)}
              <Badge variant={getStatusVariant(survey.status)} className="text-xs">
                {survey.status || 'Draft'}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">{survey.title}</h1>
            <p className="text-slate-600 mt-1 max-w-2xl">{survey.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-xl">
            <Link href={`/creator/create?edit=${survey.id}`}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button 
            size="sm" 
            onClick={handleDownload}
            disabled={responses.length === 0}
            className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50/50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">{responses.length}</div>
                  <div className="text-sm text-slate-600">Total Responses</div>
                </div>
                <div className="text-center p-4 bg-slate-50/50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                  <div className="text-sm text-slate-600">Completion Rate</div>
                </div>
                <div className="text-center p-4 bg-slate-50/50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{avgDuration}s</div>
                  <div className="text-sm text-slate-600">Avg. Duration</div>
                </div>
                <div className="text-center p-4 bg-slate-50/50 rounded-xl">
                  <div className="text-2xl font-bold text-amber-600">{survey.estimatedTime || 5}m</div>
                  <div className="text-sm text-slate-600">Est. Time</div>
                </div>
              </div>

              {responses.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      {responses.slice(0, 5).map((response, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#013F5C] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {response.user?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {response.user?.name || 'Anonymous User'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {response.completed ? 'Completed' : 'In Progress'}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(response.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Survey Details */}
          <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Survey Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Created</label>
                  <div className="text-sm text-slate-600 mt-1">
                    {new Date(survey.createdAt || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Questions</label>
                  <div className="text-sm text-slate-600 mt-1">
                    {survey.questions?.length || 0} questions
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Target Audience</label>
                  <div className="text-sm text-slate-600 mt-1">
                    {survey.targetAudience || 'General public'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <div className="text-sm text-slate-600 mt-1">
                    {survey.category || 'General'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
                <Play className="h-4 w-4 mr-2" />
                Activate Survey
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
                <Pause className="h-4 w-4 mr-2" />
                Pause Survey
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
                <Settings className="h-4 w-4 mr-2" />
                Survey Settings
              </Button>
              <Separator />
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Delete Survey
              </Button>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Responses</span>
                </div>
                <span className="font-semibold text-slate-900">{responses.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Completion</span>
                </div>
                <span className="font-semibold text-slate-900">{completionRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Avg. Time</span>
                </div>
                <span className="font-semibold text-slate-900">{avgDuration}s</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Status</span>
                </div>
                <Badge variant={getStatusVariant(survey.status)} className="text-xs">
                  {survey.status || 'Draft'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
