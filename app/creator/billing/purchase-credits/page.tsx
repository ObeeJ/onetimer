"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { 
  CreditCard, 
  Check,
  ArrowLeft,
  Shield,
  Zap,
  Star
} from "lucide-react"
import Link from "next/link"

export default function PurchaseCredits() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(1)
  const [processing, setProcessing] = useState(false)

  const packages = [
    { 
      id: 0,
      name: "Starter", 
      credits: 500, 
      price: 5000, 
      popular: false,
      bonus: 0,
      description: "Perfect for small surveys"
    },
    { 
      id: 1,
      name: "Professional", 
      credits: 1500, 
      price: 12000, 
      popular: true,
      bonus: 100,
      description: "Most popular choice"
    },
    { 
      id: 2,
      name: "Enterprise", 
      credits: 5000, 
      price: 35000, 
      popular: false,
      bonus: 500,
      description: "For large-scale research"
    },
  ]

  const handlePurchase = async () => {
    if (!selectedPackage && selectedPackage !== 0) return
    
    setProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Success - redirect to billing page
      window.location.href = "/creator/billing"
    } catch (error) {
      console.error("Payment failed:", error)
    } finally {
      setProcessing(false)
    }
  }

  const selectedPkg = packages.find(p => p.id === selectedPackage)

  return (
    <div>
      <PageHeader 
        title="Purchase Credits" 
        description="Choose a credit package to fund your surveys"
        backHref="/creator/billing"
      />
      
      <div className="max-w-4xl space-y-6">
        {/* Package Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${
                selectedPackage === pkg.id 
                  ? 'border-[#013f5c] bg-blue-50' 
                  : 'border-slate-200 hover:border-slate-300'
              } ${pkg.popular ? 'ring-2 ring-[#013f5c]/20' : ''}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#013f5c]">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <p className="text-sm text-slate-600">{pkg.description}</p>
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-[#013f5c]">
                    ₦{pkg.price.toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold mt-1">
                    {pkg.credits.toLocaleString()} credits
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      +{pkg.bonus} bonus credits
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-slate-500">
                  ₦{(pkg.price / (pkg.credits + pkg.bonus)).toFixed(2)} per credit
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span>~{Math.floor((pkg.credits + pkg.bonus) / 10)} survey responses</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span>No expiration</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span>Instant activation</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Summary */}
        {selectedPkg && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Package:</span>
                <span className="font-semibold">{selectedPkg.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Credits:</span>
                <span className="font-semibold">{selectedPkg.credits.toLocaleString()}</span>
              </div>
              {selectedPkg.bonus > 0 && (
                <div className="flex justify-between items-center">
                  <span>Bonus Credits:</span>
                  <span className="font-semibold text-green-600">+{selectedPkg.bonus}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-[#013f5c]">
                  ₦{selectedPkg.price.toLocaleString()}
                </span>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center text-sm">
                  <Shield className="h-4 w-4 text-green-600 mr-2" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center text-sm">
                  <Zap className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Credits added instantly</span>
                </div>
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
              
              <Button 
                onClick={handlePurchase}
                disabled={processing}
                className="w-full bg-[#013f5c] hover:bg-[#0b577a] py-3"
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {processing ? "Processing Payment..." : `Pay ₦${selectedPkg.price.toLocaleString()}`}
              </Button>
              
              <p className="text-xs text-slate-500 text-center">
                By clicking "Pay", you agree to our Terms of Service and Privacy Policy.
                You will be charged ₦{selectedPkg.price.toLocaleString()} for {selectedPkg.credits + selectedPkg.bonus} credits.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}