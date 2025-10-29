"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, useReducedMotion, easeOut } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Wallet, ListChecks, Clock } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { useSurveys } from "@/hooks/use-surveys"
import { useEarnings } from "@/hooks/use-earnings"
import { Breadcrumb } from "@/components/ui/breadcrumb"


export default function DashboardPage() {
  const { user, isAuthenticated, isVerified, isLoading } = useAuth()
  const { data: surveys, isLoading: surveysLoading } = useSurveys()
  const { data: earnings } = useEarnings()
  const router = useRouter()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/filler/auth/sign-in")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.1,
        duration: reduceMotion ? 0.1 : 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.1 : 0.4, ease: easeOut },
    },
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <Breadcrumb items={[{ label: "Dashboard" }]} className="mb-4" />
        </motion.div>
        
        <motion.div variants={itemVariants} className="-mt-2">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-1 sm:px-6 lg:px-8 rounded-2xl bg-white/70 backdrop-blur-xl shadow-sm">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {isAuthenticated ? `Welcome back, ${user?.name || 'User'}!` : 'Welcome to OneTime Survey'}
              </h1>
              <p className="text-slate-600 font-medium">
                {isAuthenticated 
                  ? (isVerified ? 'Ready to earn? Check out available surveys and track your progress.' : 'Complete verification to unlock all features and start earning.')
                  : 'Join thousands earning money by sharing their opinions.'}
              </p>
            </div>
          </div>
        </motion.div>

        {isAuthenticated && (
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Surveys Completed</p>
                      <p className="text-3xl font-bold text-slate-900">{earnings?.transactions?.filter(t => t.type === 'earning').length || 0}</p>
                      <p className="text-xs text-green-600 mt-1">+{earnings?.transactions?.filter(t => t.type === 'earning' && new Date(t.date) > new Date(Date.now() - 7*24*60*60*1000)).length || 0} this week</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#013F5C]/10">
                      <ListChecks className="h-6 w-6 text-[#013F5C]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Earned</p>
                      <p className="text-3xl font-bold text-slate-900">₦{earnings?.total?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-blue-600 mt-1">Available: ₦{earnings?.available?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100">
                      <Wallet className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Hours Spent</p>
                      <p className="text-3xl font-bold text-slate-900">8.5</p>
                      <p className="text-xs text-slate-500 mt-1">This month</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-100">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Withdrawn</p>
                      <p className="text-3xl font-bold text-slate-900">₦{earnings?.withdrawn?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-purple-600 mt-1">Last: {earnings?.transactions?.find(t => t.type === 'withdrawal')?.date ? new Date(earnings.transactions.find(t => t.type === 'withdrawal')!.date).toLocaleDateString() : 'Never'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-100">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
        




        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Available Surveys</h2>
              <p className="text-slate-600">Complete surveys and earn money for your opinions</p>
            </div>
            <Link href="/filler/surveys" className="text-sm text-[#013F5C] hover:text-[#012d42] font-medium transition-colors">
              View all surveys →
            </Link>
          </div>
          
                     {surveys && surveys.pages.reduce((acc, page) => acc + page.surveys.length, 0) > 0 ? (            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {surveys.pages.flatMap(page => page.surveys).slice(0, 6).map((survey) => (                <Card key={survey.id} className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700 text-xs">
                        {survey.category}
                      </Badge>
                      <div className="text-lg font-bold text-green-600">₦{survey.reward}</div>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900">
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
                        <span>{survey.estimated_duration} mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{survey.responses_count || 0}</span>
                      </div>
                    </div>
                    <Button asChild variant="filler" className="w-full">
                      <Link href={`/filler/surveys/${survey.id}`}>
                        Start Survey
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty state when no surveys available */
            <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <ListChecks className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">No surveys available right now</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  New surveys are added regularly. Check back soon for new opportunities to earn money by sharing your opinions.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
