"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
  animation?: "fade" | "slide-up" | "slide-down" | "scale" | "slide-right"
  className?: string
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg", 
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full w-full h-full"
}

const animations = {
  fade: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  },
  "slide-up": {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 }
  },
  "slide-down": {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 }
  },
  "slide-right": {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  }
}

export function AnimatedModal({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  animation = "fade",
  className
}: AnimatedModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Panel */}
          <motion.div
            initial={animations[animation].initial}
            animate={animations[animation].animate}
            exit={animations[animation].exit}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className={cn(
              "relative bg-white rounded-xl shadow-2xl border border-slate-200 mx-4",
              sizeClasses[size],
              size === "full" ? "rounded-none" : "max-h-[90vh]",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            )}
            
            {/* Content */}
            <div className={cn(
              "overflow-y-auto",
              title ? "p-6" : "p-6",
              size === "full" ? "h-full" : "max-h-[calc(90vh-8rem)]"
            )}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Tailwind-only modal (without Framer Motion)
export function TailwindModal({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  animation = "fade"
}: AnimatedModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-300 ease-out"
    
    switch (animation) {
      case "slide-up":
        return isOpen 
          ? `${baseClasses} opacity-100 translate-y-0`
          : `${baseClasses} opacity-0 translate-y-full`
      case "slide-down":
        return isOpen
          ? `${baseClasses} opacity-100 translate-y-0`
          : `${baseClasses} opacity-0 -translate-y-full`
      case "scale":
        return isOpen
          ? `${baseClasses} opacity-100 scale-100`
          : `${baseClasses} opacity-0 scale-95`
      default: // fade
        return isOpen
          ? `${baseClasses} opacity-100 scale-100`
          : `${baseClasses} opacity-0 scale-95`
    }
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center transition-all duration-300",
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}>
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div
        className={cn(
          "relative bg-white rounded-xl shadow-2xl border border-slate-200 mx-4",
          sizeClasses[size],
          size === "full" ? "rounded-none w-full h-full" : "max-h-[90vh]",
          getAnimationClasses()
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={cn(
          "overflow-y-auto",
          title ? "p-6" : "p-6",
          size === "full" ? "h-full" : "max-h-[calc(90vh-8rem)]"
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}