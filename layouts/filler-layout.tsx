"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RoleGuard } from "@/components/auth/role-guard"
import { Button } from "@/components/ui/button"
import { Home, ListChecks, Wallet, Settings, LogOut, User2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { SidebarToggle } from "@/components/ui/sidebar-toggle"
import { useSidebarStore } from "@/lib/sidebar-store"

const navItems = [
  { title: "Dashboard", url: "/filler", icon: Home },
  { title: "Surveys", url: "/filler/surveys", icon: ListChecks },
  { title: "Earnings", url: "/filler/earnings", icon: Wallet },
  { title: "Settings", url: "/filler/settings", icon: Settings },
]

export default function FillerLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const { isOpen: sidebarOpen } = useSidebarStore()

  const isAuthFlow = pathname?.startsWith("/filler/auth") || pathname?.startsWith("/filler/onboarding")

  if (isAuthFlow) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">{children}</div>
  }

  return (
    <RoleGuard requiredRole="filler" requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <div className={cn(
          "hidden lg:flex fixed left-0 top-0 z-40 h-full bg-white border-r border-slate-200 flex-col transition-all duration-300 ease-in-out shadow-lg",
          sidebarOpen ? "w-64" : "w-16"
        )}>
          {/* Header */}
          <div className="h-16 border-b border-slate-200 flex items-center justify-center px-4">
            {sidebarOpen ? (
              <div className="flex items-center gap-3 w-full">
                <Link href="/filler">
                  <img src="/Logo.png" alt="OneTime Survey" className="h-8 w-auto cursor-pointer" />
                </Link>
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
                    "flex items-center rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    sidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5",
                    isActive
                      ? "bg-[#013e5c] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#013e5c]"
                  )}
                  title={!sidebarOpen ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="truncate">{item.title}</span>
                  )}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
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
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name || "Filler User"}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || "filler@onetime.com"}</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    signOut()
                    window.location.href = "/filler/auth/sign-in"
                  }}
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
                  onClick={() => {
                    signOut()
                    window.location.href = "/filler/auth/sign-in"
                  }}
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

        {/* Mobile toggle button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <SidebarToggle className="bg-white shadow-lg" />
        </div>

        {/* Mobile sidebar */}
        <div className={cn(
          "lg:hidden fixed left-0 top-0 z-40 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4">
            <Link href="/filler">
              <img src="/Logo.png" alt="OneTime Survey" className="h-8 w-auto cursor-pointer" />
            </Link>
            <SidebarToggle />
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={() => useSidebarStore.getState().setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive ? "bg-[#013e5c] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-[#013e5c]"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-slate-200 p-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <User2 className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.name || "Filler User"}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || "filler@onetime.com"}</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  signOut()
                  window.location.href = "/filler/auth/sign-in"
                }}
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:bg-[#013e5c]/10 hover:text-[#013e5c] px-3 py-2"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => useSidebarStore.getState().setOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={cn(
          "p-6 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}>
          {children}
        </main>
      </div>
    </RoleGuard>
  )
}