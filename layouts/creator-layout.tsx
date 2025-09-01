"use client"

import { GlobalSidebar } from "@/components/ui/global-sidebar"
import { RoleGuard } from "@/components/auth/role-guard"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { usePathname } from "next/navigation"
import { Home, Plus, FileText, BarChart3, CreditCard, Settings } from "lucide-react"

const navItems = [
  { title: "Dashboard", url: "/creator/dashboard", icon: Home },
  { title: "Create Survey", url: "/creator/surveys/create", icon: Plus },
  { title: "My Surveys", url: "/creator/surveys", icon: FileText },
  { title: "Analytics", url: "/creator/analytics", icon: BarChart3 },
  { title: "Credits", url: "/creator/credits", icon: CreditCard },
  { title: "Settings", url: "/creator/settings", icon: Settings },
]

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname?.includes("/auth/")

  if (isAuthPage) {
    return children
  }
  
  return (
    <ErrorBoundary>
      <RoleGuard requiredRole="creator" requireAuth={false}>
        <div className="min-h-screen bg-gray-50">
          <GlobalSidebar 
            role="creator"
            navItems={navItems}
            dashboardTitle="Creator Dashboard"
          />
          <main className="md:ml-64 p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </RoleGuard>
    </ErrorBoundary>
  )
}