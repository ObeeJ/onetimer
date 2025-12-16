"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle, AlertCircle } from "lucide-react"

interface KYCVerificationFormProps {
  onSuccess?: () => void
}

export function KYCVerificationForm({ onSuccess }: KYCVerificationFormProps) {
  const [nin, setNin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
    data?: any
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nin || nin.length !== 11) {
      setResult({
        type: 'error',
        message: 'Please enter a valid 11-digit NIN'
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // CRITICAL: Send cookies including auth_token
        body: JSON.stringify({ nin })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: 'success',
          message: 'KYC verification successful!',
          data: data.data
        })
        onSuccess?.()
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Verification failed'
        })
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Network error. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>KYC Verification</CardTitle>
        <p className="text-sm text-slate-600">
          Verify your identity to enable withdrawals
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              National Identification Number (NIN)
            </label>
            <Input
              type="text"
              placeholder="Enter your 11-digit NIN"
              value={nin}
              onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
              maxLength={11}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your NIN will be used to verify your identity securely
            </p>
          </div>

          {result && (
            <div className={`p-3 rounded-lg flex items-start gap-2 ${
              result.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {result.type === 'success' ? (
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              )}
              <div className="text-sm">
                <p className="font-medium">{result.message}</p>
                {result.data && (
                  <p className="mt-1">
                    Welcome, {result.data.firstname} {result.data.lastname}
                  </p>
                )}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || nin.length !== 11}
          >
            {isLoading ? "Verifying..." : "Verify Identity"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
