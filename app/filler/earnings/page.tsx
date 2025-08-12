"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import WithdrawDialog from "@/components/earnings/withdraw-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchJSON } from "@/hooks/use-api"
import { Wallet, TrendingUp, DollarSign, Download, Clock } from "lucide-react"

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

  const fmtUSD = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(usd)
  const fmtNGN = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(ngn)

  const canWithdraw = balance >= 1000

  return (
    <div className="container mx-auto space-y-8 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Earnings Dashboard</h1>
        <p className="text-slate-600 font-medium">Track your survey earnings and manage withdrawals</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Total Points</CardTitle>
              <Wallet className="h-5 w-5 text-[#C1654B]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{balance.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">Available for withdrawal</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">USD Value</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{fmtUSD}</div>
              <p className="text-xs text-slate-500 mt-1">1,000 points = $1.00</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Naira Value</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{fmtNGN}</div>
              <p className="text-xs text-slate-500 mt-1">1,000 points = ₦1,000</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Withdraw Earnings</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Transfer your earnings to your bank account via Paystack</p>
              </div>
              <Download className="h-6 w-6 text-[#013F5C]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={canWithdraw ? "default" : "secondary"} className="rounded-full">
                {canWithdraw ? "Eligible" : "Minimum not met"}
              </Badge>
              <span className="text-sm text-slate-600">
                {canWithdraw ? "You can withdraw your earnings" : "Minimum 1,000 points required"}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => setOpen(true)}
              disabled={!canWithdraw}
              size="lg"
              className="h-12 rounded-xl bg-[#013F5C] font-semibold text-white hover:bg-[#0b577a] disabled:bg-slate-300 disabled:text-slate-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Withdraw Funds
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#C1654B]" />
              <CardTitle className="text-xl font-bold text-slate-900">Earnings History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="font-semibold text-slate-700">Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Source</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h, index) => (
                    <TableRow key={h.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {new Date(h.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-slate-600">{h.source}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="rounded-full bg-green-50 text-green-700 border-green-200">
                          +{h.points} pts
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <WithdrawDialog open={open} onOpenChange={setOpen} balance={balance} />
    </div>
  )
}
