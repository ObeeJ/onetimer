"use client"

import { GlobalSidebar } from "@/components/ui/global-sidebar"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePathname } from "next/navigation"
import { Home, Users, ListChecks, CreditCard, BarChart3, Settings } from "lucide-react"

const navItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Surveys", url: "/admin/surveys", icon: ListChecks },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]

export default function AdminLayout({
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
    <RoleGuard requiredRole="admin" requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        <GlobalSidebar 
          role="admin"
          navItems={navItems}
          dashboardTitle="Admin Dashboard"
        />
        <main className="md:ml-64 p-6">
          {children}
        </main>
      </div>
    </RoleGuard>
  )
}