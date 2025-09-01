"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { GlobalSidebar } from "@/components/ui/global-sidebar"
import { RoleGuard } from "@/components/auth/role-guard"
import { Home, ListChecks, Wallet, Users, Settings } from "lucide-react"

const navItems = [
  { title: "Dashboard", url: "/filler", icon: Home },
  { title: "Surveys", url: "/filler/surveys", icon: ListChecks },
  { title: "Earnings", url: "/filler/earnings", icon: Wallet },
  { title: "Referrals", url: "/filler/referrals", icon: Users },
  { title: "Settings", url: "/filler/settings", icon: Settings },
]

export default function FillerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAuthFlow = pathname?.startsWith("/filler/auth") || pathname?.startsWith("/filler/onboarding")

  if (isAuthFlow) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">{children}</div>
  }

  return (
    <RoleGuard requiredRole="filler" requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        <GlobalSidebar 
          role="filler"
          navItems={navItems}
          dashboardTitle="Filler Dashboard"
        />
        <main className="md:ml-64 p-6">
          {children}
        </main>
      </div>
    </RoleGuard>
  )
}
