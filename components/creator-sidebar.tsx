"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react"

interface SidebarNavProps {
  className?: string
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
  collapsed?: boolean
  setCollapsed?: (collapsed: boolean) => void
}

const navItems = [
  {
    title: "Dashboard",
    href: "/creator/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Survey",
    href: "/creator/surveys/create",
    icon: PlusCircle,
  },
  {
    title: "My Surveys",
    href: "/creator/surveys",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/creator/analytics",
    icon: BarChart3,
  },
  {
    title: "Billing & Credits",
    href: "/creator/billing",
    icon: CreditCard,
  },
]

const bottomNavItems = [
  {
    title: "Settings",
    href: "/creator/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/creator/help",
    icon: HelpCircle,
  },
]

export function CreatorSidebar({ 
  className, 
  isOpen = false, 
  setIsOpen,
  collapsed = false,
  setCollapsed
}: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen?.(false)}
        />
      )}
      
      <div className={cn(
        "flex h-screen flex-col bg-white border-r border-slate-200 fixed left-0 top-0 z-50 transition-all duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed ? "w-16" : "w-64",
        className
      )}>
      {/* Logo/Brand */}
      <div className={cn(
        "flex h-16 items-center border-b border-slate-200",
        collapsed ? "justify-center px-4" : "justify-between px-6"
      )}>
        {collapsed ? (
          <button
            onClick={() => setCollapsed?.(false)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Expand sidebar"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
        ) : (
          <>
            <Logo 
              size="sm" 
              showText={true} 
              href="/creator"
              textClassName="text-slate-900"
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCollapsed?.(true)}
                className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              </button>
              <button
                onClick={() => setIsOpen?.(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-slate-600 font-medium text-sm">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
              <p className="text-xs text-slate-500 truncate">creator@example.com</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Pro
            </Badge>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-lg font-bold text-slate-900">8</div>
              <div className="text-xs text-slate-600">Active</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-lg font-bold text-slate-900">1,250</div>
              <div className="text-xs text-slate-600">Credits</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          let isActive = false
          if (item.href === "/creator/surveys/create") {
            isActive = pathname === "/creator/surveys/create"
          } else if (item.href === "/creator/surveys") {
            isActive = pathname === "/creator/surveys" || (pathname.startsWith("/creator/surveys/") && !pathname.startsWith("/creator/surveys/create"))
          } else {
            isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center" : "space-x-3",
                isActive
                  ? "bg-[#013f5c] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>
      {/* Bottom Navigation */}
      <div className="border-t border-slate-200 p-4 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center" : "space-x-3",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
        
        <Separator className="my-2" />
        
        <Button
          variant="ghost"
          className={cn(
            "w-full text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
          size="sm"
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
    </>
  )
}
