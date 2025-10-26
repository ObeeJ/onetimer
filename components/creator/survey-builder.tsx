"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, GripVertical, Eye, Save, Send, Upload, AlertCircle, CheckCircle, MessageSquare, Star } from "lucide-react"
import { useCreateSurvey, useUpdateSurvey } from "@/hooks/use-creator"
import { toast } from "sonner"

type QuestionType = "multiple_choice" | "open_ended" | "rating" | "media_upload"

interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: string[]
  allowMedia?: boolean
}

interface SurveyData {
  title: string
  description: string
  targetAudience: string
  rewardAmount: number
  questions: Question[]
}

interface SurveyBuilderProps {
  initialData?: SurveyData & { id?: string }
  isEditing?: boolean
}

export default function SurveyBuilder({ initialData, isEditing = false }: SurveyBuilderProps = {}) {
  const router = useRouter()
  const createSurvey = useCreateSurvey()
  const updateSurvey = useUpdateSurvey()
  const [survey, setSurvey] = useState<SurveyData>(initialData || {
    title: "",
    description: "",
    targetAudience: "",
    rewardAmount: 5,
    questions: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const questionTypes = [
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "open_ended", label: "Open Ended" },
    { value: "rating", label: "Rating Scale" },
    { value: "media_upload", label: "Media Upload" }
  ]

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      title: "",
      required: false,
      ...(type === "multiple_choice" && { options: ["", ""] }),
      ...(type === "media_upload" && { allowMedia: true })
    }
    setSurvey(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }))
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    }))
  }

  const removeQuestion = (id: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }))
  }

  const moveQuestion = (dragId: string, hoverId: string) => {
    const dragIndex = survey.questions.findIndex(q => q.id === dragId)
    const hoverIndex = survey.questions.findIndex(q => q.id === hoverId)
    
    if (dragIndex === -1 || hoverIndex === -1) return
    
    const newQuestions = [...survey.questions]
    const draggedQuestion = newQuestions[dragIndex]
    newQuestions.splice(dragIndex, 1)
    newQuestions.splice(hoverIndex, 0, draggedQuestion)
    
    setSurvey(prev => ({ ...prev, questions: newQuestions }))
  }

  const addOption = (questionId: string) => {
    updateQuestion(questionId, {
      options: [...(survey.questions.find(q => q.id === questionId)?.options || []), ""]
    })
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = survey.questions.find(q => q.id === questionId)
    if (question?.options) {
      const newOptions = [...question.options]
      newOptions[optionIndex] = value
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = survey.questions.find(q => q.id === questionId)
    if (question?.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex)
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const validateSurvey = () => {
    const newErrors: Record<string, string> = {}
    
    if (!survey.title.trim()) newErrors.title = "Survey title is required"
    if (!survey.description.trim()) newErrors.description = "Survey description is required"
    if (survey.questions.length === 0) newErrors.questions = "At least one question is required"
    
    survey.questions.forEach((question, index) => {
      if (!question.title.trim()) {
        newErrors[`question_${question.id}`] = `Question ${index + 1} title is required`
      }
      if (question.type === "multiple_choice" && (!question.options || question.options.filter(o => o.trim()).length < 2)) {
        newErrors[`question_${question.id}_options`] = `Question ${index + 1} needs at least 2 options`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveDraft = async () => {
    setIsSaving(true)
    try {
      const surveyData = {
        ...survey,
        status: 'draft'
      }
      
      if (isEditing && initialData?.id) {
        await updateSurvey.mutateAsync({ id: initialData.id, data: surveyData })
        toast.success('Draft saved successfully')
      } else {
        await createSurvey.mutateAsync(surveyData)
        toast.success('Draft saved successfully')
      }
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  const submitForApproval = async () => {
    if (!validateSurvey()) return
    
    setIsSaving(true)
    try {
      const surveyData = {
        ...survey,
        status: 'pending'
      }
      
      if (isEditing && initialData?.id) {
        await updateSurvey.mutateAsync({ id: initialData.id, data: surveyData })
        toast.success('Survey updated successfully')
      } else {
        await createSurvey.mutateAsync(surveyData)
        toast.success('Survey submitted for approval')
      }
      
      router.push('/creator/surveys')
    } catch (error) {
      toast.error('Failed to submit survey')
    } finally {
      setIsSaving(false)
    }
  }

  const renderQuestion = (question: Question, index: number) => (
    <Card 
      key={question.id} 
      className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200" 
      draggable 
      onDragStart={(e) => e.dataTransfer.setData('text/plain', question.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const dragId = e.dataTransfer.getData('text/plain')
        if (dragId !== question.id) {
          moveQuestion(dragId, question.id)
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
            <Badge variant="outline" className="bg-slate-50/80">{questionTypes.find(t => t.value === question.type)?.label}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select onValueChange={(value) => addQuestion(value as QuestionType)}>
              <SelectTrigger className="w-auto h-8 px-3 text-xs border-slate-200 bg-white/50">
                <Plus className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Add" />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-xs">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => removeQuestion(question.id)} className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Question {index + 1} *</Label>
          <Input
            placeholder="Enter your question"
            value={question.title}
            onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
          />
          {errors[`question_${question.id}`] && (
            <p className="text-sm text-red-600">{errors[`question_${question.id}`]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Description (optional)</Label>
          <Textarea
            placeholder="Additional context for this question"
            value={question.description || ""}
            onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
            rows={2}
          />
        </div>

        {question.type === "multiple_choice" && (
          <div className="space-y-2">
            <Label>Options *</Label>
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex gap-2">
                <Input
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                />
                {question.options && question.options.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => removeOption(question.id, optionIndex)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addOption(question.id)}>
              <Plus className="h-4 w-4 mr-1" /> Add Option
            </Button>
            {errors[`question_${question.id}_options`] && (
              <p className="text-sm text-red-600">{errors[`question_${question.id}_options`]}</p>
            )}
          </div>
        )}

        {question.type === "rating" && (
          <div className="space-y-2">
            <Label>Rating Scale</Label>
            <Select defaultValue="5">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">1-3 Scale</SelectItem>
                <SelectItem value="5">1-5 Scale</SelectItem>
                <SelectItem value="10">1-10 Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {question.type === "media_upload" && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Respondents will be able to upload images, videos, or documents (max 5MB per file).
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )

  if (isPreview) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Survey Preview</h2>
          <Button variant="outline" onClick={() => setIsPreview(false)} className="w-full sm:w-auto">
            Back to Edit
          </Button>
        </div>
        
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>{survey.title}</CardTitle>
            <p className="text-slate-600">{survey.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {survey.questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <Label className="text-base font-medium">
                  {index + 1}. {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {question.description && (
                  <p className="text-sm text-slate-600">{question.description}</p>
                )}
                
                {question.type === "multiple_choice" && (
                  <div className="space-y-2">
                    {question.options?.map((option, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="radio" name={`question_${question.id}`} disabled />
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === "open_ended" && (
                  <Textarea placeholder="Your answer here..." disabled />
                )}
                
                {question.type === "rating" && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button key={rating} className="w-8 h-8 border rounded disabled:opacity-50" disabled>
                        {rating}
                      </button>
                    ))}
                  </div>
                )}
                
                {question.type === "media_upload" && (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">Upload files (max 5MB)</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900">Survey Details</CardTitle>
          <p className="text-sm text-slate-600 mt-1">Configure your survey settings and target audience</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Survey Title *</Label>
            <Input
              id="title"
              placeholder="Enter survey title"
              value={survey.title}
              onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what your survey is about and what you hope to learn"
              value={survey.description}
              onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select value={survey.targetAudience} onValueChange={(value) => setSurvey(prev => ({ ...prev, targetAudience: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Population</SelectItem>
                <SelectItem value="18-24">Ages 18-24</SelectItem>
                <SelectItem value="25-34">Ages 25-34</SelectItem>
                <SelectItem value="35-44">Ages 35-44</SelectItem>
                <SelectItem value="45+">Ages 45+</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="professionals">Working Professionals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-slate-200/60">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Survey Questions</h3>
            <p className="text-sm text-slate-600 mt-1">Add different question types to gather insights</p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion("multiple_choice")}
              className="border-slate-200 hover:bg-white hover:border-[#C1654B] hover:text-[#C1654B] transition-all duration-200 text-xs sm:text-sm"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              <span className="truncate">Multiple Choice</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion("open_ended")}
              className="border-slate-200 hover:bg-white hover:border-[#C1654B] hover:text-[#C1654B] transition-all duration-200 text-xs sm:text-sm"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              <span className="truncate">Open Ended</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion("rating")}
              className="border-slate-200 hover:bg-white hover:border-[#C1654B] hover:text-[#C1654B] transition-all duration-200 text-xs sm:text-sm"
            >
              <Star className="h-3 w-3 mr-1" />
              <span className="truncate">Rating Scale</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion("media_upload")}
              className="border-slate-200 hover:bg-white hover:border-[#C1654B] hover:text-[#C1654B] transition-all duration-200 text-xs sm:text-sm"
            >
              <Upload className="h-3 w-3 mr-1" />
              <span className="truncate">Media Upload</span>
            </Button>
          </div>
        </div>

        {errors.questions && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.questions}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {survey.questions.map((question, index) => renderQuestion(question, index))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-slate-200/60">
        <Button 
          variant="filler-outline" 
          onClick={saveDraft} 
          disabled={isSaving}
          className="h-11 w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button variant="creator-outline" onClick={() => setIsPreview(true)} className="h-11 w-full sm:w-auto">
          <Eye className="h-4 w-4 mr-2" />
          Preview Survey
        </Button>
        <Button 
          variant="creator" 
          onClick={submitForApproval} 
          disabled={isSaving}
          className="h-11 w-full sm:w-auto sm:ml-auto"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSaving ? 'Submitting...' : (isEditing ? "Update Survey" : "Submit for Approval")}
        </Button>
      </div>
    </div>
  )
}