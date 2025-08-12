"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function FillerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, signOut } = useAuth()
  const pathname = usePathname()

  const isAuthFlow = pathname?.startsWith("/filler/auth") || pathname?.startsWith("/filler/onboarding")

  if (isAuthFlow) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">{children}</div>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex min-h-svh flex-1 flex-col bg-white">
        <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <SidebarTrigger className="rounded-xl" />
            <Link
              href="/"
              className="ml-1 mr-2 text-lg font-bold tracking-tight text-[#013F5C] transition-colors hover:text-[#0b577a] sm:text-xl"
            >
              OneTime Survey
            </Link>
            <div className="ml-auto flex items-center gap-3 sm:gap-4">
              {isAuthenticated && (
                <div className="hidden text-sm font-medium text-slate-600 sm:block lg:text-base">
                  Welcome back, <span className="font-bold text-slate-900">{user?.name ?? "User"}</span>
                </div>
              )}
              {isAuthenticated ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Online
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl transition-all hover:bg-slate-100"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 text-slate-700" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-9 w-9 cursor-pointer transition-all hover:ring-2 hover:ring-[#013F5C]/20 sm:h-10 sm:w-10">
                        <AvatarFallback className="bg-[#013F5C] text-white font-semibold">
                          {user?.name?.slice(0, 2).toUpperCase() ?? "OT"}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem asChild>
                        <Link href="/filler/profile" className="flex items-center gap-2 cursor-pointer">
                          <User className="h-4 w-4" /> Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer focus:text-red-600"
                        onClick={() => {
                          signOut()
                          window.location.href = "/filler/auth/sign-in"
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    asChild
                    variant="ghost"
                    className="rounded-xl font-semibold text-[#013F5C] transition-all hover:bg-[#013F5C]/5"
                  >
                    <Link href="/filler/auth/sign-in">Sign in</Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-xl bg-[#C1654B] font-semibold text-white transition-all hover:bg-[#b25a43] hover:shadow-md"
                  >
                    <Link href="/filler/auth/sign-up">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 bg-gradient-to-br from-slate-50/30 via-white to-slate-100/30">{children}</main>
      </div>
    </SidebarProvider>
  )
}
