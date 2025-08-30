"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { CreatorSidebar } from "@/components/creator/creator-sidebar"
import { RoleGuard } from "@/components/auth/role-guard"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("CreatorLayout rendering with children:", !!children)
  
  return (
    <ErrorBoundary>
      <RoleGuard requiredRole="creator" requireAuth={true}>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-slate-50">
            <CreatorSidebar />
            <main className="flex-1 p-6 overflow-auto">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </SidebarProvider>
      </RoleGuard>
    </ErrorBoundary>
  )
}