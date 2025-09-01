"use client"

import { PanelLeft, PanelLeftClose } from "lucide-react"
import { useSidebarStore } from "@/lib/sidebar-store"
import { cn } from "@/lib/utils"

interface SidebarToggleProps {
  className?: string
}

export function SidebarToggle({ className }: SidebarToggleProps) {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <button
      onClick={toggle}
      className={cn(
        "group relative w-9 h-9 text-slate-600 hover:text-slate-900 transition-all duration-300 cursor-pointer flex items-center justify-center rounded-xl hover:bg-slate-100/80 hover:shadow-sm active:scale-95 backdrop-blur-sm",
        className
      )}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {isOpen ? (
        <PanelLeftClose className="w-5 h-5 relative z-10" />
      ) : (
        <PanelLeft className="w-5 h-5 relative z-10" />
      )}
    </button>
  )
}