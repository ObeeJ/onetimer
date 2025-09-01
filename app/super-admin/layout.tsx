"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RoleGuard } from "@/components/auth/role-guard"
import { Button } from "@/components/ui/button"
import { Home, Shield, Users, FileText, CreditCard, BarChart3, AlertTriangle, Settings, LogOut, User2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarToggle } from "@/components/ui/sidebar-toggle"
import { useSidebarStore } from "@/lib/sidebar-store"

const navItems = [
  { title: "Dashboard", url: "/super-admin", icon: Home },
  { title: "Admins", url: "/super-admin/admins", icon: Shield },
  { title: "Users", url: "/super-admin/users", icon: Users },
  { title: "Surveys", url: "/super-admin/surveys", icon: FileText },
  { title: "Finance", url: "/super-admin/finance", icon: CreditCard },
  { title: "Reports", url: "/super-admin/reports", icon: BarChart3 },
  { title: "Audit Logs", url: "/super-admin/audit", icon: AlertTriangle },
  { title: "Settings", url: "/super-admin/settings", icon: Settings },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname?.includes("/auth/")
  const { isOpen: sidebarOpen } = useSidebarStore()

  if (isAuthPage) {
    return children
  }

  return (
    <RoleGuard requiredRole="super-admin" requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar for super admin */}
        <div className="lg:ml-64 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarToggle className="lg:hidden" />
            <img src="/Logo.png" alt="OneTime Survey" className="h-8 w-auto lg:hidden" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
              <User2 className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Super Admin</p>
              <p className="text-xs text-slate-500">superadmin@onetime.com</p>
            </div>
            <Button
              onClick={() => window.location.href = "/super-admin/auth/login"}
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:bg-[#013e5c]/10 hover:text-[#013e5c]"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-center gap-3">
            <img src="/Logo.png" alt="OneTime Survey" className="h-8 w-auto" />
            <SidebarToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={() => useSidebarStore.getState().setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#013e5c] text-white"
                      : "text-slate-600 hover:bg-[#0b577a]/10 hover:text-[#0b577a]"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                <User2 className="h-4 w-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Super Admin</p>
                <p className="text-xs text-slate-500">superadmin@onetime.com</p>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = "/super-admin/auth/login"}
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:bg-[#013e5c]/10 hover:text-[#013e5c]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => useSidebarStore.getState().setOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="lg:ml-64 p-6">
          {children}
        </main>
      </div>
    </RoleGuard>
  )
}