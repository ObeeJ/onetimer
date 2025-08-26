"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  DollarSign,
  Users,
  Calendar,
  Send,
  RefreshCw,
  Eye,
  Target,
  Zap
} from "lucide-react"
import type { Survey } from "@/types/creator"

interface LaunchingSurveyProps {
  survey: Survey
  onLaunch: () => Promise<void>
  onPurchaseCredits: (amount: number) => Promise<void>
  currentCredits?: number
  loading?: boolean
}

interface CreditPackage {
  credits: number
  price: number
  bonus: number
  popular?: boolean
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { credits: 1000, price: 5000, bonus: 0 },
  { credits: 2500, price: 12000, bonus: 250, popular: true },
  { credits: 5000, price: 22000, bonus: 750 },
  { credits: 10000, price: 40000, bonus: 2000 },
]

export function LaunchingSurvey({ 
  survey, 
  onLaunch, 
  onPurchaseCredits,
  currentCredits = 0,
  loading = false 
}: LaunchingSurveyProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [purchasingCredits, setPurchasingCredits] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)

  const requiredCredits = (survey.targetResponses || 100) * (survey.rewardAmount || 10)
  const platformFee = requiredCredits * 0.1
  const totalCost = requiredCredits + platformFee
  const hasEnoughCredits = currentCredits >= totalCost

  const handlePurchaseCredits = async () => {
    if (!selectedPackage) return
    
    setPurchasingCredits(true)
    try {
      await onPurchaseCredits(selectedPackage.credits + selectedPackage.bonus)
    } finally {
      setPurchasingCredits(false)
    }
  }

  const handleLaunch = async () => {
    setApprovalStatus('pending')
    try {
      await onLaunch()
      // Simulate admin approval process
      setTimeout(() => {
        setApprovalStatus('approved')
      }, 2000)
    } catch (error) {
      setApprovalStatus('rejected')
    }
  }

  return (
    <div className="space-y-6">
      {/* Survey Overview */}
      <Card className="rounded-xl border-slate-200/60 bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Survey Launch Overview
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-[#013F5C]">{survey.targetResponses}</p>
              <p className="text-sm text-slate-600">Target Responses</p>
            </div>
            
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-[#013F5C]">₦{survey.rewardAmount}</p>
              <p className="text-sm text-slate-600">Per Response</p>
            </div>
            
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-[#013F5C]">{survey.duration} days</p>
              <p className="text-sm text-slate-600">Duration</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Survey responses</span>
              <span className="font-medium">₦{requiredCredits.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Platform fee (10%)</span>
              <span className="font-medium">₦{platformFee.toLocaleString()}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">Total Cost</span>
              <span className="text-xl font-bold text-[#013F5C]">
                ₦{totalCost.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="credits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="credits">Purchase Credits</TabsTrigger>
          <TabsTrigger value="launch">Launch Survey</TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="space-y-6">
          {/* Current Credits */}
          <Card className="rounded-xl border-slate-200/60 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Credits
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-[#013F5C]">₦{currentCredits.toLocaleString()}</p>
                  <p className="text-slate-600">Available Credits</p>
                </div>
                
                <div className="text-right">
                  <Badge variant={hasEnoughCredits ? "default" : "destructive"}>
                    {hasEnoughCredits ? "Sufficient" : "Insufficient"}
                  </Badge>
                  {!hasEnoughCredits && (
                    <p className="text-sm text-red-600 mt-1">
                      Need ₦{(totalCost - currentCredits).toLocaleString()} more
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Packages */}
          <Card className="rounded-xl border-slate-200/60 bg-white/80">
            <CardHeader>
              <CardTitle>Purchase Credits</CardTitle>
              <p className="text-slate-600">Select a credit package to fund your surveys</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CREDIT_PACKAGES.map((pkg, index) => (
                  <div
                    key={index}
                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPackage === pkg
                        ? 'border-[#013F5C] bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${pkg.popular ? 'ring-2 ring-[#013F5C]/20' : ''}`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#013F5C]">
                        Most Popular
                      </Badge>
                    )}
                    
                    <div className="text-center space-y-2">
                      <p className="text-xl font-bold text-[#013F5C]">
                        ₦{pkg.credits.toLocaleString()}
                      </p>
                      
                      {pkg.bonus > 0 && (
                        <div className="text-green-600">
                          <p className="text-sm font-medium">+₦{pkg.bonus.toLocaleString()} bonus</p>
                          <p className="text-xs">Total: ₦{(pkg.credits + pkg.bonus).toLocaleString()}</p>
                        </div>
                      )}
                      
                      <p className="text-slate-600 text-sm">₦{pkg.price.toLocaleString()}</p>
                      
                      <div className="text-xs text-slate-500">
                        ₦{(pkg.price / (pkg.credits + pkg.bonus)).toFixed(2)} per credit
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPackage && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Selected Package</span>
                    <span className="text-[#013F5C] font-semibold">
                      ₦{(selectedPackage.credits + selectedPackage.bonus).toLocaleString()} credits
                    </span>
                  </div>
                  
                  <Button
                    onClick={handlePurchaseCredits}
                    disabled={purchasingCredits}
                    className="w-full rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
                  >
                    {purchasingCredits ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing Payment...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay ₦{selectedPackage.price.toLocaleString()}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="launch" className="space-y-6">
          {/* Launch Requirements */}
          <Card className="rounded-xl border-slate-200/60 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Launch Requirements
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    survey.title && survey.description && survey.questions?.length 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {survey.title && survey.description && survey.questions?.length ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </div>
                  <span className="text-sm">Survey content completed</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    hasEnoughCredits 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {hasEnoughCredits ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                  </div>
                  <span className="text-sm">Sufficient credits available</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    approvalStatus === 'approved'
                      ? 'bg-green-100 text-green-600'
                      : approvalStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-600' 
                      : approvalStatus === 'rejected'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {approvalStatus === 'approved' ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : approvalStatus === 'pending' ? (
                      <Clock className="h-3 w-3" />
                    ) : approvalStatus === 'rejected' ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </div>
                  <span className="text-sm">
                    {approvalStatus === 'approved' && "Admin approved"}
                    {approvalStatus === 'pending' && "Pending admin approval"}
                    {approvalStatus === 'rejected' && "Admin approval required"}
                    {!approvalStatus && "Admin approval required"}
                  </span>
                </div>
              </div>

              {approvalStatus === 'pending' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Awaiting Admin Approval
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your survey is being reviewed by our admin team. You'll be notified once approved.
                  </p>
                </div>
              )}

              {approvalStatus === 'approved' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Survey Approved & Live!
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your survey is now live and collecting responses.
                  </p>
                </div>
              )}

              {approvalStatus === 'rejected' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Survey Rejected
                    </span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Please review the feedback and make necessary changes before resubmitting.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Launch Button */}
          <Card className="rounded-xl border-slate-200/60 bg-white/80">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Ready to Launch?</h3>
                  <p className="text-slate-600">
                    Submit your survey for admin approval and go live
                  </p>
                </div>

                <Button
                  onClick={handleLaunch}
                  disabled={
                    loading || 
                    !hasEnoughCredits || 
                    !survey.title || 
                    !survey.questions?.length ||
                    approvalStatus === 'pending' ||
                    approvalStatus === 'approved'
                  }
                  size="lg"
                  className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a] px-8"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Submitting...
                    </div>
                  ) : approvalStatus === 'approved' ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      View Live Survey
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
