"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  Users, 
  Clock, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  FileText,
  Database,
  Eye,
  AlertCircle
} from "lucide-react"
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart as RechartsPieChart, 
  Cell, 
  LineChart, 
  Line,
  Legend,
  Pie
} from 'recharts'
import type { Survey, SurveyResponse } from "@/types/creator"

interface SurveyAnalyticsProps {
  survey: Survey
  onExportData: (format: 'csv' | 'json') => Promise<void>
  onRefresh: () => Promise<void>
  refreshing?: boolean
}

// Mock data for demonstration
const generateMockData = () => {
  const dailyResponses = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    responses: Math.floor(Math.random() * 50) + 10,
    completions: Math.floor(Math.random() * 40) + 5
  }))

  const demographics = [
    { name: '18-24', value: 25, color: '#013F5C' },
    { name: '25-34', value: 35, color: '#0b577a' },
    { name: '35-44', value: 20, color: '#166ba3' },
    { name: '45-54', value: 15, color: '#2180cc' },
    { name: '55+', value: 5, color: '#4d9ae8' }
  ]

  const locations = [
    { name: 'Lagos', responses: 120, percentage: 35 },
    { name: 'Abuja', responses: 85, percentage: 25 },
    { name: 'Kano', responses: 65, percentage: 19 },
    { name: 'Rivers', responses: 45, percentage: 13 },
    { name: 'Others', responses: 28, percentage: 8 }
  ]

  const questionPerformance = [
    { question: 'Q1: Brand Awareness', completion: 98, avgTime: 15 },
    { question: 'Q2: Product Usage', completion: 96, avgTime: 22 },
    { question: 'Q3: Satisfaction', completion: 94, avgTime: 18 },
    { question: 'Q4: Recommendation', completion: 91, avgTime: 25 },
    { question: 'Q5: Demographics', completion: 89, avgTime: 30 }
  ]

  return { dailyResponses, demographics, locations, questionPerformance }
}

export function SurveyAnalytics({ 
  survey, 
  onExportData, 
  onRefresh, 
  refreshing = false 
}: SurveyAnalyticsProps) {
  const [data, setData] = useState(generateMockData())
  const [isExporting, setIsExporting] = useState<'csv' | 'json' | null>(null)

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(format)
    try {
      await onExportData(format)
    } finally {
      setIsExporting(null)
    }
  }

  const totalResponses = 343
  const completionRate = 87
  const avgCompletionTime = "4m 32s"
  const dropOffRate = 13

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border-slate-200/60 bg-white/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Responses</p>
                <p className="text-2xl font-bold text-slate-900">{totalResponses}</p>
              </div>
              <div className="h-12 w-12 bg-[#013F5C]/10 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-[#013F5C]" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+12% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200/60 bg-white/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold text-slate-900">{completionRate}%</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200/60 bg-white/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Time</p>
                <p className="text-2xl font-bold text-slate-900">{avgCompletionTime}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-slate-600">Target: 5m</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200/60 bg-white/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Drop-off Rate</p>
                <p className="text-2xl font-bold text-slate-900">{dropOffRate}%</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-orange-600">Industry avg: 15%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Survey Analytics</h2>
          <p className="text-slate-600">Real-time insights and data export</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={onRefresh}
            disabled={refreshing}
            variant="outline"
            className="rounded-xl"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          
          <Button
            onClick={() => handleExport('csv')}
            disabled={isExporting === 'csv'}
            variant="outline"
            className="rounded-xl"
          >
            {isExporting === 'csv' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
          
          <Button
            onClick={() => handleExport('json')}
            disabled={isExporting === 'json'}
            className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
          >
            {isExporting === 'json' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Export JSON
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Timeline */}
            <Card className="rounded-xl border-slate-200/60 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Response Timeline (7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.dailyResponses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="responses" fill="#013F5C" name="Started" />
                    <Bar dataKey="completions" fill="#2180cc" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Age Distribution */}
            <Card className="rounded-xl border-slate-200/60 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Age Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={data.demographics}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {data.demographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Distribution */}
            <Card className="rounded-xl border-slate-200/60 bg-white/80">
              <CardHeader>
                <CardTitle>Response by Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.locations.map((location, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{location.name}</span>
                      <span className="text-sm text-slate-600">{location.responses} responses</span>
                    </div>
                    <Progress value={location.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Demographics Summary */}
            <Card className="rounded-xl border-slate-200/60 bg-white/80">
              <CardHeader>
                <CardTitle>Demographics Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#013F5C]">64%</p>
                    <p className="text-sm text-slate-600">Female</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#013F5C]">36%</p>
                    <p className="text-sm text-slate-600">Male</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#013F5C]">78%</p>
                    <p className="text-sm text-slate-600">Urban</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#013F5C]">22%</p>
                    <p className="text-sm text-slate-600">Rural</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card className="rounded-xl border-slate-200/60 bg-white/80">
            <CardHeader>
              <CardTitle>Question Performance</CardTitle>
              <p className="text-slate-600">Completion rates and average time per question</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.questionPerformance.map((q, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">{q.question}</h4>
                      <Badge variant={q.completion >= 95 ? "default" : q.completion >= 90 ? "secondary" : "destructive"}>
                        {q.completion}% complete
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                      <div>
                        <span>Completion: </span>
                        <Progress value={q.completion} className="h-2 mt-1" />
                      </div>
                      <div>
                        <span>Avg. Time: {q.avgTime}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card className="rounded-xl border-slate-200/60 bg-white/80">
            <CardHeader>
              <CardTitle>Response Timeline</CardTitle>
              <p className="text-slate-600">Detailed view of responses over time</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.dailyResponses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="responses" 
                    stroke="#013F5C" 
                    strokeWidth={3}
                    name="Responses Started"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completions" 
                    stroke="#2180cc" 
                    strokeWidth={3}
                    name="Responses Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
