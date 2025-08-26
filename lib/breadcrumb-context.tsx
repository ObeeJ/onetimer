"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { surveyStore } from './survey-store'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbContextType {
  items: BreadcrumbItem[]
  setCustomBreadcrumbs: (items: BreadcrumbItem[]) => void
  resetBreadcrumbs: () => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider')
  }
  return context
}

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [customItems, setCustomItems] = useState<BreadcrumbItem[] | null>(null)

  const generateAutoBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []

    // Always start with Dashboard for creator routes
    if (segments[0] === 'creator') {
      items.push({ label: 'Dashboard', href: '/creator/dashboard' })
      
      if (segments.length > 1) {
        switch (segments[1]) {
          case 'surveys':
            items.push({ label: 'Surveys', href: '/creator/surveys' })
            
            if (segments[2] === 'create') {
              items.push({ label: 'Create Survey' })
            } else if (segments[2] && segments[2] !== 'create') {
              // Dynamic survey ID
              const survey = surveyStore.getById(segments[2])
              const surveyTitle = survey?.title || 'Survey'
              items.push({ 
                label: surveyTitle.length > 30 ? surveyTitle.substring(0, 30) + '...' : surveyTitle, 
                href: `/creator/surveys/${segments[2]}` 
              })
              
              if (segments[3] === 'edit') {
                items.push({ label: 'Edit' })
              } else if (segments[3] === 'analytics') {
                items.push({ label: 'Analytics' })
              } else if (segments[3] === 'preview') {
                items.push({ label: 'Preview' })
              }
            }
            break
            
          case 'analytics':
            items.push({ label: 'Analytics' })
            break
            
          case 'billing':
            items.push({ label: 'Billing', href: '/creator/billing' })
            if (segments[2] === 'purchase-credits') {
              items.push({ label: 'Purchase Credits' })
            }
            break
            
          case 'settings':
            items.push({ label: 'Settings' })
            break
            
          case 'help':
            items.push({ label: 'Help & Support' })
            break
            
          default:
            // Capitalize and format segment
            const label = segments[1].split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
            items.push({ label })
        }
      }
    }

    return items
  }

  const [items, setItems] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    if (customItems) {
      setItems(customItems)
    } else {
      setItems(generateAutoBreadcrumbs(pathname))
    }
  }, [pathname, customItems])

  const setCustomBreadcrumbs = (newItems: BreadcrumbItem[]) => {
    setCustomItems(newItems)
  }

  const resetBreadcrumbs = () => {
    setCustomItems(null)
  }

  return (
    <BreadcrumbContext.Provider value={{ items, setCustomBreadcrumbs, resetBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}