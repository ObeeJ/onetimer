"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ResponsiveNavbar } from "@/components/ui/responsive-navbar"
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
      <div className="min-h-screen bg-slate-50">
        <ResponsiveNavbar 
          role="admin" 
          navItems={navItems}
          user={{ name: "Admin User", email: "admin@onetime.com" }}
          onSignOut={() => window.location.href = "/admin/auth/login"}
        />
        <div className="lg:hidden">
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AdminSidebar />
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