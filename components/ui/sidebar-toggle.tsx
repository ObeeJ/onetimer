"use client"

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
        "w-6 h-6 text-[#013f5d] hover:text-[#c0684a] transition-colors duration-200 cursor-pointer",
        className
      )}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Sidebar rectangle */}
        <rect x="3" y="4" width="6" height="16" rx="1" />
        {/* Main area rectangle */}
        <rect x="11" y="4" width="10" height="16" rx="1" />
        {/* Chevron arrow */}
        {isOpen ? (
          <path d="m7 9 -2 3 2 3" />
        ) : (
          <path d="m5 9 2 3 -2 3" />
        )}
      </svg>
    </button>
  )
}