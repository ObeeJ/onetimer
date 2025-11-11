"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, Home, Users, FileText, Shield, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface ResponsiveNavbarProps {
  role: "filler" | "creator" | "admin" | "super-admin"
  navItems: NavItem[]
  user?: { name?: string; email?: string }
  onSignOut?: () => void
}

const roleThemes = {
  filler: {
    primary: "bg-[#013F5C] hover:bg-[#0b577a]",
    accent: "text-[#013F5C]",
    border: "border-[#013F5C]"
  },
  creator: {
    primary: "bg-[#C1654B] hover:bg-[#b25a43]",
    accent: "text-[#C1654B]",
    border: "border-[#C1654B]"
  },
  admin: {
    primary: "bg-[#004AAD] hover:bg-[#003080]",
    accent: "text-[#004AAD]",
    border: "border-[#004AAD]"
  },
  "super-admin": {
    primary: "bg-[#004AAD] hover:bg-[#003080]",
    accent: "text-[#004AAD]",
    border: "border-[#004AAD]"
  }
}

export function ResponsiveNavbar({ role, navItems, user, onSignOut }: ResponsiveNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const theme = roleThemes[role]

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-8">
          <Link href={`/${role}`} className="flex items-center gap-2">
            <Image src="/Logo.png" alt="OneTime Survey" width={64} height={32} priority className="h-8 w-auto" />
            <span className="font-bold text-lg text-slate-900">OneTime</span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? `${theme.primary} text-white` 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Welcome, {user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="text-slate-600 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <Link href={`/${role}`} className="flex items-center gap-2">
          <Image src="/Logo.png" alt="OneTime Survey" width={64} height={32} priority className="h-8 w-auto" />
          <span className="font-bold text-lg text-slate-900">OneTime</span>
        </Link>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Image src="/Logo.png" alt="OneTime Survey" width={64} height={32} priority className="h-8 w-auto" />
                  <span className="font-bold text-lg text-slate-900">OneTime</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full",
                        isActive 
                          ? `${theme.primary} text-white` 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  )
                })}
              </div>
              
              {user && (
                <div className="border-t pt-4 mt-4">
                  <div className="px-4 py-2 mb-3">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onSignOut?.()
                      setIsOpen(false)
                    }}
                    className="w-full justify-start text-slate-600 hover:text-slate-900"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  )
}