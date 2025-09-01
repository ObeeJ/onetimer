"use client"

import { GlobalSidebar } from "@/components/ui/global-sidebar"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePathname } from "next/navigation"
import { Home, Shield, Users, FileText, CreditCard, BarChart3, AlertTriangle, Settings } from "lucide-react"

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

  if (isAuthPage) {
    return children
  }

  return (
    <RoleGuard requiredRole="super-admin" requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        <GlobalSidebar 
          role="super-admin"
          navItems={navItems}
          dashboardTitle="Super Admin Dashboard"
        />
        <main className="md:ml-64 p-6">
          {children}
        </main>
      </div>
    </RoleGuard>
  )
}