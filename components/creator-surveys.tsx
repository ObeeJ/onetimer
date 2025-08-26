"use client"

import React, { useState } from "react"
import { SurveyPreview } from "@/components/creator/survey-preview"
import { Survey } from "@/types/creator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { Modal } from "@/components/ui/modal"
import { 
  PlusCircle, 
  Eye, 
  BarChart3, 
  Edit3, 
  Play, 
  Pause, 
  Clock,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react"
import Link from "next/link"

// Mock surveys for demo
const mockSurveys: Survey[] = [
  {
    id: "survey-1",
    creatorId: "creator-1",
    title: "Customer Satisfaction Survey",
    description: "Help us improve our product by sharing your feedback.",
    category: "customer_feedback",
    targetDemographics: {},
    questions: [
      {
        id: "q1",
        type: "single_choice",
        text: "How satisfied are you with our product?",
        description: "Please rate your overall satisfaction",
        required: true,
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
      },
      {
        id: "q2",
        type: "textarea",
        text: "What can we improve?",
        description: "Please share your suggestions",
        required: false
      },
      {
        id: "q3",
        type: "rating",
        text: "Rate our customer service",
        required: true,
        scaleMin: 1,
        scaleMax: 5
      }
    ],
    rewardPerCompletion: 10,
    totalBudget: 1000,
    estimatedTime: 5,
    maxResponses: 100,
    status: "live",
    createdAt: new Date().toISOString(),
    launchedAt: new Date().toISOString(),
    responses: { total: 50, completed: 45, inProgress: 5 },
    analytics: { completionRate: 90, avgDuration: 3, demographics: {} },
  },
  {
    id: "survey-2",
    creatorId: "creator-1",
    title: "Product Feature Feedback",
    description: "Share your thoughts on our new features and help us prioritize development.",
    category: "product_feedback",
    targetDemographics: {},
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "Which features do you use most?",
        required: true,
        options: ["Dashboard", "Analytics", "Reports", "Settings", "Mobile App"]
      }
    ],
    rewardPerCompletion: 15,
    totalBudget: 750,
    estimatedTime: 3,
    maxResponses: 50,
    status: "draft",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    responses: { total: 0, completed: 0, inProgress: 0 },
    analytics: { completionRate: 0, avgDuration: 0, demographics: {} },
  },
  {
    id: "survey-3",
    creatorId: "creator-1",
    title: "User Experience Research",
    description: "Help us understand how you interact with our platform.",
    category: "user_research",
    targetDemographics: {},
    questions: [
      {
        id: "q1",
        type: "rating",
        text: "How easy is it to navigate our platform?",
        required: true,
        scaleMin: 1,
        scaleMax: 10
      }
    ],
    rewardPerCompletion: 20,
    totalBudget: 2000,
    estimatedTime: 7,
    maxResponses: 100,
    status: "completed",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    launchedAt: new Date(Date.now() - 86400000).toISOString(),
    responses: { total: 100, completed: 100, inProgress: 0 },
    analytics: { completionRate: 95, avgDuration: 6, demographics: {} },
  }
]

export function CreatorSurveys() {
  const [surveys] = useState<Survey[]>(mockSurveys)
  const [showPreview, setShowPreview] = useState<Survey | null>(null)
  const [filter, setFilter] = useState<'all' | 'draft' | 'live' | 'completed'>('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800 border-green-200'
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Play className="h-3 w-3" />
      case 'draft': return <FileText className="h-3 w-3" />
      case 'completed': return <CheckCircle2 className="h-3 w-3" />
      case 'paused': return <Pause className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }

  const filteredSurveys = filter === 'all' ? surveys : surveys.filter(s => s.status === filter)

  return (
    <div>
      <PageHeader 
        title="My Surveys" 
        description="Manage and track all your surveys in one place."
      >
        <Link href="/creator/surveys/create">
          <Button className="bg-[#013f5c] hover:bg-[#0b577a]">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Survey
          </Button>
        </Link>
      </PageHeader>
      
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All Surveys' },
            { key: 'draft', label: 'Drafts' },
            { key: 'live', label: 'Live' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-white text-[#013f5c] shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Surveys Grid */}
        {filteredSurveys.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {filter === 'all' ? 'No surveys yet' : `No ${filter} surveys`}
              </h3>
              <p className="text-slate-600 mb-4">
                {filter === 'all' 
                  ? 'Create your first survey to start collecting responses.' 
                  : `You don't have any ${filter} surveys at the moment.`
                }
              </p>
              {filter === 'all' && (
                <Link href="/creator/surveys/create">
                  <Button className="bg-[#013f5c] hover:bg-[#0b577a]">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Survey
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredSurveys.map((survey) => (
              <Card key={survey.id} className="group hover:shadow-md transition-all duration-200 border hover:border-[#013f5c]/20">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl text-slate-900 group-hover:text-[#013f5c] transition-colors">
                          {survey.title}
                        </CardTitle>
                        <Badge className={`${getStatusColor(survey.status)} flex items-center gap-1`}>
                          {getStatusIcon(survey.status)}
                          {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {survey.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">Responses:</span>
                      <span className="font-semibold">{survey.responses.completed}/{survey.maxResponses}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">Reward:</span>
                      <span className="font-semibold">₦{survey.rewardPerCompletion}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">Duration:</span>
                      <span className="font-semibold">~{survey.estimatedTime}m</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">Completion:</span>
                      <span className="font-semibold">{survey.analytics.completionRate}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {survey.status === 'live' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Progress</span>
                        <span>{Math.round((survey.responses.completed / survey.maxResponses) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-[#013f5c] transition-all duration-300"
                          style={{ width: `${(survey.responses.completed / survey.maxResponses) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    {survey.status !== 'draft' && (
                      <Link href={`/creator/surveys/${survey.id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowPreview(survey)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    
                    {survey.status !== 'draft' && (
                      <Link href={`/creator/surveys/${survey.id}/analytics`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </Link>
                    )}
                    
                    {survey.status === 'draft' && (
                      <Link href={`/creator/surveys/${survey.id}/edit`}>
                        <Button size="sm" className="bg-[#013f5c] hover:bg-[#0b577a] flex-1">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Survey Preview Modal */}
        {showPreview && (
          <Modal
            isOpen={!!showPreview}
            onClose={() => setShowPreview(null)}
            title="Survey Preview"
            size="xl"
          >
            <SurveyPreview survey={showPreview} onClose={() => setShowPreview(null)} />
          </Modal>
        )}
      </div>
    </div>
  )
}

export default CreatorSurveys
