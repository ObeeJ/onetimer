"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ResponsiveNavbar } from "@/components/ui/responsive-navbar"
import { useAuth } from "@/hooks/use-auth"
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
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  const isAuthFlow = pathname?.startsWith("/filler/auth") || pathname?.startsWith("/filler/onboarding")

  if (isAuthFlow) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">{children}</div>
  }

  return (
    <RoleGuard requiredRole="filler" requireAuth={false}>
      <div className="min-h-screen bg-slate-50">
        <ResponsiveNavbar 
          role="filler" 
          navItems={navItems}
          user={{ name: user?.name || "Filler User", email: user?.email || "filler@onetime.com" }}
          onSignOut={() => {
            signOut()
            window.location.href = "/filler/auth/sign-in"
          }}
        />
        <div className="lg:hidden">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/30 via-white to-slate-100/30">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </div>
        <div className="hidden lg:block">
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}
