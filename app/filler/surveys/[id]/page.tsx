"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Clock, DollarSign, Users, ArrowLeft, Play } from "lucide-react"

export default function SurveyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id

  // Mock survey data - replace with actual API call
  const survey = {
    id: surveyId,
    title: "Consumer Shopping Habits Survey",
    description: "Share your shopping preferences and earn rewards. This comprehensive survey covers online and offline shopping behaviors, including your favorite stores, payment methods, and shopping frequency.",
    reward: "₦550",
    duration: "8 mins",
    participants: 234,
    category: "Shopping",
    difficulty: "Easy",
    questions: 15,
    estimatedTime: "5-10 minutes"
  }

  const handleStartSurvey = () => {
    // Navigate to survey taking interface
    router.push(`/filler/surveys/${surveyId}/take`)
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
        <Breadcrumb 
          items={[
            { label: "Surveys", href: "/filler/surveys" },
            { label: survey.title }
          ]} 
        />

        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Surveys
          </Button>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700">
                      {survey.category}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {survey.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {survey.title}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{survey.reward}</div>
                  <div className="text-sm text-slate-500">Reward</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                {survey.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                  <div className="font-semibold text-slate-900">{survey.duration}</div>
                  <div className="text-xs text-slate-500">Duration</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                  <div className="font-semibold text-slate-900">{survey.participants}</div>
                  <div className="text-xs text-slate-500">Participants</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900 mb-2">{survey.questions}</div>
                  <div className="text-xs text-slate-500">Questions</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-slate-600" />
                  <div className="font-semibold text-slate-900">Easy</div>
                  <div className="text-xs text-slate-500">Difficulty</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Survey Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Answer all questions honestly and completely</li>
                  <li>• You can pause and resume the survey at any time</li>
                  <li>• Reward will be credited after survey completion</li>
                  <li>• Estimated completion time: {survey.estimatedTime}</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStartSurvey}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] flex-1 bg-[#013F5C] hover:bg-[#012d42] text-white h-12 text-base font-semibold px-6"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Survey
                </button>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-6 rounded-xl h-12"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}