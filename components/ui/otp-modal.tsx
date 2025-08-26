"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { fetchJSON } from "@/hooks/use-api"

export default function OTPModal({
  open,
  email,
  onClose,
  onVerified,
}: {
  open: boolean
  email?: string
  onClose: () => void
  onVerified: () => void
}) {
  const [code, setCode] = useState("")
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) send()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const send = async () => {
    if (!email) {
      setMessage("No email on file to send OTP to.")
      return
    }
    setMessage(null)
    setSending(true)
    try {
      await fetchJSON("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email }) })
      setMessage(`OTP sent to ${email}`)
    } catch (err) {
      setMessage("Failed to send OTP. Try again.")
    } finally {
      setSending(false)
    }
  }

  const verify = async () => {
    setVerifying(true)
    setMessage(null)
    try {
      await fetchJSON("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ code }) })
      onVerified()
      onClose()
    } catch (err) {
      setMessage("Invalid code or verification failed.")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter verification code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-2">
          <p className="text-sm text-slate-600">We sent a one-time code to your email. Enter it below to continue.</p>
          <div>
            <Label htmlFor="otp">Code</Label>
            <Input id="otp" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" className="mt-1" />
          </div>
          {message && <div className="text-sm text-slate-600">{message}</div>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={send} disabled={sending}>{sending ? 'Sending...' : 'Resend code'}</Button>
            <div className="ml-auto">
              <Button onClick={verify} disabled={verifying || code.length < 4}>{verifying ? 'Verifying...' : 'Verify'}</Button>
            </div>
          </div>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  )
}
