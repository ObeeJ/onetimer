"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Eye,
  Ban,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Shield
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  userType: 'filler' | 'creator'
  status: 'active' | 'suspended' | 'banned' | 'pending'
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  joinDate: string
  lastActivity: string
  totalEarnings?: number
  totalSpent?: number
  documentsSubmitted?: string[]
}

interface KycApplication {
  id: string
  userId: string
  userName: string
  submittedAt: string
  documents: {
    nin?: string
    bvn?: string
    profilePhoto?: string
    idDocument?: string
  }
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
  priority: 'high' | 'medium' | 'low'
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [kycApplications, setKycApplications] = useState<KycApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")

  useEffect(() => {
    // Simulate API call to load users and KYC applications
    const timer = setTimeout(() => {
      setUsers([
        {
          id: 'user-001',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+234 801 234 5678',
          userType: 'filler',
          status: 'active',
          kycStatus: 'pending',
          joinDate: '2025-01-15',
          lastActivity: '2 hours ago',
          totalEarnings: 45000,
          documentsSubmitted: ['NIN', 'BVN', 'Photo']
        },
        {
          id: 'user-002',
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+234 802 345 6789',
          userType: 'creator',
          status: 'active',
          kycStatus: 'approved',
          joinDate: '2025-01-10',
          lastActivity: '1 day ago',
          totalSpent: 125000
        },
        {
          id: 'user-003',
          name: 'Michael Johnson',
          email: 'michael.j@email.com',
          phone: '+234 803 456 7890',
          userType: 'filler',
          status: 'pending',
          kycStatus: 'under_review',
          joinDate: '2025-01-20',
          lastActivity: '5 hours ago',
          totalEarnings: 12000,
          documentsSubmitted: ['NIN', 'Photo']
        },
        {
          id: 'user-004',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@email.com',
          phone: '+234 804 567 8901',
          userType: 'creator',
          status: 'suspended',
          kycStatus: 'rejected',
          joinDate: '2025-01-08',
          lastActivity: '1 week ago',
          totalSpent: 85000
        }
      ])

      setKycApplications([
        {
          id: 'kyc-001',
          userId: 'user-001',
          userName: 'John Doe',
          submittedAt: '2025-01-22 14:30',
          documents: {
            nin: 'nin_12345678901.pdf',
            bvn: 'bvn_12345678901.pdf',
            profilePhoto: 'photo_john_doe.jpg',
            idDocument: 'drivers_license.pdf'
          },
          status: 'pending',
          priority: 'high'
        },
        {
          id: 'kyc-002',
          userId: 'user-003',
          userName: 'Michael Johnson',
          submittedAt: '2025-01-21 16:45',
          documents: {
            nin: 'nin_98765432109.pdf',
            profilePhoto: 'photo_michael.jpg'
          },
          status: 'under_review',
          priority: 'medium'
        },
        {
          id: 'kyc-003',
          userId: 'user-005',
          userName: 'David Brown',
          submittedAt: '2025-01-20 09:15',
          documents: {
            nin: 'nin_55667788990.pdf',
            bvn: 'bvn_55667788990.pdf',
            profilePhoto: 'photo_david.jpg'
          },
          status: 'pending',
          priority: 'low'
        }
      ])

      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'default'
      case 'pending':
      case 'under_review':
        return 'secondary'
      case 'suspended':
      case 'rejected':
        return 'destructive'
      case 'banned':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'pending':
      case 'under_review':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      case 'not_submitted':
        return 'outline'
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

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'ban') => {
    // Simulate user action
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: action === 'activate' ? 'active' : action as any }
        : user
    ))
  }

