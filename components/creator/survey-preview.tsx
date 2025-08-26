"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Eye,
  Smartphone,
  Monitor,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  CheckCircle2
} from "lucide-react"
import type { Survey, SurveyQuestion } from "@/types/creator"

interface SurveyPreviewProps {
  survey: Survey
  onClose: () => void
  mode?: 'desktop' | 'mobile'
}

interface PreviewResponse {
  [questionId: string]: string | string[] | number
}

export function SurveyPreview({ survey, onClose, mode = 'desktop' }: SurveyPreviewProps) {
  const [responses, setResponses] = useState<PreviewResponse>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(mode)
  const [showAllQuestions, setShowAllQuestions] = useState(true)

  const updateResponse = (questionId: string, value: string | string[] | number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const renderQuestion = (question: SurveyQuestion, index: number) => {
    const response = responses[question.id]

    switch (question.type) {
      case "single_choice":
        return (
          <div className="space-y-3">
            <RadioGroup
              value={response as string || ""}
              onValueChange={(value) => updateResponse(question.id, value)}
            >
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-${optionIndex}`}
                  />
                  <Label
                    htmlFor={`${question.id}-${optionIndex}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "multiple_choice":
        const multiResponse = (response as string[]) || []
        return (
          <div className="space-y-3">
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${optionIndex}`}
                  checked={multiResponse.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateResponse(question.id, [...multiResponse, option])
                    } else {
                      updateResponse(question.id, multiResponse.filter(r => r !== option))
                    }
                  }}
                />
                <Label
                  htmlFor={`${question.id}-${optionIndex}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "text":
        return (
          <Input
            value={(response as string) || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="rounded-xl"
          />
        )

      case "textarea":
        return (
          <Textarea
            value={(response as string) || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Enter your detailed response..."
            className="rounded-xl min-h-[100px] resize-none"
            rows={4}
          />
        )

      case "rating":
        const ratingValue = (response as number) || 0
        const min = question.scaleMin || 1
        const max = question.scaleMax || 5
        
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: max - min + 1 }, (_, i) => {
                const value = min + i
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateResponse(question.id, value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      ratingValue === value
                        ? 'border-[#013F5C] bg-[#013F5C] text-white'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        )

      case "boolean":
        return (
          <RadioGroup
            value={response as string || ""}
            onValueChange={(value) => updateResponse(question.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`} className="text-sm font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`} className="text-sm font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        )

      default:
        return <p className="text-slate-500 italic">Unsupported question type</p>
    }
  }

  const currentQuestion = survey.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  const containerClass = viewMode === 'mobile' 
    ? "max-w-sm mx-auto" 
    : "max-w-4xl mx-auto"

  return (
    <div className={`w-full h-full flex flex-col ${containerClass}`}>
      {/* Controls Header */}
      <div className="flex-shrink-0 border-b border-slate-200 p-4 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-[#013F5C]" />
          <span className="text-sm font-medium text-slate-700">{survey.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded transition-all ${
                viewMode === 'desktop'
                  ? 'bg-white text-[#013F5C] shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded transition-all ${
                viewMode === 'mobile'
                  ? 'bg-white text-[#013F5C] shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* View Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllQuestions(!showAllQuestions)}
            className="rounded-lg"
          >
            {showAllQuestions ? 'Single View' : 'All Questions'}
          </Button>
        </div>
      </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {showAllQuestions ? (
            /* All Questions View */
            <div className="space-y-6">
              {/* Survey Header */}
              <div className="text-center space-y-2 pb-6 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">{survey.title}</h1>
                {survey.description && (
                  <p className="text-slate-600 max-w-2xl mx-auto">{survey.description}</p>
                )}
                <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                  <span>{survey.questions.length} questions</span>
                  <span>•</span>
                  <span>~{Math.ceil(survey.questions.length * 0.5)} min</span>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-8">
                {survey.questions.map((question, index) => (
                  <Card key={question.id} className="rounded-xl border-slate-200/60">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-[#013F5C] text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-2">
                              <h3 className="font-medium text-slate-900 flex-1">
                                {question.text}
                              </h3>
                              {question.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            {question.description && (
                              <p className="text-sm text-slate-600">{question.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="ml-11">
                          {renderQuestion(question, index)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6 border-t border-slate-200">
                <Button
                  size="lg"
                  className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a] px-8"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Survey
                </Button>
              </div>
            </div>
          ) : (
            /* Single Question View */
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Question {currentQuestionIndex + 1} of {survey.questions.length}</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / survey.questions.length) * 100)}% complete</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#013F5C] transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Current Question */}
              <Card className="rounded-xl border-slate-200/60">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <h2 className="text-xl font-semibold text-slate-900 flex-1">
                          {currentQuestion.text}
                        </h2>
                        {currentQuestion.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      {currentQuestion.description && (
                        <p className="text-slate-600">{currentQuestion.description}</p>
                      )}
                    </div>

                    {renderQuestion(currentQuestion, currentQuestionIndex)}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={isFirstQuestion}
                  className="rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {survey.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-[#013F5C] w-6'
                          : index < currentQuestionIndex
                          ? 'bg-green-500'
                          : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>

                {isLastQuestion ? (
                  <Button className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(survey.questions.length - 1, prev + 1))}
                    className="rounded-xl bg-[#013F5C] hover:bg-[#0b577a]"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-200 p-4 bg-slate-50">
          <div className="text-center text-xs text-slate-500">
            This is a preview of your survey. Responses are not saved.
          </div>
        </div>
    </div>
  )
}
