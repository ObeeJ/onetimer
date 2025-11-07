"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"
import { Loader2, AlertCircle, CheckCircle, Banknote, Building2 } from "lucide-react"

const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank", logo: "🏦" },
  { code: "014", name: "Afribank Nigeria Plc", logo: "🏦" },
  { code: "023", name: "Citibank Nigeria Limited", logo: "🏦" },
  { code: "050", name: "Ecobank Nigeria Plc", logo: "🏦" },
  { code: "011", name: "First Bank of Nigeria", logo: "🏦" },
  { code: "214", name: "First City Monument Bank", logo: "🏦" },
  { code: "070", name: "Fidelity Bank", logo: "🏦" },
  { code: "058", name: "Guaranty Trust Bank", logo: "🏦" },
  { code: "030", name: "Heritage Bank", logo: "🏦" },
  { code: "301", name: "Jaiz Bank", logo: "🏦" },
  { code: "082", name: "Keystone Bank", logo: "🏦" },
  { code: "50211", name: "Kuda Bank", logo: "💳" },
  { code: "304", name: "Lotus Bank", logo: "🏦" },
  { code: "999991", name: "Opay", logo: "📱" },
  { code: "999992", name: "Palmpay", logo: "📱" },
  { code: "076", name: "Polaris Bank", logo: "🏦" },
  { code: "101", name: "Providus Bank", logo: "🏦" },
  { code: "221", name: "Stanbic IBTC Bank", logo: "🏦" },
  { code: "068", name: "Standard Chartered Bank", logo: "🏦" },
  { code: "232", name: "Sterling Bank", logo: "🏦" },
  { code: "100", name: "Suntrust Bank", logo: "🏦" },
  { code: "032", name: "Union Bank of Nigeria", logo: "🏦" },
  { code: "033", name: "United Bank For Africa", logo: "🏦" },
  { code: "215", name: "Unity Bank", logo: "🏦" },
  { code: "035", name: "Wema Bank", logo: "🏦" },
  { code: "057", name: "Zenith Bank", logo: "🏦" },
]

export default function WithdrawDialog({
  open = false,
  onOpenChange,
  balance = 0,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  balance?: number
}) {
  const [formData, setFormData] = useState({
    accountName: "",
    bankCode: "",
    bankName: "",
    accountNumber: "",
    amount: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required"
    }

    if (!formData.bankCode) {
      newErrors.bankCode = "Please select a bank"
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required"
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be exactly 10 digits"
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required"
    } else {
      const amount = Number(formData.amount)
      if (amount <= 0) {
        newErrors.amount = "Amount must be greater than 0"
      } else if (amount < 1000) {
        newErrors.amount = "Minimum withdrawal is ₦1,000"
      } else if (amount > balance) {
        newErrors.amount = "Amount exceeds available balance"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch("/api/earnings/withdraw", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_name: formData.accountName,
          bank_code: formData.bankCode,
          account_number: formData.accountNumber,
          amount: Number(formData.amount),
        }),
      })

      if (!response.ok) {
        throw new Error("Withdrawal request failed")
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onOpenChange?.(false)
        setFormData({ accountName: "", bankCode: "", bankName: "", accountNumber: "", amount: "" })
      }, 2000)
    } catch (error) {
      setErrors({ submit: "Failed to process withdrawal. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange?.(false)
      setFormData({ accountName: "", bankCode: "", bankName: "", accountNumber: "", amount: "" })
      setErrors({})
      setSuccess(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleBankSelect = (bankCode: string) => {
    const selectedBank = NIGERIAN_BANKS.find(bank => bank.code === bankCode)
    if (selectedBank) {
      setFormData(prev => ({
        ...prev,
        bankCode,
        bankName: selectedBank.name
      }))
      if (errors.bankCode) {
        setErrors(prev => ({ ...prev, bankCode: "" }))
      }
    }
  }

  const nairaAmount = Number(formData.amount || 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Banknote className="h-5 w-5 text-primary" />
            Withdraw to Bank Account
          </DialogTitle>
          <p className="text-sm text-slate-600">Transfer your earnings to any Nigerian bank account</p>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Withdrawal Submitted!</h3>
            <p className="text-slate-600">Your withdrawal request has been processed successfully.</p>
            <p className="text-sm text-slate-500 mt-2">Funds will be transferred within 24 hours</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600">Available Balance</div>
                  <div className="text-2xl font-bold text-slate-900">₦{balance.toLocaleString()}</div>
                </div>
                <Banknote className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bankCode" className="text-sm font-semibold text-slate-700">
                  Select Bank *
                </Label>
                <Select value={formData.bankCode} onValueChange={handleBankSelect}>
                  <SelectTrigger className={`mt-1 h-12 rounded-xl ${errors.bankCode ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Choose your bank" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {NIGERIAN_BANKS.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code} className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{bank.logo}</span>
                          <span>{bank.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bankCode && <p className="text-sm text-red-600 mt-1">{errors.bankCode}</p>}
              </div>

              <div>
                <Label htmlFor="accountNumber" className="text-sm font-semibold text-slate-700">
                  Account Number *
                </Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => updateField("accountNumber", e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 10-digit account number"
                  maxLength={10}
                  className={`mt-1 h-12 rounded-xl ${errors.accountNumber ? "border-red-500" : ""}`}
                />
                {errors.accountNumber && <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>}
              </div>

              <div>
                <Label htmlFor="accountName" className="text-sm font-semibold text-slate-700">
                  Account Name *
                </Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => updateField("accountName", e.target.value)}
                  placeholder="Enter account holder name"
                  className={`mt-1 h-12 rounded-xl ${errors.accountName ? "border-red-500" : ""}`}
                />
                {errors.accountName && <p className="text-sm text-red-600 mt-1">{errors.accountName}</p>}
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm font-semibold text-slate-700">
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={1000}
                  max={balance}
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  placeholder="Enter amount to withdraw"
                  className={`mt-1 h-12 rounded-xl ${errors.amount ? "border-red-500" : ""}`}
                />
                {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Minimum: ₦1,000</span>
                  {nairaAmount > 0 && <span>You'll receive: ₦{nairaAmount.toLocaleString()}</span>}
                </div>
              </div>
            </div>

            {errors.submit && (
              <Alert className="border-red-200 bg-red-50 rounded-xl">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Withdrawal Information</p>
                  <p className="text-blue-700 mt-1">• Processing time: 24 hours</p>
                  <p className="text-blue-700">• No withdrawal fees</p>
                  <p className="text-blue-700">• Secure bank transfer via Paystack</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!success && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="rounded-xl bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Withdrawal"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}