"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RoleGuard } from "@/components/auth/role-guard"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, ListChecks, Wallet, Users, Settings, LogOut, User2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

const navItems = [
  { title: "Dashboard", url: "/filler", icon: Home },
  { title: "Surveys", url: "/filler/surveys", icon: ListChecks },
  { title: "Earnings", url: "/filler/earnings", icon: Wallet },
  { title: "Referrals", url: "/filler/referrals", icon: Users },
  { title: "Settings", url: "/filler/settings", icon: Settings },
]

export default function FillerLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAuthFlow = pathname?.startsWith("/filler/auth") || pathname?.startsWith("/filler/onboarding")

  if (isAuthFlow) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">{children}</div>
  }

  return (
    <RoleGuard requiredRole="filler" requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white shadow-md hover:bg-gray-50"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Header */}
          <div className="p-2 border-b border-slate-200">
            <img src="/Logo.png" alt="OneTime Survey" className="h-8 w-auto" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={() => setSidebarOpen(false)}
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
                <p className="text-sm font-medium text-slate-900">{user?.name || "Filler User"}</p>
                <p className="text-xs text-slate-500">{user?.email || "filler@onetime.com"}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                signOut()
                window.location.href = "/filler/auth/sign-in"
              }}
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
            onClick={() => setSidebarOpen(false)}
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
