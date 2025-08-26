"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { fetchJSON } from "@/hooks/use-api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, RefreshCw, Users, Gift, Share2, CheckCircle, TrendingUp } from "lucide-react"

type RefUser = { id: string; name: string; joinedAt: string; points: number }

export default function ReferralsPage() {
  const [link, setLink] = useState("")
  const [users, setUsers] = useState<RefUser[]>([])
  const [copied, setCopied] = useState(false)
  // regenerate removed from referrals UI; link rotation handled elsewhere/admin

  useEffect(() => {
    fetchJSON<{ link: string }>("/api/referrals")
      .then((r) => {
        if (r) {
          setLink(r.link || "https://onetime.com/ref/demo123")
        }
      })
      .catch(() => {
        setLink("https://onetime.com/ref/demo123")
      })
    
    fetchJSON<{ users: RefUser[] }>("/api/referrals?list=1")
      .then((r) => {
        if (r) {
          setUsers(r.users || [])
        }
      })
      .catch(() => {
        setUsers([])
      })
  }, [])

  const copyLink = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }



  const totalReferrals = users.length
  const totalEarnings = users.reduce((sum, user) => sum + user.points, 0)

  return (
    <div className="container mx-auto space-y-8 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Referral Program</h1>
        <p className="text-slate-600 font-medium">Invite friends and earn rewards together</p>
      </div>

  <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600">Total Referrals</CardTitle>
              <Users className="h-5 w-5 text-[#C1654B]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalReferrals}</div>
              <p className="text-xs text-slate-500 mt-1">Friends joined</p>
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
              <CardTitle className="text-sm font-semibold text-slate-600">Referral Earnings</CardTitle>
              <Gift className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalEarnings}</div>
              <p className="text-xs text-slate-500 mt-1">Points earned from referrals</p>
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
              <CardTitle className="text-sm font-semibold text-slate-600">Avg. per Referral</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {totalReferrals > 0 ? Math.round(totalEarnings / totalReferrals) : 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Points per friend</p>
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
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#013F5C]" />
              <CardTitle className="text-xl font-bold text-slate-900">Your Referral Link</CardTitle>
            </div>
            <p className="text-sm text-slate-600 mt-1">Share this link with friends to earn rewards when they join</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  value={link}
                  readOnly
      className="h-12 rounded-xl border-slate-300 bg-slate-50 font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={copyLink}
      className="h-12 rounded-xl bg-[#013F5C] font-semibold text-white hover:bg-[#0b577a]"
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                {/* regenerate removed */}
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Gift className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Earn 50 points</strong> for each friend who joins using your referral link and completes their
                first survey!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#C1654B]" />
                <CardTitle className="text-xl font-bold text-slate-900">Referred Friends</CardTitle>
              </div>
              <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                {totalReferrals} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-700">Friend</TableHead>
                      <TableHead className="font-semibold text-slate-700">Joined</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Points Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-900">{u.name}</TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(u.joinedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="rounded-full bg-green-50 text-green-700 border-green-200">
                            +{u.points} pts
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No referrals yet</h3>
                <p className="text-slate-600 mb-4">Start sharing your referral link to earn rewards!</p>
                <Button
                  onClick={copyLink}
                  className="rounded-xl bg-[#C1654B] font-semibold text-white hover:bg-[#b25a43]"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Your Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
