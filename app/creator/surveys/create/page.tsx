"use client"

import { useState, useEffect } from "react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import SurveyBuilder from "@/components/creator/survey-builder"
import { useAuth } from "@/providers/auth-provider"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Lock } from "lucide-react"

export default function CreateSurveyPage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [templatesLoading, setTemplatesLoading] = useState(true)

  useEffect(() => {
    // Simulate template fetching
    const fetchTemplates = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setTemplatesLoading(false)
      } catch (error) {
        setTemplatesLoading(false)
      }
    }
    if (isAuthenticated && user?.role === 'creator') {
      fetchTemplates()
    }
  }, [isAuthenticated, user?.role])

  if (isLoading || (isAuthenticated && user?.role === 'creator' && templatesLoading)) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading survey templates...</h2>
              <p className="text-slate-600">Please wait while we prepare your survey builder.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'creator') {
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
        
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Create New Survey</h1>
          <p className="text-lg text-slate-600">Build your survey and start collecting valuable insights from our community.</p>
        </div>

        <SurveyBuilder />
      </div>
    </div>
  )
}