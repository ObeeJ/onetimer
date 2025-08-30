"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { DollarSign, TrendingUp, Calendar, Download, Lock, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function EarningsPage() {
  const { isAuthenticated, isVerified } = useAuth()
  const reduceMotion = useReducedMotion()
  const [timeRange, setTimeRange] = useState("lifetime")

  // TODO: Replace with actual API data
  const earningsData = {
    total: 24750,
    thisMonth: 8250,
    pending: 1500,
    withdrawn: 23250
  }

  const transactions = [
    { id: "1", type: "survey", title: "Consumer Behavior Study", amount: 550, date: "2024-01-15", status: "completed" },
    { id: "2", type: "survey", title: "Product Feedback", amount: 325, date: "2024-01-14", status: "completed" },
    { id: "3", type: "referral", title: "Friend Referral Bonus", amount: 1000, date: "2024-01-13", status: "completed" },
    { id: "4", type: "survey", title: "Market Research", amount: 475, date: "2024-01-12", status: "pending" }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reduceMotion ? 0 : 0.1, duration: reduceMotion ? 0.1 : 0.3 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0.1 : 0.4, ease: "easeOut" } }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <EmptyState
            icon={Lock}
            title="Sign in to view earnings"
            description="Please sign in to access your earnings dashboard."
            action={{ label: "Sign in", href: "/filler/auth/sign-in" }}
          />
        </div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <Breadcrumb items={[{ label: "Earnings" }]} />
          
          <Card className="border-yellow-200 bg-yellow-50 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Lock className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Complete Verification Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please complete your account verification to unlock earnings tracking and withdrawals.
                  </p>
                  <Button className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white">
                    Complete Verification
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          
          <motion.div variants={itemVariants}>
            <Breadcrumb items={[{ label: "Earnings" }]} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Earnings Dashboard</h1>
                <p className="text-slate-600">Track your survey earnings and manage withdrawals</p>
              </div>
              <div className="flex gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">₦{earningsData.total.toLocaleString()}</div>
                  <p className="text-xs text-slate-500 mt-1">All time earnings</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">₦{earningsData.thisMonth.toLocaleString()}</div>
                  <p className="text-xs text-slate-500 mt-1">+15% from last month</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">₦{earningsData.pending.toLocaleString()}</div>
                  <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Withdrawn</CardTitle>
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">₦{earningsData.withdrawn.toLocaleString()}</div>
                  <p className="text-xs text-slate-500 mt-1">Successfully paid out</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList>
                <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                <TabsTrigger value="breakdown">Earnings Breakdown</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactions.length === 0 ? (
                      <EmptyState
                        icon={DollarSign}
                        title="No transactions yet"
                        description="Complete surveys to start earning and see your transaction history here."
                      />
                    ) : (
                      <div className="space-y-4">
                        {transactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">{transaction.title}</p>
                              <p className="text-sm text-slate-500">{transaction.date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-semibold text-slate-900">₦{transaction.amount}</p>
                                <Badge 
                                  variant={transaction.status === "completed" ? "default" : "secondary"}
                                  className={transaction.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-xl">
                    <CardHeader>
                      <CardTitle>Earnings by Source</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Surveys</span>
                        <span className="font-semibold">₦18,500</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Referrals</span>
                        <span className="font-semibold">₦6,250</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Bonuses</span>
                        <span className="font-semibold">₦0</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl">
                    <CardHeader>
                      <CardTitle>Withdrawal Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600">Available balance: ₦{(earningsData.total - earningsData.withdrawn).toLocaleString()}</p>
                      <Button className="w-full bg-[#013F5C] hover:bg-[#0b577a]">
                        Request Withdrawal
                      </Button>
                      <p className="text-xs text-slate-500">Minimum withdrawal: ₦5,000</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}