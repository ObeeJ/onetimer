"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { surveyStore, type Survey, type Question } from "@/lib/survey-store"
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save,
  Settings,
  CreditCard,
  ChevronDown,
  Type,
  CheckSquare,
  Star,
  ToggleLeft,
  Upload,
  AlertCircle,
  Loader2,
  X
} from "lucide-react"

export default function EditSurvey() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [surveyTitle, setSurveyTitle] = useState("")
  const [surveyDescription, setSurveyDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [maxResponses, setMaxResponses] = useState(100)
  const [reward, setReward] = useState(10)
  const [estimatedTime, setEstimatedTime] = useState(5)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  const questionTypes = [
    { value: "text", label: "Text Response", icon: Type },
    { value: "multiple_choice", label: "Multiple Choice", icon: CheckSquare },
    { value: "rating", label: "Rating Scale", icon: Star },
    { value: "yes_no", label: "Yes/No", icon: ToggleLeft },
    { value: "file_upload", label: "File Upload", icon: Upload },
  ]

  useEffect(() => {
    const loadSurvey = () => {
      try {
        const survey = surveyStore.getById(params.id as string)
        if (survey) {
          setSurveyTitle(survey.title)
          setSurveyDescription(survey.description)
          setQuestions(survey.questions)
          setMaxResponses(survey.maxResponses)
          setReward(survey.reward)
          setEstimatedTime(survey.estimatedTime)
        } else {
          setErrors({ general: "Survey not found" })
        }
      } catch (error) {
        setErrors({ general: "Failed to load survey data" })
      } finally {
        setLoading(false)
      }
    }

    // Simulate loading delay
    setTimeout(loadSurvey, 500)
  }, [params.id])

  const addQuestion = (type = "text") => {
    const newId = Math.max(...questions.map(q => q.id), 0) + 1
    const newQuestion = { 
      id: newId, 
      type, 
      question: "", 
      required: true, 
      options: type === "multiple_choice" ? ["Option 1", "Option 2"] : []
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updated = { ...q, [field]: value }
        if (field === "type" && value === "multiple_choice" && !updated.options?.length) {
          updated.options = ["Option 1", "Option 2"]
        }
        return updated
      }
      return q
    }))
  }
  
  const addOption = (questionId: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }
        : q
    ))
  }
  
  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options?.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ))
  }
  
  const removeOption = (questionId: number, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options?.filter((_, idx) => idx !== optionIndex) }
        : q
    ))
  }
  
  const validateSurvey = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!surveyTitle.trim()) {
      newErrors.title = "Survey title is required"
    }
    
    if (!surveyDescription.trim()) {
      newErrors.description = "Survey description is required"
    }
    
    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors[`question-${q.id}`] = `Question ${index + 1} text is required`
      }
      
      if (q.type === "multiple_choice" && (!q.options || q.options.length < 2)) {
        newErrors[`options-${q.id}`] = `Question ${index + 1} needs at least 2 options`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSave = async () => {
    if (!validateSurvey()) return
    
    setSaving(true)
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedSurvey = surveyStore.update(params.id as string, {
        title: surveyTitle,
        description: surveyDescription,
        questions,
        maxResponses,
        reward,
        estimatedTime
      })
      
      if (updatedSurvey) {
        setErrors({})
        // Show success message briefly before redirecting
        setTimeout(() => {
          router.push(`/creator/surveys/${params.id}`)
        }, 500)
      } else {
        setErrors({ general: "Failed to save changes. Survey not found." })
      }
    } catch (error) {
      setErrors({ general: "Failed to save changes. Please try again." })
    } finally {
      setSaving(false)
    }
  }
  
  const handlePreview = () => {
    if (validateSurvey()) {
      setShowPreview(true)
    }
  }
  
  const totalBudget = maxResponses * reward

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader 
        title="Edit Survey" 
        description="Make changes to your survey"
      >
        <Button variant="outline" onClick={handlePreview} disabled={saving}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button onClick={handleSave} disabled={saving} className="bg-[#013f5c] hover:bg-[#0b577a]">
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  placeholder="Enter survey title..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  placeholder="Describe what this survey is about..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Questions ({questions.length})</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-xl p-6 space-y-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Question {index + 1}</Label>
                    {questions.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <Label className="text-sm font-medium mb-2 block">Add Media to Question (Optional)</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx,.gif"
                        className="hidden"
                        id={`media-${question.id}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            // Handle file upload validation here
                          }
                        }}
                      />
                      <label
                        htmlFor={`media-${question.id}`}
                        className="cursor-pointer flex items-center space-x-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg hover:border-[#013f5c] hover:bg-blue-50 transition-all duration-200"
                      >
                        <Upload className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600">Upload Image, Video, PDF, DOC, or GIF</span>
                      </label>
                      <span className="text-xs text-slate-400">Max 10MB</span>
                    </div>
                  </div>
                  
                  <Input
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                    placeholder="Enter your question..."
                    className="text-lg"
                  />
                  
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, "type", e.target.value)}
                        className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#013f5c] focus:border-transparent"
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => updateQuestion(question.id, "required", e.target.checked)}
                        className="rounded border-slate-300 text-[#013f5c] focus:ring-[#013f5c]"
                      />
                      <span className="text-sm font-medium">Required</span>
                    </label>
                  </div>
                  
                  {question.type === "multiple_choice" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Options:</Label>
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1"
                          />
                          {(question.options?.length || 0) > 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(question.id, optIndex)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(question.id)}
                        className="border-dashed"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  )}
                  
                  {question.type === "rating" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Rating Scale:</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="radio" name={`scale-${question.id}`} defaultChecked />
                          <span className="text-sm">1-5 Stars</span>
                          <div className="flex space-x-1 ml-2">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" name={`scale-${question.id}`} />
                          <span className="text-sm">1-10 Scale</span>
                          <div className="flex space-x-1 ml-2">
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                              <span key={num} className="w-6 h-6 bg-slate-100 rounded text-xs flex items-center justify-center">{num}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" name={`scale-${question.id}`} />
                          <span className="text-sm">Emoji Scale</span>
                          <div className="flex space-x-1 ml-2 text-lg">
                            {['😞', '😐', '🙂', '😊', '😍'].map((emoji, idx) => (
                              <span key={idx}>{emoji}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {question.type === "yes_no" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Response Options:</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="radio" name={`yesno-${question.id}`} defaultChecked />
                          <span className="text-sm">Yes / No</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" name={`yesno-${question.id}`} />
                          <span className="text-sm">True / False</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" name={`yesno-${question.id}`} />
                          <span className="text-sm">Agree / Disagree</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" name={`yesno-${question.id}`} />
                          <span className="text-sm">👍 / 👎</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {question.type === "file_upload" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">File Upload Settings:</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-slate-600">Allowed File Types:</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {[
                              { type: "image", label: "Images", icon: Upload, formats: "JPG, PNG" },
                              { type: "gif", label: "GIFs", icon: Upload, formats: "GIF" },
                              { type: "video", label: "Videos", icon: Upload, formats: "MP4, MOV" }
                            ].map((fileType) => (
                              <label key={fileType.type} className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  defaultChecked
                                  className="rounded border-slate-300 text-[#013f5c] focus:ring-[#013f5c]"
                                />
                                <fileType.icon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm">{fileType.label}</span>
                                <span className="text-xs text-slate-400">({fileType.formats})</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Maximum File Size:</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input 
                              type="number" 
                              defaultValue="5" 
                              className="w-20" 
                              min="1" 
                              max="10"
                            />
                            <span className="text-sm text-slate-600">MB</span>
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Upload className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">File Upload Preview</p>
                              <p className="text-xs text-blue-700">Users will see a drag & drop area to upload their files</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxResponses">Max Responses</Label>
                <Input
                  id="maxResponses"
                  type="number"
                  value={maxResponses}
                  onChange={(e) => setMaxResponses(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reward">Reward per Response (₦)</Label>
                <Input
                  id="reward"
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Budget Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Max Responses:</span>
                <span className="text-sm font-medium">{maxResponses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cost per Response:</span>
                <span className="text-sm font-medium">₦{reward}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Budget:</span>
                <span className="font-bold text-[#013f5c]">₦{totalBudget.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Survey Preview</h2>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{surveyTitle || "Untitled Survey"}</h3>
                <p className="text-slate-600">{surveyDescription || "No description provided"}</p>
                <div className="flex items-center space-x-4 mt-4 text-sm text-slate-500">
                  <span>⏱️ {estimatedTime} minutes</span>
                  <span>💰 ₦{reward} reward</span>
                  <span>👥 {maxResponses} max responses</span>
                </div>
              </div>
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-3 border-b pb-4">
                  <Label className="text-lg font-medium">
                    {index + 1}. {question.question || "Question not set"}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {question.type === "text" && (
                    <Textarea placeholder="Your answer..." disabled className="bg-slate-50" />
                  )}
                  {question.type === "multiple_choice" && (
                    <div className="space-y-2">
                      {question.options?.map((option, idx) => (
                        <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name={`q${question.id}`} disabled className="text-[#013f5c]" />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {question.type === "rating" && (
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className="h-6 w-6 text-slate-300 cursor-pointer hover:text-yellow-400" />
                      ))}
                    </div>
                  )}
                  {question.type === "yes_no" && (
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name={`q${question.id}`} disabled className="text-[#013f5c]" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name={`q${question.id}`} disabled className="text-[#013f5c]" />
                        <span>No</span>
                      </label>
                    </div>
                  )}
                  {question.type === "file_upload" && (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">Drag & drop files here or click to browse</p>
                      <p className="text-xs text-slate-400 mt-1">Max file size: 10MB</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close Preview
                </Button>
                <Button className="bg-[#013f5c] hover:bg-[#0b577a]">
                  Submit Survey
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}