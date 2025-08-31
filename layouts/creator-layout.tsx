"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { CreatorSidebar } from "@/components/creator/creator-sidebar"
import { ResponsiveNavbar } from "@/components/ui/responsive-navbar"
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
        <div className="min-h-screen bg-slate-50">
          <ResponsiveNavbar 
            role="creator" 
            navItems={navItems}
            user={{ name: "Creator User", email: "creator@onetime.com" }}
            onSignOut={() => window.location.href = "/creator/auth/sign-in"}
          />
          <div className="lg:hidden">
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <CreatorSidebar />
                <main className="flex-1 overflow-auto">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>
              </div>
            </SidebarProvider>
          </div>
          <div className="hidden lg:block">
            <main className="container mx-auto px-4 py-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </RoleGuard>
    </ErrorBoundary>
  )
}