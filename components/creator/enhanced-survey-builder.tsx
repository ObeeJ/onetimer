"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  Target,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Settings
} from "lucide-react"
import { QuestionBuilder } from "@/components/creator/survey-builder"
import type { Survey, SurveyQuestion } from "@/types/creator"

interface BudgetRewardSetupProps {
  survey: Survey
  onUpdate: (updates: Partial<Survey>) => void
}

function BudgetRewardSetup({ survey, onUpdate }: BudgetRewardSetupProps) {
  const rewardPerResponse = survey.rewardAmount || 10
  const targetResponses = survey.targetResponses || 100
  const totalBudget = rewardPerResponse * targetResponses
  const platformFee = totalBudget * 0.1 // 10% platform fee
  const finalCost = totalBudget + platformFee

  return (
    <Card className="rounded-xl border-slate-200/60 bg-white/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget & Reward Setup
        </CardTitle>
        <p className="text-sm text-slate-600">
          Configure your survey budget and participant rewards
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Target Responses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Target Responses</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="number"
                min="10"
                max="5000"
                value={targetResponses}
                onChange={(e) => onUpdate({ targetResponses: Number(e.target.value) })}
                className="pl-10 rounded-xl"
                placeholder="100"
              />
            </div>
            <p className="text-xs text-slate-500">Minimum: 10, Maximum: 5,000</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Reward per Response (₦)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">₦</span>
              <Input
                type="number"
                min="5"
                max="1000"
                value={rewardPerResponse}
                onChange={(e) => onUpdate({ rewardAmount: Number(e.target.value) })}
                className="pl-8 rounded-xl"
                placeholder="10"
              />
            </div>
            <p className="text-xs text-slate-500">Range: ₦5 - ₦1,000 per response</p>
          </div>
        </div>

        <Separator />

        {/* Budget Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Budget Breakdown</h4>
          
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">
                {targetResponses} responses × ₦{rewardPerResponse}
              </span>
              <span className="font-medium">₦{totalBudget.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Platform fee (10%)</span>
              <span className="font-medium">₦{platformFee.toLocaleString()}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">Total Cost</span>
              <span className="text-xl font-bold text-[#013F5C]">
                ₦{finalCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Survey Duration */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Survey Duration (Days)</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="number"
              min="1"
              max="30"
              value={survey.duration || 7}
              onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
              className="pl-10 rounded-xl"
              placeholder="7"
            />
          </div>
          <p className="text-xs text-slate-500">How long should this survey run? (1-30 days)</p>
        </div>

        {/* Survey Category */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Survey Category</Label>
          <select
            value={survey.category || "market_research"}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl bg-white"
          >
            <option value="market_research">Market Research</option>
            <option value="product_feedback">Product Feedback</option>
            <option value="brand_awareness">Brand Awareness</option>
            <option value="customer_satisfaction">Customer Satisfaction</option>
            <option value="academic_research">Academic Research</option>
            <option value="opinion_poll">Opinion Poll</option>
            <option value="other">Other</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}

interface EnhancedSurveyBuilderProps {
  survey: Survey
  onUpdate: (survey: Survey) => void
  onSave: () => Promise<void>
  onPreview: () => void
  onSaveDraft: () => Promise<void>
  loading?: boolean
}

export function EnhancedSurveyBuilder({ 
  survey, 
  onUpdate, 
  onSave, 
  onPreview,
  onSaveDraft,
  loading = false 
}: EnhancedSurveyBuilderProps) {
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<string>>(new Set())
  const [isDraftSaving, setIsDraftSaving] = useState(false)

  const updateSurvey = (updates: Partial<Survey>) => {
    onUpdate({ ...survey, ...updates })
  }

  const addQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: `q_${Date.now()}`,
      type: "single_choice",
      text: "",
      order: (survey.questions?.length || 0) + 1,
      required: false,
      options: ["Option 1", "Option 2"]
    }

    const updatedQuestions = [...(survey.questions || []), newQuestion]
    updateSurvey({ questions: updatedQuestions })
  }

  const updateQuestion = (questionId: string, updates: Partial<SurveyQuestion>) => {
    const updatedQuestions = survey.questions?.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ) || []
    updateSurvey({ questions: updatedQuestions })
  }

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = survey.questions?.filter(q => q.id !== questionId) || []
    // Reorder remaining questions
    const reorderedQuestions = updatedQuestions.map((q, index) => ({
      ...q,
      order: index + 1
    }))
    updateSurvey({ questions: reorderedQuestions })
  }

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = survey.questions?.find(q => q.id === questionId)
    if (!questionToDuplicate) return

    const newQuestion: SurveyQuestion = {
      ...questionToDuplicate,
      id: `q_${Date.now()}`,
      order: (survey.questions?.length || 0) + 1,
      text: `${questionToDuplicate.text} (Copy)`
    }

    const updatedQuestions = [...(survey.questions || []), newQuestion]
    updateSurvey({ questions: updatedQuestions })
  }

  const toggleQuestionCollapse = (questionId: string) => {
    const newCollapsed = new Set(collapsedQuestions)
    if (newCollapsed.has(questionId)) {
      newCollapsed.delete(questionId)
    } else {
      newCollapsed.add(questionId)
    }
    setCollapsedQuestions(newCollapsed)
  }

  const handleSaveDraft = async () => {
    setIsDraftSaving(true)
    try {
      await onSaveDraft()
    } finally {
      setIsDraftSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="budget">Budget & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Basic Survey Information */}
          <Card className="rounded-xl border-slate-200/60 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Survey Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="survey-title" className="text-sm font-medium">
                  Survey Title *
                </Label>
                <Input
                  id="survey-title"
                  value={survey.title || ""}
                  onChange={(e) => updateSurvey({ title: e.target.value })}
                  placeholder="Enter a clear, descriptive title for your survey"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="survey-description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="survey-description"
                  value={survey.description || ""}
                  onChange={(e) => updateSurvey({ description: e.target.value })}
                  placeholder="Describe what this survey is about and why participants should take it..."
                  className="rounded-xl min-h-[100px] resize-none"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-time" className="text-sm font-medium">
                  Estimated Completion Time (minutes)
                </Label>
                <Input
                  id="estimated-time"
                  type="number"
                  min="1"
                  max="60"
                  value={survey.estimatedTime || 5}
                  onChange={(e) => updateSurvey({ estimatedTime: Number(e.target.value) })}
                  className="rounded-xl"
                  placeholder="5"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          {/* Questions Section */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Survey Questions</h3>
              <p className="text-slate-600">Build your survey by adding questions</p>
            </div>
            
            <Button
              onClick={addQuestion}
              className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {survey.questions?.length === 0 ? (
              <Card className="rounded-xl border-dashed border-slate-300">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center">
                      <Plus className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">No questions yet</h4>
                      <p className="text-slate-600">Start by adding your first question</p>
                    </div>
                    <Button
                      onClick={addQuestion}
                      variant="outline"
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              survey.questions?.map((question) => (
                <QuestionBuilder
                  key={question.id}
                  question={question}
                  onUpdate={(updatedQuestion) => updateQuestion(question.id, updatedQuestion)}
                  onDelete={() => deleteQuestion(question.id)}
                  onDuplicate={() => duplicateQuestion(question.id)}
                  isCollapsed={collapsedQuestions.has(question.id)}
                  onToggleCollapse={() => toggleQuestionCollapse(question.id)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <BudgetRewardSetup survey={survey} onUpdate={updateSurvey} />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="text-sm text-slate-600">
          {survey.questions?.length || 0} question{(survey.questions?.length || 0) !== 1 ? 's' : ''} added
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isDraftSaving || !survey.title?.trim()}
            className="rounded-xl"
          >
            {isDraftSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onPreview}
            disabled={!survey.questions?.length}
            className="rounded-xl"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button
            onClick={onSave}
            disabled={loading || !survey.title?.trim() || !survey.questions?.length}
            className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing...
              </div>
            ) : (
              "Publish Survey"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
