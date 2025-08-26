"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Building2, 
  Shield, 
  ShieldCheck,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react"

interface UserData {
  fillers: any[]
  creators: any[]
  admins: any[]
  superAdmin: any[]
}

export default function AllUsersPage() {
  const [userData, setUserData] = useState<UserData>({
    fillers: [],
    creators: [],
    admins: [],
    superAdmin: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedUserType, setSelectedUserType] = useState<string>("all")

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // This would be the actual API response
      setUserData({
        fillers: [
          {
            id: "filler-001",
            email: "john.doe@gmail.com",
            name: "John Doe",
            type: "filler",
            status: "active",
            joinDate: "2025-01-15",
            completedSurveys: 47,
            totalEarnings: 94000,
            pendingEarnings: 5000,
            kycStatus: "verified",
            location: "Lagos, Nigeria",
            demographics: { age: 28, gender: "male", occupation: "Software Developer" }
          },
          {
            id: "filler-002", 
            email: "sarah.johnson@yahoo.com",
            name: "Sarah Johnson",
            type: "filler",
            status: "active", 
            joinDate: "2025-02-03",
            completedSurveys: 32,
            totalEarnings: 64000,
            pendingEarnings: 3000,
            kycStatus: "verified",
            location: "Abuja, Nigeria",
            demographics: { age: 24, gender: "female", occupation: "Marketing Executive" }
          },
          {
            id: "filler-003",
            email: "mike.wilson@outlook.com", 
            name: "Mike Wilson",
            type: "filler",
            status: "active",
            joinDate: "2025-01-28",
            completedSurveys: 29,
            totalEarnings: 58000,
            pendingEarnings: 2000,
            kycStatus: "pending",
            location: "Port Harcourt, Nigeria",
            demographics: { age: 31, gender: "male", occupation: "Teacher" }
          }
        ],
        creators: [
          {
            id: "creator-001",
            email: "research@brandinsights.com",
            name: "Brand Insights Ltd",
            type: "creator",
            status: "active",
            joinDate: "2024-11-20",
            activeSurveys: 8,
            totalSurveys: 24,
            totalSpent: 2400000,
            responseRate: 87.5,
            kycStatus: "verified",
            companyInfo: {
              industry: "Market Research",
              size: "51-200 employees",
              location: "Lagos, Nigeria"
            }
          },
          {
            id: "creator-002", 
            email: "surveys@nigerianbank.com",
            name: "Nigerian Commercial Bank",
            type: "creator",
            status: "active",
            joinDate: "2024-12-05",
            activeSurveys: 5,
            totalSurveys: 15,
            totalSpent: 1800000,
            responseRate: 92.3,
            kycStatus: "verified",
            companyInfo: {
              industry: "Financial Services", 
              size: "1000+ employees",
              location: "Abuja, Nigeria"
            }
          }
        ],
        admins: [
          {
            id: "admin-001",
            email: "admin@onetimesurvey.com",
            name: "James Okafor",
            type: "admin",
            status: "active",
            joinDate: "2024-10-01",
            role: "Platform Administrator",
            permissions: ["user_management", "survey_approval", "payment_processing", "content_moderation", "basic_reports"],
            lastLogin: "2025-08-23T10:30:00Z",
            mfaEnabled: true,
            actionsToday: 23,
            department: "Operations"
          },
          {
            id: "admin-002",
            email: "support.admin@onetimesurvey.com", 
            name: "Fatima Abdullahi",
            type: "admin",
            status: "active",
            joinDate: "2024-11-15",
            role: "Support Administrator",
            permissions: ["user_support", "basic_reports", "content_moderation"],
            lastLogin: "2025-08-23T09:15:00Z",
            mfaEnabled: true,
            actionsToday: 15,
            department: "Customer Support"
          }
        ],
        superAdmin: [
          {
            id: "super-admin-001",
            email: "superadmin@onetimesurvey.com",
            name: "Emmanuel Obiajulu",
            type: "super_admin", 
            status: "active",
            joinDate: "2024-09-01",
            role: "Super Administrator",
            permissions: ["*"],
            lastLogin: "2025-08-23T14:45:00Z",
            mfaEnabled: true,
            securityLevel: "maximum",
            actionsToday: 8,
            department: "Executive",
            specialAccess: ["aws_console", "financial_oversight", "security_monitoring", "platform_configuration", "admin_management"]
          }
        ]
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'pending': return 'secondary'
      case 'verified': return 'default'
      default: return 'outline'
    }
  }

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'filler': return <Users className="h-5 w-5 text-blue-600" />
      case 'creator': return <Building2 className="h-5 w-5 text-green-600" />
      case 'admin': return <Shield className="h-5 w-5 text-orange-600" />
      case 'super_admin': return <ShieldCheck className="h-5 w-5 text-red-600" />
      default: return <Users className="h-5 w-5" />
    }
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'filler': return 'bg-blue-50 border-blue-200'
      case 'creator': return 'bg-green-50 border-green-200'
      case 'admin': return 'bg-orange-50 border-orange-200'
      case 'super_admin': return 'bg-red-50 border-red-200'
      default: return 'bg-slate-50 border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalUsers = userData.fillers.length + userData.creators.length + userData.admins.length + userData.superAdmin.length

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">OneTime Survey - All Users</h1>
          <p className="text-slate-600">Overview of all 4 user types: Fillers, Creators, Admin, and Super Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            Total Users: {totalUsers}
          </Badge>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* User Type Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Fillers (Survey Takers)</p>
                <p className="text-2xl font-bold text-blue-900">{userData.fillers.length}</p>
                <p className="text-xs text-blue-600">Active users earning rewards</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Creators (Survey Creators)</p>
                <p className="text-2xl font-bold text-green-900">{userData.creators.length}</p>
                <p className="text-xs text-green-600">Companies creating surveys</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Admins</p>
                <p className="text-2xl font-bold text-orange-900">{userData.admins.length}</p>
                <p className="text-xs text-orange-600">Platform administrators</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Super Admin</p>
                <p className="text-2xl font-bold text-red-900">{userData.superAdmin.length}</p>
                <p className="text-xs text-red-600">Maximum security access</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={selectedUserType === "all" ? "default" : "outline"}
          onClick={() => setSelectedUserType("all")}
          size="sm"
        >
          All Users ({totalUsers})
        </Button>
        <Button 
          variant={selectedUserType === "fillers" ? "default" : "outline"}
          onClick={() => setSelectedUserType("fillers")}
          size="sm"
        >
          Fillers ({userData.fillers.length})
        </Button>
        <Button 
          variant={selectedUserType === "creators" ? "default" : "outline"}
          onClick={() => setSelectedUserType("creators")}
          size="sm"
        >
          Creators ({userData.creators.length})
        </Button>
        <Button 
          variant={selectedUserType === "admins" ? "default" : "outline"}
          onClick={() => setSelectedUserType("admins")}
          size="sm"
        >
          Admins ({userData.admins.length})
        </Button>
        <Button 
          variant={selectedUserType === "superAdmin" ? "default" : "outline"}
          onClick={() => setSelectedUserType("superAdmin")}
          size="sm"
        >
          Super Admin ({userData.superAdmin.length})
        </Button>
      </div>

      {/* User Lists */}
      <div className="space-y-6">
        {/* Fillers */}
        {(selectedUserType === "all" || selectedUserType === "fillers") && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Fillers (Survey Takers)
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {userData.fillers.map((user) => (
                <Card key={user.id} className={getUserTypeColor(user.type)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getUserTypeIcon(user.type)}
                        <Badge variant={getStatusColor(user.status) as any}>{user.status}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Surveys Completed:</span>
                        <span className="font-medium">{user.completedSurveys}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Earnings:</span>
                        <span className="font-medium text-green-600">₦{(user.totalEarnings / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">KYC Status:</span>
                        <Badge variant={user.kycStatus === 'verified' ? 'default' : 'secondary'} className="text-xs">
                          {user.kycStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{user.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Creators */}
        {(selectedUserType === "all" || selectedUserType === "creators") && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Creators (Survey Creators)
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {userData.creators.map((user) => (
                <Card key={user.id} className={getUserTypeColor(user.type)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getUserTypeIcon(user.type)}
                        <Badge variant={getStatusColor(user.status) as any}>{user.status}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Active Surveys:</span>
                        <span className="font-medium">{user.activeSurveys}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Spent:</span>
                        <span className="font-medium text-blue-600">₦{(user.totalSpent / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Response Rate:</span>
                        <span className="font-medium">{user.responseRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Industry:</span>
                        <span className="font-medium">{user.companyInfo.industry}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Admins */}
        {(selectedUserType === "all" || selectedUserType === "admins") && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Platform Administrators
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {userData.admins.map((user) => (
                <Card key={user.id} className={getUserTypeColor(user.type)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-sm font-medium text-orange-600">{user.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getUserTypeIcon(user.type)}
                        <Badge variant={getStatusColor(user.status) as any}>{user.status}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Department:</span>
                        <span className="font-medium">{user.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Permissions:</span>
                        <span className="font-medium">{user.permissions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Actions Today:</span>
                        <span className="font-medium">{user.actionsToday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">MFA Enabled:</span>
                        <Badge variant={user.mfaEnabled ? 'default' : 'destructive'} className="text-xs">
                          {user.mfaEnabled ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Super Admin */}
        {(selectedUserType === "all" || selectedUserType === "superAdmin") && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-600" />
              Super Administrator (Maximum Security)
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {userData.superAdmin.map((user) => (
                <Card key={user.id} className={getUserTypeColor(user.type)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-sm font-medium text-red-600">{user.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getUserTypeIcon(user.type)}
                        <Badge variant="destructive">MAXIMUM SECURITY</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Department:</span>
                          <span className="font-medium">{user.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Security Level:</span>
                          <Badge variant="destructive" className="text-xs">{user.securityLevel}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Actions Today:</span>
                          <span className="font-medium">{user.actionsToday}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">MFA Enabled:</span>
                          <Badge variant="default" className="text-xs">Enhanced</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Special Access:</span>
                          <span className="font-medium">{user.specialAccess.length} areas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Permissions:</span>
                          <Badge variant="destructive" className="text-xs">ALL</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
