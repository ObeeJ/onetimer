"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function WithdrawDialog({
  open = false,
  onOpenChange,
  balance = 0,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  balance?: number
}) {
  const [amount, setAmount] = useState("")

  const submit = async () => {
    await fetch("/api/payments/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount: Number(amount) }),
    })
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <span />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw via Paystack (mock)</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="amt">Amount (pts)</Label>
          <Input
            id="amt"
            type="number"
            min={0}
            max={balance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <p className="text-xs text-muted-foreground">Available: {balance} pts</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={submit} className="rounded-xl" disabled={!amount || Number(amount) <= 0 || Number(amount) > balance}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
