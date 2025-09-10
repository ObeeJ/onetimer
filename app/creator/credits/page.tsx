"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { CreditCard, Plus, History, Zap, Info } from "lucide-react"
import { useCreatorAuth } from "@/hooks/use-creator-auth"

export default function CreatorCreditsPage() {
  const { creator, updateCredits } = useCreatorAuth()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const creditPackages = [
    {
      id: "starter",
      name: "Starter Pack",
      credits: 50,
      price: 15000,
      popular: false,
      description: "Perfect for small surveys"
    },
    {
      id: "professional",
      name: "Professional Pack", 
      credits: 150,
      price: 40000,
      popular: true,
      description: "Most popular choice"
    },
    {
      id: "enterprise",
      name: "Enterprise Pack",
      credits: 500,
      price: 120000,
      popular: false,
      description: "For large-scale research"
    }
  ]

  const transactionHistory = [
    {
      id: "1",
      type: "purchase",
      credits: 100,
      date: "2024-01-20",
      description: "Credit purchase"
    },
    {
      id: "2", 
      type: "usage",
      credits: -25,
      date: "2024-01-18",
      description: "Survey: Consumer Behavior Study"
    },
    {
      id: "3",
      type: "purchase",
      credits: 50,
      date: "2024-01-15",
      description: "Credit purchase"
    }
  ]

  const handlePurchase = async (packageId: string) => {
    setIsLoading(true)
    setSelectedPackage(packageId)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const selectedPkg = creditPackages.find(pkg => pkg.id === packageId)
      if (selectedPkg && creator) {
        updateCredits(creator.credits + selectedPkg.credits)
      }
      setSelectedPackage(null)
    } catch (error) {
      console.error("Payment failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomPurchase = async () => {
    const credits = parseInt(customAmount)
    if (credits < 10) return
    
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      if (creator) {
        updateCredits(creator.credits + credits)
      }
      setCustomAmount("")
    } catch (error) {
      console.error("Payment failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Credits" }]} />
        
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
          <div className="relative">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Credits Management</h1>
            <p className="text-slate-600 text-lg">Purchase credits to launch surveys and collect valuable responses from our community.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Current Balance</CardTitle>
              <div className="p-2 rounded-lg bg-orange-100/80 group-hover:bg-orange-200/80 transition-colors">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">100</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <p className="text-xs text-slate-500">Available credits</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Credits Used</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100/80 group-hover:bg-blue-200/80 transition-colors">
                <History className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">25</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-xs text-slate-500">This month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Purchased</CardTitle>
              <div className="p-2 rounded-lg bg-green-100/80 group-hover:bg-green-200/80 transition-colors">
                <Plus className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">150</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs text-slate-500">All time</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Estimated Value</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100/80 group-hover:bg-purple-200/80 transition-colors">
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">₦30K</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <p className="text-xs text-slate-500">Current balance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Credit Packages</CardTitle>
              <div className="p-2 rounded-lg bg-[#C1654B]/10">
                <Zap className="h-5 w-5 text-[#C1654B]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {creditPackages.map((pkg) => (
                <div key={pkg.id} className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${pkg.popular ? 'border-[#C1654B] bg-orange-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#C1654B] text-white">
                      Most Popular
                    </Badge>
                  )}
                  <div className="text-center space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{pkg.name}</h3>
                      <p className="text-sm text-slate-600">{pkg.description}</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">{pkg.credits}</div>
                      <div className="text-sm text-slate-600">credits</div>
                    </div>
                    <div className="text-2xl font-bold text-[#C1654B]">₦{pkg.price.toLocaleString()}</div>
                    <Button 
                      variant="creator"
                      className="w-full"
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={isLoading && selectedPackage === pkg.id}
                    >
                      {isLoading && selectedPackage === pkg.id ? "Processing..." : "Purchase"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900 mb-4">Custom Amount</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customCredits" className="text-sm font-medium text-slate-700">Number of credits (minimum 10)</Label>
                    <Input
                      id="customCredits"
                      type="number"
                      min="10"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {customAmount && parseInt(customAmount) >= 10 && (
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Total Cost:</span>
                        <span className="font-semibold text-[#C1654B]">₦{(parseInt(customAmount) * 300).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  <Button 
                    variant="creator"
                    onClick={handleCustomPurchase}
                    disabled={!customAmount || parseInt(customAmount) < 10 || isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Processing..." : "Purchase Custom Amount"}
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">How Credits Work</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Each survey response costs 1 credit</li>
                      <li>• Credits never expire</li>
                      <li>• Unused credits carry over</li>
                      <li>• Secure payment with Paystack</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <div className="p-2 rounded-lg bg-[#C1654B]/10">
                  <History className="h-5 w-5 text-[#C1654B]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactionHistory.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        transaction.type === 'purchase' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{transaction.description}</p>
                        <p className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${
                        transaction.credits > 0 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                      </p>
                      <p className="text-xs text-slate-500">credits</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
                <div className="p-2 rounded-lg bg-[#C1654B]/10">
                  <CreditCard className="h-5 w-5 text-[#C1654B]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl bg-slate-50">
                  <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">VISA</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-slate-500">Expires 12/25</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Default</Badge>
                </div>
                <Button variant="creator-outline" className="w-full border-dashed border-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  )
}