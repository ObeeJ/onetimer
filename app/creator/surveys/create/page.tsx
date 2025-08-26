"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { surveyStore } from "@/lib/survey-store"
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save,
  Settings,
  Users,
  CreditCard,
  ChevronDown,
  Type,
  CheckSquare,
  Star,
  ToggleLeft,
  Upload,
  Image,
  Video,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"

export default function CreateSurvey() {
  const [surveyTitle, setSurveyTitle] = useState("")
  const [surveyDescription, setSurveyDescription] = useState("")
  const [questions, setQuestions] = useState([
    { id: 1, type: "text", question: "", required: true, options: [] }
  ])
  const [showPreview, setShowPreview] = useState(false)
  const [maxResponses, setMaxResponses] = useState(100)
  const [reward, setReward] = useState(10)
  const [estimatedTime, setEstimatedTime] = useState(5)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const questionTypes = [
    { value: "text", label: "Text Response", icon: Type },
    { value: "multiple_choice", label: "Multiple Choice", icon: CheckSquare },
    { value: "rating", label: "Rating Scale", icon: Star },
    { value: "yes_no", label: "Yes/No", icon: ToggleLeft },
    { value: "file_upload", label: "File Upload", icon: Upload },
  ]
  
  const nigerianStates = [
    "All States", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ]

  const addQuestion = (type = "text") => {
    const newId = Math.max(...questions.map(q => q.id)) + 1
    const newQuestion = { 
      id: newId, 
      type, 
      question: "", 
      required: true, 
      options: type === "multiple_choice" ? ["Option 1", "Option 2"] : [],
      fileTypes: type === "file_upload" ? ["image", "video"] : [],
      maxFileSize: type === "file_upload" ? 5 : null
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
    
    if (maxResponses < 1 || maxResponses > 10000) {
      newErrors.maxResponses = "Max responses must be between 1 and 10,000"
    }
    
    if (reward < 1 || reward > 1000) {
      newErrors.reward = "Reward must be between ₦1 and ₦1,000"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handlePreview = () => {
    if (validateSurvey()) {
      setShowPreview(true)
    }
  }
  
  const handleSaveDraft = async () => {
    if (!validateSurvey()) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setErrors({})
      // Success notification would go here
    } catch (error) {
      setErrors({ general: "Failed to save draft. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFileUpload = (questionId: number, file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/', 'video/', 'application/pdf', 'application/msword', 'image/gif']
    
    if (file.size > maxSize) {
      setErrors({ [`file-${questionId}`]: "File size must be less than 10MB" })
      return false
    }
    
    if (!allowedTypes.some(type => file.type.startsWith(type) || file.type.includes('document'))) {
      setErrors({ [`file-${questionId}`]: "Invalid file type. Please upload images, videos, PDFs, DOCs, or GIFs only." })
      return false
    }
    
    // Clear error if validation passes
    const newErrors = { ...errors }
    delete newErrors[`file-${questionId}`]
    setErrors(newErrors)
    return true
  }
  
  const totalBudget = maxResponses * reward

  return (
    <div>
      <PageHeader 
        title="Create Survey" 
        description="Build your survey step by step"
      >
        <Button variant="outline" onClick={handlePreview} disabled={isLoading}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Saving..." : "Save Draft"}
        </Button>
        <Button 
          onClick={async () => {
            if (!validateSurvey()) return
            
            setIsLoading(true)
            try {
              await new Promise(resolve => setTimeout(resolve, 1500))
              
              const newSurvey = surveyStore.create({
                title: surveyTitle,
                description: surveyDescription,
                questions,
                maxResponses,
                reward,
                estimatedTime,
                status: 'live',
                responses: 0
              })
              
              window.location.href = `/creator/surveys/${newSurvey.id}`
            } catch (error) {
              setErrors({ general: "Failed to launch survey. Please try again." })
            } finally {
              setIsLoading(false)
            }
          }}
          disabled={isLoading}
          className="bg-[#013f5c] hover:bg-[#0b577a]"
        >
          {isLoading ? "Launching..." : "Launch Survey"}
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Survey Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
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
                  onChange={(e) => {
                    setSurveyTitle(e.target.value)
                    if (errors.title) {
                      const newErrors = { ...errors }
                      delete newErrors.title
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="Enter survey title..."
                  className={`mt-1 ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={surveyDescription}
                  onChange={(e) => {
                    setSurveyDescription(e.target.value)
                    if (errors.description) {
                      const newErrors = { ...errors }
                      delete newErrors.description
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="Describe what this survey is about..."
                  className={`mt-1 ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Type Cards - Fixed Sticky */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 py-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold mb-4">Add Questions</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {questionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => addQuestion(type.value)}
                    className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-3 hover:border-[#013f5c] hover:bg-blue-50 transition-all duration-200 text-center"
                  >
                    <div className="flex items-center justify-center mb-1">
                      <type.icon className="h-5 w-5 text-slate-400 group-hover:text-[#013f5c]" />
                      <Plus className="h-4 w-4 text-[#013f5c] ml-1" />
                    </div>
                    <p className="text-xs font-medium text-slate-600 group-hover:text-[#013f5c]">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-xl p-6 space-y-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {questionTypes.find(t => t.value === question.type)?.icon && (
                        <div className="p-2 bg-[#013f5c] rounded-lg">
                          {React.createElement(questionTypes.find(t => t.value === question.type)!.icon, {
                            className: "h-4 w-4 text-white"
                          })}
                        </div>
                      )}
                      <Label className="text-lg font-semibold">Question {index + 1}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {questionTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => addQuestion(type.value)}
                            className="p-1.5 border border-slate-200 rounded-lg hover:border-[#013f5c] hover:bg-blue-50 transition-all duration-200"
                            title={`Add ${type.label}`}
                          >
                            <type.icon className="h-3 w-3 text-slate-400 hover:text-[#013f5c]" />
                          </button>
                        ))}
                      </div>
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
                            handleFileUpload(question.id, file)
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
                    {errors[`file-${question.id}`] && (
                      <p className="text-sm text-red-600 mt-2 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors[`file-${question.id}`]}
                      </p>
                    )}
                  </div>
                  
                  <Input
                    value={question.question}
                    onChange={(e) => {
                      updateQuestion(question.id, "question", e.target.value)
                      if (errors[`question-${question.id}`]) {
                        const newErrors = { ...errors }
                        delete newErrors[`question-${question.id}`]
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="Enter your question..."
                    className={`text-lg ${errors[`question-${question.id}`] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors[`question-${question.id}`] && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors[`question-${question.id}`]}
                    </p>
                  )}
                  
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
                  
                  {/* Question Type Specific Options */}
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
                  
                  {errors[`options-${question.id}`] && (
                    <p className="text-sm text-red-600 mt-2 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors[`options-${question.id}`]}
                    </p>
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
                              { type: "image", label: "Images", icon: Image, formats: "JPG, PNG" },
                              { type: "gif", label: "GIFs", icon: Image, formats: "GIF" },
                              { type: "video", label: "Videos", icon: Video, formats: "MP4, MOV" }
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Survey Settings */}
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
                  onChange={(e) => {
                    setMaxResponses(Number(e.target.value))
                    if (errors.maxResponses) {
                      const newErrors = { ...errors }
                      delete newErrors.maxResponses
                      setErrors(newErrors)
                    }
                  }}
                  className={`mt-1 ${errors.maxResponses ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.maxResponses && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.maxResponses}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="reward">Reward per Response (₦)</Label>
                <Input
                  id="reward"
                  type="number"
                  value={reward}
                  onChange={(e) => {
                    setReward(Number(e.target.value))
                    if (errors.reward) {
                      const newErrors = { ...errors }
                      delete newErrors.reward
                      setErrors(newErrors)
                    }
                  }}
                  className={`mt-1 ${errors.reward ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.reward && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.reward}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Age Range</Label>
                <div className="flex space-x-2 mt-1">
                  <Input placeholder="Min" type="number" />
                  <Input placeholder="Max" type="number" />
                </div>
              </div>
              <div>
                <Label>Location (State)</Label>
                <div className="relative mt-1">
                  <select className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#013f5c] focus:border-transparent">
                    {nigerianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <Label>Gender</Label>
                <div className="relative mt-1">
                  <select className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#013f5c] focus:border-transparent">
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Summary */}
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
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Your Credits:</span>
                <span className="text-sm font-medium">1,250</span>
              </div>
              <Badge className={`w-full justify-center ${
                totalBudget <= 1250 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {totalBudget <= 1250 ? "Sufficient Credits" : "Insufficient Credits"}
              </Badge>
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
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{surveyTitle || "Untitled Survey"}</h3>
                <p className="text-slate-600">{surveyDescription || "No description provided"}</p>
              </div>
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-lg font-medium">
                    {index + 1}. {question.question || "Question not set"}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {question.type === "text" && (
                    <Textarea placeholder="Your answer..." disabled />
                  )}
                  {question.type === "multiple_choice" && (
                    <div className="space-y-2">
                      {question.options?.map((option, idx) => (
                        <label key={idx} className="flex items-center space-x-2">
                          <input type="radio" name={`q${question.id}`} disabled />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {question.type === "rating" && (
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className="h-6 w-6 text-slate-300 cursor-pointer" />
                      ))}
                    </div>
                  )}
                  {question.type === "yes_no" && (
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input type="radio" name={`q${question.id}`} disabled />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name={`q${question.id}`} disabled />
                        <span>No</span>
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}