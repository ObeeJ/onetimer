"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/ui/page-header"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { surveyStore } from "@/lib/survey-store"
import { 
  PlusCircle, 
  Eye, 
  Edit3, 
  BarChart3,
  Calendar,
  Users,
  Clock
} from "lucide-react"

export default function SurveysPage() {
  const surveys = surveyStore.getAll()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div>

      
      <PageHeader 
        title="My Surveys" 
        description="Manage and monitor all your surveys"
      >
        <Link href="/creator/surveys/create">
          <Button className="bg-[#013f5c] hover:bg-[#0b577a]">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Survey
          </Button>
        </Link>
      </PageHeader>
      
      <div className="space-y-6">
        {surveys.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No surveys yet</h3>
              <p className="text-slate-600 mb-4">Create your first survey to start collecting responses</p>
              <Link href="/creator/surveys/create">
                <Button className="bg-[#013f5c] hover:bg-[#0b577a]">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Survey
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">{survey.title}</h3>
                        <Badge className={getStatusColor(survey.status)}>
                          {survey.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-4">{survey.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            {survey.responses}/{survey.maxResponses} responses
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600">{survey.estimatedTime}min</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            {survey.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          ₦{survey.reward} per response
                        </div>
                      </div>
                      
                      {survey.status === 'live' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{Math.round((survey.responses / survey.maxResponses) * 100)}%</span>
                          </div>
                          <Progress value={(survey.responses / survey.maxResponses) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-6">
                      <Link href={`/creator/surveys/${survey.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      
                      {survey.status === 'draft' && (
                        <Link href={`/creator/surveys/${survey.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )}
                      
                      {(survey.status === 'live' || survey.status === 'completed') && (
                        <Link href={`/creator/surveys/${survey.id}/analytics`}>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
                          </Button>
                        </Link>
                      )}
                    </div>
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