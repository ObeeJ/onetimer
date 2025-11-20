"use client"

import { useSurvey } from "@/hooks/use-surveys"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, HelpCircle, Award, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SurveyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: survey, isLoading, error, refetch } = useSurvey(params.id)

  // Check for invalid survey ID and redirect
  useEffect(() => {
    if (!params.id || params.id === 'undefined' || params.id === 'null') {
      router.replace('/filler/surveys')
    }
  }, [params.id, router])

  // Don't render anything if ID is invalid
  if (!params.id || params.id === 'undefined' || params.id === 'null') {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorMessage
        message="Failed to load survey details"
        onRetry={refetch}
      />
    )
  }

  if (!survey) {
    return (
      <div className="text-center">
        <p>Survey not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Breadcrumb items={[{ label: "Surveys", href: "/filler/surveys" }, { label: "Details" }]} />
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader className="text-center p-8 bg-slate-50 rounded-t-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">{survey.title}</CardTitle>
          <CardDescription className="text-lg text-slate-600 mt-2">{survey.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-slate-50 rounded-xl">
              <Clock className="h-6 w-6 mx-auto text-slate-500 mb-2" />
              <p className="text-sm font-medium text-slate-600">Estimated Time</p>
              <p className="text-lg font-bold text-slate-900">{survey.estimated_duration} mins</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <HelpCircle className="h-6 w-6 mx-auto text-slate-500 mb-2" />
              <p className="text-sm font-medium text-slate-600">Questions</p>
              <p className="text-lg font-bold text-slate-900">{survey.questions?.length || 0}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <CheckCircle className="h-6 w-6 mx-auto text-slate-500 mb-2" />
              <p className="text-sm font-medium text-slate-600">Reward</p>
              <p className="text-lg font-bold text-green-600">₦{survey.reward}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-8 pt-0">
          <Button asChild size="lg" className="w-full text-lg font-semibold group">
            <Link href={`/filler/surveys/${params.id}/take`}>
              Start Survey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
