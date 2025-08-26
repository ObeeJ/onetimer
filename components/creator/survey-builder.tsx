"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Star,
  Type,
  CheckSquare,
  Circle,
  FileText,
  MessageSquare
} from "lucide-react"
import type { 
  SurveyQuestion, 
  QuestionType, 
  DemographicsTarget,
  Survey 
} from "@/types/creator"

interface QuestionBuilderProps {
  question: SurveyQuestion
  onUpdate: (question: SurveyQuestion) => void
  onDelete: () => void
  onDuplicate: () => void
  isCollapsed?: boolean
  onToggleCollapse: () => void
}

const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "multiple_choice",
    label: "Multiple Choice",
    icon: <CheckSquare className="h-4 w-4" />,
    description: "Multiple options, multiple selections"
  },
  {
    value: "single_choice",
    label: "Single Choice",
    icon: <Circle className="h-4 w-4" />,
    description: "Multiple options, one selection"
  },
  {
    value: "text",
    label: "Short Text",
    icon: <Type className="h-4 w-4" />,
    description: "Single line text input"
  },
  {
    value: "textarea",
    label: "Long Text",
    icon: <FileText className="h-4 w-4" />,
    description: "Multi-line text input"
  },
  {
    value: "rating",
    label: "Rating Scale",
    icon: <Star className="h-4 w-4" />,
    description: "1-5 or 1-10 rating scale"
  },
  {
    value: "boolean",
    label: "Yes/No",
    icon: <MessageSquare className="h-4 w-4" />,
    description: "Simple yes or no question"
  }
]

