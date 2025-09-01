"use client"

import { PanelLeft, PanelLeftClose } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarToggleProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
  className?: string
}

export function SidebarToggle({ isOpen, onToggle, className }: SidebarToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isOpen)}
      className={cn(
        "w-6 h-6 text-[#013e5c] hover:text-[#c0684a] transition-colors duration-200 cursor-pointer",
        className
      )}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isOpen ? (
        <PanelLeftClose className="w-6 h-6" />
      ) : (
        <PanelLeft className="w-6 h-6" />
      )}
    </button>
  )
}