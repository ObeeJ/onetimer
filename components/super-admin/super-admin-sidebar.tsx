"use client"

import { Home, Users, Shield, Settings, BarChart3, FileText, AlertTriangle, CreditCard, LogOut, Crown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useSuperAdminAuth } from "@/hooks/use-super-admin-auth"

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

export function SuperAdminSidebar() {
  const { user, signOut } = useSuperAdminAuth()
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between px-3">
        <div className="flex items-center justify-between w-full">
          <Link href="/super-admin" className="hover:opacity-80 transition-opacity group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <Crown className="h-8 w-8 text-purple-600" />
              <span className="font-bold text-lg">Super Admin</span>
            </div>
          </Link>
          <SidebarTrigger className="rounded-xl group-data-[collapsible=icon]:mx-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link 
                        href={item.url}
                        className={`${isActive ? "bg-purple-600 text-white font-bold rounded-lg" : "hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-all duration-200"}`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div
          className="mx-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-2 backdrop-blur-xl group-data-[collapsible=icon]:justify-center"
          role="group"
          aria-label="Super Admin profile"
        >
          <div className="flex size-9 items-center justify-center rounded-full border bg-purple-100">
            <Crown className="h-4 w-4 text-purple-600" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold">{user?.name ?? "Super Admin"}</div>
            <div className="truncate text-xs text-slate-500">{user?.email ?? ""}</div>
          </div>
          <button
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors group-data-[collapsible=icon]:hidden"
            aria-label="Sign out"
            onClick={() => {
              signOut()
              window.location.href = "/super-admin/auth/login"
            }}
            title="Log out"
          >
            <LogOut className="h-4 w-4 text-slate-700" />
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}