"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import WithdrawDialog from "@/components/earnings/withdraw-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchJSON } from "@/hooks/use-api"

type Earning = { id: string; points: number; date: string; source: string }

const POINTS_PER_USD = 1000
const POINTS_PER_NGN = 1 // 1000 pts = ₦1000 => 1 pt = ₦1

export default function EarningsPage() {
  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState<Earning[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchJSON<{ balance: number; history: Earning[] }>("/api/earnings").then((r) => {
      setBalance(r.balance)
      setHistory(r.history)
    })
  }, [])

  const usd = useMemo(() => balance / POINTS_PER_USD, [balance])
  const ngn = useMemo(() => balance * POINTS_PER_NGN, [balance])

  const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(usd)
  const fmtNGN = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(ngn)

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <Card className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground">Points</div>
            <div className="text-4xl font-bold">{balance} pts</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">USD</div>
            <div className="text-2xl font-semibold">{fmtUSD}</div>
            <div className="text-xs text-muted-foreground">1000 points = $1</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Naira</div>
            <div className="text-2xl font-semibold">{fmtNGN}</div>
            <div className="text-xs text-muted-foreground">1000 points = ₦1,000</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setOpen(true)} disabled={balance < 1000} size="lg" className="rounded-2xl h-11">
            Request Withdrawal
          </Button>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>{new Date(h.date).toLocaleDateString()}</TableCell>
                  <TableCell>{h.source}</TableCell>
                  <TableCell className="text-right">{h.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <WithdrawDialog open={open} onOpenChange={setOpen} balance={balance} />
    </div>
  )
}
