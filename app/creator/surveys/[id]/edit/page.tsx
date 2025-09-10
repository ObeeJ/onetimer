"use client"

import { useParams } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import SurveyBuilder from "@/components/creator/survey-builder"
import { useCreatorAuth } from "@/hooks/use-creator-auth"
import { EmptyState } from "@/components/ui/empty-state"
import { Lock } from "lucide-react"

export default function EditSurveyPage() {
  const params = useParams()
  const surveyId = params.id as string
  const { isAuthenticated } = useCreatorAuth()

  // Mock survey data - would come from API
  const existingSurvey = {
    id: surveyId,
    title: "Consumer Behavior Study",
    description: "Understanding shopping patterns in urban areas",
    targetAudience: "general",
    rewardAmount: 500,
    questions: [
      {
        id: "1",
        type: "multiple_choice" as const,
        title: "What is your age group?",
        description: "Please select your current age range",
        required: true,
        options: ["18-24", "25-34", "35-44", "45-54", "55+"]
      },
      {
        id: "2",
        type: "rating" as const,
        title: "How satisfied are you with online shopping?",
        description: "Rate your overall satisfaction",
        required: true
      },
      {
        id: "3",
        type: "open_ended" as const,
        title: "What improvements would you suggest?",
        description: "Share your thoughts and suggestions",
        required: false
      }
    ]
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <EmptyState
            icon={Lock}
            title="Sign in required"
            description="Please sign in to edit surveys."
            action={{ label: "Sign in", href: "/creator/auth/sign-in" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <Breadcrumb items={[
          { label: "Surveys", href: "/creator/surveys" },
          { label: existingSurvey.title, href: `/creator/surveys/${surveyId}` },
          { label: "Edit" }
        ]} />
        
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Edit Survey</h1>
          <p className="text-lg text-slate-600">Modify your survey and update questions to gather better insights.</p>
        </div>

        <SurveyBuilder initialData={existingSurvey} isEditing={true} />
      </div>
    </div>
  )
}