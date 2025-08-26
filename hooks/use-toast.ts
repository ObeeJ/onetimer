"use client"

import { useState } from "react"

interface ToastState {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const show = (toast: Omit<ToastState, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { id, ...toast }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
    
    return id
  }

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const dismissAll = () => {
    setToasts([])
  }

  return {
    toasts,
    show,
    dismiss,
    dismissAll
  }
}
