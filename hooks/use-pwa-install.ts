"use client"

import { useEffect, useState, useCallback } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setStandalone] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault?.()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    const nav = navigator as NavigatorWithStandalone
    setStandalone(
      window.matchMedia?.("(display-mode: standalone)").matches ||
        // iOS Safari
        nav.standalone === true,
    )
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const canInstall = !!deferred

  const promptInstall = useCallback(async () => {
    if (!deferred) return
    try {
      await deferred.prompt()
      setDeferred(null)
    } catch {
      // user dismissed
    }
  }, [deferred])

  return { canInstall, promptInstall, isStandalone }
}
