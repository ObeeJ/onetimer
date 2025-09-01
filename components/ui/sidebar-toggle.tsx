"use client"

import { ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/lib/sidebar-store"
import { cn } from "@/lib/utils"

interface SidebarToggleProps {
  className?: string
}

export function SidebarToggle({ className }: SidebarToggleProps) {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn(
        "h-8 w-8 rounded-lg hover:bg-[#013e5c]/10 text-[#013e5c] focus-visible:ring-2 focus-visible:ring-[#013e5c]/50 focus-visible:ring-offset-2 transition-colors",
        className
      )}
    >
      {isOpen ? (
        <ToggleRight className="h-4 w-4" />
      ) : (
        <ToggleLeft className="h-4 w-4" />
      )}
    </Button>
  )
}