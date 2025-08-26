"use client"

import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"

type ToastProps = {
  title?: string
  description?: string
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function Toast({ title, description, open, onOpenChange }: ToastProps) {
  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Root
        className="rounded-lg border bg-white/90 p-3 shadow-md backdrop-blur-md"
        open={open}
        onOpenChange={onOpenChange}
      >
        {title && <ToastPrimitive.Title className="font-medium text-sm">{title}</ToastPrimitive.Title>}
        {description && <ToastPrimitive.Description className="text-sm text-slate-600">{description}</ToastPrimitive.Description>}
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed bottom-6 right-6 z-50" />
    </ToastPrimitive.Provider>
  )
}

export function useToast() {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState<string | undefined>(undefined)
  const [description, setDescription] = React.useState<string | undefined>(undefined)

  const show = (opts?: { title?: string; description?: string }) => {
    setTitle(opts?.title)
    setDescription(opts?.description)
    setOpen(false)
    setTimeout(() => setOpen(true), 50)
    return () => setOpen(false)
  }
  return { open, setOpen, show, title, description }
}

export default Toast
