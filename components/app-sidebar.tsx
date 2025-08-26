"use client"

import { Home, ListChecks, Wallet, Users, LogOut, User2 } from "lucide-react"
import Link from "next/link"
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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { LogoCompact } from "@/components/ui/logo"

const navItems = [
  { title: "Dashboard", url: "/filler", icon: Home },
  { title: "Surveys", url: "/filler/surveys", icon: ListChecks },
  { title: "Earnings", url: "/filler/earnings", icon: Wallet },
  { title: "Profile", url: "/filler/profile", icon: User2 },
  { title: "Referrals", url: "/filler/referrals", icon: Users },
]

export function AppSidebar() {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <LogoCompact size="sm" href="/filler" priority={true} />
          <span className="font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Onetime Survey
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!isAuthenticated ? (
          <div className="grid gap-2 p-2">
            <Button asChild size="sm" className="rounded-xl bg-[#013F5C] text-white hover:bg-[#0b577a]">
              <Link href="/filler/auth/sign-in">Sign in</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-[#013F5C] text-[#013F5C] bg-transparent"
            >
              <Link href="/filler/auth/sign-up">Sign up</Link>
            </Button>
          </div>
        ) : (
          <div
            className="mx-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-2 backdrop-blur-xl"
            role="group"
            aria-label="User profile"
          >
            <div className="flex size-9 items-center justify-center rounded-full border bg-white">
              <User2 className="h-4 w-4 text-slate-700" />
            </div>
            <Link href="/filler/profile" className="min-w-0 flex-1 hover:underline">
              <div className="truncate text-sm font-semibold">{user?.name ?? "User"}</div>
              <div className="truncate text-xs text-slate-500">{user?.email ?? ""}</div>
            </Link>
            <button
              className="inline-flex size-8 items-center justify-center rounded-md hover:bg-slate-100"
              aria-label="Sign out"
              onClick={() => {
                signOut()
                window.location.href = "/filler/auth/sign-in"
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
