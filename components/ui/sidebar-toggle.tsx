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
        "w-6 h-6 text-[#013e5c] hover:text-[#c0684a] transition-colors duration-200 cursor-pointer flex items-center justify-center",
        className
      )}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isOpen ? (
        <PanelLeftClose className="w-4 h-4" />
      ) : (
        <PanelLeft className="w-4 h-4" />
      )}
    </button>
  )
}