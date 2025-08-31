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
  const pathname = usePathname()
  const isAuthPage = pathname?.includes("/auth/")

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