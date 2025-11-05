"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react"

export default function Hero() {
  const reduceMotion = useReducedMotion()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'hero_section' })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setEmail("")
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to join waitlist' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
          animate={
            reduceMotion
              ? {}
              : {
                  backgroundPosition: ["0px 0px", "50px 50px"],
                }
          }
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />

        <div className="absolute inset-0 backdrop-blur-md bg-white/10 border-t border-white/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.8 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.8, delay: reduceMotion ? 0 : 0.2 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            Earn Money Taking Surveys
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.8, delay: reduceMotion ? 0 : 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90"
          >
            Join thousands of Nigerians earning extra income by sharing their opinions. Simple, fast, and rewarding
            surveys that fit your schedule.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.8, delay: reduceMotion ? 0 : 0.6 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button
              asChild
              className="min-h-[48px] px-4 py-2 rounded-lg bg-[#013f5c] text-white font-medium hover:bg-[#012f49]"
            >
              <Link href="/filler/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-[48px] px-4 py-2 rounded-lg bg-white text-[#013f5c] font-medium hover:bg-gray-100 border border-gray-300"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </motion.div>

          {/* Waitlist Section */}
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 1, delay: reduceMotion ? 0 : 0.8 }}
            className="mt-16 mx-auto max-w-4xl"
          >
            <form onSubmit={handleWaitlistSubmit} className="relative">
              {/* Glassmorphism container */}
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                  {/* Social Media Icons - Left Side */}
                  <motion.div
                    className="flex items-center gap-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.a
                      href="https://twitter.com/onetimer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Twitter className="w-5 h-5 text-white" />
                    </motion.a>
                    <motion.a
                      href="https://instagram.com/onetimer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Instagram className="w-5 h-5 text-white" />
                    </motion.a>
                    <motion.a
                      href="https://linkedin.com/company/onetimer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Linkedin className="w-5 h-5 text-white" />
                    </motion.a>
                  </motion.div>

                  {/* Email Input - Search Bar Style */}
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      required
                      disabled={isSubmitting}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 disabled:opacity-50"
                    />
                  </div>

                  {/* CTA Button - Right Side */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="px-8 py-4 rounded-xl bg-[#013f5c] text-white font-semibold hover:bg-[#012f49] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Joining...
                      </span>
                    ) : (
                      'Join The Waitlist'
                    )}
                  </motion.button>
                </div>

                {/* Success/Error Message */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-100'
                        : 'bg-red-500/20 border border-red-500/30 text-red-100'
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </div>

              {/* Animated background glow */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl -z-10"
                animate={
                  reduceMotion
                    ? {}
                    : {
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.02, 1],
                      }
                }
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
