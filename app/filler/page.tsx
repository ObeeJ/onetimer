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
import { Breadcrumb } from "@/components/ui/breadcrumb"


export default function DashboardPage() {
  const { user, isAuthenticated, isVerified, isLoading } = useAuth()
  const router = useRouter()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
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
                      <p className="text-3xl font-bold text-slate-900">12</p>
                      <p className="text-xs text-green-600 mt-1">+3 this week</p>
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
                      <p className="text-3xl font-bold text-slate-900">₦6,500</p>
                      <p className="text-xs text-blue-600 mt-1">Available: ₦2,300</p>
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
                      <p className="text-3xl font-bold text-slate-900">₦4,200</p>
                      <p className="text-xs text-purple-600 mt-1">Last: Jan 15</p>
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
          
          {/* Change to false to test empty state */}
          {true ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700 text-xs">
                      Shopping
                    </Badge>
                    <div className="text-lg font-bold text-green-600">₦550</div>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Consumer Shopping Habits Survey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    Share your shopping preferences and earn rewards
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>8 mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>234</span>
                    </div>
                  </div>
                  <Button asChild variant="filler" className="w-full">
                    <Link href="/filler/surveys/1">
                      Start Survey
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full bg-purple-100 text-purple-700 text-xs">
                      Technology
                    </Badge>
                    <div className="text-lg font-bold text-green-600">₦325</div>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Technology Usage Survey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    Help us understand how people use technology
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>5 mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>156</span>
                    </div>
                  </div>
                  <Button asChild variant="filler" className="w-full">
                    <Link href="/filler/surveys/2">
                      Start Survey
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full bg-orange-100 text-orange-700 text-xs">
                      Food
                    </Badge>
                    <div className="text-lg font-bold text-green-600">₦475</div>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Food & Dining Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    Tell us about your dining and food preferences
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>7 mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>89</span>
                    </div>
                  </div>
                  <Button asChild variant="filler" className="w-full">
                    <Link href="/filler/surveys/3">
                      Start Survey
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full bg-green-100 text-green-700 text-xs">
                      Healthcare
                    </Badge>
                    <div className="text-lg font-bold text-green-600">₦725</div>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Healthcare & Wellness Survey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    Share insights about healthcare experiences
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>12 mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>67</span>
                    </div>
                  </div>
                  <Button asChild variant="filler" className="w-full">
                    <Link href="/filler/surveys/4">
                      Start Survey
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full bg-pink-100 text-pink-700 text-xs">
                      Travel
                    </Badge>
                    <div className="text-lg font-bold text-green-600">₦600</div>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Travel & Tourism Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    Help tourism companies understand travel preferences
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>10 mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>145</span>
                    </div>
                  </div>
                  <Button asChild variant="filler" className="w-full">
                    <Link href="/filler/surveys/5">
                      Start Survey
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full bg-indigo-100 text-indigo-700 text-xs">
                      Education
                    </Badge>
                    <div className="text-lg font-bold text-green-600">₦450</div>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Online Learning Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    Share your experience with online education platforms
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>6 mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>98</span>
                    </div>
                  </div>
                  <Button asChild variant="filler" className="w-full">
                    <Link href="/filler/surveys/6">
                      Start Survey
                    </Link>
                  </Button>
                </CardContent>
              </Card>
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
