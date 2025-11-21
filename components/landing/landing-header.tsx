"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Settings, LogOut } from "lucide-react"

export default function LandingHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Mock user data
  const user = {
    name: "John Doe",
    avatar: null // Set to null to show initials
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="flex items-center h-auto py-2 md:py-3 relative z-50 border-b border-white/20 bg-white/10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              OneTime Survey
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button asChild variant="ghost" className="min-h-[48px] px-4 py-2 text-white hover:bg-white/10">
                  <Link href="/filler/auth/sign-in">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="min-h-[48px] px-4 py-2 rounded-lg bg-white text-[#013f5c] font-medium hover:bg-gray-100"
                >
                  <Link href="/filler/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {user.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name} 
                      width={40} 
                      height={40} 
                      className="w-10 h-10 rounded-full"
                      priority={false}
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-white font-medium text-sm">
                      {getInitials(user.name)}
                    </span>
                  )}
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                    >
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>
                      <button 
                        onClick={() => setIsAuthenticated(false)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* Toggle button for testing */}
            <Button
              onClick={() => setIsAuthenticated(!isAuthenticated)}
              variant="outline"
              size="sm"
              className="ml-4 text-white border-white/20 hover:bg-white/10"
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
