"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface AnimatedTabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
  tabClassName?: string
  contentClassName?: string
}

export function AnimatedTabs({ 
  tabs, 
  defaultTab, 
  className,
  tabClassName,
  contentClassName 
}: AnimatedTabsProps) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || tabs[0]?.id)

  const activeTab = tabs.find(tab => tab.id === selectedTab)

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={cn(
                "relative py-4 px-1 text-sm font-medium transition-colors whitespace-nowrap",
                selectedTab === tab.id
                  ? "text-[#013f5c] border-[#013f5c]"
                  : "text-slate-500 hover:text-slate-700",
                tabClassName
              )}
              initial={false}
              animate={{
                color: selectedTab === tab.id ? "#013f5c" : "#64748b"
              }}
            >
              {tab.label}
              {selectedTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#013f5c]"
                  layoutId="activeTab"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                />
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className={cn("mt-6", contentClassName)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.2,
              ease: "easeInOut"
            }}
          >
            {activeTab?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}