export function QuestionBuilder({ 
  question, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  isCollapsed,
  onToggleCollapse 
}: QuestionBuilderProps) {
  const [localQuestion, setLocalQuestion] = useState<SurveyQuestion>(question)

  const updateQuestion = (updates: Partial<SurveyQuestion>) => {
    const updated = { ...localQuestion, ...updates }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  const addOption = () => {
    if (!localQuestion.options) return
    
    const newOptions = [...localQuestion.options, `Option ${localQuestion.options.length + 1}`]
    updateQuestion({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    if (!localQuestion.options) return
    
    const newOptions = [...localQuestion.options]
    newOptions[index] = value
    updateQuestion({ options: newOptions })
  }

  const removeOption = (index: number) => {
    if (!localQuestion.options || localQuestion.options.length <= 2) return
    
    const newOptions = localQuestion.options.filter((_, i) => i !== index)
    updateQuestion({ options: newOptions })
  }

  const questionTypeConfig = QUESTION_TYPES.find(t => t.value === localQuestion.type)

  if (isCollapsed) {
    return (
      <Card className="rounded-xl border-slate-200/60">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 cursor-move">
                <GripVertical className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  Q{question.order}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {questionTypeConfig?.icon}
                <Badge variant="outline" className="text-xs">
                  {questionTypeConfig?.label}
                </Badge>
              </div>
              
              <h3 className="font-medium text-slate-900 truncate">
                {localQuestion.text || "Untitled Question"}
              </h3>
              
              {localQuestion.required && (
                <Badge variant="secondary" className="text-xs">Required</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-move">
              <GripVertical className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                Question {question.order}
              </span>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {questionTypeConfig?.label}
            </Badge>
            
            {localQuestion.required && (
              <Badge variant="secondary" className="text-xs">Required</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0"
              title="Duplicate question"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
              title="Collapse question"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete question"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Question Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => updateQuestion({ 
                  type: type.value,
                  options: ['multiple_choice', 'single_choice'].includes(type.value) 
                    ? ['Option 1', 'Option 2'] 
                    : undefined
                })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  localQuestion.type === type.value
                    ? 'border-[#013F5C] bg-blue-50 text-[#013F5C]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {type.icon}
                  <span className="font-medium text-sm">{type.label}</span>
                </div>
                <p className="text-xs opacity-70">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Question Text */}
        <div className="space-y-2">
          <Label htmlFor={`question-text-${question.id}`} className="text-sm font-medium">
            Question Text *
          </Label>
          <Textarea
            id={`question-text-${question.id}`}
            value={localQuestion.text}
            onChange={(e) => updateQuestion({ text: e.target.value })}
            placeholder="Enter your question here..."
            className="rounded-xl min-h-[80px] resize-none"
            rows={3}
          />
        </div>

        {/* Question Description */}
        <div className="space-y-2">
          <Label htmlFor={`question-desc-${question.id}`} className="text-sm font-medium">
            Description (Optional)
          </Label>
          <Input
            id={`question-desc-${question.id}`}
            value={localQuestion.description || ""}
            onChange={(e) => updateQuestion({ description: e.target.value })}
            placeholder="Additional context or instructions..."
            className="rounded-xl"
          />
        </div>

        {/* Options for Multiple/Single Choice */}
        {(localQuestion.type === "multiple_choice" || localQuestion.type === "single_choice") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Answer Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="h-8 rounded-lg"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            </div>
            
            <div className="space-y-2">
              {localQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-slate-300 flex items-center justify-center bg-slate-50">
                    <span className="text-xs text-slate-600">{index + 1}</span>
                  </div>
                  
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="rounded-lg"
                  />
                  
                  {(localQuestion.options?.length || 0) > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating Scale Configuration */}
        {localQuestion.type === "rating" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rating Scale</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`scale-min-${question.id}`} className="text-xs">Minimum</Label>
                <Input
                  id={`scale-min-${question.id}`}
                  type="number"
                  min="1"
                  max="5"
                  value={localQuestion.scaleMin || 1}
                  onChange={(e) => updateQuestion({ scaleMin: Number(e.target.value) })}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`scale-max-${question.id}`} className="text-xs">Maximum</Label>
                <Input
                  id={`scale-max-${question.id}`}
                  type="number"
                  min="2"
                  max="10"
                  value={localQuestion.scaleMax || 5}
                  onChange={(e) => updateQuestion({ scaleMax: Number(e.target.value) })}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Question Settings */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Question Settings</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`required-${question.id}`}
              checked={localQuestion.required}
              onCheckedChange={(checked) => updateQuestion({ required: !!checked })}
            />
            <Label htmlFor={`required-${question.id}`} className="text-sm">
              Required question
            </Label>
          </div>
          
          {localQuestion.type === "multiple_choice" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`allow-other-${question.id}`}
                checked={localQuestion.allowOther}
                onCheckedChange={(checked) => updateQuestion({ allowOther: !!checked })}
              />
              <Label htmlFor={`allow-other-${question.id}`} className="text-sm">
                Allow "Other" option with text input
              </Label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface SurveyBuilderProps {
  survey: Partial<Survey>
  onUpdate: (survey: Partial<Survey>) => void
  onSave: () => Promise<void>
  onPreview: () => void
  loading?: boolean
}

function SurveyBuilder({ survey, onUpdate, onSave, onPreview, loading = false }: SurveyBuilderProps) {
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<string>>(new Set())

  const addQuestion = (type: QuestionType = "single_choice") => {
    const newQuestion: SurveyQuestion = {
      id: `q_${Date.now()}`,
      type,
      text: "",
      required: false,
      order: (survey.questions?.length || 0) + 1,
      ...(type === "multiple_choice" || type === "single_choice" ? { options: ["Option 1", "Option 2"] } : {}),
      ...(type === "rating" ? { scaleMin: 1, scaleMax: 5 } : {})
    }

    onUpdate({
      ...survey,
      questions: [...(survey.questions || []), newQuestion]
    })
  }

  const updateQuestion = (questionId: string, updatedQuestion: SurveyQuestion) => {
    const questions = survey.questions?.map(q => 
      q.id === questionId ? updatedQuestion : q
    ) || []
    
    onUpdate({ ...survey, questions })
  }

  const deleteQuestion = (questionId: string) => {
    const questions = survey.questions?.filter(q => q.id !== questionId) || []
    const reorderedQuestions = questions.map((q, index) => ({ ...q, order: index + 1 }))
    
    onUpdate({ ...survey, questions: reorderedQuestions })
    setCollapsedQuestions(prev => {
      const next = new Set(prev)
      next.delete(questionId)
      return next
    })
  }

  const duplicateQuestion = (questionId: string) => {
    const question = survey.questions?.find(q => q.id === questionId)
    if (!question) return

    const newQuestion: SurveyQuestion = {
      ...question,
      id: `q_${Date.now()}`,
      order: question.order + 1,
      text: `${question.text} (Copy)`
    }

    const questions = survey.questions || []
    const insertIndex = questions.findIndex(q => q.id === questionId) + 1
    const newQuestions = [
      ...questions.slice(0, insertIndex),
      newQuestion,
      ...questions.slice(insertIndex).map(q => ({ ...q, order: q.order + 1 }))
    ]

    onUpdate({ ...survey, questions: newQuestions })
  }

  const toggleQuestionCollapse = (questionId: string) => {
    setCollapsedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Survey Header */}
      <Card className="rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Survey Builder
          </CardTitle>
          <p className="text-slate-600">
            Create engaging surveys with our intuitive drag-and-drop builder
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Survey Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="survey-title" className="text-sm font-medium">
                Survey Title *
              </Label>
              <Input
                id="survey-title"
                value={survey.title || ""}
                onChange={(e) => onUpdate({ ...survey, title: e.target.value })}
                placeholder="Enter survey title..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="survey-category" className="text-sm font-medium">
                Category
              </Label>
              <select
                id="survey-category"
                value={survey.category || ""}
                onChange={(e) => onUpdate({ ...survey, category: e.target.value })}
                className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select category</option>
                <option value="market_research">Market Research</option>
                <option value="customer_feedback">Customer Feedback</option>
                <option value="product_feedback">Product Feedback</option>
                <option value="academic">Academic Research</option>
                <option value="opinion_poll">Opinion Poll</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="survey-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="survey-description"
              value={survey.description || ""}
              onChange={(e) => onUpdate({ ...survey, description: e.target.value })}
              placeholder="Describe what this survey is about and why responses matter..."
              className="rounded-xl min-h-[100px] resize-none"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {survey.questions?.map((question) => (
          <QuestionBuilder
            key={question.id}
            question={question}
            onUpdate={(updatedQuestion) => updateQuestion(question.id, updatedQuestion)}
            onDelete={() => deleteQuestion(question.id)}
            onDuplicate={() => duplicateQuestion(question.id)}
            isCollapsed={collapsedQuestions.has(question.id)}
            onToggleCollapse={() => toggleQuestionCollapse(question.id)}
          />
        ))}

        {/* Add Question */}
        <Card className="rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-slate-600">
                <Plus className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Add a new question</p>
                <p className="text-sm opacity-80">Choose a question type to get started</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {QUESTION_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant="outline"
                    onClick={() => addQuestion(type.value)}
                    className="h-auto p-3 rounded-xl flex flex-col gap-2 hover:bg-blue-50 hover:border-[#013F5C]"
                  >
                    {type.icon}
                    <span className="text-xs font-medium">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <HelpCircle className="h-4 w-4" />
          <span>{survey.questions?.length || 0} questions added</span>
        </div>

        <div className="flex items-center gap-3">
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
            {loading ? "Saving..." : "Save Survey"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SurveyBuilder
