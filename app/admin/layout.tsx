"use client"


import Link from "next/link"
import { usePathname } from "next/navigation"
import { RoleGuard } from "@/components/auth/role-guard"
import { Button } from "@/components/ui/button"
import { Home, Users, ListChecks, CreditCard, BarChart3, Settings, LogOut, User2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarToggle } from "@/components/ui/sidebar-toggle"
import { useSidebarStore } from "@/lib/sidebar-store"

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
  const { isOpen: sidebarOpen } = useSidebarStore()

  if (isAuthPage) {
    return children
  }

  return (
    <RoleGuard requiredRole="admin" requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Mobile toggle button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <SidebarToggle className="bg-white shadow-lg" />
        </div>


        {/* Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 z-40 h-full bg-white/95 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-all duration-500 ease-in-out shadow-2xl",
          "lg:block",
          sidebarOpen ? "w-64" : "w-16 max-lg:hidden"
        )}>
          {/* Header */}
          <div className="h-16 border-b border-slate-200/60 flex items-center justify-center px-4 bg-gradient-to-r from-slate-50/50 to-transparent">
            {sidebarOpen ? (
              <div className="flex items-center gap-3 w-full">
                <img src="/Logo.png" alt="OneTime Survey" className="h-8 w-auto" />
                <div className="ml-auto">
                  <SidebarToggle />
                </div>
              </div>
            ) : (
              <SidebarToggle />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-300 group relative backdrop-blur-sm",
                    sidebarOpen ? "gap-3 px-3 py-3" : "justify-center p-3",
                    isActive
                      ? "bg-gradient-to-r from-[#013e5c] to-[#012f46] text-white shadow-lg scale-105"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-[#013e5c] hover:scale-105 hover:shadow-md"
                  )}
                  title={!sidebarOpen ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="truncate">{item.title}</span>
                  )}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700/50">
                      {item.title}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-2">
            {sidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <User2 className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">Admin User</p>
                    <p className="text-xs text-slate-500 truncate">admin@onetime.com</p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = "/admin/auth/login"}
                  variant="ghost"
                  className="w-full justify-start text-slate-600 hover:bg-[#013e5c]/10 hover:text-[#013e5c] px-3 py-2"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <User2 className="h-5 w-5 text-slate-600" />
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = "/admin/auth/login"}
                  variant="ghost"
                  className="w-full justify-center text-slate-600 hover:bg-[#013e5c]/10 hover:text-[#013e5c] p-2"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => useSidebarStore.getState().setOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div className={cn(
          "lg:hidden fixed left-0 top-0 z-40 h-full w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-transform duration-500 ease-in-out shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Header */}
          <div className="h-16 border-b border-slate-200/60 flex items-center justify-between px-4 bg-gradient-to-r from-slate-50/50 to-transparent">
            <img src="/Logo.png" alt="OneTime Survey" className="h-8 w-auto" />
            <SidebarToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={() => useSidebarStore.getState().setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm",
                    isActive
                      ? "bg-gradient-to-r from-[#013e5c] to-[#012f46] text-white shadow-lg scale-105"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-[#013e5c] hover:scale-105 hover:shadow-md"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <User2 className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">Admin User</p>
                  <p className="text-xs text-slate-500 truncate">admin@onetime.com</p>
                </div>
              </div>
              <Button
                onClick={() => window.location.href = "/admin/auth/login"}
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:bg-[#013e5c]/10 hover:text-[#013e5c] px-3 py-2"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className={cn(
          "p-6 transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}>
          {children}
        </main>
      </div>
    </RoleGuard>
  )
}