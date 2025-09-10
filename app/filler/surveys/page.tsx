"use client"

import { motion, useReducedMotion, easeOut } from "framer-motion"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { Clock, Users, Search, Filter, ListChecks } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"

export default function SurveysPage() {
  const { isAuthenticated } = useAuth()
  const reduceMotion = useReducedMotion()
  const [searchTerm, setSearchTerm] = useState("")

  // TODO: Replace with actual data from API
  const surveys = [
    {
      id: "1",
      title: "Consumer Shopping Habits Survey",
      description: "Share your shopping preferences and earn rewards. This comprehensive survey covers online and offline shopping behaviors.",
      reward: "₦550",
      duration: "8 mins",
      participants: 234,
      category: "Shopping",
      difficulty: "Easy"
    },
    {
      id: "2",
      title: "Technology Usage Survey",
      description: "Help us understand how people use technology in their daily lives and work environments.",
      reward: "₦325", 
      duration: "5 mins",
      participants: 156,
      category: "Technology",
      difficulty: "Easy"
    },
    {
      id: "3",
      title: "Food & Dining Preferences",
      description: "Tell us about your dining and food preferences, including dietary restrictions and favorite cuisines.",
      reward: "₦475",
      duration: "7 mins", 
      participants: 89,
      category: "Food",
      difficulty: "Medium"
    },
    {
      id: "4",
      title: "Healthcare & Wellness Survey",
      description: "Share insights about healthcare experiences and wellness practices to help improve services.",
      reward: "₦725",
      duration: "12 mins",
      participants: 67,
      category: "Healthcare", 
      difficulty: "Medium"
    },
    {
      id: "5",
      title: "Travel & Tourism Preferences",
      description: "Help tourism companies understand travel preferences and booking behaviors.",
      reward: "₦600",
      duration: "10 mins",
      participants: 145,
      category: "Travel",
      difficulty: "Easy"
    }
  ]

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

  const filteredSurveys = surveys.filter(survey =>
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <Breadcrumb items={[{ label: "Surveys" }]} />
          <EmptyState
            icon={ListChecks}
            title="Sign in to view surveys"
            description="Create an account or sign in to access our latest surveys and start earning money."
            action={{
              label: "Sign up now",
              href: "/filler/auth/sign-up"
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Breadcrumb items={[{ label: "Surveys" }]} />
          </motion.div>

          <motion.div variants={itemVariants}>
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
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            {filteredSurveys.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No surveys found"
                description="Try adjusting your search terms or check back later for new surveys."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSurveys.map((survey) => (
                  <Card key={survey.id} className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700">
                            {survey.category}
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            {survey.difficulty}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{survey.reward}</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900">
                        {survey.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {survey.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{survey.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{survey.participants}</span>
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
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}