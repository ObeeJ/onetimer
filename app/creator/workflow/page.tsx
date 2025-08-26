"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Download,
  TrendingUp,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign
} from "lucide-react"

// Import our modular components
import { PaymentSetupForm, CreditsPurchase } from "@/components/creator/payment-setup"
import SurveyBuilder from "@/components/creator/survey-builder"
import { DemographicsTargeting } from "@/components/creator/demographics-targeting"
import { SurveyAnalytics } from "@/components/creator/survey-analytics"
import { SurveyPreview } from "@/components/creator/survey-preview"
import { LaunchingSurvey } from "@/components/creator/survey-launching"
import { useCreatorAuth } from "@/hooks/use-creator-auth"
import { useToast } from "@/hooks/use-toast"

import type { 
  Survey, 
  SurveyResponse, 
  SurveyAnalytics as SurveyAnalyticsType,
  PaymentSetup,
  DemographicsTarget 
} from "@/types/creator"

// Mock data for demonstration
const mockSurveys: Survey[] = [
  {
    id: "survey-1",
    title: "Customer Satisfaction Survey",
    description: "Understanding customer experience with our product",
    category: "customer_feedback",
    status: "active",
    questions: [
      {
        id: "q1",
        type: "rating",
        text: "How satisfied are you with our product?",
        required: true,
        order: 1,
        scaleMin: 1,
        scaleMax: 5
      },
      {
        id: "q2",
        type: "single_choice",
        text: "How likely are you to recommend us?",
        required: true,
        order: 2,
        options: ["Very likely", "Likely", "Neutral", "Unlikely", "Very unlikely"]
      }
    ],
    demographics: {
      gender: ["male", "female"],
      ageRange: ["25-34", "35-44"],
      location: ["Lagos", "Abuja"],
      interests: ["technology", "business"]
    },
    creditsPerResponse: 10,
    maxResponses: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockAnalytics: SurveyAnalyticsType = {
  totalViews: 245,
  completedResponses: 187,
  responseTimeline: [
    { date: new Date().toISOString(), count: 15 },
    { date: new Date(Date.now() - 86400000).toISOString(), count: 23 },
    { date: new Date(Date.now() - 172800000).toISOString(), count: 18 }
  ],
  demographics: {
    gender: [
      { value: "male", count: 89 },
      { value: "female", count: 98 }
    ],
    ageRange: [
      { value: "25-34", count: 67 },
      { value: "35-44", count: 45 },
      { value: "18-24", count: 32 },
      { value: "45-54", count: 28 },
      { value: "55-64", count: 15 }
    ],
    location: [
      { value: "Lagos", count: 89 },
      { value: "Abuja", count: 45 },
      { value: "Kano", count: 23 },
      { value: "Port Harcourt", count: 19 },
      { value: "Ibadan", count: 11 }
    ]
  },
  questionStats: [
    { questionId: "q1", responseCount: 187, averageRating: 4.2 },
    { questionId: "q2", responseCount: 187 }
  ],
  averageRating: 4.2
}

export default function CreatorWorkflow() {
  const { profile, isAuthenticated, login, logout } = useCreatorAuth()
  const toast = useToast()

  // State management
  const [currentStep, setCurrentStep] = useState<'registration' | 'payment' | 'builder' | 'targeting' | 'launch' | 'analytics'>('registration')
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [newSurvey, setNewSurvey] = useState<Partial<Survey>>({
    title: "",
    description: "",
    category: "",
    questions: [],
    demographics: {
      gender: [],
      ageRange: [],
      location: [],
      education: [],
      employment: [],
      income: [],
      maritalStatus: [],
      interests: []
    },
    creditsPerResponse: 10,
    maxResponses: 100
  })
  const [showPreview, setShowPreview] = useState(false)
  const [paymentSetup, setPaymentSetup] = useState<PaymentSetup | null>(null)
  const [credits, setCredits] = useState(1500)
  const [loading, setLoading] = useState(false)

  // Mock authentication for demo
  useEffect(() => {
    if (!isAuthenticated) {
      // Auto-login for demo
      login({
        id: "creator-1",
        email: "creator@example.com",
        companyName: "Demo Company",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "+234 806 123 4567",
        businessDescription: "Market research company",
        isApproved: true,
        isVerified: true,
        createdAt: new Date().toISOString()
      })
    }
  }, [isAuthenticated, login])

  // Step progression logic
  const canProceedToNext = () => {
    switch (currentStep) {
      case 'registration':
        return isAuthenticated && profile?.isApproved
      case 'payment':
        return paymentSetup?.verified
      case 'builder':
        return newSurvey.title && newSurvey.questions && newSurvey.questions.length > 0
      case 'targeting':
        return true // Demographics are optional
      case 'launch':
        return credits >= (newSurvey.creditsPerResponse || 10) * (newSurvey.maxResponses || 100)
      default:
        return false
    }
  }

  // Handlers
  const handlePaymentSetup = async (data: any) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setPaymentSetup({
        paystackPublicKey: data.paystackPublicKey,
        paystackSecretKey: data.paystackSecretKey,
        bankAccount: data.bankAccount,
        verified: true,
        verifiedAt: new Date().toISOString()
      })
      
      toast.show({
        type: 'success',
        title: 'Payment setup complete',
        description: 'Your payment information has been verified.'
      })
    } catch (error) {
      toast.show({
        type: 'error',
        title: 'Setup failed',
        description: 'Failed to setup payment information.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreditsPurchase = async (amount: number) => {
    setLoading(true)
    try {
      // Simulate Paystack payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const creditsToAdd = Math.floor(amount / 10)
      setCredits(prev => prev + creditsToAdd)
      
      toast.show({
        type: 'success',
        title: 'Credits purchased',
        description: `Successfully added ${creditsToAdd} credits to your account.`
      })
    } catch (error) {
      toast.show({
        type: 'error',
        title: 'Purchase failed',
        description: 'Failed to purchase credits.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSurvey = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const surveyToSave: Survey = {
        ...newSurvey as Survey,
        id: `survey-${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setSurveys(prev => [...prev, surveyToSave])
      setSelectedSurvey(surveyToSave)
      
      toast.show({
        type: 'success',
        title: 'Survey saved',
        description: 'Your survey has been saved successfully.'
      })
      
      setCurrentStep('targeting')
    } catch (error) {
      toast.show({
        type: 'error',
        title: 'Save failed',
        description: 'Failed to save survey.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      // Simulate API call for draft saving
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.show({
        type: 'success',
        title: 'Draft saved',
        description: 'Your survey draft has been saved.'
      })
    } catch (error) {
      toast.show({
        type: 'error',
        title: 'Save failed',
        description: 'Failed to save draft.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLaunchSurvey = async (survey: Survey) => {
    const totalCost = survey.creditsPerResponse * survey.maxResponses
    
    if (credits < totalCost) {
      toast.show({
        type: 'error',
        title: 'Insufficient credits',
        description: `You need ${totalCost} credits to launch this survey. You have ${credits} credits.`
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setCredits(prev => prev - totalCost)
      setSurveys(prev => prev.map(s => 
        s.id === survey.id 
          ? { ...s, status: 'active' as const }
          : s
      ))
      
      toast.show({
        type: 'success',
        title: 'Survey launched',
        description: `Survey is now live! ${totalCost} credits deducted.`
      })
      
      setCurrentStep('analytics')
    } catch (error) {
      toast.show({
        type: 'error',
        title: 'Launch failed',
        description: 'Failed to launch survey.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async (format: 'csv' | 'json') => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.show({
        type: 'success',
        title: 'Export complete',
        description: `Survey data exported as ${format.toUpperCase()}.`
      })
    } catch (error) {
      toast.show({
        type: 'error',
        title: 'Export failed',
        description: 'Failed to export data.'
      })
    }
  }

  const refreshAnalytics = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.show({
      type: 'success',
      title: 'Data refreshed',
      description: 'Analytics data has been updated.'
    })
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Creator Access Required</CardTitle>
            <p className="text-sm text-slate-600">Please register as a creator to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-500">
                Join our creator program to start building and launching surveys
              </p>
              <Button 
                asChild 
                className="w-full bg-[#013f5c] hover:bg-[#012a3d] text-white"
              >
                <Link href="/creator/register">
                  Register as Creator
                </Link>
              </Button>
              <Button 
                variant="outline" 
                asChild 
                className="w-full"
              >
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Creator Dashboard</h1>
              <p className="text-slate-600">Welcome back, {profile.firstName}!</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-bold text-[#013F5C]">
                  {credits.toLocaleString()} Credits
                </div>
                <div className="text-xs text-slate-600">Available balance</div>
              </div>
              
              <Button variant="outline" onClick={() => setCurrentStep('payment')}>
                <CreditCard className="h-4 w-4 mr-2" />
                Add Credits
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
          <TabsList className="grid w-full grid-cols-6 mb-8 rounded-xl">
            <TabsTrigger value="registration" className="rounded-lg">Profile</TabsTrigger>
            <TabsTrigger value="payment" className="rounded-lg">Payment</TabsTrigger>
            <TabsTrigger value="builder" className="rounded-lg">Build</TabsTrigger>
            <TabsTrigger value="targeting" className="rounded-lg">Target</TabsTrigger>
            <TabsTrigger value="launch" className="rounded-lg">Launch</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
          </TabsList>

          {/* Registration/Profile Tab */}
          <TabsContent value="registration" className="space-y-6">
            <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Creator Profile Verified
                </CardTitle>
                <p className="text-slate-600">Your creator account is approved and ready to use.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Company Name</label>
                    <p className="text-slate-900">{profile.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Contact Person</label>
                    <p className="text-slate-900">{profile.firstName} {profile.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <p className="text-slate-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <p className="text-slate-900">{profile.phoneNumber}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <Button 
                    onClick={() => setCurrentStep('payment')}
                    className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
                  >
                    Continue to Payment Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-6">
            {!paymentSetup?.verified ? (
              <PaymentSetupForm
                onSubmit={handlePaymentSetup}
                loading={loading}
              />
            ) : (
              <div className="space-y-6">
                <PaymentSetupForm
                  currentSetup={paymentSetup}
                  onSubmit={handlePaymentSetup}
                  loading={loading}
                />
                
                <CreditsPurchase
                  currentCredits={credits}
                  onPurchase={handleCreditsPurchase}
                  loading={loading}
                />
              </div>
            )}
          </TabsContent>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <SurveyBuilder
              survey={newSurvey}
              onUpdate={setNewSurvey}
              onSave={handleSaveSurvey}
              onPreview={() => setShowPreview(true)}
              loading={loading}
            />
          </TabsContent>

          {/* Targeting Tab */}
          <TabsContent value="targeting" className="space-y-6">
            {newSurvey.demographics && (
              <DemographicsTargeting
                demographics={newSurvey.demographics}
                onUpdate={(demographics) => setNewSurvey(prev => ({ ...prev, demographics }))}
                estimatedReach={12500}
                loading={loading}
              />
            )}
            
            <div className="text-center pt-6">
              <Button 
                onClick={() => setCurrentStep('launch')}
                size="lg"
                className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
              >
                Continue to Launch
              </Button>
            </div>
          </TabsContent>

          {/* Launch Tab */}
          <TabsContent value="launch" className="space-y-6">
            <LaunchingSurvey
              survey={newSurvey}
              onLaunch={() => handleLaunchSurvey(newSurvey)}
              onPurchaseCredits={handleCreditsPurchase}
              currentCredits={credits}
              loading={loading}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {selectedSurvey ? (
              <SurveyAnalytics
                survey={selectedSurvey}
                analytics={mockAnalytics}
                responses={[]}
                onExportData={handleExportData}
                onRefresh={refreshAnalytics}
                loading={loading}
              />
            ) : (
              <Card className="rounded-xl border-slate-200/60">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="font-semibold text-slate-900 mb-2">No Survey Selected</h3>
                  <p className="text-slate-600">Create and launch a survey to view analytics.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Survey Preview Modal */}
      {showPreview && newSurvey.questions && newSurvey.questions.length > 0 && (
        <SurveyPreview
          survey={newSurvey as Survey}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
