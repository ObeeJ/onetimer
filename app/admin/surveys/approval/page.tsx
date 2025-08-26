"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  MessageCircle,
  Filter,
  Search,
  MoreHorizontal
} from "lucide-react"

interface PendingSurvey {
  id: string
  title: string
  description: string
  creatorName: string
  creatorEmail: string
  submittedAt: string
  targetResponses: number
  rewardPerResponse: number
  totalBudget: number
  estimatedDuration: string
  status: 'pending_approval'
  priority: 'low' | 'medium' | 'high'
  category: string
  flaggedReason?: string
}

export default function AdminSurveyApprovalPage() {
  const [pendingSurveys, setPendingSurveys] = useState<PendingSurvey[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<PendingSurvey | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    // Mock data for pending surveys
    const mockSurveys: PendingSurvey[] = [
      {
        id: 'survey-001',
        title: 'Customer Satisfaction Survey 2025',
        description: 'Understanding customer preferences and satisfaction levels for our new product line. This survey aims to gather insights about user experience, product quality, and areas for improvement.',
        creatorName: 'John Doe',
        creatorEmail: 'john@company.com',
        submittedAt: '2025-08-23T10:30:00Z',
        targetResponses: 500,
        rewardPerResponse: 200,
        totalBudget: 100000,
        estimatedDuration: '5-7 minutes',
        status: 'pending_approval',
        priority: 'high',
        category: 'Market Research'
      },
      {
        id: 'survey-002',
        title: 'Employee Feedback Survey',
        description: 'Annual employee satisfaction and workplace culture assessment',
        creatorName: 'Jane Smith',
        creatorEmail: 'jane@hr.com',
        submittedAt: '2025-08-23T09:15:00Z',
        targetResponses: 200,
        rewardPerResponse: 150,
        totalBudget: 30000,
        estimatedDuration: '3-5 minutes',
        status: 'pending_approval',
        priority: 'medium',
        category: 'HR & Employment'
      },
      {
        id: 'survey-003',
        title: 'Product Usage Study',
        description: 'Research on how users interact with our mobile application',
        creatorName: 'Mike Johnson',
        creatorEmail: 'mike@tech.com',
        submittedAt: '2025-08-23T08:45:00Z',
        targetResponses: 1000,
        rewardPerResponse: 100,
        totalBudget: 100000,
        estimatedDuration: '10-12 minutes',
        status: 'pending_approval',
        priority: 'low',
        category: 'Technology'
      }
    ]

    setPendingSurveys(mockSurveys)
    if (mockSurveys.length > 0) {
      setSelectedSurvey(mockSurveys[0])
    }
  }, [])

  const handleApprove = async () => {
    if (!selectedSurvey) return
    
    setProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Remove from pending list
    setPendingSurveys(prev => prev.filter(s => s.id !== selectedSurvey.id))
    setSelectedSurvey(null)
    setApprovalNotes('')
    setProcessing(false)
    
    alert('Survey approved successfully!')
  }

  const handleReject = async () => {
    if (!selectedSurvey || !rejectionReason.trim()) return
    
    setProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Remove from pending list
    setPendingSurveys(prev => prev.filter(s => s.id !== selectedSurvey.id))
    setSelectedSurvey(null)
    setRejectionReason('')
    setProcessing(false)
    
    alert('Survey rejected and creator notified.')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Survey Approval Dashboard</h1>
            <p className="text-slate-600 mt-1">Review and approve pending surveys</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="px-3 py-1">
              {pendingSurveys.length} Pending Review
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-slate-900">{pendingSurveys.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">High Priority</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {pendingSurveys.filter(s => s.priority === 'high').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Budget</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₦{pendingSurveys.reduce((sum, s) => sum + s.totalBudget, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Target Responses</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {pendingSurveys.reduce((sum, s) => sum + s.targetResponses, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Survey List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Pending Surveys</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {pendingSurveys.map((survey) => (
                    <div
                      key={survey.id}
                      onClick={() => setSelectedSurvey(survey)}
                      className={`p-4 cursor-pointer border-l-4 transition-colors ${
                        selectedSurvey?.id === survey.id
                          ? 'bg-blue-50 border-l-[#013f5c]'
                          : 'bg-white border-l-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {survey.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            by {survey.creatorName}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getPriorityColor(survey.priority)} variant="secondary">
                              {survey.priority}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {formatDate(survey.submittedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-slate-500 grid grid-cols-2 gap-2">
                        <span>₦{survey.totalBudget.toLocaleString()}</span>
                        <span>{survey.targetResponses} responses</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Survey Details & Approval */}
          <div className="lg:col-span-2 space-y-6">
            {selectedSurvey ? (
              <>
                {/* Survey Details */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedSurvey.title}</CardTitle>
                      <Badge className={getPriorityColor(selectedSurvey.priority)}>
                        {selectedSurvey.priority} priority
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>Created by: <strong>{selectedSurvey.creatorName}</strong> ({selectedSurvey.creatorEmail})</p>
                      <p>Submitted: {formatDate(selectedSurvey.submittedAt)}</p>
                      <p>Category: {selectedSurvey.category}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold">Description</Label>
                      <p className="mt-2 text-slate-700">{selectedSurvey.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-semibold">Survey Metrics</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Target Responses:</span>
                            <span className="font-medium">{selectedSurvey.targetResponses.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Estimated Duration:</span>
                            <span className="font-medium">{selectedSurvey.estimatedDuration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Category:</span>
                            <span className="font-medium">{selectedSurvey.category}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Budget Information</Label>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Reward per Response:</span>
                            <span className="font-medium">₦{selectedSurvey.rewardPerResponse}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Budget:</span>
                            <span className="font-medium">₦{selectedSurvey.totalBudget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Platform Fee (10%):</span>
                            <span className="font-medium">₦{(selectedSurvey.totalBudget * 0.1).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Survey
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Creator
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Verification & Approval */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Verification & Approval</CardTitle>
                    <p className="text-sm text-slate-600">
                      The system has automatically verified this survey. Review the checks below and approve.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Automated Verification Results */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-900">Automated Verification Results</h4>
                      
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium">Content Policy Compliance</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Passed</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium">Question Quality Check</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Passed</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium">Budget & Credit Validation</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Passed</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium">Target Audience Feasibility</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Passed</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium">Creator Account Verification</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Passed</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Admin Notes (Optional) */}
                    <div>
                      <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                      <Textarea
                        id="adminNotes"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add any additional notes for the creator..."
                        rows={3}
                      />
                    </div>

                    {/* Quick Approve Button */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-900">Ready for Approval</h4>
                          <p className="text-sm text-green-700">All system checks passed. Survey is ready to go live.</p>
                        </div>
                        <Button 
                          onClick={handleApprove}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                          size="lg"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {processing ? "Approving..." : "Approve Survey"}
                        </Button>
                      </div>
                    </div>

                    {/* Manual Override (if needed) */}
                    <details className="border border-slate-200 rounded-lg">
                      <summary className="p-3 cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Manual Override (Use only if needed)
                      </summary>
                      <div className="p-4 border-t border-slate-200 space-y-4">
                        <div>
                          <Label htmlFor="rejectionReason">Rejection Reason</Label>
                          <Textarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Only use if there's a specific issue the system couldn't detect..."
                            rows={3}
                          />
                        </div>
                        <Button 
                          onClick={handleReject}
                          disabled={processing || !rejectionReason.trim()}
                          variant="outline"
                          className="w-full border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {processing ? "Rejecting..." : "Manual Reject"}
                        </Button>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Survey Selected</h3>
                  <p className="text-slate-600">Select a survey from the list to review and approve</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
