"use client"

import { useEffect } from "react"

export function LogoPreloader() {
  useEffect(() => {
    // Preload the logo image for better performance
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = "/images/onetime-logo.png"
    link.as = "image"
    link.type = "image/png"
    document.head.appendChild(link)

    return () => {
      // Cleanup on unmount
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  return null
}
