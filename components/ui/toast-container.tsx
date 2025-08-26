"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToastProps {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  onDismiss: (id: string) => void
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800"
}

const iconStyles = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-amber-600",
  info: "text-blue-600"
}

export function Toast({ id, title, description, type, onDismiss }: ToastProps) {
  const Icon = icons[type]

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-lg transition-all",
        styles[type]
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", iconStyles[type])} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-black/10"
              onClick={() => onDismiss(id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    title: string
    description?: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
      style={{ zIndex: 9999 }}
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  )
}
