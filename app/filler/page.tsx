"use client"

import Link from "next/link"
import { motion, useReducedMotion, easeOut } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SurveysSection from "@/components/surveys/surveys-section"
import { TrendingUp, Users, Wallet, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import StatsCards from "@/components/dashboard/stats-cards"

export default function DashboardPage() {
  const { user, isAuthenticated, isVerified } = useAuth()
  const reduceMotion = useReducedMotion()

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
                  : 'Join thousands earning money by sharing their opinions. Sign up to get started.'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCards isAuthenticated={isAuthenticated} isVerified={isVerified} />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-2 auto-rows-fr">
          <Card className="min-w-0 w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#c0694b] flex-shrink-0" />
                <CardTitle className="text-lg font-bold text-slate-900 truncate">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 font-medium break-words">Jump into surveys and start earning immediately.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  asChild
                  variant="accent"
                  className="h-12 rounded-xl font-semibold transition-all hover:shadow-md"
                  size="lg"
                >
                  <Link href="/filler/surveys" className="flex items-center gap-2">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Check Surveys</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  className="h-12 rounded-xl font-semibold transition-all hover:shadow-md"
                  size="lg"
                >
                  <Link href="/filler/earnings" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">View Earnings</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Plus className="h-5 w-5 text-[#c0694b] flex-shrink-0" />
                  <CardTitle className="text-lg font-bold text-slate-900 truncate">Become a Creator</CardTitle>
                </div>
                <Badge variant="secondary" className="rounded-full bg-orange-100 text-orange-700 flex-shrink-0">
                  New
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 font-medium break-words">
                Launch your own surveys and collect valuable data from our community.
              </p>
              <Button
                asChild
                variant="default"
                className="h-12 w-full rounded-xl font-semibold transition-all hover:shadow-md"
                size="lg"
              >
                <Link href="/creator/auth/sign-up" className="flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Create Survey</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Available Surveys</h2>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Link href="/filler/surveys">View All</Link>
            </Button>
          </div>
          <SurveysSection />
        </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
