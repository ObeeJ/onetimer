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
        "w-8 h-8 text-[#013f5d] hover:text-[#c0684a] transition-colors duration-200 cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100",
        className
      )}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isOpen ? (
        <PanelLeftClose className="w-5 h-5" />
      ) : (
        <PanelLeft className="w-5 h-5" />
      )}
    </button>
  )
}