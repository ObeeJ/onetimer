"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  MapPin,
  Star,
  Eye
} from "lucide-react"
import type { Survey, SurveyResponse, SurveyAnalytics } from "@/types/creator"

// Simple chart components (could be replaced with recharts in production)
interface SimpleBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  title?: string
}

function SimpleBarChart({ data, title }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-3">
      {title && <h4 className="font-medium text-slate-900">{title}</h4>}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#013F5C'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SimplePieChartProps {
  data: Array<{ label: string; value: number; color: string }>
  title?: string
}

function SimplePieChart({ data, title }: SimplePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="space-y-3">
      {title && <h4 className="font-medium text-slate-900">{title}</h4>}
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const offset = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0)
              const strokeDasharray = `${percentage} ${100 - percentage}`
              const strokeDashoffset = -offset
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="15.9"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              )
            })}
          </svg>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700">{item.label}</span>
            </div>
            <span className="font-medium">
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SurveyAnalyticsProps {
  survey: Survey
  analytics: SurveyAnalytics
  responses: SurveyResponse[]
  onExportData: (format: 'csv' | 'json') => Promise<void>
  onRefresh: () => Promise<void>
  loading?: boolean
}

export function SurveyAnalytics({ 
  survey, 
  analytics, 
  responses, 
  onExportData, 
  onRefresh,
  loading = false 
}: SurveyAnalyticsProps) {
  const [exportLoading, setExportLoading] = useState<'csv' | 'json' | null>(null)

  const handleExport = async (format: 'csv' | 'json') => {
    setExportLoading(format)
    try {
      await onExportData(format)
    } finally {
      setExportLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCompletionRate = () => {
    if (analytics.totalViews === 0) return 0
    return Math.round((analytics.completedResponses / analytics.totalViews) * 100)
  }

  // Process response data for charts
  const demographicsData = {
    gender: analytics.demographics.gender.map(g => ({
      label: g.value.charAt(0).toUpperCase() + g.value.slice(1),
      value: g.count,
      color: g.value === 'male' ? '#3B82F6' : g.value === 'female' ? '#EC4899' : '#8B5CF6'
    })),
    ageRange: analytics.demographics.ageRange.map(a => ({
      label: a.value,
      value: a.count,
      color: '#013F5C'
    })),
    location: analytics.demographics.location.slice(0, 5).map((l, i) => ({
      label: l.value,
      value: l.count,
      color: `hsl(${200 + i * 30}, 70%, 50%)`
    }))
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-[#013F5C]" />
                Survey Analytics
              </CardTitle>
              <p className="text-slate-600 mt-1">{survey.title}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(survey.status)} border`}>
                {survey.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {survey.status === 'paused' && <Clock className="h-3 w-3 mr-1" />}
                {survey.status === 'draft' && <AlertCircle className="h-3 w-3 mr-1" />}
                {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="rounded-lg"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">
                {analytics.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700 flex items-center justify-center gap-1">
                <Eye className="h-3 w-3" />
                Total Views
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-900">
                {analytics.completedResponses.toLocaleString()}
              </div>
              <div className="text-sm text-green-700 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-900">
                {getCompletionRate()}%
              </div>
              <div className="text-sm text-purple-700 flex items-center justify-center gap-1">
                <Target className="h-3 w-3" />
                Completion Rate
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="text-2xl font-bold text-orange-900">
                {analytics.averageRating ? analytics.averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-orange-700 flex items-center justify-center gap-1">
                <Star className="h-3 w-3" />
                Avg. Rating
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="responses" className="rounded-lg">Responses</TabsTrigger>
          <TabsTrigger value="demographics" className="rounded-lg">Demographics</TabsTrigger>
          <TabsTrigger value="export" className="rounded-lg">Export Data</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Timeline */}
            <Card className="rounded-xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Response Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={analytics.responseTimeline.map(t => ({
                    label: new Date(t.date).toLocaleDateString(),
                    value: t.count
                  }))}
                />
              </CardContent>
            </Card>

            {/* Question Performance */}
            <Card className="rounded-xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Question Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {survey.questions.map((question, index) => {
                    const responseCount = analytics.questionStats.find(
                      q => q.questionId === question.id
                    )?.responseCount || 0
                    
                    return (
                      <div key={question.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-700 truncate">
                            Q{index + 1}: {question.text}
                          </span>
                          <span className="font-medium">{responseCount} responses</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-[#013F5C] transition-all duration-300"
                            style={{
                              width: `${analytics.completedResponses > 0 
                                ? (responseCount / analytics.completedResponses) * 100 
                                : 0}%`
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-6">
          <Card className="rounded-xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responses.slice(0, 10).map((response) => (
                  <div 
                    key={response.id} 
                    className="border border-slate-200 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-slate-900">
                          Response #{response.id.slice(-8)}
                        </div>
                        <div className="text-sm text-slate-600">
                          {new Date(response.submittedAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge 
                        variant={response.isComplete ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {response.isComplete ? 'Complete' : 'Partial'}
                      </Badge>
                    </div>
                    
                    {response.demographics && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {response.demographics.gender && (
                          <Badge variant="outline" className="text-xs">
                            {response.demographics.gender}
                          </Badge>
                        )}
                        {response.demographics.ageRange && (
                          <Badge variant="outline" className="text-xs">
                            {response.demographics.ageRange}
                          </Badge>
                        )}
                        {response.demographics.location && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-2 w-2 mr-1" />
                            {response.demographics.location}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {responses.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No responses yet</p>
                    <p className="text-sm">Share your survey to start collecting responses</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gender Distribution */}
            <Card className="rounded-xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <SimplePieChart data={demographicsData.gender} />
              </CardContent>
            </Card>

            {/* Age Distribution */}
            <Card className="rounded-xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Age Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={demographicsData.ageRange} />
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card className="rounded-xl border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={demographicsData.location}
                  title="Top 5 States"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card className="rounded-xl border-slate-200/60">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Export Survey Data</CardTitle>
              <p className="text-sm text-slate-600">
                Download your survey responses and analytics data
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CSV Export */}
                <div className="border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900">CSV Format</h3>
                    <p className="text-sm text-slate-600">
                      Download responses in CSV format for analysis in Excel, Google Sheets, or other tools.
                    </p>
                  </div>
                  
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• All response data</li>
                    <li>• Demographics information</li>
                    <li>• Timestamps and metadata</li>
                    <li>• Compatible with Excel</li>
                  </ul>
                  
                  <Button
                    onClick={() => handleExport('csv')}
                    disabled={exportLoading === 'csv' || responses.length === 0}
                    className="w-full rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
                  >
                    {exportLoading === 'csv' ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Preparing CSV...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </>
                    )}
                  </Button>
                </div>

                {/* JSON Export */}
                <div className="border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900">JSON Format</h3>
                    <p className="text-sm text-slate-600">
                      Download structured data in JSON format for programmatic analysis and processing.
                    </p>
                  </div>
                  
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Complete response structure</li>
                    <li>• Analytics metadata</li>
                    <li>• Question mapping</li>
                    <li>• Developer-friendly format</li>
                  </ul>
                  
                  <Button
                    onClick={() => handleExport('json')}
                    disabled={exportLoading === 'json' || responses.length === 0}
                    variant="outline"
                    className="w-full rounded-xl"
                  >
                    {exportLoading === 'json' ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Preparing JSON...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download JSON
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {responses.length === 0 && (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No data to export</p>
                  <p className="text-sm">Collect some responses first to export data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
