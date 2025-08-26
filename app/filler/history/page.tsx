"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react"

const surveyHistory = [
  {
    id: 1,
    title: "Consumer Shopping Habits Survey",
    company: "Market Research Co.",
    completedAt: "2024-01-15T10:30:00Z",
    duration: "12 minutes",
    reward: "₦250",
    status: "completed",
    rating: 4.5
  },
  {
    id: 2,
    title: "Technology Usage Survey",
    company: "Tech Insights Ltd",
    completedAt: "2024-01-14T15:45:00Z",
    duration: "8 minutes",
    reward: "₦180",
    status: "completed",
    rating: 5.0
  },
  {
    id: 3,
    title: "Food Preferences Study",
    company: "Nutrition Research",
    completedAt: "2024-01-13T09:15:00Z",
    duration: "15 minutes",
    reward: "₦300",
    status: "completed",
    rating: 4.0
  },
  {
    id: 4,
    title: "Travel Behavior Survey",
    company: "Tourism Board",
    completedAt: "2024-01-12T14:20:00Z",
    duration: "10 minutes",
    reward: "₦200",
    status: "rejected",
    rating: null
  },
  {
    id: 5,
    title: "Health & Wellness Survey",
    company: "Health Analytics",
    completedAt: "2024-01-11T11:00:00Z",
    duration: "20 minutes",
    reward: "₦400",
    status: "pending",
    rating: null
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-amber-600" />
    default:
      return <Clock className="h-4 w-4 text-slate-600" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
    case 'pending':
      return <Badge className="bg-amber-100 text-amber-800">Under Review</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function HistoryPage() {
  const completedSurveys = surveyHistory.filter(s => s.status === 'completed').length
  const totalEarnings = surveyHistory
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + parseInt(s.reward.replace('₦', '').replace(',', '')), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Survey History</h1>
        <p className="text-slate-600">View all your completed and pending surveys</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Completed Surveys</p>
              <p className="text-xl font-bold text-slate-900">{completedSurveys}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Earnings</p>
              <p className="text-xl font-bold text-slate-900">₦{totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Pending Review</p>
              <p className="text-xl font-bold text-slate-900">{surveyHistory.filter(s => s.status === 'pending').length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {surveyHistory.map((survey) => (
          <Card key={survey.id} className="p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-2 bg-slate-100 rounded-lg">
                  {getStatusIcon(survey.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{survey.title}</h3>
                    {getStatusBadge(survey.status)}
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">{survey.company}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span>Completed: {formatDate(survey.completedAt)}</span>
                    <span>Duration: {survey.duration}</span>
                    {survey.rating && (
                      <span>Rating: {survey.rating}/5 ⭐</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{survey.reward}</p>
                  {survey.status === 'completed' && (
                    <p className="text-xs text-green-600">Paid</p>
                  )}
                  {survey.status === 'pending' && (
                    <p className="text-xs text-amber-600">Processing</p>
                  )}
                  {survey.status === 'rejected' && (
                    <p className="text-xs text-red-600">Not paid</p>
                  )}
                </div>
                
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}