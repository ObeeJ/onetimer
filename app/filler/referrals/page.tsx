"use client"

import { useState } from "react"
import { motion, useReducedMotion, easeOut } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { EmptyState } from "@/components/ui/empty-state"
import { Users, Copy, Share2, Gift, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { useReferrals } from "@/hooks/use-referrals"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"

export default function ReferralsPage() {
  const { isAuthenticated, isVerified } = useAuth()
  const { data: referralData, isLoading, error, refetch } = useReferrals()
  const reduceMotion = useReducedMotion()
  const [copied, setCopied] = useState(false)

  const referralCode = referralData?.referral_code || ""
  const referralLink = `https://onetimesurvey.com/join?ref=${referralCode}`
  const referrals = referralData?.referrals || []

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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-none space-y-8 p-4 sm:p-6 lg:p-8">
          <Breadcrumb items={[{ label: "Referrals" }]} />
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
          <Breadcrumb items={[{ label: "Referrals" }]} />
          <ErrorMessage 
            message="Failed to load referral data" 
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
            title="Sign in to view referrals"
            description="Please sign in to access your referral dashboard."
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
          <Breadcrumb items={[{ label: "Referrals" }]} />
          
          <Card className="border-yellow-200 bg-yellow-50 rounded-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Lock className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Complete Verification Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please complete your account verification to unlock the referral program and start earning bonuses.
                  </p>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] mt-4 bg-[#013F5C] hover:bg-[#012d42] text-white px-6 py-2">
                    Complete Verification
                  </button>
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
            <Breadcrumb items={[{ label: "Referrals" }]} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">Referral Program</h1>
              <p className="text-slate-600">Invite friends and earn ₦1,000 for each successful referral</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Referrals</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{referralData?.total_referrals || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Friends joined</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Active Referrals</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{referralData?.active_referrals || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Currently earning</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Earnings</CardTitle>
                  <Gift className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">₦{referralData?.total_earnings?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-slate-500 mt-1">From referrals</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">₦{referralData?.pending_earnings?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-slate-500 mt-1">Awaiting completion</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Share Your Referral Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Your Referral Code</label>
                  <div className="flex gap-2">
                    <Input value={referralCode} readOnly className="font-mono" />
                    <Button variant="outline" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Referral Link</label>
                  <div className="flex gap-2">
                    <Input value={referralLink} readOnly className="text-xs" />
                    <Button variant="outline" onClick={copyToClipboard}>
                      {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] w-full bg-[#013F5C] hover:bg-[#012d42] text-white px-6 py-2">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Share your referral link with friends</li>
                    <li>• They sign up and complete their first survey</li>
                    <li>• You both earn ₦1,000 bonus</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No referrals yet"
                    description="Share your referral link to start earning bonuses when friends join."
                  />
                ) : (
                  <div className="space-y-3">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900">{referral.name}</p>
                          <p className="text-sm text-slate-500">Joined {new Date(referral.join_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">₦{referral.earnings}</p>
                            <Badge 
                              variant={referral.status === "active" ? "default" : "secondary"}
                              className={referral.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                            >
                              {referral.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}