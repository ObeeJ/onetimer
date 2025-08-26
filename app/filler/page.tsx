"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SurveysSection from "@/components/surveys/surveys-section"
import { TrendingUp, Users, Wallet, Plus, Award, Target, Clock } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, Survey Taker
        </h1>
        <p className="text-slate-600">
          Ready to earn? Check out available surveys and track your progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Available Surveys</p>
              <p className="text-xl font-bold text-slate-900">8</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-xl font-bold text-slate-900">12</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Wallet className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Earnings</p>
              <p className="text-xl font-bold text-slate-900">₦2,450</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-xl font-bold text-slate-900">₦280</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-5 w-5 text-[#013F5C]" />
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Jump into surveys and start earning immediately.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-[#013F5C] hover:bg-[#0b577a]">
              <Link href="/filler/surveys" className="flex items-center justify-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Find Surveys</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/filler/earnings" className="flex items-center justify-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>View Earnings</span>
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Plus className="h-5 w-5 text-[#C1654B]" />
              <h3 className="text-lg font-semibold text-slate-900">Become a Creator</h3>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              New
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Launch your own surveys and collect valuable data from our community.
          </p>
          <Button asChild className="w-full bg-[#C1654B] hover:bg-[#b25a43]">
            <Link href="/creator/auth/sign-up" className="flex items-center justify-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Survey</span>
            </Link>
          </Button>
        </Card>
      </div>

      {/* Available Surveys */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Available Surveys</h2>
          <Button asChild variant="outline">
            <Link href="/filler/surveys">View All</Link>
          </Button>
        </div>
        <SurveysSection />
      </div>
    </div>
  )
}
