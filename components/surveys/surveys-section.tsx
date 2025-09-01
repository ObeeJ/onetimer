"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Clock, DollarSign, Users, ListChecks } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { fetchJSON } from "@/hooks/use-api"

export default function SurveysSection() {
  const { isAuthenticated } = useAuth()
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const response = await fetchJSON('/api/surveys')
        setSurveys(response.data || [])
      } catch (error) {
        console.error('Failed to load surveys:', error)
        // Fallback to mock data
        setSurveys(isAuthenticated ? [
          {
            id: "1",
            title: "Consumer Shopping Habits Survey",
            description: "Share your shopping preferences and earn rewards",
            reward: 550,
            estimatedTime: 8,
            category: "Shopping"
          },
          {
            id: "2", 
            title: "Technology Usage Survey",
            description: "Help us understand how people use technology",
            reward: 325,
            estimatedTime: 5,
            category: "Technology"
          }
        ] : [])
      } finally {
        setLoading(false)
      }
    }
    loadSurveys()
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-200 rounded-2xl h-48"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!isAuthenticated && surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-slate-100 p-6 mb-4">
          <ListChecks className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No surveys available</h3>
        <p className="text-slate-600 mb-6 max-w-sm">Sign up to access our latest surveys and start earning money today.</p>
        <Button asChild variant="filler">
          <Link href="/filler/auth/sign-up">Sign up now</Link>
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
          <Link href="/filler/profile">Complete profile</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {surveys.map((survey) => (
        <Card key={survey.id} className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700">
                {survey.category}
              </Badge>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">₦{survey.reward}</div>
              </div>
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2">
              {survey.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 line-clamp-2">
              {survey.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{survey.estimatedTime} mins</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Available</span>
              </div>
            </div>

            <Button 
              asChild 
              variant="filler"
              className="w-full rounded-xl"
              disabled={!isAuthenticated}
            >
              {isAuthenticated ? (
                <Link href={`/filler/surveys/${survey.id}`}>
                  Start Survey
                </Link>
              ) : (
                <Link href="/filler/auth/sign-up">
                  Sign up to start
                </Link>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}