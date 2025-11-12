"use client"

import { useState, useCallback, useEffect } from 'react'

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
  const id = Math.random().toString(36).substring(2, 9)
  const newToast = { ...toast, id }
  
  toasts.push(newToast)
  listeners.forEach(listener => {
    try {
      listener([...toasts])
    } catch (error) {
      console.warn('Toast listener error:', error)
    }
  })
  
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      listeners.forEach(listener => {
        try {
          listener([...toasts])
        } catch (error) {
          console.warn('Toast listener error:', error)
        }
      })
    }
  }, toast.duration || 5000)
}

export function subscribe(listener: (toasts: Toast[]) => void) {
  listeners.push(listener)
  listener([...toasts])

  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) listeners.splice(index, 1)
  }
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([])

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    dispatch(props)
  }, [])

  useEffect(() => {
    const unsubscribe = (() => {
      listeners.push(setToastList)
      return () => {
        const index = listeners.indexOf(setToastList)
        if (index > -1) listeners.splice(index, 1)
      }
    })()

    return unsubscribe
  }, [])

  return { toast, toasts: toastList, subscribe }
}

export const toast = (props: Omit<Toast, 'id'>) => dispatch(props)