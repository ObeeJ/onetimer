"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar"
import { SuperAdminTopbar } from "@/components/super-admin/super-admin-topbar"
import { useSuperAdminAuth } from "@/hooks/use-super-admin-auth"
import { usePathname } from "next/navigation"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useSuperAdminAuth()
  const pathname = usePathname()
  const isAuthPage = pathname?.includes("/auth/")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Super Admin Access Required</h1>
          <p className="text-slate-600 mb-4">Please sign in with super admin credentials</p>
          <a href="/super-admin/auth/login" className="text-[#013F5C] hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  if (isAuthPage) {
    return children
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col">
          <SuperAdminTopbar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}