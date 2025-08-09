"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SurveysSection from "@/components/surveys/surveys-section"

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="col-span-1 rounded-2xl border-slate-200 bg-white/70 backdrop-blur-xl md:col-span-2">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">Jump into surveys and earn fast.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="h-11 rounded-2xl bg-[#013F5C] text-white hover:bg-[#0b577a]" size="lg">
                  <Link href="/filler/surveys">Check Survey</Link>
                </Button>
                <Button asChild className="h-11 rounded-2xl bg-[#C1654B] text-white hover:bg-[#b25a43]" size="lg">
                  <Link href="/filler/earnings">View Earnings</Link>
                </Button>
                <Button variant="outline" className="h-11 rounded-2xl bg-transparent" size="lg">
                  Track Incomplete
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white/70 backdrop-blur-xl md:col-span-2">
            <CardHeader>
              <CardTitle>Become a Creator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Want to launch surveys and reward participants? You’ll need a creator account.
              </p>
              <Button asChild className="h-11 rounded-2xl bg-[#C1654B] text-white hover:bg-[#b25a43]" size="lg">
                <Link href="/filler/auth/sign-up?role=creator">Create Survey</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Prominent Surveys list right on the dashboard */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Surveys</h2>
        <SurveysSection />
      </div>
    </div>
  )
}
