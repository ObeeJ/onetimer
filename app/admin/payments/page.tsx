"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  CreditCard,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  RefreshCw,
  FileText,
  Banknote
} from "lucide-react"

interface WithdrawalRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  accountDetails: {
    bankName: string
    accountNumber: string
    accountName: string
    bankCode?: string
  }
  requestedAt: string
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'rejected'
  availableBalance: number
  totalEarnings: number
  surveyCompletions: number
  processingFee: number
  netAmount: number
  paymentReference?: string
  processedAt?: string
  failureReason?: string
  rejectionReason?: string
  priority: 'high' | 'medium' | 'low'
  verificationStatus: {
    kycVerified: boolean
    accountVerified: boolean
    eligibilityMet: boolean
  }
}

interface PaymentStats {
  totalPending: number
  totalProcessing: number
  totalCompleted: number
  totalFailed: number
  totalAmount: number
  totalFees: number
}

export default function AdminPaymentsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalPending: 0,
    totalProcessing: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalAmount: 0,
    totalFees: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("pending")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [actionDialog, setActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'process' | null>(null)
  const [actionNotes, setActionNotes] = useState("")

  useEffect(() => {
    // Simulate API call to load withdrawal requests
    const timer = setTimeout(() => {
      const withdrawalData: WithdrawalRequest[] = [
        {
          id: 'wd-001',
          userId: 'user-001',
          userName: 'John Doe',
          userEmail: 'john.doe@email.com',
          amount: 25000,
          accountDetails: {
            bankName: 'First Bank of Nigeria',
            accountNumber: '1234567890',
            accountName: 'John Doe',
            bankCode: '011'
          },
          requestedAt: '2025-01-22 16:30',
          status: 'pending',
          availableBalance: 45000,
          totalEarnings: 67000,
          surveyCompletions: 134,
          processingFee: 500,
          netAmount: 24500,
          priority: 'high',
          verificationStatus: {
            kycVerified: true,
            accountVerified: true,
            eligibilityMet: true
          }
        },
        {
          id: 'wd-002',
          userId: 'user-002',
          userName: 'Jane Smith',
          userEmail: 'jane.smith@email.com',
          amount: 15000,
          accountDetails: {
            bankName: 'GTBank',
            accountNumber: '0987654321',
            accountName: 'Jane Smith',
            bankCode: '058'
          },
          requestedAt: '2025-01-22 14:15',
          status: 'processing',
          availableBalance: 28000,
          totalEarnings: 43000,
          surveyCompletions: 86,
          processingFee: 300,
          netAmount: 14700,
          paymentReference: 'PAY_REF_001',
          priority: 'medium',
          verificationStatus: {
            kycVerified: true,
            accountVerified: true,
            eligibilityMet: true
          }
        },
        {
          id: 'wd-003',
          userId: 'user-003',
          userName: 'Michael Johnson',
          userEmail: 'michael.j@email.com',
          amount: 8000,
          accountDetails: {
            bankName: 'Access Bank',
            accountNumber: '1122334455',
            accountName: 'Michael Johnson',
            bankCode: '044'
          },
          requestedAt: '2025-01-21 11:20',
          status: 'rejected',
          availableBalance: 12000,
          totalEarnings: 20000,
          surveyCompletions: 40,
          processingFee: 200,
          netAmount: 7800,
          rejectionReason: 'Insufficient survey completions for withdrawal eligibility',
          priority: 'low',
          verificationStatus: {
            kycVerified: false,
            accountVerified: false,
            eligibilityMet: false
          }
        },
        {
          id: 'wd-004',
          userId: 'user-004',
          userName: 'Sarah Wilson',
          userEmail: 'sarah.wilson@email.com',
          amount: 50000,
          accountDetails: {
            bankName: 'Zenith Bank',
            accountNumber: '5566778899',
            accountName: 'Sarah Wilson',
            bankCode: '057'
          },
          requestedAt: '2025-01-20 09:45',
          status: 'completed',
          availableBalance: 75000,
          totalEarnings: 125000,
          surveyCompletions: 250,
          processingFee: 1000,
          netAmount: 49000,
          paymentReference: 'PAY_REF_002',
          processedAt: '2025-01-20 15:30',
          priority: 'high',
          verificationStatus: {
            kycVerified: true,
            accountVerified: true,
            eligibilityMet: true
          }
        },
        {
          id: 'wd-005',
          userId: 'user-005',
          userName: 'David Brown',
          userEmail: 'david.brown@email.com',
          amount: 20000,
          accountDetails: {
            bankName: 'UBA',
            accountNumber: '7788990011',
            accountName: 'David Brown',
            bankCode: '033'
          },
          requestedAt: '2025-01-19 13:10',
          status: 'failed',
          availableBalance: 35000,
          totalEarnings: 55000,
          surveyCompletions: 110,
          processingFee: 400,
          netAmount: 19600,
          paymentReference: 'PAY_REF_003',
          failureReason: 'Invalid account details - account number not found',
          priority: 'medium',
          verificationStatus: {
            kycVerified: true,
            accountVerified: false,
            eligibilityMet: true
          }
        }
      ]

      setWithdrawals(withdrawalData)
      
      // Calculate stats
      const totalPending = withdrawalData.filter(w => w.status === 'pending').length
      const totalProcessing = withdrawalData.filter(w => w.status === 'processing').length
      const totalCompleted = withdrawalData.filter(w => w.status === 'completed').length
      const totalFailed = withdrawalData.filter(w => w.status === 'failed').length
      const totalAmount = withdrawalData.reduce((sum, w) => sum + w.amount, 0)
      const totalFees = withdrawalData.reduce((sum, w) => sum + w.processingFee, 0)

      setStats({
        totalPending,
        totalProcessing,
        totalCompleted,
        totalFailed,
        totalAmount,
        totalFees
      })

      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'processing':
        return 'outline'
      case 'failed':
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject' | 'process', notes?: string) => {
    // Simulate Paystack integration for processing
    if (action === 'process') {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId)
      if (withdrawal) {
        // Simulate Paystack transfer API call
        try {
          const paymentReference = `PAY_${Date.now()}`
          
          setWithdrawals(prev => prev.map(w => 
            w.id === withdrawalId 
              ? { 
                  ...w, 
                  status: 'processing',
                  paymentReference,
                  processedAt: new Date().toISOString()
                }
              : w
          ))

          // Simulate processing delay
          setTimeout(() => {
            setWithdrawals(prev => prev.map(w => 
              w.id === withdrawalId 
                ? { ...w, status: 'completed' }
                : w
            ))
          }, 3000)
        } catch (error) {
          setWithdrawals(prev => prev.map(w => 
            w.id === withdrawalId 
              ? { 
                  ...w, 
                  status: 'failed',
                  failureReason: 'Payment processing failed. Please try again.'
                }
              : w
          ))
        }
      }
    } else {
      setWithdrawals(prev => prev.map(withdrawal => 
        withdrawal.id === withdrawalId 
          ? { 
              ...withdrawal, 
              status: action === 'approve' ? 'approved' : 'rejected',
              processedAt: new Date().toISOString(),
              rejectionReason: action === 'reject' ? notes : undefined
            }
          : withdrawal
      ))
    }
    
    setActionDialog(false)
    setActionNotes("")
    setSelectedWithdrawal(null)
  }

  const openActionDialog = (withdrawal: WithdrawalRequest, action: 'approve' | 'reject' | 'process') => {
    setSelectedWithdrawal(withdrawal)
    setActionType(action)
    setActionDialog(true)
  }

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedTab === 'all') return matchesSearch
    return matchesSearch && withdrawal.status === selectedTab
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Processing</h1>
          <p className="text-slate-600">Manage withdrawal requests and process payments via Paystack</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Transactions
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Paystack
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.totalPending}</p>
                <p className="text-xs text-yellow-600">Awaiting approval</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Processing</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalProcessing}</p>
                <p className="text-xs text-blue-600">In progress</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalCompleted}</p>
                <p className="text-xs text-green-600">Successfully paid</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Amount</p>
                <p className="text-2xl font-bold text-purple-900">₦{stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-purple-600">₦{stats.totalFees.toLocaleString()} in fees</p>
              </div>
              <Banknote className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by user name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({withdrawals.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.totalPending})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({stats.totalProcessing})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.totalCompleted})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({stats.totalFailed})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({withdrawals.filter(w => w.status === 'rejected').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <div className="space-y-4">
            {filteredWithdrawals.map((withdrawal) => (
              <Card key={withdrawal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-slate-900">{withdrawal.userName}</h3>
                        <Badge variant={getStatusColor(withdrawal.status) as any}>
                          {withdrawal.status}
                        </Badge>
                        <Badge variant={getPriorityColor(withdrawal.priority) as any}>
                          {withdrawal.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-500">Amount Requested</p>
                          <p className="font-semibold text-lg">₦{withdrawal.amount.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">Net: ₦{withdrawal.netAmount.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-500">Account Details</p>
                          <p className="font-medium">{withdrawal.accountDetails.bankName}</p>
                          <p className="text-sm text-slate-600">{withdrawal.accountDetails.accountNumber}</p>
                          <p className="text-sm text-slate-600">{withdrawal.accountDetails.accountName}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-500">User Stats</p>
                          <p className="text-sm">Balance: ₦{withdrawal.availableBalance.toLocaleString()}</p>
                          <p className="text-sm">Surveys: {withdrawal.surveyCompletions}</p>
                          <p className="text-sm">Total Earned: ₦{withdrawal.totalEarnings.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${withdrawal.verificationStatus.kycVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>KYC {withdrawal.verificationStatus.kycVerified ? 'Verified' : 'Pending'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${withdrawal.verificationStatus.accountVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>Account {withdrawal.verificationStatus.accountVerified ? 'Verified' : 'Unverified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${withdrawal.verificationStatus.eligibilityMet ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>Eligibility {withdrawal.verificationStatus.eligibilityMet ? 'Met' : 'Not Met'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Requested: {withdrawal.requestedAt}</span>
                        {withdrawal.processedAt && (
                          <span>Processed: {withdrawal.processedAt}</span>
                        )}
                        {withdrawal.paymentReference && (
                          <span>Ref: {withdrawal.paymentReference}</span>
                        )}
                      </div>

                      {(withdrawal.rejectionReason || withdrawal.failureReason) && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">
                            <strong>
                              {withdrawal.rejectionReason ? 'Rejection Reason:' : 'Failure Reason:'}
                            </strong> {withdrawal.rejectionReason || withdrawal.failureReason}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/payments/withdrawals/${withdrawal.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {withdrawal.status === 'pending' && withdrawal.verificationStatus.eligibilityMet && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => openActionDialog(withdrawal, 'approve')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => openActionDialog(withdrawal, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {withdrawal.status === 'approved' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openActionDialog(withdrawal, 'process')}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Process Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Withdrawal' : 
               actionType === 'reject' ? 'Reject Withdrawal' : 
               'Process Payment'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Verify all details before approving this withdrawal request.'
                : actionType === 'reject'
                ? 'Please provide a reason for rejecting this withdrawal request.'
                : 'This will initiate payment processing via Paystack.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="py-4">
              <div className="space-y-2 mb-4">
                <p><strong>User:</strong> {selectedWithdrawal.userName}</p>
                <p><strong>Amount:</strong> ₦{selectedWithdrawal.amount.toLocaleString()}</p>
                <p><strong>Net Amount:</strong> ₦{selectedWithdrawal.netAmount.toLocaleString()}</p>
                <p><strong>Bank:</strong> {selectedWithdrawal.accountDetails.bankName}</p>
                <p><strong>Account:</strong> {selectedWithdrawal.accountDetails.accountNumber}</p>
              </div>
              
              {(actionType === 'reject') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason</label>
                  <Textarea
                    placeholder="Explain why this withdrawal is being rejected..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={
                actionType === 'approve' ? 'default' : 
                actionType === 'reject' ? 'destructive' : 
                'default'
              }
              onClick={() => selectedWithdrawal && handleWithdrawalAction(
                selectedWithdrawal.id, 
                actionType!, 
                actionNotes || undefined
              )}
            >
              {actionType === 'approve' ? 'Approve Withdrawal' : 
               actionType === 'reject' ? 'Reject Withdrawal' : 
               'Process Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
