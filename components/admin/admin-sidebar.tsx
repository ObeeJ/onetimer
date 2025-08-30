"use client"

import { Home, Users, ListChecks, CreditCard, BarChart3, Settings, LogOut, Shield } from "lucide-react"
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
import { useAdminAuth } from "@/hooks/use-admin-auth"

const navItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Surveys", url: "/admin/surveys", icon: ListChecks },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const { user, signOut } = useAdminAuth()
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between px-3">
        <div className="flex items-center justify-between w-full">
          <Link href="/admin" className="hover:opacity-80 transition-opacity group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="font-bold text-lg">Admin Panel</span>
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
                        className={`${isActive ? "bg-red-600 text-white font-bold rounded-lg" : "hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-all duration-200"}`}
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
          aria-label="Admin profile"
        >
          <div className="flex size-9 items-center justify-center rounded-full border bg-red-100">
            <Shield className="h-4 w-4 text-red-600" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold">{user?.name ?? "Admin"}</div>
            <div className="truncate text-xs text-slate-500">{user?.email ?? ""}</div>
          </div>
          <button
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors group-data-[collapsible=icon]:hidden"
            aria-label="Sign out"
            onClick={() => {
              signOut()
              window.location.href = "/admin/auth/login"
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