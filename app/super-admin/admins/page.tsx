"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users,
  Plus,
  Search,
  Shield,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Mail,
  Phone,
  Globe
} from "lucide-react"

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SENIOR_ADMIN' | 'SUPER_ADMIN'
  status: 'active' | 'inactive' | 'suspended'
  permissions: string[]
  createdAt: string
  lastLogin?: string
  lastActivity?: string
  loginAttempts: number
  mfaEnabled: boolean
  department: string
  phone?: string
  location?: string
  sessionCount: number
  totalActions: number
}

interface AdminRole {
  id: string
  name: string
  description: string
  permissions: string[]
  level: number
}

interface AdminActivity {
  id: string
  adminId: string
  adminName: string
  action: string
  resource: string
  timestamp: string
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed' | 'blocked'
  details?: string
}

const AVAILABLE_PERMISSIONS = [
  { id: 'users.read', name: 'View Users', category: 'User Management' },
  { id: 'users.write', name: 'Manage Users', category: 'User Management' },
  { id: 'users.delete', name: 'Delete Users', category: 'User Management' },
  { id: 'surveys.read', name: 'View Surveys', category: 'Survey Management' },
  { id: 'surveys.write', name: 'Manage Surveys', category: 'Survey Management' },
  { id: 'surveys.approve', name: 'Approve Surveys', category: 'Survey Management' },
  { id: 'payments.read', name: 'View Payments', category: 'Payment Management' },
  { id: 'payments.process', name: 'Process Payments', category: 'Payment Management' },
  { id: 'payments.refund', name: 'Issue Refunds', category: 'Payment Management' },
  { id: 'reports.read', name: 'View Reports', category: 'Reporting' },
  { id: 'reports.export', name: 'Export Reports', category: 'Reporting' },
  { id: 'settings.read', name: 'View Settings', category: 'System Settings' },
  { id: 'settings.write', name: 'Modify Settings', category: 'System Settings' },
  { id: 'security.read', name: 'View Security Logs', category: 'Security' },
  { id: 'security.write', name: 'Manage Security', category: 'Security' }
]

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("admins")
  const [searchTerm, setSearchTerm] = useState("")
  const [createAdminDialog, setCreateAdminDialog] = useState(false)
  const [editAdminDialog, setEditAdminDialog] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'ADMIN' as const,
    department: '',
    phone: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    // Simulate loading admin data
    const timer = setTimeout(() => {
      setAdmins([
        {
          id: 'admin-001',
          name: 'John Smith',
          email: 'john.smith@onetimesurvey.com',
          role: 'SENIOR_ADMIN',
          status: 'active',
          permissions: ['users.read', 'users.write', 'surveys.read', 'surveys.write', 'surveys.approve', 'payments.read', 'reports.read'],
          createdAt: '2025-01-15',
          lastLogin: '2025-08-23 14:30:00',
          lastActivity: '2025-08-23 15:45:00',
          loginAttempts: 0,
          mfaEnabled: true,
          department: 'Operations',
          phone: '+234-80-1234-5678',
          location: 'Lagos, Nigeria',
          sessionCount: 245,
          totalActions: 1847
        },
        {
          id: 'admin-002',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@onetimesurvey.com',
          role: 'ADMIN',
          status: 'active',
          permissions: ['users.read', 'surveys.read', 'surveys.write', 'payments.read', 'reports.read'],
          createdAt: '2025-02-20',
          lastLogin: '2025-08-23 12:15:00',
          lastActivity: '2025-08-23 13:20:00',
          loginAttempts: 0,
          mfaEnabled: true,
          department: 'Customer Support',
          phone: '+234-70-9876-5432',
          location: 'Abuja, Nigeria',
          sessionCount: 156,
          totalActions: 892
        },
        {
          id: 'admin-003',
          name: 'Michael Brown',
          email: 'michael.brown@onetimesurvey.com',
          role: 'ADMIN',
          status: 'inactive',
          permissions: ['users.read', 'surveys.read', 'reports.read'],
          createdAt: '2025-03-10',
          lastLogin: '2025-08-20 09:30:00',
          lastActivity: '2025-08-20 11:45:00',
          loginAttempts: 2,
          mfaEnabled: false,
          department: 'Analytics',
          phone: '+234-90-5555-1234',
          location: 'Port Harcourt, Nigeria',
          sessionCount: 78,
          totalActions: 234
        },
        {
          id: 'admin-004',
          name: 'Emily Davis',
          email: 'emily.davis@onetimesurvey.com',
          role: 'SENIOR_ADMIN',
          status: 'suspended',
          permissions: ['users.read', 'users.write', 'surveys.read', 'surveys.write', 'payments.read', 'payments.process'],
          createdAt: '2025-01-25',
          lastLogin: '2025-08-18 16:20:00',
          lastActivity: '2025-08-18 17:30:00',
          loginAttempts: 5,
          mfaEnabled: true,
          department: 'Finance',
          phone: '+234-81-7777-8888',
          location: 'Kano, Nigeria',
          sessionCount: 189,
          totalActions: 1203
        }
      ])

      setActivities([
        {
          id: 'activity-001',
          adminId: 'admin-001',
          adminName: 'John Smith',
          action: 'Approved Survey',
          resource: 'Survey ID: SUR-456',
          timestamp: '2025-08-23 15:45:00',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 120.0',
          status: 'success',
          details: 'Market research survey approved for publication'
        },
        {
          id: 'activity-002',
          adminId: 'admin-002',
          adminName: 'Sarah Johnson',
          action: 'User Status Change',
          resource: 'User ID: USR-789',
          timestamp: '2025-08-23 13:20:00',
          ipAddress: '192.168.1.101',
          userAgent: 'Firefox 119.0',
          status: 'success',
          details: 'User account suspended due to policy violation'
        },
        {
          id: 'activity-003',
          adminId: 'admin-004',
          adminName: 'Emily Davis',
          action: 'Failed Login Attempt',
          resource: 'Admin Panel',
          timestamp: '2025-08-18 16:25:00',
          ipAddress: '192.168.1.150',
          userAgent: 'Chrome 120.0',
          status: 'failed',
          details: 'Multiple failed login attempts - account locked'
        },
        {
          id: 'activity-004',
          adminId: 'admin-001',
          adminName: 'John Smith',
          action: 'Payment Processed',
          resource: 'Withdrawal ID: WD-123',
          timestamp: '2025-08-23 14:30:00',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 120.0',
          status: 'success',
          details: 'Withdrawal of ₦25,000 processed successfully'
        }
      ])

      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'suspended':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive'
      case 'SENIOR_ADMIN':
        return 'default'
      case 'ADMIN':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleCreateAdmin = () => {
    const admin: AdminUser = {
      id: `admin-${Date.now()}`,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      status: 'active',
      permissions: newAdmin.permissions,
      createdAt: new Date().toISOString().split('T')[0],
      loginAttempts: 0,
      mfaEnabled: false,
      department: newAdmin.department,
      phone: newAdmin.phone,
      sessionCount: 0,
      totalActions: 0
    }

    setAdmins(prev => [...prev, admin])
    setCreateAdminDialog(false)
    setNewAdmin({
      name: '',
      email: '',
      role: 'ADMIN',
      department: '',
      phone: '',
      permissions: []
    })
  }

  const handleUpdateAdminStatus = (adminId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setAdmins(prev => prev.map(admin => 
      admin.id === adminId ? { ...admin, status: newStatus } : admin
    ))
  }

  const handleToggleMFA = (adminId: string) => {
    setAdmins(prev => prev.map(admin => 
      admin.id === adminId ? { ...admin, mfaEnabled: !admin.mfaEnabled } : admin
    ))
  }

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-3xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-600">Create and manage admin accounts with role-based permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setCreateAdminDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Admin
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Admins</p>
                <p className="text-2xl font-bold text-blue-900">{admins.length}</p>
                <p className="text-xs text-blue-600">{admins.filter(a => a.status === 'active').length} active</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Sessions</p>
                <p className="text-2xl font-bold text-green-900">{admins.reduce((sum, a) => sum + a.sessionCount, 0)}</p>
                <p className="text-xs text-green-600">Across all admins</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Actions</p>
                <p className="text-2xl font-bold text-purple-900">{admins.reduce((sum, a) => sum + a.totalActions, 0)}</p>
                <p className="text-xs text-purple-600">This month</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">MFA Enabled</p>
                <p className="text-2xl font-bold text-orange-900">{admins.filter(a => a.mfaEnabled).length}</p>
                <p className="text-xs text-orange-600">Out of {admins.length} admins</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search admins by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admins">Admin Accounts ({filteredAdmins.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-4">
          <div className="space-y-4">
            {filteredAdmins.map((admin) => (
              <Card key={admin.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-slate-900">{admin.name}</h3>
                        <Badge variant={getStatusColor(admin.status) as any}>
                          {admin.status}
                        </Badge>
                        <Badge variant={getRoleColor(admin.role) as any}>
                          {admin.role.replace('_', ' ')}
                        </Badge>
                        {admin.mfaEnabled && (
                          <Badge variant="outline" className="border-green-500 text-green-700">
                            MFA
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-500">Contact Information</p>
                          <p className="font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {admin.email}
                          </p>
                          {admin.phone && (
                            <p className="text-sm flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {admin.phone}
                            </p>
                          )}
                          {admin.location && (
                            <p className="text-sm flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              {admin.location}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-500">Department & Activity</p>
                          <p className="font-medium">{admin.department}</p>
                          <p className="text-sm">Sessions: {admin.sessionCount}</p>
                          <p className="text-sm">Actions: {admin.totalActions}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-500">Access Information</p>
                          <p className="text-sm">Created: {admin.createdAt}</p>
                          {admin.lastLogin && (
                            <p className="text-sm">Last Login: {admin.lastLogin}</p>
                          )}
                          <p className="text-sm">Login Attempts: {admin.loginAttempts}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-slate-500">Permissions:</span>
                        {admin.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {admin.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{admin.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedAdmin(admin)
                          setEditAdminDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {admin.status === 'active' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateAdminStatus(admin.id, 'suspended')}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Suspend
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateAdminStatus(admin.id, 'active')}
                        >
                          <Unlock className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                      
                      <Button 
                        variant={admin.mfaEnabled ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleToggleMFA(admin.id)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {admin.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{activity.adminName}</span>
                        <Badge variant={activity.status === 'success' ? 'default' : 'destructive'}>
                          {activity.status}
                        </Badge>
                        <span className="text-sm text-slate-500">{activity.timestamp}</span>
                      </div>
                      <p className="text-slate-700 mb-2">
                        <strong>{activity.action}</strong> - {activity.resource}
                      </p>
                      {activity.details && (
                        <p className="text-sm text-slate-600 mb-2">{activity.details}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>IP: {activity.ipAddress}</span>
                        <span>Agent: {activity.userAgent}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Admin Dialog */}
      <Dialog open={createAdminDialog} onOpenChange={setCreateAdminDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Admin Account</DialogTitle>
            <DialogDescription>
              Create a new admin account with specific roles and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  placeholder="john.doe@onetimesurvey.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role</label>
                <select 
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SENIOR_ADMIN">Senior Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={newAdmin.department}
                  onChange={(e) => setNewAdmin({...newAdmin, department: e.target.value})}
                  placeholder="Operations"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Phone (Optional)</label>
              <Input
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({...newAdmin, phone: e.target.value})}
                placeholder="+234-80-1234-5678"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Permissions</label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={newAdmin.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewAdmin({
                            ...newAdmin,
                            permissions: [...newAdmin.permissions, permission.id]
                          })
                        } else {
                          setNewAdmin({
                            ...newAdmin,
                            permissions: newAdmin.permissions.filter(p => p !== permission.id)
                          })
                        }
                      }}
                    />
                    <label htmlFor={permission.id} className="text-sm">
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAdminDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAdmin}
              disabled={!newAdmin.name || !newAdmin.email || !newAdmin.department}
            >
              Create Admin Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
