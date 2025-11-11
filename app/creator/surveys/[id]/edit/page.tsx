"use client"

import { useParams } from "next/navigation"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import SurveyBuilder from "@/components/creator/survey-builder"
import { useAuth } from "@/hooks/use-auth"
import { EmptyState } from "@/components/ui/empty-state"
import { Lock } from "lucide-react"

export default function EditSurveyPage() {
  const params = useParams()
  const surveyId = params ? params.id as string : ""
  const { isAuthenticated } = useAuth()

  // Mock survey data - would come from API
  const existingSurvey = {
    id: surveyId,
    title: "Consumer Behavior Study",
    description: "Understanding shopping patterns in urban areas",
    category: "market_research",
    estimated_duration: 10,
    reward: 500,
    questions: [
      {
        id: "1",
        type: "multi" as const,
        text: "What is your age group?",
        required: true,
        options: ["18-24", "25-34", "35-44", "45-54", "55+"]
      },
      {
        id: "2",
        type: "rating" as const,
        text: "How satisfied are you with online shopping?",
        required: true,
        scale: 5
      },
      {
        id: "3",
        type: "text" as const,
        text: "What improvements would you suggest?",
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