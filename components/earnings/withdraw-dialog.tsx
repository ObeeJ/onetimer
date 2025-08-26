"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import OTPModal from "@/components/ui/otp-modal"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, AlertCircle, CheckCircle, Banknote } from "lucide-react"
import { fetchJSON } from "@/hooks/use-api"

const NIGERIAN_BANKS = [
  "Access Bank",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "FCMB",
  "GTBank",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Stanbic IBTC",
  "Standard Chartered",
  "Sterling Bank",
  "UBA",
  "Union Bank",
  "Wema Bank",
  "Zenith Bank",
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
    bankName: "",
    accountNumber: "",
    amount: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const { user, loaded } = useAuth()

  // try prefill from server or local storage
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const p = await fetchJSON<any>("/api/profile")
        if (mounted && p) {
          setFormData((f) => ({ ...f, accountName: p.accountName ?? f.accountName, bankName: p.bankName ?? f.bankName, accountNumber: p.accountNumber ?? f.accountNumber }))
        }
      } catch {
        try {
          const raw = localStorage.getItem("sf:profile")
          if (raw) {
            const parsed = JSON.parse(raw)
            if (mounted) setFormData((f) => ({ ...f, accountName: parsed.accountName ?? f.accountName, bankName: parsed.bankName ?? f.bankName, accountNumber: parsed.accountNumber ?? f.accountNumber }))
          }
        } catch {}
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required"
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required"
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
        newErrors.amount = "Minimum withdrawal is 1,000 points"
      } else if (amount > balance) {
        newErrors.amount = "Amount exceeds available balance"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async () => {
    if (!validateForm()) return

    // open OTP modal to confirm
    setPendingSubmit(true)
    setOtpOpen(true)
    return
  }

  const onOtpVerified = async () => {
    // proceed with previously validated formData
    setOtpOpen(false)
    setPendingSubmit(false)
    setIsLoading(true)
    setErrors({})
    try {
      await fetchJSON("/api/payments/withdraw", {
        method: "POST",
        body: JSON.stringify({
          accountName: formData.accountName,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          amount: Number(formData.amount),
        }),
      })

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onOpenChange?.(false)
        setFormData({ accountName: "", bankName: "", accountNumber: "", amount: "" })
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
      setFormData({ accountName: "", bankName: "", accountNumber: "", amount: "" })
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Banknote className="h-5 w-5 text-[#013F5C]" />
            Withdraw to Bank Account
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Withdrawal Submitted!</h3>
            <p className="text-slate-600">Your withdrawal request has been processed successfully.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-sm text-slate-600">Available Balance</div>
              <div className="text-lg font-bold text-slate-900">{balance.toLocaleString()} points</div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accountName" className="text-sm font-semibold text-slate-700">
                  Name on Account *
                </Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => updateField("accountName", e.target.value)}
                  placeholder="Enter account holder name"
                  className={`mt-1 ${errors.accountName ? "border-red-500" : ""}`}
                />
                {errors.accountName && <p className="text-sm text-red-600 mt-1">{errors.accountName}</p>}
              </div>

              <div>
                <Label htmlFor="bankName" className="text-sm font-semibold text-slate-700">
                  Bank Name *
                </Label>
                <div className="mt-1">
                  <select
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => updateField("bankName", e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm ${errors.bankName ? "border-red-500" : "border-slate-200"}`}
                  >
                    <option value="">Select bank</option>
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.bankName && <p className="text-sm text-red-600 mt-1">{errors.bankName}</p>}
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
                  className={`mt-1 ${errors.accountNumber ? "border-red-500" : ""}`}
                />
                {errors.accountNumber && <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>}
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm font-semibold text-slate-700">
                  Amount (Points) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={1000}
                  max={balance}
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  placeholder="Enter amount to withdraw"
                  className={`mt-1 ${errors.amount ? "border-red-500" : ""}`}
                />
                {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
                <p className="text-xs text-slate-500 mt-1">Minimum: 1,000 points</p>
              </div>
            </div>

            {errors.submit && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{errors.submit}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!success && (
            <DialogFooter className="gap-2 flex items-center justify-between">
              <p className="text-xs text-slate-500 mr-4">An OTP will be sent to your email to confirm this withdrawal.</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleClose} disabled={isLoading} className="rounded-xl bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="h-12 rounded-xl bg-[#013F5C] font-semibold text-white hover:bg-[#0b577a] disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Withdraw Funds"
                  )}
                </Button>
              </div>
            </DialogFooter>
        )}
      </DialogContent>
      </Dialog>
      <OTPModal open={otpOpen} email={user?.email} onClose={() => { setOtpOpen(false); setPendingSubmit(false) }} onVerified={onOtpVerified} />
    </>
  )
}
