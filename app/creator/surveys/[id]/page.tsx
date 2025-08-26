"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { surveyStore, type Survey } from "@/lib/survey-store"
import { 
  ArrowLeft, 
  Eye, 
  Edit3, 
  Play, 
  Pause, 
  BarChart3,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Send,
  Download,
  Settings
} from "lucide-react"



export default function SurveyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [userCredits, setUserCredits] = useState(2500) // Mock user credits
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    const loadSurvey = () => {
      const foundSurvey = surveyStore.getById(params.id as string)
      if (foundSurvey) {
        // Convert survey store format to component format
        const convertedSurvey = {
          id: foundSurvey.id,
          title: foundSurvey.title,
          description: foundSurvey.description,
          status: foundSurvey.status as 'draft' | 'pending_approval' | 'approved' | 'live' | 'paused' | 'completed' | 'rejected',
          createdAt: foundSurvey.createdAt.toISOString().split('T')[0],
          targetResponses: foundSurvey.maxResponses,
          currentResponses: foundSurvey.responses,
          rewardPerResponse: foundSurvey.reward,
          totalBudget: foundSurvey.maxResponses * foundSurvey.reward,
          creditsRequired: foundSurvey.maxResponses * foundSurvey.reward,
          estimatedDuration: `${foundSurvey.estimatedTime} minutes`
        }
        setSurvey(convertedSurvey)
      }
      setLoading(false)
    }

    setTimeout(loadSurvey, 500)
  }, [params.id])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          color: 'bg-slate-100 text-slate-800',
          icon: <Edit3 className="h-4 w-4" />,
          message: 'Survey is in draft mode. Complete and submit for automated verification.'
        }
      case 'pending_approval':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="h-4 w-4" />,
          message: 'Survey submitted for automated system verification. This typically takes 2-5 minutes.'
        }
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle2 className="h-4 w-4" />,
          message: 'Survey passed all automated checks and is ready to launch!'
        }
      case 'live':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Play className="h-4 w-4" />,
          message: 'Survey is live and collecting responses from eligible fillers.'
        }
      case 'paused':
        return {
          color: 'bg-orange-100 text-orange-800',
          icon: <Pause className="h-4 w-4" />,
          message: 'Survey is temporarily paused. Resume to continue collecting responses.'
        }
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle2 className="h-4 w-4" />,
          message: 'Survey completed! All target responses collected.'
        }
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="h-4 w-4" />,
          message: 'Survey did not pass automated verification. Please review and resubmit.'
        }
      default:
        return {
          color: 'bg-slate-100 text-slate-800',
          icon: <AlertCircle className="h-4 w-4" />,
          message: 'Unknown status'
        }
    }
  }

  const handlePurchaseCredits = () => {
    router.push('/creator/billing/purchase-credits')
  }

  const handleSubmitForApproval = async () => {
    setLaunching(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (survey) {
      setSurvey({ ...survey, status: 'pending_approval' })
    }
    setLaunching(false)
  }

  const handleLaunchSurvey = async () => {
    setLaunching(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (survey) {
      setSurvey({ ...survey, status: 'live' })
      setUserCredits(prev => prev - survey.creditsRequired)
    }
    setLaunching(false)
  }

  const handlePauseSurvey = async () => {
    setLaunching(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (survey) {
      setSurvey({ ...survey, status: 'paused' })
    }
    setLaunching(false)
  }

  const handleResumeSurvey = async () => {
    setLaunching(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (survey) {
      setSurvey({ ...survey, status: 'live' })
    }
    setLaunching(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-48 bg-slate-200 rounded"></div>
              <div className="h-48 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Survey Not Found</h2>
            <p className="text-slate-600 mb-4">The survey you're looking for doesn't exist or has been deleted.</p>
            <Button asChild>
              <Link href="/creator/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(survey.status)
  const progressPercentage = (survey.currentResponses / survey.targetResponses) * 100
  const hasInsufficientCredits = userCredits < survey.creditsRequired

  return (
    <div>
      <div className="max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{survey.title}</h1>
            <p className="text-slate-600 mt-1">Created on {survey.createdAt}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={statusInfo.color}>
              {statusInfo.icon}
              <span className="ml-2 capitalize">{survey.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>

        {/* Status Message */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.color}`}>
                {statusInfo.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {survey.status === 'rejected' ? 'Survey Rejected' : 
                   survey.status === 'pending_approval' ? 'System Verification in Progress' :
                   survey.status === 'approved' ? 'Ready to Launch' :
                   survey.status === 'live' ? 'Survey Active' :
                   survey.status === 'completed' ? 'Survey Completed' :
                   'Draft Mode'}
                </h3>
                <p className="text-slate-600">
                  {survey.status === 'pending_approval' 
                    ? 'Your survey is being automatically verified by our system. This process typically takes 2-5 minutes.'
                    : statusInfo.message}
                </p>
                
                {survey.status === 'rejected' && survey.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">Rejection Reason:</p>
                    <p className="text-red-700 text-sm mt-1">{survey.rejectionReason}</p>
                  </div>
                )}
                
                {survey.status === 'approved' && survey.approvalNotes && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">System Verification Complete</p>
                    <p className="text-green-700 text-sm mt-1">Your survey passed all automated checks and is ready to launch!</p>
                    {survey.approvalNotes && (
                      <p className="text-green-700 text-sm mt-2">Admin Notes: {survey.approvalNotes}</p>
                    )}
                  </div>
                )}

                {survey.status === 'pending_approval' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium">Automated Verification in Progress</p>
                    <div className="text-blue-700 text-sm mt-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span>Checking content policy compliance</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span>Validating question quality and structure</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span>Verifying budget and credit allocation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span>Confirming target audience feasibility</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Survey Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Survey Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-600">{survey.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Target Responses</h4>
                    <p className="text-2xl font-bold text-slate-900">{survey.targetResponses.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Estimated Duration</h4>
                    <p className="text-2xl font-bold text-slate-900">{survey.estimatedDuration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress (only show if live or completed) */}
            {(survey.status === 'live' || survey.status === 'completed' || survey.status === 'paused') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Response Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{survey.currentResponses} / {survey.targetResponses} responses</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{survey.currentResponses}</p>
                        <p className="text-sm text-slate-600">Completed</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{Math.round(progressPercentage)}%</p>
                        <p className="text-sm text-slate-600">Progress</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{survey.targetResponses - survey.currentResponses}</p>
                        <p className="text-sm text-slate-600">Remaining</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="justify-start">
                    <Link href={`/creator/surveys/${survey.id}/edit`}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Survey
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="justify-start">
                    <Link href={`/creator/surveys/${survey.id}/preview`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Survey
                    </Link>
                  </Button>
                  
                  {/* Always allow access to analytics & export so direct slug URLs can show full analytics (even for drafts in the mock) */}
                  <>
                    <Button asChild variant="outline" className="justify-start">
                      <Link href={`/creator/surveys/${survey.id}/analytics`}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Link>
                    </Button>
                    
                    <Button variant="outline" className="justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Credits & Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Budget & Credits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Your Credits</span>
                    <span className="font-semibold">₦{userCredits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Required Credits</span>
                    <span className="font-semibold">₦{survey.creditsRequired.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Per Response</span>
                    <span className="font-semibold">₦{survey.rewardPerResponse}</span>
                  </div>
                </div>

                {hasInsufficientCredits && survey.status !== 'live' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-medium mb-2">Insufficient Credits</p>
                    <p className="text-red-700 text-xs mb-3">
                      You need ₦{(survey.creditsRequired - userCredits).toLocaleString()} more credits to launch this survey.
                    </p>
                    <Button onClick={handlePurchaseCredits} size="sm" className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase Credits
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Launch Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Launch Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Step 3.1 & 3.2: Submit for Automated Verification */}
                {survey.status === 'draft' && (
                  <Button 
                    onClick={handleSubmitForApproval}
                    disabled={launching}
                    className="w-full bg-[#013f5c] hover:bg-[#012a3d]"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {launching ? "Submitting..." : "Submit for Verification"}
                  </Button>
                )}

                {/* Step 3.3: Automated Verification in Progress */}
                {survey.status === 'pending_approval' && (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-slate-600 font-medium">System Verification in Progress...</p>
                    <p className="text-xs text-slate-500 mt-1">This typically takes 2-5 minutes</p>
                  </div>
                )}

                {/* Step 3.4: Launch Survey */}
                {survey.status === 'approved' && (
                  <Button 
                    onClick={handleLaunchSurvey}
                    disabled={launching || hasInsufficientCredits}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {launching ? "Launching..." : "Launch Survey"}
                  </Button>
                )}

                {/* Step 3.5: Survey Live Controls */}
                {survey.status === 'live' && (
                  <Button 
                    onClick={handlePauseSurvey}
                    disabled={launching}
                    variant="outline"
                    className="w-full"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    {launching ? "Pausing..." : "Pause Survey"}
                  </Button>
                )}

                {survey.status === 'paused' && (
                  <Button 
                    onClick={handleResumeSurvey}
                    disabled={launching}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {launching ? "Resuming..." : "Resume Survey"}
                  </Button>
                )}

                {survey.status === 'rejected' && (
                  <Button asChild className="w-full bg-[#013f5c] hover:bg-[#012a3d]">
                    <Link href={`/creator/surveys/${survey.id}/edit`}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit & Resubmit
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Status</span>
                  <Badge className={statusInfo.color} variant="secondary">
                    {survey.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Target</span>
                  <span className="font-semibold">{survey.targetResponses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Collected</span>
                  <span className="font-semibold">{survey.currentResponses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Budget</span>
                  <span className="font-semibold">₦{survey.totalBudget.toLocaleString()}</span>
                </div>
                
                {/* Analytics Access */}
                {/* Always show analytics access so creators can inspect analytics even for drafts in local/demo data */}
                <>
                  <Separator className="my-4" />
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/creator/surveys/${survey.id}/analytics`}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics & Results
                    </Link>
                  </Button>
                </>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
