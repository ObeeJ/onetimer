"use client"

import { useState, useEffect } from "react"
import { CreatorSidebar } from "@/components/creator-sidebar"
import { BreadcrumbProvider } from "@/lib/breadcrumb-context"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <BreadcrumbProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <CreatorSidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        
        <div className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          {/* Mobile header */}
          <div className="lg:hidden bg-white/90 backdrop-blur-sm border-b border-slate-200 p-3 sticky top-0 z-30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2"
            >
              <Menu className="h-4 w-4" />
              <span className="text-sm font-medium">Menu</span>
            </Button>
          </div>
          
          <main className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-full overflow-hidden">
              <Breadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  )
}