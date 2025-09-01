"use client"

import { BarChart3, CreditCard, FileText, Home, LogOut, Settings, User2, Plus } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useCreatorAuth } from "@/hooks/use-creator-auth"

const navItems = [
  { title: "Dashboard", url: "/creator/dashboard", icon: Home },
  { title: "Create Survey", url: "/creator/surveys/create", icon: Plus },
  { title: "My Surveys", url: "/creator/surveys", icon: FileText },
  { title: "Analytics", url: "/creator/analytics", icon: BarChart3 },
  { title: "Credits", url: "/creator/credits", icon: CreditCard },
  { title: "Settings", url: "/creator/settings", icon: Settings },
]

export function CreatorSidebar() {
  const { creator, isAuthenticated, isApproved, signOut } = useCreatorAuth()
  const pathname = usePathname()

  const getStatusBadge = () => {
    if (!creator) return null
    
    switch (creator.status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Approved</Badge>
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-700">Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between px-3">
        <div className="flex items-center justify-between w-full">
          <Link href="/creator/dashboard" className="hover:opacity-80 transition-opacity group-data-[collapsible=icon]:hidden">
            <img src="/Logo.png" alt="Survey Platform" className="h-10 sm:h-14 md:h-12 w-auto" />
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
                const isDisabled = false // All features available when authenticated
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} disabled={isDisabled}>
                      <Link 
                        href={isDisabled ? "#" : item.url}
                        className={`${isActive ? "bg-brand-orange text-white font-bold rounded-lg" : "hover:bg-brand-orange/10 hover:text-slate-700 rounded-lg transition-all duration-200"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
        {!isAuthenticated ? (
          <div className="grid gap-2 p-2">
            <SidebarMenuButton asChild tooltip="Sign in">
              <Link href="/creator/auth/sign-in" className="flex items-center gap-2 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90 hover:text-white p-2 transition-all duration-200">
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Sign in</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild tooltip="Sign up">
              <Link href="/creator/auth/sign-up" className="flex items-center gap-2 rounded-lg border border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue hover:text-white p-2 transition-all duration-200">
                <User2 className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Sign up</span>
              </Link>
            </SidebarMenuButton>
          </div>
        ) : (
          <div className="mx-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-2 backdrop-blur-xl group-data-[collapsible=icon]:justify-center">
            <div className="flex size-9 items-center justify-center rounded-full border bg-white">
              <User2 className="h-4 w-4 text-slate-700" />
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-semibold">{creator?.name ?? "Creator"}</div>
                {getStatusBadge()}
              </div>
              <div className="truncate text-xs text-slate-500">
                {creator?.credits ?? 0} credits
              </div>
            </div>
            <button
              className="inline-flex size-8 items-center justify-center rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors group-data-[collapsible=icon]:hidden"
              onClick={() => {
                signOut()
                window.location.href = "/creator/auth/sign-in"
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