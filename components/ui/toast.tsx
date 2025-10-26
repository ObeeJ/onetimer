"use client"

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const { subscribe } = useToast()
  
  useEffect(() => {
    return subscribe(setToasts)
  }, [subscribe])
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastComponent({ toast }: { toast: Toast }) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])
  
  const variants = {
    default: 'bg-white border-slate-200',
    destructive: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200'
  }
  
  const icons = {
    default: Info,
    destructive: AlertCircle,
    success: CheckCircle
  }
  
  const Icon = icons[toast.variant || 'default']
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300",
      variants[toast.variant || 'default'],
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    )}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{toast.title}</div>
        {toast.description && (
          <div className="text-sm text-slate-600 mt-1">{toast.description}</div>
        )}
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-slate-400 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}