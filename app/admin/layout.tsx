"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname?.includes("/auth/")

  if (isAuthPage) {
    return children
  }

  return (
    <RoleGuard requiredRole="admin" requireAuth={true}>
      {renderLayout()}
    </RoleGuard>
  )

  function renderLayout() {

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
}