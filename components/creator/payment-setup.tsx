"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CreditCard, 
  Landmark, 
  CheckCircle2, 
  AlertCircle, 
  Shield,
  ArrowRight,
  Wallet,
  Plus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { PaymentSetup } from "@/types/creator"

interface PaymentSetupFormData {
  paystackPublicKey: string
  paystackSecretKey: string
  bankAccount?: {
    accountNumber: string
    bankCode: string
    accountName: string
  }
}

interface PaymentSetupFormProps {
  onSubmit: (data: PaymentSetupFormData) => Promise<void>
  loading?: boolean
  currentSetup?: PaymentSetup
}

const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "014", name: "Afribank" },
  { code: "050", name: "Ecobank" },
  { code: "011", name: "First Bank" },
  { code: "058", name: "GTBank" },
  { code: "030", name: "Heritage Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered" },
  { code: "232", name: "Sterling Bank" },
  { code: "032", name: "Union Bank" },
  { code: "033", name: "UBA" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" }
]

export function PaymentSetupForm({ onSubmit, loading = false, currentSetup }: PaymentSetupFormProps) {
  const [formData, setFormData] = useState<PaymentSetupFormData>({
    paystackPublicKey: currentSetup?.paystackPublicKey || "",
    paystackSecretKey: currentSetup?.paystackSecretKey || "",
    bankAccount: currentSetup?.bankAccount || {
      accountNumber: "",
      bankCode: "",
      accountName: ""
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.paystackPublicKey.trim()) {
      newErrors.paystackPublicKey = "Paystack public key is required"
    } else if (!formData.paystackPublicKey.startsWith("pk_")) {
      newErrors.paystackPublicKey = "Invalid public key format"
    }

    if (!formData.paystackSecretKey.trim()) {
      newErrors.paystackSecretKey = "Paystack secret key is required"
    } else if (!formData.paystackSecretKey.startsWith("sk_")) {
      newErrors.paystackSecretKey = "Invalid secret key format"
    }

    if (formData.bankAccount?.accountNumber && !formData.bankAccount.bankCode) {
      newErrors.bankCode = "Please select a bank"
    }

    if (formData.bankAccount?.bankCode && !formData.bankAccount.accountNumber) {
      newErrors.accountNumber = "Account number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
      toast.show({
        type: 'success',
        title: 'Payment setup completed',
        description: 'Your payment information has been saved and verified.'
      })
    } catch (error) {
      toast.show({
        type: 'error',
        title: 'Setup failed',
        description: 'Failed to save payment information. Please try again.'
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PaymentSetupFormData] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (currentSetup?.verified) {
    return (
      <Card className="w-full max-w-2xl mx-auto rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
        <CardContent className="py-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-green-100 border border-green-200">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Payment Setup Complete
                </h3>
                <p className="text-sm text-green-700 opacity-90 mb-4">
                  Your payment information has been verified and is ready to use. You can now purchase credits and receive payments.
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Paystack Integration:</span>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  {currentSetup.bankAccount && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Bank Account:</span>
                      <span className="font-medium text-green-800">
                        ****{currentSetup.bankAccount.accountNumber.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Update Payment Info
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-900">
          Payment Setup
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Configure your payment methods to purchase credits and receive payments
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Paystack Integration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <CreditCard className="h-4 w-4" />
              Paystack Integration
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Secure Payment Processing</h4>
                  <p className="text-sm text-blue-700">
                    We use Paystack to securely process payments. Your API keys are encrypted and stored safely.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paystackPublicKey">Paystack Public Key</Label>
                <Input
                  id="paystackPublicKey"
                  type="text"
                  value={formData.paystackPublicKey}
                  onChange={(e) => handleInputChange("paystackPublicKey", e.target.value)}
                  placeholder="pk_test_xxxxxxxxxx or pk_live_xxxxxxxxxx"
                  className="rounded-xl font-mono text-sm"
                  aria-invalid={!!errors.paystackPublicKey}
                />
                {errors.paystackPublicKey && (
                  <p className="text-sm text-red-600">{errors.paystackPublicKey}</p>
                )}
                <p className="text-xs text-slate-500">
                  Get your API keys from your Paystack dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paystackSecretKey">Paystack Secret Key</Label>
                <Input
                  id="paystackSecretKey"
                  type="password"
                  value={formData.paystackSecretKey}
                  onChange={(e) => handleInputChange("paystackSecretKey", e.target.value)}
                  placeholder="sk_test_xxxxxxxxxx or sk_live_xxxxxxxxxx"
                  className="rounded-xl font-mono text-sm"
                  aria-invalid={!!errors.paystackSecretKey}
                />
                {errors.paystackSecretKey && (
                  <p className="text-sm text-red-600">{errors.paystackSecretKey}</p>
                )}
                <p className="text-xs text-slate-500">
                  This key will be encrypted and used for secure transactions
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bank Account (Optional) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Landmark className="h-4 w-4" />
              Bank Account (Optional)
            </div>

            <p className="text-sm text-slate-600">
              Add your bank account to receive direct payments for completed surveys.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankCode">Bank</Label>
                <select
                  id="bankCode"
                  value={formData.bankAccount?.bankCode || ""}
                  onChange={(e) => handleInputChange("bankAccount.bankCode", e.target.value)}
                  className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a bank</option>
                  {NIGERIAN_BANKS.map(bank => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                {errors.bankCode && (
                  <p className="text-sm text-red-600">{errors.bankCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  value={formData.bankAccount?.accountNumber || ""}
                  onChange={(e) => handleInputChange("bankAccount.accountNumber", e.target.value)}
                  placeholder="0000000000"
                  className="rounded-xl"
                  maxLength={10}
                  aria-invalid={!!errors.accountNumber}
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-600">{errors.accountNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                type="text"
                value={formData.bankAccount?.accountName || ""}
                onChange={(e) => handleInputChange("bankAccount.accountName", e.target.value)}
                placeholder="Account holder name"
                className="rounded-xl"
              />
            </div>
          </div>

          <Separator />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full rounded-xl bg-[#013F5C] hover:bg-[#0b577a] h-12 font-semibold"
          >
            {loading ? (
              "Setting up payment..."
            ) : (
              <>
                Complete Payment Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <div className="text-center text-xs text-slate-500">
            Your payment information is encrypted and secure. We never store sensitive data in plain text.
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface CreditsPurchaseProps {
  currentCredits: number
  onPurchase: (amount: number) => Promise<void>
  loading?: boolean
}

export function CreditsPurchase({ currentCredits, onPurchase, loading = false }: CreditsPurchaseProps) {
  const [amount, setAmount] = useState(1000)
  const toast = useToast()

  const creditPackages = [
    { amount: 1000, credits: 100, bonus: 0, popular: false },
    { amount: 5000, credits: 550, bonus: 50, popular: true },
    { amount: 10000, credits: 1200, bonus: 200, popular: false },
    { amount: 25000, credits: 3000, bonus: 500, popular: false }
  ]

  const handlePurchase = async () => {
    try {
      await onPurchase(amount)
      toast.show({
        type: 'success',
        title: 'Credits purchased',
        description: `Successfully added ${Math.floor(amount / 10)} credits to your account.`
      })
    } catch (error) {
      toast.show({
        type: 'error',
        title: 'Purchase failed',
        description: 'Failed to purchase credits. Please try again.'
      })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-900">
          Purchase Survey Credits
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Buy credits to fund your surveys and reach more respondents
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="bg-gradient-to-r from-[#013F5C] to-[#0b577a] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Current Balance</p>
              <p className="text-3xl font-bold">{currentCredits.toLocaleString()} Credits</p>
            </div>
            <Wallet className="h-10 w-10 opacity-80" />
          </div>
        </div>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.amount}
              className={`relative border rounded-xl p-4 cursor-pointer transition-all ${
                amount === pkg.amount
                  ? 'border-[#013F5C] bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              } ${pkg.popular ? 'ring-2 ring-[#013F5C] ring-opacity-50' : ''}`}
              onClick={() => setAmount(pkg.amount)}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-[#013F5C] text-white">Most Popular</Badge>
                </div>
              )}
              
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-slate-900">
                  ₦{pkg.amount.toLocaleString()}
                </div>
                <div className="text-lg font-semibold text-slate-700">
                  {pkg.credits.toLocaleString()} Credits
                </div>
                {pkg.bonus > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    +{pkg.bonus} Bonus Credits
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  ₦{(pkg.amount / pkg.credits).toFixed(2)} per credit
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="border border-slate-200 rounded-xl p-4">
          <Label htmlFor="customAmount" className="text-sm font-medium">
            Custom Amount
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-slate-600">₦</span>
            <Input
              id="customAmount"
              type="number"
              min="500"
              step="100"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="rounded-xl"
            />
            <span className="text-sm text-slate-500 whitespace-nowrap">
              = {Math.floor(amount / 10)} credits
            </span>
          </div>
        </div>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={loading || amount < 500}
          size="lg"
          className="w-full rounded-xl bg-[#013F5C] hover:bg-[#0b577a] h-12 font-semibold"
        >
          {loading ? (
            "Processing payment..."
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Purchase {Math.floor(amount / 10)} Credits for ₦{amount.toLocaleString()}
            </>
          )}
        </Button>

        <div className="text-center text-xs text-slate-500">
          Credits are non-refundable. Unused credits do not expire.
        </div>
      </CardContent>
    </Card>
  )
}
