"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar"
import { ResponsiveNavbar } from "@/components/ui/responsive-navbar"
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
      <div className="min-h-screen bg-slate-50">
        <ResponsiveNavbar 
          role="super-admin" 
          navItems={navItems}
          user={{ name: "Super Admin", email: "superadmin@onetime.com" }}
          onSignOut={() => window.location.href = "/super-admin/auth/login"}
        />
        <div className="lg:hidden">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <SuperAdminSidebar />
              <main className="flex-1 overflow-auto">
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