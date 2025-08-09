"use client"

import type React from "react"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function FillerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex min-h-svh flex-1 flex-col bg-white">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2">
            <SidebarTrigger />
            <Link href="/" className="ml-1 mr-2 text-sm font-semibold tracking-tight sm:text-base text-[#013F5C]">
              OneTime Survey
            </Link>
            <div className="ml-auto flex items-center gap-3">
              {isAuthenticated && (
                <div className="hidden text-sm text-slate-600 sm:block">
                  Welcome, <span className="font-semibold text-slate-900">{user?.name ?? "User"}</span>
                </div>
              )}
              {isAuthenticated ? (
                <>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <span className="size-2 rounded-full bg-emerald-600" /> Logged in
                  </span>
                  <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Notifications">
                    <Bell className="h-5 w-5 text-slate-700" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() ?? "OT"}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/filler/profile" className="flex items-center gap-2">
                          <User className="h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="text-red-600">
                        <Link href="/filler/auth/sign-in" className="flex items-center gap-2">
                          <LogOut className="h-4 w-4" /> Sign out
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" className="rounded-xl text-[#013F5C]">
                    <Link href="/filler/auth/sign-in">Sign in</Link>
                  </Button>
                  <Button asChild className="rounded-xl bg-[#C1654B] text-white hover:bg-[#b25a43]">
                    <Link href="/filler/auth/sign-up">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}
