"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Users, 
  ListChecks, 
  CreditCard,
  Download,
  Calendar,
  BarChart3
} from "lucide-react"

export default function ReportsPage() {
  const metrics = [
    { title: "Total Revenue", value: "₦2.4M", change: "+24%", period: "This month" },
    { title: "Active Users", value: "2,847", change: "+12%", period: "This month" },
    { title: "Survey Completions", value: "15,234", change: "+18%", period: "This month" },
    { title: "Avg. Response Time", value: "4.2 min", change: "-8%", period: "This month" },
  ]

  const topCreators = [
    { name: "TechCorp Ltd", surveys: 45, spent: "₦450,000", completion: "94%" },
    { name: "StartupXYZ", surveys: 32, spent: "₦320,000", completion: "87%" },
    { name: "FoodTech Inc", surveys: 28, spent: "₦280,000", completion: "91%" },
  ]

  const topFillers = [
    { name: "John Doe", completed: 156, earned: "₦78,000", rating: "4.9" },
    { name: "Jane Smith", completed: 142, earned: "₦71,000", rating: "4.8" },
    { name: "Mike Johnson", completed: 134, earned: "₦67,000", rating: "4.7" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600">Platform insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="rounded-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{metric.title}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
              <div className="flex items-center justify-between mt-1">
                <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </p>
                <p className="text-xs text-slate-500">{metric.period}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Revenue chart would be displayed here</p>
                <p className="text-sm text-slate-500">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">User growth chart would be displayed here</p>
                <p className="text-sm text-slate-500">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Top Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCreators.map((creator, index) => (
                <div key={creator.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-semibold text-orange-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{creator.name}</p>
                      <p className="text-sm text-slate-600">{creator.surveys} surveys</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{creator.spent}</p>
                    <p className="text-sm text-green-600">{creator.completion} completion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" />
              Top Fillers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFillers.map((filler, index) => (
                <div key={filler.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{filler.name}</p>
                      <p className="text-sm text-slate-600">{filler.completed} completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{filler.earned}</p>
                    <p className="text-sm text-green-600">⭐ {filler.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}