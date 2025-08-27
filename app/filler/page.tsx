"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SurveysSection from "@/components/surveys/surveys-section"
import { TrendingUp, Users, Wallet, Plus } from "lucide-react"

export default function DashboardPage() {
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
      transition: { duration: reduceMotion ? 0.1 : 0.4, ease: "easeOut" },
    },
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back to OneTime Survey
          </h1>
          <p className="text-slate-600 font-medium">
            Ready to earn? Check out available surveys and track your progress.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <Card className="glass-card rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#013F5C]" />
                <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 font-medium">Jump into surveys and start earning immediately.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col xl:flex-row">
                <Button
                  asChild
                  className="h-12 flex-1 rounded-xl bg-[#013F5C] font-semibold text-white transition-all hover:bg-[#0b577a] hover:shadow-md"
                  size="lg"
                >
                  <Link href="/filler/surveys" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Check Surveys
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-12 flex-1 rounded-xl bg-[#C1654B] font-semibold text-white transition-all hover:bg-[#b25a43] hover:shadow-md"
                  size="lg"
                >
                  <Link href="/filler/earnings" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    View Earnings
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-xl border-slate-300 bg-white font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400"
                  size="lg"
                >
                  Track Progress
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#C1654B]" />
                  <CardTitle className="text-lg font-bold text-slate-900">Become a Creator</CardTitle>
                </div>
                <Badge variant="secondary" className="rounded-full bg-orange-100 text-orange-700">
                  New
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 font-medium">
                Launch your own surveys and collect valuable data from our community.
              </p>
              <Button
                asChild
                className="h-12 w-full rounded-xl bg-[#C1654B] font-semibold text-white transition-all hover:bg-[#b25a43] hover:shadow-md"
                size="lg"
              >
                <Link href="/creator/auth/sign-up" className="flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Survey
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
  )
}
