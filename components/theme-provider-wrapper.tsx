"use client"

import dynamic from 'next/dynamic'
import { type ReactNode } from 'react'

const ThemeProvider = dynamic(
  () => import('next-themes').then((mod) => mod.ThemeProvider),
  { ssr: false }
)

interface ThemeProviderWrapperProps {
  children: ReactNode
  attribute?: string
  forcedTheme?: string
  disableTransitionOnChange?: boolean
}

export function ThemeProviderWrapper({ 
  children, 
  attribute = "class",
  forcedTheme = "light",
  disableTransitionOnChange = true 
}: ThemeProviderWrapperProps) {
  return (
    <ThemeProvider 
      attribute={attribute} 
      forcedTheme={forcedTheme} 
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </ThemeProvider>
  )
}
