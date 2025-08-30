"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const pathname = usePathname()
  const isAuthPage = pathname?.includes("/auth/")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!isAuthenticated && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-slate-600 mb-4">Please sign in to access the admin panel</p>
          <a href="/admin/auth/login" className="text-[#013F5C] hover:underline">
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
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminTopbar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}