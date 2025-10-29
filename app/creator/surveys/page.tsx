"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BarChart3, Plus, Search, Eye, Users, Calendar, MoreHorizontal, Edit, Copy, Pause, Play, Trash2, Share, Upload } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { useCreatorSurveys, useDeleteSurvey } from "@/hooks/use-creator"
import { CreatorSurvey } from "@/types/survey"
import { toast } from "sonner"
import { CreatorSurvey } from "@/types/survey"

export default function CreatorSurveysPage() {
  const { isAuthenticated, user } = useAuth()
  const { data: surveysData, isLoading } = useCreatorSurveys()
  const deleteSurvey = useDeleteSurvey()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const surveys: CreatorSurvey[] = surveysData?.surveys || []

  const handleDeleteSurvey = async (surveyId: string) => {
    try {
      await deleteSurvey.mutateAsync(surveyId)
      toast.success('Survey deleted successfully')
    } catch (error) {
      toast.error('Failed to delete survey')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700">Completed</Badge>
      case "paused":
        return <Badge className="bg-gray-100 text-gray-700">Paused</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || survey.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated || user?.role !== 'creator') {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <EmptyState
            icon={BarChart3}
            title="Sign in required"
            description="Please sign in to view your surveys."
            action={{ label: "Sign in", href: "/creator/auth/sign-in" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <Breadcrumb items={[{ label: "Surveys" }]} />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Surveys</h1>
            <p className="text-slate-600">Manage and track your survey campaigns</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="creator-outline" className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              Import Survey
            </Button>
            <Button asChild variant="creator" className="w-full sm:w-auto">
              <Link href="/creator/surveys/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* All authenticated users have full access */}

        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-xl">
                <CardHeader>
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-4 bg-slate-200 rounded"></div>
                      <div className="h-4 bg-slate-200 rounded"></div>
                      <div className="h-4 bg-slate-200 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-slate-200 rounded w-24"></div>
                      <div className="h-8 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSurveys.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title={searchQuery || statusFilter !== "all" ? "No surveys found" : "No surveys yet"}
            description={searchQuery || statusFilter !== "all" ? "Try adjusting your search or filter criteria." : "Create your first survey to start collecting insights."}
            action={!searchQuery && statusFilter === "all" ? { label: "Create Survey", href: "/creator/surveys/create" } : undefined}
          />
        ) : (
          <div className="grid gap-6">
            {filteredSurveys.map((survey) => (
              <Card key={survey.id} className="rounded-xl hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <CardTitle className="text-lg truncate">{survey.title}</CardTitle>
                        {getStatusBadge(survey.status)}
                      </div>
                      <p className="text-slate-600 text-sm line-clamp-2">{survey.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/creator/surveys/${survey.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Survey
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          {survey.status === "active" ? (
                            <><Pause className="h-4 w-4 mr-2" />Pause Survey</>
                          ) : (
                            <><Play className="h-4 w-4 mr-2" />Resume Survey</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteSurvey(survey.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">{survey.responses || 0}/{survey.target || 0}</p>
                        <p className="text-xs text-slate-500">Responses</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">{Math.round(((survey.responses || 0) / (survey.target || 1)) * 100)}%</p>
                        <p className="text-xs text-slate-500">Complete</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium">{survey.expiresAt}</p>
                        <p className="text-xs text-slate-500">Expires</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild variant="creator-outline" size="sm" className="w-full sm:w-auto">
                      <Link href={`/creator/surveys/${survey.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    <Button asChild variant="creator" size="sm" className="w-full sm:w-auto">
                      <Link href={`/creator/analytics?survey=${survey.id}`}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}