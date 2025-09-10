"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Clock, DollarSign, Users, ListChecks } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function SurveysSection() {
  const { isAuthenticated } = useAuth()
  
  // TODO: Replace with actual data from API
  const surveys = isAuthenticated ? [
    {
      id: "1",
      title: "Consumer Shopping Habits Survey",
      description: "Share your shopping preferences and earn rewards",
      reward: "₦550",
      duration: "8 mins",
      participants: 234,
      category: "Shopping"
    },
    {
      id: "2", 
      title: "Technology Usage Survey",
      description: "Help us understand how people use technology",
      reward: "₦325",
      duration: "5 mins",
      participants: 156,
      category: "Technology"
    },
    {
      id: "3",
      title: "Food & Dining Preferences",
      description: "Tell us about your dining and food preferences",
      reward: "₦475",
      duration: "7 mins",
      participants: 89,
      category: "Food"
    }
  ] : [
    {
      id: "demo-1",
      title: "Sample Survey: Shopping Habits",
      description: "Example survey about consumer preferences",
      reward: "₦550",
      duration: "8 mins",
      participants: 234,
      category: "Demo"
    },
    {
      id: "demo-2",
      title: "Sample Survey: Technology Usage", 
      description: "Example survey about technology adoption",
      reward: "₦325",
      duration: "5 mins",
      participants: 156,
      category: "Demo"
    }
  ]

  if (!isAuthenticated && surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-slate-100 p-6 mb-4">
          <ListChecks className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No surveys available</h3>
        <p className="text-slate-600 mb-6 max-w-sm">Sign up to access our latest surveys and start earning money today.</p>
        <Button asChild variant="filler">
          <Link href="/filler/auth/sign-up">
            Sign up now
          </Link>
        </Button>
      </div>
    )
  }

  if (isAuthenticated && surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-slate-100 p-6 mb-4">
          <ListChecks className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No surveys available right now</h3>
        <p className="text-slate-600 mb-6 max-w-sm">New surveys are added regularly. Check back soon or complete your profile to get more targeted surveys.</p>
        <Button asChild variant="filler">
          <Link href="/filler/profile">
            Complete profile
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {surveys.map((survey) => (
        <Card key={survey.id} className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700 text-xs">
                {survey.category}
              </Badge>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-green-600">{survey.reward}</div>
              </div>
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2">
              {survey.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 line-clamp-2">
              {survey.description}
            </p>
            
            <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>{survey.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span>{survey.participants}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <Button asChild variant="filler" className="w-full">
                <Link href={`/filler/surveys/${survey.id}`}>
                  Start Survey
                </Link>
              </Button>
            ) : (
              <Button asChild variant="filler" className="w-full">
                <Link href="/filler/auth/sign-up">
                  Sign up to start
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}