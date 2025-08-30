import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ArrowLeft, Clock, Coins, Users, Calendar, Target, MapPin } from "lucide-react"

async function getSurvey(id: string) {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : process.env.NEXT_PUBLIC_BASE_URL ?? ''
    const res = await fetch(`${baseUrl}/api/surveys/${id}`, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getSurvey(id)
  if (!data?.data) notFound()
  const survey = data.data
  
  const progressPercentage = Math.round((156 / 500) * 100)
  const categoryColors = {
    lifestyle: 'bg-purple-100 text-purple-700 border-purple-200',
    finance: 'bg-green-100 text-green-700 border-green-200',
    tech: 'bg-blue-100 text-blue-700 border-blue-200',
    health: 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto pb-20 lg:pb-8">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            asChild
            variant="ghost"
            className="rounded-2xl font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 p-2"
          >
            <Link href="/filler/surveys" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Surveys
            </Link>
          </Button>
        </div>

        {/* Main Survey Card */}
        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl leading-tight">
                {survey.title}
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                {survey.description}
              </p>
              <Badge
                className={`w-fit rounded-full px-4 py-2 text-sm font-semibold border ${categoryColors[survey.category as keyof typeof categoryColors] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
              >
                {survey.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Survey Metadata Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 hover:from-slate-100 hover:to-slate-50 transition-all duration-200">
                <div className="rounded-xl bg-[#013F5C]/10 p-3">
                  <Clock className="h-6 w-6 text-[#013F5C]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Estimated Time</p>
                  <p className="text-xl font-bold text-slate-900">{survey.estimatedTime} min</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 hover:from-amber-100 hover:to-amber-50 transition-all duration-200">
                <div className="rounded-xl bg-amber-500/10 p-3">
                  <Coins className="h-6 w-6 text-amber-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Reward</p>
                  <p className="text-xl font-bold text-amber-700">{survey.reward} points</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 hover:from-blue-100 hover:to-blue-50 transition-all duration-200">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Target Audience</p>
                  <p className="text-lg font-semibold text-slate-900">Adults 18-65</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100/50 p-4 hover:from-green-100 hover:to-green-50 transition-all duration-200">
                <div className="rounded-xl bg-green-500/10 p-3">
                  <Target className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Questions</p>
                  <p className="text-lg font-semibold text-slate-900">{survey.questions?.length || 8} questions</p>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Survey Progress</h2>
              <div className="rounded-2xl bg-slate-50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Responses Collected</span>
                  <span className="text-sm font-bold text-slate-900">156 / 500</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-3" 
                  aria-label={`Survey progress: ${progressPercentage}% complete`}
                />
                <p className="text-xs text-slate-500">{progressPercentage}% complete • {500 - 156} responses needed</p>
              </div>
            </div>

            {/* Eligibility Status */}
            <div className={`rounded-2xl border p-6 ${
              survey.eligible 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-3 w-3 rounded-full ${
                  survey.eligible ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className={`font-semibold ${
                    survey.eligible ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {survey.eligible ? '✓ You are eligible for this survey' : '✗ You are not eligible for this survey'}
                  </p>
                  <p className={`mt-1 text-sm ${
                    survey.eligible ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {survey.eligible 
                      ? `Complete this survey to earn ${survey.reward} points and help reach the response goal.`
                      : 'This survey may not match your demographic profile or previous responses.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Bottom CTAs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-4 lg:hidden">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            asChild
            variant="outline"
            className="flex-1 h-12 rounded-2xl border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200"
          >
            <Link href="/filler/surveys">Back</Link>
          </Button>
          <Button
            asChild
            className={`flex-1 h-12 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 ${
              survey.eligible 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            disabled={!survey.eligible}
          >
            <Link href={survey.eligible ? `/filler/surveys/${survey.id}/take` : "#"}>
              {survey.eligible ? 'Take Survey' : 'Not Eligible'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop CTAs */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <Button
              asChild
              variant="outline"
              className="h-14 px-8 rounded-2xl border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              size="lg"
            >
              <Link href="/filler/surveys">Back to Surveys</Link>
            </Button>
            <Button
              asChild
              className={`flex-1 h-14 px-8 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 ${
                survey.eligible 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
              size="lg"
              disabled={!survey.eligible}
            >
              <Link href={survey.eligible ? `/filler/surveys/${survey.id}/take` : "#"}>
                {survey.eligible ? 'Take Survey' : 'Not Eligible'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
