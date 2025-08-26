"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import Link from "next/link"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Download,
  Filter,
  Calendar,
  Eye,
  ArrowUpRight,
  Globe,
  Timer
} from "lucide-react"

function handleExport() {
  const data = "Survey Analytics Data\nTotal Views: 2,847\nResponses: 1,247\nCompletion Rate: 87.3%"
  const blob = new Blob([data], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'analytics-export.csv'
  a.click()
}

function handleFilter() {
  alert('Filter functionality - would open filter modal')
}

function handleDateRange() {
  alert('Date range picker - would open calendar selector')
}

export default function Analytics() {
  return (
    <div>
      <PageHeader 
        title="Analytics" 
        description="Track your survey performance and insights"
      >
        <Button variant="outline" onClick={handleFilter}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" onClick={handleDateRange}>
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>
        <Button onClick={handleExport} className="bg-[#013f5c] hover:bg-[#0b577a]">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>
      
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Responses</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-green-600">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.3%</div>
              <p className="text-xs text-green-600">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
              <Clock className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2m</div>
              <p className="text-xs text-slate-600">-0.3m from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Chart visualization would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Age 18-25</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#013f5c] h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Age 26-35</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#013f5c] h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Age 36-45</span>
                    <span className="text-sm font-medium">22%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#013f5c] h-2 rounded-full" style={{ width: '22%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Age 45+</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#013f5c] h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ongoing Surveys Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Ongoing Surveys Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { 
            title: "Customer Satisfaction Q4", 
            responses: 245, 
            completion: 92, 
            avgTime: "2.8m", 
            status: "live",
            views: 267,
            bounceRate: 8,
            topCountry: "United States",
            peakHour: "2-3 PM"
          },
          { 
            title: "Product Feedback Survey", 
            responses: 189, 
            completion: 85, 
            avgTime: "3.2m", 
            status: "live",
            views: 222,
            bounceRate: 15,
            topCountry: "Canada",
            peakHour: "10-11 AM"
          },
        ].map((survey, index) => (
          <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{survey.title}</h3>
              <Badge variant="secondary" className={
                survey.status === "live" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              }>
                {survey.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-[#013f5c]">{survey.responses}</div>
                <div className="text-sm text-slate-600">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#013f5c]">{survey.views}</div>
                <div className="text-sm text-slate-600">Views</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#013f5c]">{survey.completion}%</div>
                <div className="text-sm text-slate-600">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#013f5c]">{survey.avgTime}</div>
                <div className="text-sm text-slate-600">Avg Time</div>
              </div>
            </div>
              
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Bounce Rate</span>
                <span className="text-sm font-medium">{survey.bounceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Top Country</span>
                <span className="text-sm font-medium">{survey.topCountry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Peak Hour</span>
                <span className="text-sm font-medium">{survey.peakHour}</span>
              </div>
            </div>
              
            <Link href={`/creator/surveys/${survey.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Eye className="h-4 w-4 mr-2" />
                View Full Analytics
              </Button>
            </Link>
          </div>
        ))}
            </div>
          </CardContent>
        </Card>

        {/* Completed Surveys Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Surveys Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { 
            title: "User Experience Research", 
            responses: 156, 
            completion: 78, 
            avgTime: "4.1m", 
            status: "completed",
            views: 200,
            bounceRate: 22,
            topCountry: "United Kingdom",
            peakHour: "1-2 PM"
          },
          { 
            title: "Brand Awareness Study", 
            responses: 203, 
            completion: 88, 
            avgTime: "3.5m", 
            status: "completed",
            views: 231,
            bounceRate: 12,
            topCountry: "Australia",
            peakHour: "9-10 AM"
          },
        ].map((survey, index) => (
          <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{survey.title}</h3>
              <Badge variant="secondary" className={
                survey.status === "live" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              }>
                {survey.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-[#013f5c]">{survey.responses}</div>
                <div className="text-sm text-slate-600">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#013f5c]">{survey.views}</div>
                <div className="text-sm text-slate-600">Views</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#013f5c]">{survey.completion}%</div>
                <div className="text-sm text-slate-600">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#013f5c]">{survey.avgTime}</div>
                <div className="text-sm text-slate-600">Avg Time</div>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Bounce Rate</span>
                <span className="text-sm font-medium">{survey.bounceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Top Country</span>
                <span className="text-sm font-medium">{survey.topCountry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Peak Hour</span>
                <span className="text-sm font-medium">{survey.peakHour}</span>
              </div>
            </div>
            <Link href={`/creator/surveys/${survey.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Eye className="h-4 w-4 mr-2" />
                View Full Analytics
              </Button>
            </Link>
          </div>
        ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}