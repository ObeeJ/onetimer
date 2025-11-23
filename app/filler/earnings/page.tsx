"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion, easeOut } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { DollarSign, TrendingUp, Calendar, Download, Lock, CheckCircle } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { useEarnings } from "@/hooks/use-earnings"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { KYCVerificationForm } from "@/components/kyc/kyc-verification-form"
import WithdrawDialog from "@/components/earnings/withdraw-dialog"

export default function EarningsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isKycVerified } = useAuth()
  const { data: earnings, isLoading, error, refetch } = useEarnings()
  const reduceMotion = useReducedMotion()
  const [timeRange, setTimeRange] = useState("lifetime")
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [showKYCForm, setShowKYCForm] = useState(false)

  const handleCompleteVerification = () => {
    router.push('/filler/onboarding/verify')
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/earnings/export', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleCopyReferral = () => {
    const referralCode = `REF${user?.id?.slice(-6)?.toUpperCase() || 'DEMO'}`
    navigator.clipboard.writeText(referralCode)
    console.log("Referral code copied:", referralCode)
  }

  const earningsData = {
    total: earnings?.total || 0,
    available: earnings?.available || 0,
    pending: earnings?.pending || 0,
    withdrawn: earnings?.withdrawn || 0,
    transactions: earnings?.transactions || []
  }

  // const thisMonth = earnings?.this_month || 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reduceMotion ? 0 : 0.1, duration: reduceMotion ? 0.1 : 0.3 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0.1 : 0.4, ease: easeOut } }
  }

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <ErrorMessage 
            message="Failed to load earnings data" 
            onRetry={refetch}
          />
        </div>
      </div>
    )
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
                <Button variant="outline" onClick={handleExport}>
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
                  {/* <div className="text-2xl font-bold text-slate-900">₦{thisMonth.toLocaleString()}</div> */}
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
                <TabsTrigger value="referrals">Referrals</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!earningsData.transactions || earningsData.transactions.length === 0 ? (
                      <EmptyState
                        icon={DollarSign}
                        title="No transactions yet"
                        description="Complete surveys to start earning and see your transaction history here."
                      />
                    ) : (
                      <div className="space-y-4">
                        {earningsData.transactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">{transaction.description}</p>
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
                      {!isKycVerified ? (
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setShowKYCForm(true)}
                          >
                            Complete KYC to Withdraw
                          </Button>
                          <p className="text-xs text-slate-500">KYC verification required for withdrawals</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button 
                            variant="filler" 
                            className="w-full"
                            onClick={() => setWithdrawOpen(true)}
                            disabled={earningsData.available < 1000}
                          >
                            Request Withdrawal
                          </Button>
                          <p className="text-xs text-slate-500">Minimum withdrawal: ₦5,000</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="referrals" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="rounded-xl">
                    <CardHeader>
                      <CardTitle>Referral Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Total Referrals</span>
                        <span className="font-semibold text-2xl">8</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Active Referrals</span>
                        <span className="font-semibold text-2xl">5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Referral Earnings</span>
                        <span className="font-semibold text-2xl">₦6,250</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl">
                    <CardHeader>
                      <CardTitle>Share Your Link</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600">Earn ₦1,000 for each friend who joins and completes their first survey!</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value="https://onetime.com/ref/USER123" 
                          readOnly 
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                        />
                        <Button variant="filler" size="sm" onClick={handleCopyReferral}>
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
        
        <WithdrawDialog 
          open={withdrawOpen}
          onOpenChange={setWithdrawOpen}
          balance={earningsData.available}
        />

        {/* KYC Verification Modal */}
        {showKYCForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="relative">
              <button
                onClick={() => setShowKYCForm(false)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg z-10"
              >
                ✕
              </button>
              <KYCVerificationForm 
                onSuccess={() => {
                  setShowKYCForm(false)
                  // Refresh user data to update KYC status
                  window.location.reload()
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}