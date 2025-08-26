"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { 
  ArrowLeft, 
  BarChart3, 
  Download, 
  RefreshCw,
  Users,
  Clock,
  TrendingUp,
  Target,
  MapPin,
  Calendar,
  Filter,
  FileText,
  Eye,
  Activity,
  CheckCircle2
} from "lucide-react"

interface AnalyticsData {
  surveyId: string
  title: string
  status: string
  responses: {
    total: number
    target: number
    todayCount: number
    weeklyTrend: number[]
  }
  demographics: {
    ageGroups: { range: string; count: number; percentage: number }[]
    gender: { type: string; count: number; percentage: number }[]
    locations: { state: string; count: number; percentage: number }[]
  }
  completion: {
    rate: number
    averageTime: string
    dropoffPoints: { question: number; dropoffRate: number }[]
  }
  realTimeStats: {
    activeNow: number
    lastUpdated: string
    responseRate: number
  }
}

export default function SurveyAnalyticsPage() {
  const params = useParams()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    // Mock analytics data - in real app, fetch from API
    const mockData: AnalyticsData = {
      surveyId: params.id as string,
      title: "Customer Satisfaction Survey 2025",
      status: "live",
      responses: {
        total: 247,
        target: 500,
        todayCount: 23,
        weeklyTrend: [15, 22, 18, 31, 28, 35, 23]
      },
      demographics: {
        ageGroups: [
          { range: "18-24", count: 62, percentage: 25.1 },
          { range: "25-34", count: 89, percentage: 36.0 },
          { range: "35-44", count: 54, percentage: 21.9 },
          { range: "45-54", count: 28, percentage: 11.3 },
          { range: "55+", count: 14, percentage: 5.7 }
        ],
        gender: [
          { type: "Female", count: 142, percentage: 57.5 },
          { type: "Male", count: 98, percentage: 39.7 },
          { type: "Other", count: 7, percentage: 2.8 }
        ],
        locations: [
          { state: "Lagos", count: 89, percentage: 36.0 },
          { state: "Abuja", count: 45, percentage: 18.2 },
          { state: "Kano", count: 32, percentage: 13.0 },
          { state: "Rivers", count: 28, percentage: 11.3 },
          { state: "Ogun", count: 25, percentage: 10.1 },
          { state: "Others", count: 28, percentage: 11.3 }
        ]
      },
      completion: {
        rate: 78.5,
        averageTime: "6m 32s",
        dropoffPoints: [
          { question: 3, dropoffRate: 8.2 },
          { question: 6, dropoffRate: 12.4 },
          { question: 8, dropoffRate: 6.1 }
        ]
      },
      realTimeStats: {
        activeNow: 12,
        lastUpdated: new Date().toISOString(),
        responseRate: 4.2
      }
    }

    setTimeout(() => {
      setAnalyticsData(mockData)
      setLoading(false)
    }, 1000)
  }, [params.id])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      // Simulate real-time updates
      setAnalyticsData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          responses: {
            ...prev.responses,
            total: prev.responses.total + Math.floor(Math.random() * 3),
            todayCount: prev.responses.todayCount + Math.floor(Math.random() * 2)
          },
          realTimeStats: {
            ...prev.realTimeStats,
            activeNow: Math.floor(Math.random() * 20) + 5,
            lastUpdated: new Date().toISOString()
          }
        }
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const handleDownload = async (format: string) => {
    setDownloading(format)
    
    try {
      // Simulate S3 download with proper progress tracking
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In real implementation, this would:
      // 1. Call API to generate signed S3 URL
      // 2. Stream download from S3 bucket
      // 3. Handle large file downloads with progress
      
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `survey-${params.id}-results-${timestamp}.${format}`
      
      // Generate comprehensive mock data based on format
      let content = ''
      let mimeType = ''
      
      if (format === 'csv') {
        content = [
          'response_id,submitted_at,age_group,gender,location,completion_time,question_1,question_2,question_3',
          '1,"2025-08-20T10:30:00Z","25-34","Female","Lagos","00:06:32","Very Satisfied","Daily","Yes"',
          '2,"2025-08-20T11:15:00Z","18-24","Male","Abuja","00:05:45","Satisfied","Weekly","No"',
          '3,"2025-08-20T12:00:00Z","35-44","Female","Kano","00:07:20","Very Satisfied","Daily","Yes"',
          // Add more sample rows...
          ...Array.from({length: analyticsData.responses.total - 3}, (_, i) => {
            const responseId = i + 4
            const ages = ["18-24", "25-34", "35-44", "45-54", "55+"]
            const genders = ["Male", "Female", "Other"]
            const locations = ["Lagos", "Abuja", "Kano", "Rivers", "Ogun"]
            const satisfaction = ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
            const frequency = ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
            const yesNo = ["Yes", "No"]
            
            return `${responseId},"2025-08-${Math.floor(Math.random() * 20) + 1}T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z","${ages[Math.floor(Math.random() * ages.length)]}","${genders[Math.floor(Math.random() * genders.length)]}","${locations[Math.floor(Math.random() * locations.length)]}","00:0${Math.floor(Math.random() * 9) + 3}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}","${satisfaction[Math.floor(Math.random() * satisfaction.length)]}","${frequency[Math.floor(Math.random() * frequency.length)]}","${yesNo[Math.floor(Math.random() * yesNo.length)]}"`
          })
        ].join('\n')
        mimeType = 'text/csv'
      } else if (format === 'json') {
        const responses = Array.from({length: analyticsData.responses.total}, (_, i) => ({
          response_id: i + 1,
          submitted_at: `2025-08-${Math.floor(Math.random() * 20) + 1}T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z`,
          demographics: {
            age_group: ["18-24", "25-34", "35-44", "45-54", "55+"][Math.floor(Math.random() * 5)],
            gender: ["Male", "Female", "Other"][Math.floor(Math.random() * 3)],
            location: ["Lagos", "Abuja", "Kano", "Rivers", "Ogun"][Math.floor(Math.random() * 5)]
          },
          completion_time: `00:0${Math.floor(Math.random() * 9) + 3}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          answers: {
            question_1: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"][Math.floor(Math.random() * 5)],
            question_2: ["Daily", "Weekly", "Monthly", "Rarely", "Never"][Math.floor(Math.random() * 5)],
            question_3: ["Yes", "No"][Math.floor(Math.random() * 2)]
          }
        }))
        
        content = JSON.stringify({
          survey_id: params.id,
          survey_title: analyticsData.title,
          export_date: new Date().toISOString(),
          total_responses: analyticsData.responses.total,
          export_format: "json",
          responses: responses
        }, null, 2)
        mimeType = 'application/json'
      } else if (format === 'xlsx') {
        // For Excel, we'll create a simple CSV-like structure
        content = 'Survey Results exported in Excel format would contain multiple sheets with detailed analysis'
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      } else if (format === 'pdf') {
        // Generate PDF report content
        content = `
SURVEY ANALYTICS REPORT
=======================

Survey: ${analyticsData.title}
Generated: ${new Date().toLocaleString()}
Survey ID: ${params.id}

EXECUTIVE SUMMARY
=================
• Total Responses: ${analyticsData.responses.total}
• Target Responses: ${analyticsData.responses.target}
• Completion Rate: ${analyticsData.completion.rate}%
• Average Response Time: ${analyticsData.completion.averageTime}

DEMOGRAPHIC BREAKDOWN
====================

Age Groups:
${analyticsData.demographics.ageGroups.map(group => 
  `• ${group.range}: ${group.count} responses (${group.percentage}%)`
).join('\n')}

Gender Distribution:
${analyticsData.demographics.gender.map(gender => 
  `• ${gender.type}: ${gender.count} responses (${gender.percentage}%)`
).join('\n')}

Geographic Distribution:
${analyticsData.demographics.locations.map(location => 
  `• ${location.state}: ${location.count} responses (${location.percentage}%)`
).join('\n')}

PERFORMANCE METRICS
==================
• Response Quality Score: 4.2/5
• Valid Responses: 92%
• Cost per Response: ₦12.50
• ROI: 156%

SMART INSIGHTS
==============
• Satisfaction Trend: 66.8% positive responses
• Geographic Pattern: Lagos shows 15% higher satisfaction
• Age Correlation: 25-34 demographic has highest engagement
• Recommendation: Focus marketing on Lagos and 25-34 age group

This report was generated automatically from your survey data.
        `
        mimeType = 'application/pdf'
      }
      
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Show success message
      console.log(`Downloaded ${filename} successfully`)
      
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading('')
    }
  }

  const refreshData = async () => {
    setLoading(true)
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Analytics Data</h2>
            <p className="text-slate-600 mb-4">Analytics data is not available for this survey.</p>
            <Button asChild>
              <Link href="/creator/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPercentage = (analyticsData.responses.total / analyticsData.responses.target) * 100

  return (
    <div>
      <div className="max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Survey Analytics</h1>
            <p className="text-slate-600 mt-1">{analyticsData.title}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-slate-400'}`}></div>
              <span className="text-sm text-slate-600">
                {autoRefresh ? 'Live' : 'Paused'}
              </span>
            </div>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant="outline"
              size="sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              {autoRefresh ? 'Pause' : 'Resume'} Live Updates
            </Button>
            <Button onClick={refreshData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Responses</p>
                  <p className="text-2xl font-bold text-slate-900">{analyticsData.responses.total}</p>
                  <p className="text-xs text-slate-500">of {analyticsData.responses.target} target</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Progress</p>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(progressPercentage)}%</p>
                  <Progress value={progressPercentage} className="h-1 mt-2" />
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Today</p>
                  <p className="text-2xl font-bold text-slate-900">{analyticsData.responses.todayCount}</p>
                  <p className="text-xs text-slate-500">responses</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Now</p>
                  <p className="text-2xl font-bold text-slate-900">{analyticsData.realTimeStats.activeNow}</p>
                  <p className="text-xs text-slate-500">taking survey</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{analyticsData.completion.rate}%</p>
                  <p className="text-xs text-slate-500">avg {analyticsData.completion.averageTime}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="responses">Responses</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Weekly Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Response Trend (Last 7 Days)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {analyticsData.responses.weeklyTrend.map((count, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                          <div 
                            className="bg-[#013f5c] rounded-t flex items-end justify-center text-white text-xs font-medium"
                            style={{ 
                              height: `${(count / Math.max(...analyticsData.responses.weeklyTrend)) * 200}px`,
                              minHeight: '20px'
                            }}
                          >
                            {count}
                          </div>
                          <span className="text-xs text-slate-500">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Completion Rate Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Completion Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Overall Completion Rate</span>
                        <span className="font-semibold">{analyticsData.completion.rate}%</span>
                      </div>
                      <Progress value={analyticsData.completion.rate} className="h-2" />
                      
                      <div className="grid sm:grid-cols-2 gap-4 pt-4">
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Drop-off Points</h4>
                          {analyticsData.completion.dropoffPoints.map((point, index) => (
                            <div key={index} className="flex justify-between text-sm mb-1">
                              <span>Question {point.question}</span>
                              <span className="text-red-600">{point.dropoffRate}% drop-off</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Performance Metrics</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Average Time</span>
                              <span>{analyticsData.completion.averageTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Response Rate</span>
                              <span>{analyticsData.realTimeStats.responseRate}/hour</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="demographics" className="space-y-6">
                {/* Age Groups */}
                <Card>
                  <CardHeader>
                    <CardTitle>Age Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.demographics.ageGroups.map((group, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <span className="w-16 text-sm font-medium">{group.range}</span>
                            <Progress value={group.percentage} className="h-2 flex-1" />
                          </div>
                          <div className="text-right min-w-[80px]">
                            <span className="text-sm font-semibold">{group.count}</span>
                            <span className="text-xs text-slate-500 ml-1">({group.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Gender Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gender Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.demographics.gender.map((gender, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <span className="w-16 text-sm font-medium">{gender.type}</span>
                            <Progress value={gender.percentage} className="h-2 flex-1" />
                          </div>
                          <div className="text-right min-w-[80px]">
                            <span className="text-sm font-semibold">{gender.count}</span>
                            <span className="text-xs text-slate-500 ml-1">({gender.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Location Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Geographic Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.demographics.locations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <span className="w-16 text-sm font-medium">{location.state}</span>
                            <Progress value={location.percentage} className="h-2 flex-1" />
                          </div>
                          <div className="text-right min-w-[80px]">
                            <span className="text-sm font-semibold">{location.count}</span>
                            <span className="text-xs text-slate-500 ml-1">({location.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="responses" className="space-y-6">
                {/* Response Patterns */}
                <Card>
                  <CardHeader>
                    <CardTitle>Response Patterns & Insights</CardTitle>
                    <p className="text-sm text-slate-600">AI-powered analysis of response patterns</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Answer Distribution */}
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Question 1: Overall Satisfaction</h4>
                        <div className="space-y-2">
                          {[
                            { answer: 'Very Satisfied', count: 89, percentage: 36.0, color: 'bg-green-500' },
                            { answer: 'Satisfied', count: 76, percentage: 30.8, color: 'bg-blue-500' },
                            { answer: 'Neutral', count: 45, percentage: 18.2, color: 'bg-yellow-500' },
                            { answer: 'Dissatisfied', count: 24, percentage: 9.7, color: 'bg-orange-500' },
                            { answer: 'Very Dissatisfied', count: 13, percentage: 5.3, color: 'bg-red-500' }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-24 text-sm font-medium">{item.answer}</div>
                              <div className="flex-1 flex items-center space-x-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                  <div 
                                    className={`${item.color} h-2 rounded-full`}
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-sm text-slate-600 w-16 text-right">
                                  {item.count} ({item.percentage}%)
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Insights */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Smart Insights
                        </h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          <p>• <strong>Satisfaction Trend:</strong> 66.8% positive responses indicate strong customer satisfaction</p>
                          <p>• <strong>Geographic Pattern:</strong> Lagos respondents show 15% higher satisfaction than average</p>
                          <p>• <strong>Age Correlation:</strong> 25-34 age group shows highest engagement with 89% completion rate</p>
                          <p>• <strong>Recommendation:</strong> Focus marketing efforts on Lagos region and 25-34 demographic</p>
                        </div>
                      </div>

                      {/* Response Quality Metrics */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900">4.2/5</div>
                          <div className="text-sm text-slate-600">Avg Response Quality</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900">92%</div>
                          <div className="text-sm text-slate-600">Valid Responses</div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900">8%</div>
                          <div className="text-sm text-slate-600">Skip Rate</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                {/* Performance Dashboard */}
                <Card>
                  <CardHeader>
                    <CardTitle>Survey Performance Analytics</CardTitle>
                    <p className="text-sm text-slate-600">Comprehensive performance metrics and optimization insights</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Key Performance Indicators */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 border border-slate-200 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">A+</div>
                          <div className="text-sm text-slate-600">Performance Grade</div>
                        </div>
                        <div className="text-center p-4 border border-slate-200 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900">89%</div>
                          <div className="text-sm text-slate-600">Quality Score</div>
                        </div>
                        <div className="text-center p-4 border border-slate-200 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900">₦12.50</div>
                          <div className="text-sm text-slate-600">Cost per Response</div>
                        </div>
                        <div className="text-center p-4 border border-slate-200 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900">156%</div>
                          <div className="text-sm text-slate-600">ROI</div>
                        </div>
                      </div>

                      {/* Response Time Analysis */}
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Response Time Distribution</h4>
                        <div className="space-y-2">
                          {[
                            { range: '0-3 minutes', count: 45, percentage: 18.2 },
                            { range: '3-6 minutes', count: 89, percentage: 36.0 },
                            { range: '6-9 minutes', count: 76, percentage: 30.8 },
                            { range: '9-12 minutes', count: 24, percentage: 9.7 },
                            { range: '12+ minutes', count: 13, percentage: 5.3 }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium w-24">{item.range}</span>
                              <div className="flex-1 mx-4">
                                <Progress value={item.percentage} className="h-2" />
                              </div>
                              <span className="text-sm text-slate-600 w-20 text-right">
                                {item.count} ({item.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Optimization Recommendations */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Optimization Recommendations
                        </h4>
                        <div className="space-y-2 text-sm text-green-800">
                          <p>• <strong>Question 3:</strong> Consider shortening - shows highest drop-off rate (12.4%)</p>
                          <p>• <strong>Target Audience:</strong> Expand to include 35-44 age group for better coverage</p>
                          <p>• <strong>Timing:</strong> Peak response times are 10-11 AM and 3-4 PM</p>
                          <p>• <strong>Incentives:</strong> Current reward amount is optimal for response quality</p>
                        </div>
                      </div>

                      {/* Comparative Analysis */}
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Comparative Performance</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>vs Industry Average</span>
                              <span className="text-green-600 font-medium">+23% better</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>vs Your Previous Surveys</span>
                              <span className="text-green-600 font-medium">+15% better</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>vs Similar Surveys</span>
                              <span className="text-green-600 font-medium">+8% better</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Response Quality</span>
                              <span className="text-blue-600 font-medium">Above Average</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Completion Rate</span>
                              <span className="text-blue-600 font-medium">Excellent</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Cost Efficiency</span>
                              <span className="text-blue-600 font-medium">High</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Download Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Export Results</span>
                </CardTitle>
                <p className="text-sm text-slate-600">Download your survey data in various formats</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleDownload('csv')}
                  disabled={downloading === 'csv'}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {downloading === 'csv' ? 'Preparing download...' : 'Download CSV'}
                  {downloading !== 'csv' && (
                    <Badge variant="secondary" className="ml-auto">
                      {(analyticsData.responses.total * 0.05).toFixed(1)}MB
                    </Badge>
                  )}
                </Button>
                
                <Button 
                  onClick={() => handleDownload('json')}
                  disabled={downloading === 'json'}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {downloading === 'json' ? 'Preparing download...' : 'Download JSON'}
                  {downloading !== 'json' && (
                    <Badge variant="secondary" className="ml-auto">
                      {(analyticsData.responses.total * 0.12).toFixed(1)}MB
                    </Badge>
                  )}
                </Button>
                
                <Button 
                  onClick={() => handleDownload('xlsx')}
                  disabled={downloading === 'xlsx'}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {downloading === 'xlsx' ? 'Preparing download...' : 'Download Excel'}
                  {downloading !== 'xlsx' && (
                    <Badge variant="secondary" className="ml-auto">
                      {(analyticsData.responses.total * 0.08).toFixed(1)}MB
                    </Badge>
                  )}
                </Button>

                <Separator className="my-3" />

                <Button 
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading === 'pdf'}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {downloading === 'pdf' ? 'Generating Report...' : 'Analytics Report (PDF)'}
                  {downloading !== 'pdf' && (
                    <Badge variant="secondary" className="ml-auto">
                      2.3MB
                    </Badge>
                  )}
                </Button>

                <div className="text-xs text-slate-500 mt-3 space-y-1">
                  <p className="flex items-center">
                    <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                    Data stored securely and encrypted
                  </p>
                  <p className="flex items-center">
                    <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                    Real-time data export available
                  </p>
                  <p className="flex items-center">
                    <CheckCircle2 className="h-3 w-3 text-green-600 mr-1" />
                    Download links expire in 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/creator/surveys/${params.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Survey Details
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/creator/surveys/${params.id}/preview`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Survey
                  </Link>
                </Button>
                
                <Button 
                  onClick={() => {
                    // Toggle advanced filters functionality
                    const filtersPanel = document.getElementById('advanced-filters')
                    if (filtersPanel) {
                      filtersPanel.style.display = filtersPanel.style.display === 'none' ? 'block' : 'none'
                    }
                  }}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
                
                <div id="advanced-filters" style={{display: 'none'}} className="mt-4 p-4 border rounded-lg bg-slate-50">
                  <h4 className="font-medium mb-3">Filter Options</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Date Range</label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Custom range</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Demographics</label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>All ages</option>
                        <option>18-24</option>
                        <option>25-34</option>
                        <option>35-44</option>
                      </select>
                    </div>
                    <Button size="sm" className="w-full">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Status */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analyticsData.status === 'live' ? 'Live' : analyticsData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Updated</span>
                    <span className="font-medium">
                      {new Date(analyticsData.realTimeStats.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Response Rate</span>
                    <span className="font-medium">{analyticsData.realTimeStats.responseRate}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Active Users</span>
                    <span className="font-medium">{analyticsData.realTimeStats.activeNow}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
