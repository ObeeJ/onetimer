"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import WithdrawDialog from "@/components/earnings/withdraw-dialog";
import { fetchJSON } from "@/hooks/use-api";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Gift,
  Download,
  CreditCard,
  Zap,
  Target,
  Clock,
  CheckCircle,
  Star,
  Award,
  Wallet
} from "lucide-react";

type Earning = { id: string; points: number; date: string; source: string };

const POINTS_PER_USD = 1000;
const POINTS_PER_NGN = 1;

// Mock enhanced data for professional display
const mockEarningsData = {
  totalEarnings: 485.75,
  thisMonth: 127.50,
  pendingPayment: 45.25,
  surveysCompleted: 156,
  averagePerSurvey: 3.11,
  streakDays: 12,
  rank: "Gold Member"
};

const mockRecentEarnings = [
  {
    id: "1",
    surveyTitle: "Consumer Behavior Study 2024",
    completedAt: "2024-01-22",
    earnings: 5.50,
    points: 5500,
    status: "Paid",
    duration: "8 mins",
    source: "Survey Completion"
  },
  {
    id: "2",
    surveyTitle: "Brand Awareness Survey",
    completedAt: "2024-01-22",
    earnings: 4.25,
    points: 4250,
    status: "Paid",
    duration: "6 mins",
    source: "Survey Completion"
  },
  {
    id: "3",
    surveyTitle: "Product Feedback Collection",
    completedAt: "2024-01-21",
    earnings: 6.75,
    points: 6750,
    status: "Pending",
    duration: "12 mins",
    source: "Survey Completion"
  }
];

const monthlyBreakdown = [
  { month: "January 2024", surveys: 42, earnings: 127.50, bonuses: 15.25 },
  { month: "December 2023", surveys: 38, earnings: 118.75, bonuses: 12.50 },
  { month: "November 2023", surveys: 35, earnings: 105.25, bonuses: 8.75 },
  { month: "October 2023", surveys: 41, earnings: 134.25, bonuses: 18.50 }
];

const achievements = [
  { title: "Survey Master", description: "Complete 100+ surveys", icon: Target, unlocked: true },
  { title: "Streak Champion", description: "10-day completion streak", icon: Zap, unlocked: true },
  { title: "Quality Contributor", description: "5-star average rating", icon: Star, unlocked: true },
  { title: "Early Bird", description: "Complete surveys within 1 hour", icon: Clock, unlocked: false }
];

const statusColors = {
  Paid: "badge-success",
  Pending: "badge-warning",
  Processing: "badge-info"
};