  const handleKycAction = (kycId: string, action: 'approve' | 'reject', reason?: string) => {
    // Simulate KYC action
    setKycApplications(prev => prev.map(kyc => 
      kyc.id === kycId 
        ? { 
            ...kyc, 
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'admin@onetimesurvey.com',
            rejectionReason: reason
          }
        : kyc
    ))

    // Update user KYC status
    const application = kycApplications.find(kyc => kyc.id === kycId)
    if (application) {
      setUsers(prev => prev.map(user => 
        user.id === application.userId 
          ? { ...user, kycStatus: action === 'approve' ? 'approved' : 'rejected' }
          : user
      ))
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedTab === 'all') return matchesSearch
    if (selectedTab === 'fillers') return matchesSearch && user.userType === 'filler'
    if (selectedTab === 'creators') return matchesSearch && user.userType === 'creator'
    if (selectedTab === 'pending') return matchesSearch && user.status === 'pending'
    
    return matchesSearch
  })

  const filteredKycApplications = kycApplications.filter(kyc => 
    kyc.userName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-64"></div>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse"></div>
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
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600">Manage users, review KYC applications, and monitor account activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="fillers">Fillers ({users.filter(u => u.userType === 'filler').length})</TabsTrigger>
          <TabsTrigger value="creators">Creators ({users.filter(u => u.userType === 'creator').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({users.filter(u => u.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="kyc">KYC Review ({kycApplications.filter(k => k.status === 'pending').length})</TabsTrigger>
        </TabsList>

        {/* All Users Tab */}
        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-slate-500">
                            <Phone className="h-3 w-3 inline mr-1" />
                            {user.phone}
                          </span>
                          <span className="text-xs text-slate-500">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Joined {user.joinDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getStatusColor(user.status) as any}>
                            {user.status}
                          </Badge>
                          <Badge variant={getKycStatusColor(user.kycStatus) as any}>
                            KYC: {user.kycStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 capitalize">
                          {user.userType} • Last active: {user.lastActivity}
                        </p>
                        {user.totalEarnings && (
                          <p className="text-xs text-green-600">Earned: ₦{user.totalEarnings.toLocaleString()}</p>
                        )}
                        {user.totalSpent && (
                          <p className="text-xs text-blue-600">Spent: ₦{user.totalSpent.toLocaleString()}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        {user.status === 'active' ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'activate')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Fillers Tab */}
        <TabsContent value="fillers" className="space-y-4">
          <div className="space-y-4">
            {filteredUsers.filter(u => u.userType === 'filler').map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-sm text-green-600">
                          Total Earnings: ₦{user.totalEarnings?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={getStatusColor(user.status) as any}>
                          {user.status}
                        </Badge>
                        <Badge variant={getKycStatusColor(user.kycStatus) as any} className="ml-2">
                          KYC: {user.kycStatus}
                        </Badge>
                      </div>
                      
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/users/${user.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Creators Tab */}
        <TabsContent value="creators" className="space-y-4">
          <div className="space-y-4">
            {filteredUsers.filter(u => u.userType === 'creator').map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-sm text-blue-600">
                          Total Spent: ₦{user.totalSpent?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={getStatusColor(user.status) as any}>
                          {user.status}
                        </Badge>
                        <Badge variant={getKycStatusColor(user.kycStatus) as any} className="ml-2">
                          KYC: {user.kycStatus}
                        </Badge>
                      </div>
                      
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/users/${user.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            {filteredUsers.filter(u => u.status === 'pending').map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-sm text-yellow-600">Awaiting verification</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleUserAction(user.id, 'activate')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleUserAction(user.id, 'ban')}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* KYC Review Tab */}
        <TabsContent value="kyc" className="space-y-4">
          <div className="space-y-4">
            {filteredKycApplications.map((kyc) => (
              <Card key={kyc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{kyc.userName}</h3>
                        <p className="text-sm text-slate-600">Submitted: {kyc.submittedAt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {Object.entries(kyc.documents).map(([type, filename]) => (
                            filename && (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type.toUpperCase()}
                              </Badge>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={getKycStatusColor(kyc.status) as any}>
                          {kyc.status}
                        </Badge>
                        <Badge variant={getPriorityColor(kyc.priority) as any} className="ml-2">
                          {kyc.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/users/kyc/${kyc.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        {kyc.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleKycAction(kyc.id, 'approve')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleKycAction(kyc.id, 'reject', 'Invalid documents')}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
