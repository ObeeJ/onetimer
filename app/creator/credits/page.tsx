"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Plus, History, Zap, Info, CheckCircle } from "lucide-react"
import { useCreatorAuth } from "@/hooks/use-creator-auth"

export default function CreatorCreditsPage() {
  console.log("CreatorCreditsPage rendering")
  const { creator, isAuthenticated, updateCredits } = useCreatorAuth()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  console.log("Credits page auth state:", { creator, isAuthenticated })

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
      amount: 100,
      credits: 100,
      date: "2024-01-20",
      status: "completed",
      description: "Credit purchase"
    },
    {
      id: "2", 
      type: "usage",
      amount: -25,
      credits: -25,
      date: "2024-01-18",
      status: "completed",
      description: "Survey: Consumer Behavior Study"
    },
    {
      id: "3",
      type: "purchase",
      amount: 50,
      credits: 50,
      date: "2024-01-15",
      status: "completed",
      description: "Credit purchase"
    }
  ]

  const handlePurchase = async (packageId: string) => {
    setIsLoading(true)
    setSelectedPackage(packageId)
    
    try {
      // TODO: Integrate with Paystack payment
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
      // TODO: Integrate with Paystack payment
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

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <EmptyState
            icon={CreditCard}
            title="Sign in required"
            description="Please sign in to manage your credits."
            action={{ label: "Sign in", href: "/creator/auth/sign-in" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <Breadcrumb items={[{ label: "Credits" }]} />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Credits</h1>
            <p className="text-slate-600">Purchase credits to launch surveys and collect responses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#C1654B]" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-slate-900">{creator?.credits || 0}</div>
                    <p className="text-slate-600">Available credits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">≈ ₦{((creator?.credits || 0) * 300).toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Estimated value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Credits are used to launch surveys. Each survey response costs 1 credit. 
                Unused credits never expire and can be used for future surveys.
              </AlertDescription>
            </Alert>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Credit Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creditPackages.map((pkg) => (
                  <Card 
                    key={pkg.id} 
                    className={`rounded-xl relative ${pkg.popular ? 'ring-2 ring-[#C1654B] ring-offset-2' : ''}`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#C1654B]">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <div className="text-2xl font-bold text-slate-900">
                        {pkg.credits} <span className="text-sm font-normal text-slate-600">credits</span>
                      </div>
                      <div className="text-lg font-semibold text-[#C1654B]">
                        ₦{pkg.price.toLocaleString()}
                      </div>
                      <p className="text-sm text-slate-600">{pkg.description}</p>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full bg-[#C1654B] hover:bg-[#b25a43]"
                        onClick={() => handlePurchase(pkg.id)}
                        disabled={isLoading && selectedPackage === pkg.id}
                      >
                        {isLoading && selectedPackage === pkg.id ? "Processing..." : "Purchase"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Custom Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customCredits">Number of credits (minimum 10)</Label>
                  <Input
                    id="customCredits"
                    type="number"
                    min="10"
                    placeholder="Enter number of credits"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                  {customAmount && parseInt(customAmount) >= 10 && (
                    <p className="text-sm text-slate-600">
                      Total: ₦{(parseInt(customAmount) * 300).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleCustomPurchase}
                  disabled={!customAmount || parseInt(customAmount) < 10 || isLoading}
                  className="bg-[#C1654B] hover:bg-[#b25a43]"
                >
                  {isLoading ? "Processing..." : "Purchase Custom Amount"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionHistory.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title="No transactions yet"
                    description="Your transaction history will appear here."
                  />
                ) : (
                  <div className="space-y-3">
                    {transactionHistory.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.type === 'purchase' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{transaction.description}</p>
                            <p className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium text-sm ${
                            transaction.credits > 0 ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                          </p>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-slate-500">Completed</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-white">VISA</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">•••• •••• •••• 4242</p>
                      <p className="text-xs text-slate-500">Expires 12/25</p>
                    </div>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
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