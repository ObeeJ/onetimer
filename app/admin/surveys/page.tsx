"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Target,
  Clock,
  BarChart3,
  Settings
} from "lucide-react"

interface Survey {
  id: string
  title: string
  description: string
  creator: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected' | 'live' | 'paused' | 'completed'
  targetResponses: number
  currentResponses: number
  rewardPerResponse: number
  totalBudget: number
  category: string
  estimatedTime: number
  demographic: {
    ageRange: string
    gender: string
    location: string
    interests?: string[]
  }
  questions: {
    id: string
    type: string
    question: string
    options?: string[]
    required: boolean
  }[]
  compliance: {
    ethicalReview: boolean
    dataPrivacy: boolean
    appropriateContent: boolean
    targetingCompliance: boolean
  }
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  priority: 'high' | 'medium' | 'low'
}

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("pending")
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    // Simulate API call to load surveys
    const timer = setTimeout(() => {
      setSurveys([
        {
          id: 'survey-001',
          title: 'Consumer Technology Preferences Survey 2025',
          description: 'Understanding consumer preferences and buying patterns in technology products for market research purposes.',
          creator: 'TechCorp Research Ltd',
          createdAt: '2025-01-22 14:30',
          status: 'pending',
          targetResponses: 1000,
          currentResponses: 0,
          rewardPerResponse: 500,
          totalBudget: 500000,
          category: 'Market Research',
          estimatedTime: 12,
          demographic: {
            ageRange: '18-65',
            gender: 'All',
            location: 'Nigeria',
            interests: ['Technology', 'Electronics', 'Gadgets']
          },
          questions: [
            {
              id: 'q1',
              type: 'multiple_choice',
              question: 'What is your primary smartphone brand?',
              options: ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Other'],
              required: true
            },
            {
              id: 'q2',
              type: 'rating',
              question: 'How important is battery life in your smartphone choice?',
              required: true
            },
            {
              id: 'q3',
              type: 'text',
              question: 'What features would you like to see in future smartphones?',
              required: false
            }
          ],
          compliance: {
            ethicalReview: true,
            dataPrivacy: true,
            appropriateContent: true,
            targetingCompliance: true
          },
          priority: 'high'
        },
        {
          id: 'survey-002',
          title: 'Employee Satisfaction Study',
          description: 'Annual employee satisfaction survey for workplace improvement initiatives.',
          creator: 'HR Solutions Nigeria',
          createdAt: '2025-01-21 09:15',
          status: 'approved',
          targetResponses: 500,
          currentResponses: 247,
          rewardPerResponse: 300,
          totalBudget: 150000,
          category: 'HR & Workplace',
          estimatedTime: 8,
          demographic: {
            ageRange: '22-60',
            gender: 'All',
            location: 'Lagos, Abuja'
          },
          questions: [
            {
              id: 'q1',
              type: 'rating',
              question: 'How satisfied are you with your current workplace?',
              required: true
            }
          ],
          compliance: {
            ethicalReview: true,
            dataPrivacy: true,
            appropriateContent: true,
            targetingCompliance: true
          },
          reviewedBy: 'admin@onetimesurvey.com',
          reviewedAt: '2025-01-21 11:30',
          priority: 'medium'
        },
        {
          id: 'survey-003',
          title: 'Political Opinion Poll',
          description: 'Gathering public opinion on current political affairs and candidate preferences.',
          creator: 'Political Research Institute',
          createdAt: '2025-01-20 16:45',
          status: 'rejected',
          targetResponses: 2000,
          currentResponses: 0,
          rewardPerResponse: 400,
          totalBudget: 800000,
          category: 'Politics',
          estimatedTime: 15,
          demographic: {
            ageRange: '18+',
            gender: 'All',
            location: 'Nigeria'
          },
          questions: [
            {
              id: 'q1',
              type: 'multiple_choice',
              question: 'Which political party do you support?',
              options: ['APC', 'PDP', 'LP', 'NNPP', 'Other'],
              required: true
            }
          ],
          compliance: {
            ethicalReview: false,
            dataPrivacy: true,
            appropriateContent: false,
            targetingCompliance: true
          },
          reviewNotes: 'Political content requires additional compliance review. Survey may influence electoral process.',
          reviewedBy: 'admin@onetimesurvey.com',
          reviewedAt: '2025-01-20 18:00',
          priority: 'high'
        },
        {
          id: 'survey-004',
          title: 'Food Delivery Service Feedback',
          description: 'Customer feedback survey for food delivery service improvement.',
          creator: 'QuickEats Nigeria',
          createdAt: '2025-01-19 13:20',
          status: 'live',
          targetResponses: 800,
          currentResponses: 456,
          rewardPerResponse: 200,
          totalBudget: 160000,
          category: 'Customer Service',
          estimatedTime: 5,
          demographic: {
            ageRange: '18-50',
            gender: 'All',
            location: 'Lagos, Port Harcourt, Abuja'
          },
          questions: [
            {
              id: 'q1',
              type: 'rating',
              question: 'How would you rate our delivery speed?',
              required: true
            }
          ],
          compliance: {
            ethicalReview: true,
            dataPrivacy: true,
            appropriateContent: true,
            targetingCompliance: true
          },
          reviewedBy: 'admin@onetimesurvey.com',
          reviewedAt: '2025-01-19 15:45',
          priority: 'low'
        }
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'live':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      case 'paused':
        return 'outline'
      case 'completed':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleSurveyAction = (surveyId: string, action: 'approve' | 'reject' | 'pause' | 'resume', notes?: string) => {
    setSurveys(prev => prev.map(survey => 
      survey.id === surveyId 
        ? { 
            ...survey, 
            status: action === 'approve' ? 'approved' : 
                   action === 'reject' ? 'rejected' :
                   action === 'pause' ? 'paused' : 'live',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'admin@onetimesurvey.com',
            reviewNotes: notes
          }
        : survey
    ))
    setReviewDialog(false)
    setReviewNotes("")
    setSelectedSurvey(null)
  }

  const openReviewDialog = (survey: Survey, action: 'approve' | 'reject') => {
    setSelectedSurvey(survey)
    setReviewAction(action)
    setReviewDialog(true)
  }

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedTab === 'all') return matchesSearch
    if (selectedTab === 'pending') return matchesSearch && survey.status === 'pending'
    if (selectedTab === 'approved') return matchesSearch && survey.status === 'approved'
    if (selectedTab === 'live') return matchesSearch && survey.status === 'live'
    if (selectedTab === 'rejected') return matchesSearch && survey.status === 'rejected'
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-64"></div>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Survey Management</h1>
          <p className="text-slate-600">Review and manage survey submissions, approvals, and live surveys</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {surveys.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Live Surveys</p>
                <p className="text-2xl font-bold text-green-900">
                  {surveys.filter(s => s.status === 'live').length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Approved</p>
                <p className="text-2xl font-bold text-blue-900">
                  {surveys.filter(s => s.status === 'approved' || s.status === 'live' || s.status === 'completed').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-900">
                  {surveys.filter(s => s.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search surveys by title, creator, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Surveys ({surveys.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({surveys.filter(s => s.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({surveys.filter(s => s.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="live">Live ({surveys.filter(s => s.status === 'live').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({surveys.filter(s => s.status === 'rejected').length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({surveys.filter(s => s.status === 'paused').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <div className="space-y-4">
            {filteredSurveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-slate-900 text-lg">{survey.title}</h3>
                        <Badge variant={getStatusColor(survey.status) as any}>
                          {survey.status}
                        </Badge>
                        <Badge variant={getPriorityColor(survey.priority) as any}>
                          {survey.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-slate-600 mb-4">{survey.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {survey.creator}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {survey.currentResponses}/{survey.targetResponses} responses
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            ₦{survey.rewardPerResponse}/response
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {survey.estimatedTime} min
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Category: {survey.category}</span>
                        <span>Created: {survey.createdAt}</span>
                        {survey.reviewedAt && (
                          <span>Reviewed: {survey.reviewedAt}</span>
                        )}
                      </div>

                      {survey.reviewNotes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600">
                            <strong>Review Notes:</strong> {survey.reviewNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/surveys/${survey.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {survey.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => openReviewDialog(survey, 'approve')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => openReviewDialog(survey, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {survey.status === 'live' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSurveyAction(survey.id, 'pause')}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      
                      {survey.status === 'paused' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSurveyAction(survey.id, 'resume')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Survey' : 'Reject Survey'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? 'Are you sure you want to approve this survey? It will be made available to survey fillers.'
                : 'Please provide a reason for rejecting this survey. The creator will be notified.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedSurvey && (
            <div className="py-4">
              <h4 className="font-medium mb-2">{selectedSurvey.title}</h4>
              <p className="text-sm text-slate-600 mb-4">by {selectedSurvey.creator}</p>
              
              {reviewAction === 'reject' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason</label>
                  <Textarea
                    placeholder="Explain why this survey is being rejected..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              onClick={() => selectedSurvey && handleSurveyAction(
                selectedSurvey.id, 
                reviewAction!, 
                reviewNotes || undefined
              )}
            >
              {reviewAction === 'approve' ? 'Approve Survey' : 'Reject Survey'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