export default function EarningsPage() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Earning[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  useEffect(() => {
    fetchJSON<{ balance: number; history: Earning[] }>("/api/earnings")
      .then((r) => {
        if (r) {
          setBalance(r.balance || 0);
          setHistory(r.history || []);
        }
      })
      .catch(() => {
        // Use mock data if API fails
        setBalance(485750); // 485.75 USD in points
        setHistory([]);
      });
  }, []);

  const usd = useMemo(() => balance / POINTS_PER_USD, [balance]);
  const ngn = useMemo(() => balance * POINTS_PER_NGN, [balance]);

  const fmtUSD = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(usd);

  const fmtNGN = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(ngn);

  const canWithdraw = balance >= 1000;

  const filteredEarnings = mockRecentEarnings.filter(earning => {
    if (selectedPeriod === "all") return true;
    const earningDate = new Date(earning.completedAt);
    const now = new Date();
    
    switch (selectedPeriod) {
      case "week":
        return earningDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "month":
        return earningDate.getMonth() === now.getMonth();
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Earnings</h1>
            <p className="text-slate-600 mt-1">Track your survey income and achievements</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setOpen(true)}
              disabled={!canWithdraw}
              className="bg-[#013f5c] hover:bg-[#024a6b] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
            <Button 
              variant="outline" 
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Available Balance</p>
                  <p className="text-2xl font-bold text-slate-900">{fmtUSD}</p>
                  <p className="text-xs text-slate-500 mt-1">{fmtNGN} • {balance.toLocaleString()} pts</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">This Month</p>
                  <p className="text-2xl font-bold text-slate-900">${mockEarningsData.thisMonth}</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Surveys Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{mockEarningsData.surveysCompleted}</p>
                  <p className="text-xs text-slate-500 mt-1">${mockEarningsData.averagePerSurvey} avg</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Current Streak</p>
                  <p className="text-2xl font-bold text-slate-900">{mockEarningsData.streakDays} days</p>
                  <p className="text-xs text-orange-600 mt-1">🔥 Keep it up!</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-lg">
            <TabsTrigger value="recent" className="data-[state=active]:bg-[#013f5c] data-[state=active]:text-white">Recent Earnings</TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-[#013f5c] data-[state=active]:text-white">Monthly Breakdown</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-[#013f5c] data-[state=active]:text-white">Achievements</TabsTrigger>
            <TabsTrigger value="payout" className="data-[state=active]:bg-[#013f5c] data-[state=active]:text-white">Payout Settings</TabsTrigger>
          </TabsList>

          {/* Recent Earnings */}
          <TabsContent value="recent" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedPeriod("all")}
                      className={selectedPeriod === "all" 
                        ? "bg-[#013f5c] hover:bg-[#024a6b] text-white px-4 py-2 rounded-lg font-medium transition-colors" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors"
                      }
                    >
                      All Time
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedPeriod("month")}
                      className={selectedPeriod === "month" 
                        ? "bg-[#013f5c] hover:bg-[#024a6b] text-white px-4 py-2 rounded-lg font-medium transition-colors" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors"
                      }
                    >
                      This Month
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedPeriod("week")}
                      className={selectedPeriod === "week" 
                        ? "bg-[#013f5c] hover:bg-[#024a6b] text-white px-4 py-2 rounded-lg font-medium transition-colors" 
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors"
                      }
                    >
                      This Week
                    </Button>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredEarnings.length} surveys completed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Earnings List */}
            <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-slate-200">
                <CardTitle className="text-xl font-bold text-slate-900">Recent Survey Completions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-6 py-4 font-semibold text-slate-700">Survey</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-700">Date</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-700">Duration</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-700">Points</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-700">Earnings</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEarnings.map((earning) => (
                        <tr key={earning.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <h3 className="font-medium text-slate-900">{earning.surveyTitle}</h3>
                              <p className="text-sm text-slate-600">Survey #{earning.id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(earning.completedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{earning.duration}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-[#013f5c]">+{earning.points}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-green-600">${earning.earnings}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={earning.status === 'Paid' ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium' : earning.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium' : 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'}>
                              {earning.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          {/* Legacy Earnings History */}
          {history.length > 0 && (
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Earnings History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>USD</TableHead>
                      <TableHead>NGN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((earning) => (
                      <TableRow key={earning.id}>
                        <TableCell>{new Date(earning.date).toLocaleDateString()}</TableCell>
                        <TableCell>{earning.source}</TableCell>
                        <TableCell className="font-medium">+{earning.points.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ${(earning.points / POINTS_PER_USD).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ₦{(earning.points * POINTS_PER_NGN).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Monthly Breakdown */}
        <TabsContent value="monthly" className="space-y-6">
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthlyBreakdown.map((month, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">{month.month}</h3>
                    <Badge className="badge-success">${month.earnings}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Surveys</p>
                      <p className="font-semibold text-slate-900">{month.surveys}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Base Earnings</p>
                      <p className="font-semibold text-slate-900">${(month.earnings - month.bonuses).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Bonuses</p>
                      <p className="font-semibold text-green-600">${month.bonuses}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`card-professional ${achievement.unlocked ? 'ring-2 ring-yellow-400' : 'opacity-75'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${achievement.unlocked ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                      <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? 'text-yellow-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-900">{achievement.title}</h3>
                        {achievement.unlocked && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge className="badge-success mt-2">Unlocked!</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Rank */}
          <Card className="card-professional">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{mockEarningsData.rank}</h3>
                <p className="text-slate-600 mb-4">You're in the top 10% of earners this month!</p>
                <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full" style={{ width: "85%" }}></div>
                </div>
                <p className="text-sm text-slate-600">85% progress to Platinum tier</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Settings */}
        <TabsContent value="payout" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">PayPal</p>
                      <p className="text-sm text-slate-600">john.doe@email.com</p>
                    </div>
                    <Badge className="badge-success">Active</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full btn-secondary">
                  Change Payment Method
                </Button>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Withdrawal Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Minimum Withdrawal</span>
                    <span className="font-semibold">1,000 points ($1.00)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Balance</span>
                    <span className="font-semibold text-green-600">{fmtUSD}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Processing Time</span>
                    <span className="font-semibold">3-5 business days</span>
                  </div>
                </div>
                <Button 
                  onClick={() => setOpen(true)}
                  disabled={!canWithdraw}
                  className="w-full btn-primary"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {canWithdraw ? "Request Withdrawal" : "Insufficient Balance"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

        <WithdrawDialog open={open} onOpenChange={setOpen} balance={balance} />
      </div>
    </div>
  );
}
