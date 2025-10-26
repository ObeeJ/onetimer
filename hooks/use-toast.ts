"use client"

import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

const toasts: Toast[] = []
const listeners: Array<(toasts: Toast[]) => void> = []

function dispatch(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast = { ...toast, id }
  
  toasts.push(newToast)
  listeners.forEach(listener => listener([...toasts]))
  
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      listeners.forEach(listener => listener([...toasts]))
    }
  }, toast.duration || 5000)
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([])
  
  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    dispatch(props)
  }, [])
  
  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])
  
  return { toast, toasts: toastList, subscribe }
}