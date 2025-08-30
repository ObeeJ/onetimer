"use client"

import { Breadcrumb } from "@/components/ui/breadcrumb"
import SurveyBuilder from "@/components/creator/survey-builder"
import { useCreatorAuth } from "@/hooks/use-creator-auth"
import { EmptyState } from "@/components/ui/empty-state"
import { Lock } from "lucide-react"

export default function CreateSurveyPage() {
  console.log("CreateSurveyPage rendering")
  const { isAuthenticated, isApproved } = useCreatorAuth()
  console.log("Create survey auth state:", { isAuthenticated, isApproved })

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <EmptyState
            icon={Lock}
            title="Sign in required"
            description="Please sign in to create surveys."
            action={{ label: "Sign in", href: "/creator/auth/sign-in" }}
          />
        </div>
      </div>
    )
  }

  // All authenticated users can create surveys

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <Breadcrumb items={[{ label: "Surveys", href: "/creator/surveys" }, { label: "Create" }]} />
        
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-r from-white/90 via-slate-50/50 to-white/90 backdrop-blur-sm p-8 shadow-sm mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C1654B]/5 to-transparent"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Create New Survey</h1>
            <p className="text-lg text-slate-600">Build your survey and start collecting valuable insights from our community.</p>
          </div>
        </div>

        <SurveyBuilder />
      </div>
    </div>
  )
}