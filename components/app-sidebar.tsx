"use client"

import { Home, ListChecks, Wallet, Users, LogOut, User2, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

const navItems = [
  { title: "Dashboard", url: "/filler", icon: Home },
  { title: "Surveys", url: "/filler/surveys", icon: ListChecks },
  { title: "Earnings", url: "/filler/earnings", icon: Wallet },
  { title: "Referrals", url: "/filler/referrals", icon: Users },
  { title: "Settings", url: "/filler/settings", icon: Settings },
]

export function AppSidebar() {
  const { user, isAuthenticated, isVerified, signOut, isLoading } = useAuth()
  const pathname = usePathname()

  // Show loading state during hydration
  if (isLoading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-between px-3">
          <div className="flex items-center justify-between w-full">
            <Link href="/filler" className="hover:opacity-80 transition-opacity group-data-[collapsible=icon]:hidden">
              <img src="/Logo.png" alt="OneTime Survey" className="h-10 sm:h-14 md:h-12 w-auto" />
            </Link>
            <SidebarTrigger className="rounded-xl group-data-[collapsible=icon]:mx-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 text-center text-slate-500">Loading...</div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between px-3">
        <div className="flex items-center justify-between w-full">
          <Link href="/filler" className="hover:opacity-80 transition-opacity group-data-[collapsible=icon]:hidden">
            <img src="/Logo.png" alt="OneTime Survey" className="h-10 sm:h-14 md:h-12 w-auto" />
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
                const isLocked = !isVerified && (item.title === "Earnings" || item.title === "Referrals")
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={isLocked ? "Complete verification to unlock" : item.title} disabled={isLocked}>
                      <Link 
                        href={isLocked ? "#" : item.url}
                        className={`${isActive ? "bg-filler-600 text-white font-bold rounded-lg" : "hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-all duration-200"} ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        {isLocked && <span className="ml-auto text-xs">🔒</span>}
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
        {!isAuthenticated ? (
          <div className="grid gap-2 p-2">
            <div className="grid gap-2 p-0">
              <SidebarMenuButton asChild tooltip="Sign in">
                <Link href="/filler/auth/sign-in" className="flex items-center gap-2 rounded-lg bg-filler-600 text-white hover:bg-filler-700 hover:text-white p-2 transition-all duration-200">
                  <LogOut className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Sign in</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild tooltip="Sign up">
                <Link href="/filler/auth/sign-up" className="flex items-center gap-2 rounded-lg border border-filler-600 text-filler-600 bg-transparent hover:bg-filler-600 hover:text-white p-2 transition-all duration-200">
                  <User2 className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Sign up</span>
                </Link>
              </SidebarMenuButton>
            </div>
          </div>
        ) : (
          <div
            className="mx-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-2 backdrop-blur-xl group-data-[collapsible=icon]:justify-center"
            role="group"
            aria-label="User profile"
          >
            <div className="flex size-9 items-center justify-center rounded-full border bg-white">
              <User2 className="h-4 w-4 text-slate-700" />
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <div className="truncate text-sm font-semibold">{user?.name ?? "User"}</div>
              <div className="truncate text-xs text-slate-500">{user?.email ?? ""}</div>
            </div>
            <button
              className="inline-flex size-8 items-center justify-center rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors group-data-[collapsible=icon]:hidden"
              aria-label="Sign out"
              onClick={() => {
                signOut()
                if (typeof window !== 'undefined') {
                  window.location.href = "/filler/auth/sign-in"
                }
              }}
              title="Log out"
            >
              <LogOut className="h-4 w-4 text-slate-700" />
            </button>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
// Built with shadcn/ui Sidebar primitives for responsive, collapsible navigation [^1]
