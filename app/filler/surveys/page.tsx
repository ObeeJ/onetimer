"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { Clock, Users, Search, Filter, ListChecks, History } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useSurveys } from "@/hooks/use-surveys"
import { useEarnings } from "@/hooks/use-earnings"
import { ErrorMessage } from "@/components/ui/error-message"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { SurveyCardSkeleton } from "@/components/surveys/survey-card-skeleton"

function AvailableSurveys() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isPending,
    refetch,
  } = useSurveys()
  const [searchTerm, setSearchTerm] = useState("")

  const allSurveys = (data as any)?.pages?.flatMap((page: any) => page.surveys) || []

  const filteredSurveys = allSurveys.filter((survey: any) =>
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isPending) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => <SurveyCardSkeleton key={i} />)}
    </div>
  )

  if (status === 'error') return <ErrorMessage message={error.message} onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Available Surveys</h1>
          <p className="text-slate-600">Complete surveys and earn money for your opinions</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </div>
      </div>
      {filteredSurveys.length === 0 ? (
        <EmptyState icon={Search} title="No surveys found" description="Try adjusting your search terms or check back later for new surveys." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey: any) => (
            <Card key={survey.id} className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700">{survey.category}</Badge>
                  <div className="text-lg font-bold text-green-600">₦{survey.reward}</div>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">{survey.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2">{survey.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{survey.estimated_duration} mins</span></div>
                  <div className="flex items-center gap-1"><Users className="h-3 w-3" /><span>{survey.responses_count || 0}</span></div>
                </div>
                <Button asChild variant="filler" className="w-full"><Link href={`/filler/surveys/${survey.id}`}>View Details</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="text-center mt-8">
        <Button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
            ? 'Load More'
            : 'Nothing more to load'}
        </Button>
      </div>
    </div>
  )
}

import { TransactionListItemSkeleton } from "@/components/earnings/transaction-list-item-skeleton"

function SurveyHistory() {
  const { data: earnings, isLoading, error, refetch } = useEarnings()
  const completedSurveys = earnings?.transactions?.filter(t => t.type === 'earning') || []

  if (isLoading) return (
    <Card className="rounded-xl">
        <CardContent className="p-0">
            <div className="divide-y divide-slate-200">
                {[...Array(5)].map((_, i) => <TransactionListItemSkeleton key={i} />)}
            </div>
        </CardContent>
    </Card>
  )

  if (error) return <ErrorMessage message="Failed to load survey history" onRetry={refetch} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Survey History</h1>
        <p className="text-slate-600">A record of all the surveys you have completed.</p>
      </div>
      {completedSurveys.length === 0 ? (
        <EmptyState icon={History} title="No completed surveys" description="Your completed surveys and earnings will appear here." />
      ) : (
        <Card className="rounded-xl">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200">
              {completedSurveys.map((survey: any) => (
                <div key={survey.id} className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{survey.description}</p>
                    <p className="text-sm text-slate-500">{new Date(survey.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+ ₦{survey.amount}</p>
                    <Badge variant="default" className="bg-green-100 text-green-700">{survey.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function SurveysPage() {
  const { isAuthenticated } = useAuth()
  const reduceMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: reduceMotion ? 0 : 0.1, duration: reduceMotion ? 0.1 : 0.3 } }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <Breadcrumb items={[{ label: "Surveys" }]} />
          <EmptyState icon={ListChecks} title="Sign in to view surveys" description="Create an account or sign in to access our latest surveys and start earning money." action={{ label: "Sign up now", href: "/filler/auth/sign-up" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <Breadcrumb items={[{ label: "Surveys" }]} />
          <Tabs defaultValue="available">
            <TabsList>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="available" className="mt-6">
              <AvailableSurveys />
            </TabsContent>
            <TabsContent value="history" className="mt-6">
              <SurveyHistory />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}