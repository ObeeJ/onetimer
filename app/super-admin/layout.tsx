"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield,
  LayoutDashboard,
  Users,
  Settings,
  DollarSign,
  Lock,
  LogOut,
  Bell,
  Search,
  User,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

interface SuperAdminLayoutProps {
  children: React.ReactNode
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const pathname = usePathname()

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/super-admin/dashboard",
      icon: LayoutDashboard,
      description: "Platform overview",
      alerts: 0
    },
    {
      name: "Admin Management",
      href: "/super-admin/admins",
      icon: Users,
      description: "Manage admin accounts",
      alerts: 2
    },
    {
      name: "Platform Settings",
      href: "/super-admin/settings",
      icon: Settings,
      description: "Global configuration",
      alerts: 0
    },
    {
      name: "Security Oversight",
      href: "/super-admin/security",
      icon: Lock,
      description: "Security monitoring",
      alerts: 4
    },
    {
      name: "Financial Overview",
      href: "/super-admin/financial",
      icon: DollarSign,
      description: "Revenue & costs",
      alerts: 1
    }
  ]

  const isActive = (href: string) => pathname === href

  const handleLogout = () => {
    // Simulate super admin logout with enhanced security
    if (confirm("Are you sure you want to logout? This will end your secure super admin session.")) {
      alert("Logging out securely...")
      // In real implementation, clear secure tokens and redirect
      window.location.href = "/super-admin/auth/login"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Security Header */}
      <div className="bg-slate-950 border-b border-slate-700 shadow-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Super Admin Console</h1>
                  <p className="text-xs text-slate-400">Maximum Security Access</p>
                </div>
              </div>
              <Badge variant="destructive" className="bg-red-600 text-white font-medium">
                RESTRICTED ACCESS
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* Security Status */}
              <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">Secure Session</span>
              </div>

              {/* Alerts */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-600 text-white border-0">
                    7
                  </Badge>
                </Button>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-white font-medium">Super Admin</span>
              </div>

              {/* Logout */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Secure Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-slate-900 border-r border-slate-700 shadow-2xl">
          <div className="p-6 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search super admin functions..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Navigation Items */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`
                      group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
                      ${active 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }
                    `}>
                      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                      <div className="flex-1">
                        <p className={`font-medium ${active ? 'text-white' : 'text-slate-200'}`}>
                          {item.name}
                        </p>
                        <p className={`text-xs ${active ? 'text-red-100' : 'text-slate-400'}`}>
                          {item.description}
                        </p>
                      </div>
                      {item.alerts > 0 && (
                        <Badge className="bg-orange-600 text-white text-xs">
                          {item.alerts}
                        </Badge>
                      )}
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-slate-800 border border-slate-600 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-500">Security Notice</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    You are in the highest security access level. All actions are monitored and logged.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Health Status */}
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Platform Health</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Overall Status</span>
                  <span className="text-green-400 font-medium">98.5%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Active Users</span>
                  <span className="text-white font-medium">2,847</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">System Load</span>
                  <span className="text-blue-400 font-medium">Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white overflow-auto">
          <div className="min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
