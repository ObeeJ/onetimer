"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function KYCUpload() {
  const [nin, setNin] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nin })
      })
      
      if (response.ok) {
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="nin" className="font-semibold">NIN (National Identification Number)</Label>
        <Input 
          id="nin" 
          placeholder="12345678901"
          value={nin} 
          onChange={(e) => setNin(e.target.value)}
          maxLength={11}
          required 
        />
        <p className="text-xs text-gray-500">Enter your 11-digit NIN for verification</p>
      </div>
      
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? "Verifying..." : "Verify Identity"}
      </Button>
      
      {status === "success" && (
        <p className="text-green-600 text-sm">KYC verification successful!</p>
      )}
      {status === "error" && (
        <p className="text-red-600 text-sm">Verification failed. Please try again.</p>
      )}
    </form>
  )
}
