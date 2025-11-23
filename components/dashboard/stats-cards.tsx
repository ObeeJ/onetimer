"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Users, Award } from "lucide-react"

interface StatsCardsProps {
  isAuthenticated: boolean
  isVerified?: boolean
}

export default function StatsCards({ isAuthenticated, isVerified = false }: StatsCardsProps) {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      
      try {
        // Mock API call for now
        await new Promise(resolve => setTimeout(resolve, 500))
        setStats(isVerified ? [
          {
            title: "Total Earnings",
            value: "₦24,750",
            change: "+12.5%",
            icon: DollarSign,
      color: "text-green-600",
      locked: !isVerified
    },
    {
      title: "Surveys Completed",
      value: "23",
      change: "+3 this week",
      icon: Award,
      color: "text-blue-600"
    },
    {
      title: "Referrals",
      value: isVerified ? "8" : "0",
      change: isVerified ? "+2 this month" : "Complete verification",
      icon: Users,
      color: "text-purple-600",
      locked: !isVerified
    },
    {
      title: "Success Rate",
      value: "94%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ] : [
    {
      title: "Available Surveys",
      value: "150+",
      change: "Updated daily",
      icon: Award,
      color: "text-blue-600"
    },
    {
      title: "Average Earning",
      value: "₦200-1,500",
      change: "Per survey",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Users",
      value: "50K+",
      change: "Join them today",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Payout Rate",
      value: "99.8%",
      change: "Reliable payments",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`rounded-2xl shadow-sm hover:shadow-md transition-shadow ${stat.locked ? 'opacity-60' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-1">
              {stat.title}
              {stat.locked && <span className="text-xs">🔒</span>}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}