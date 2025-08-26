"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  Send
} from "lucide-react"

export default function SurveyPreviewPage() {
  const params = useParams()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})

  // Mock survey data
  const survey = {
    id: params.id,
    title: "Customer Satisfaction Survey 2025",
    description: "Help us improve our services by sharing your feedback. This survey takes approximately 5-7 minutes to complete.",
    rewardPerResponse: 200,
    estimatedDuration: "5-7 minutes",
    totalQuestions: 8,
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "How would you rate your overall satisfaction with our service?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
        required: true
      },
      {
        id: 2,
        type: "multiple_choice",
        question: "How often do you use our service?",
        options: ["Daily", "Weekly", "Monthly", "Rarely", "This is my first time"],
        required: true
      },
      {
        id: 3,
        type: "checkbox",
        question: "Which features do you find most valuable? (Select all that apply)",
        options: ["Easy to use interface", "Fast response time", "Customer support", "Pricing", "Mobile app", "Security features"],
        required: false
      },
      {
        id: 4,
        type: "rating",
        question: "On a scale of 1-10, how likely are you to recommend us to a friend?",
        scale: 10,
        required: true
      },
      {
        id: 5,
        type: "yes_no",
        question: "Would you be interested in beta testing new features?",
        required: false
      },
      {
        id: 6,
        type: "multiple_choice",
        question: "What is your age group?",
        options: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
        required: false
      },
      {
        id: 7,
        type: "multiple_choice",
        question: "What is your primary use case for our service?",
        options: ["Personal use", "Business use", "Educational", "Research", "Other"],
        required: true
      },
      {
        id: 8,
        type: "open_ended",
        question: "Do you have any additional feedback or suggestions for improvement?",
        placeholder: "Please share any thoughts, suggestions, or feedback...",
        required: false
      }
    ]
  }

  const currentQ = survey.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / survey.totalQuestions) * 100

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < survey.totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    alert("Survey submitted! Thank you for your feedback.")
  }

  const isAnswered = answers[currentQuestion] !== undefined
  const canProceed = !currentQ.required || isAnswered

  const renderQuestion = () => {
    switch (currentQ.type) {
      case "multiple_choice":
        return (
          <RadioGroup
            value={answers[currentQuestion] || ""}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQ.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        const selectedOptions = answers[currentQuestion] || []
        return (
          <div className="space-y-3">
            {currentQ.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`checkbox-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    const newSelection = checked
                      ? [...selectedOptions, option]
                      : selectedOptions.filter((item: string) => item !== option)
                    handleAnswer(newSelection)
                  }}
                />
                <Label htmlFor={`checkbox-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "rating":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Not likely at all</span>
              <span>Extremely likely</span>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: currentQ.scale || 10 }, (_, i) => (
                <Button
                  key={i}
                  variant={answers[currentQuestion] === i + 1 ? "default" : "outline"}
                  className="w-12 h-12 p-0"
                  onClick={() => handleAnswer(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )

      case "yes_no":
        return (
          <RadioGroup
            value={answers[currentQuestion] || ""}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        )

      case "open_ended":
        return (
          <Textarea
            value={answers[currentQuestion] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQ.placeholder || "Please enter your response..."}
            rows={4}
            className="w-full"
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/creator/surveys/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Survey
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Survey Preview</h1>
            <p className="text-slate-600">Preview how your survey will appear to respondents</p>
          </div>
        </div>

        {/* Survey Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{survey.title}</CardTitle>
              <Badge className="bg-green-100 text-green-800">
                <DollarSign className="h-3 w-3 mr-1" />
                ₦{survey.rewardPerResponse} Reward
              </Badge>
            </div>
            <p className="text-slate-600">{survey.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{survey.estimatedDuration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{survey.totalQuestions} questions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Question {currentQuestion + 1} of {survey.totalQuestions}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg leading-relaxed pr-4">
                {currentQ.question}
              </CardTitle>
              {currentQ.required && (
                <Badge variant="secondary" className="flex-shrink-0">
                  Required
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {renderQuestion()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestion === survey.totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Survey
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-[#013f5c] hover:bg-[#012a3d]"
            >
              Next Question
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Preview Notice */}
        <Card className="mt-8">
          <CardContent className="py-4">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-slate-600">
                This is a preview. Responses are not saved. 
                <Link href={`/creator/surveys/${params.id}`} className="text-[#013f5c] hover:underline ml-1">
                  Return to survey management
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
