"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  FileText,
  CreditCard,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

interface SidebarNavProps {
  className?: string
}

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Survey Approval",
    href: "/admin/surveys/approval",
    icon: CheckSquare,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Analytics & Reports",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Content Moderation",
    href: "/admin/moderation",
    icon: AlertTriangle,
  },
  {
    title: "Financial Overview",
    href: "/admin/finance",
    icon: CreditCard,
  },
]

const bottomNavItems = [
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Support Center",
    href: "/admin/support",
    icon: HelpCircle,
  },
]

export function AdminSidebar({ className }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-screen w-64 flex-col bg-white border-r border-slate-200 fixed left-0 top-0 z-50", className)}>
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Logo 
          size="sm" 
          showText={true} 
          href="/admin"
          textClassName="text-slate-900"
        />
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Admin Panel</p>
            <p className="text-xs text-slate-500 truncate">admin@onetime.com</p>
          </div>
          <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
            Admin
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-slate-200">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-900">23</div>
            <div className="text-xs text-slate-600">Pending Reviews</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-900">1,247</div>
            <div className="text-xs text-slate-600">Active Users</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#013f5c] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
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
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          )
        })}
        
        <Separator className="my-2" />
        
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          size="sm"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
