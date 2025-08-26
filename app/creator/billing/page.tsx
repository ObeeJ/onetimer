"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { 
  CreditCard, 
  Plus, 
  Download,
  History,
  Wallet,
  TrendingUp,
  AlertCircle
} from "lucide-react"

export default function Billing() {
  return (
    <div>
      <PageHeader 
        title="Billing & Credits" 
        description="Manage your credits and billing information"
      >
        <Button className="bg-[#013f5c] hover:bg-[#0b577a]">
          <Plus className="h-4 w-4 mr-2" />
          Buy Credits
        </Button>
      </PageHeader>
      
      <div className="space-y-6">
        {/* Credit Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
              <Wallet className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-slate-600">~125 survey responses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used (30d)</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">450</div>
              <p className="text-xs text-green-600">-12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦45,000</div>
              <p className="text-xs text-slate-600">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Credit Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[
                { name: "Starter", credits: 500, price: 5000, popular: false },
                { name: "Professional", credits: 1500, price: 12000, popular: true },
                { name: "Enterprise", credits: 5000, price: 35000, popular: false },
              ].map((pkg, index) => (
                <div key={index} className={`border rounded-lg p-6 relative ${pkg.popular ? 'border-[#013f5c] bg-blue-50' : ''}`}>
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#013f5c]">
                      Most Popular
                    </Badge>
                  )}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold mb-2">₦{pkg.price.toLocaleString()}</div>
                    <div className="text-slate-600 mb-4">{pkg.credits} credits</div>
                    <div className="text-sm text-slate-500 mb-4">
                      ₦{(pkg.price / pkg.credits).toFixed(2)} per credit
                    </div>
                    <Button 
                      className={pkg.popular ? "bg-[#013f5c] hover:bg-[#0b577a] w-full" : "w-full"} 
                      variant={pkg.popular ? "default" : "outline"}
                    >
                      Purchase
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Alert */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900">Low Credit Warning</h3>
                <p className="text-sm text-orange-700 mt-1">
                  You have 1,250 credits remaining. Based on your usage, this will last approximately 2 weeks.
                  Consider purchasing more credits to avoid survey interruptions.
                </p>
                <Button className="mt-3 bg-orange-600 hover:bg-orange-700" size="sm">
                  Buy Credits Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Transaction History
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "2024-01-15", type: "Purchase", amount: "+1,500", cost: "₦12,000", status: "completed" },
                { date: "2024-01-10", type: "Survey Response", amount: "-10", cost: "₦100", status: "completed" },
                { date: "2024-01-08", type: "Survey Response", amount: "-10", cost: "₦100", status: "completed" },
                { date: "2024-01-05", type: "Purchase", amount: "+500", cost: "₦5,000", status: "completed" },
                { date: "2024-01-03", type: "Survey Response", amount: "-15", cost: "₦150", status: "completed" },
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === "Purchase" ? "bg-green-500" : "bg-blue-500"
                    }`} />
                    <div>
                      <div className="font-medium">{transaction.type}</div>
                      <div className="text-sm text-slate-600">{transaction.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      transaction.amount.startsWith("+") ? "text-green-600" : "text-slate-900"
                    }`}>
                      {transaction.amount} credits
                    </div>
                    <div className="text-sm text-slate-600">{transaction.cost}</div>
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