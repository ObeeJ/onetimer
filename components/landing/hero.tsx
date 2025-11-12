"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Twitter, Instagram, Linkedin, Mail, Lock } from "lucide-react"

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
    <section className="relative overflow-hidden py-16">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl"
          >
            Earn money sharing
            <span className="text-[#013F5C] block">your opinions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.8, delay: reduceMotion ? 0 : 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600"
          >
            Join thousands of Nigerians earning ₦200-1,500 per survey. Your voice matters, and we pay for it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.8, delay: reduceMotion ? 0 : 0.6 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            {/* <Button
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
            </Button> */}
            <Button
              disabled
              className="min-h-[48px] px-4 py-2 rounded-lg bg-gray-400 cursor-not-allowed text-white font-medium opacity-60"
              title="Currently under maintenance"
            >
              <Lock className="mr-2 h-4 w-4" />
              Get Started
            </Button>
            <Button
              disabled
              variant="outline"
              className="min-h-[48px] px-4 py-2 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 font-medium opacity-60 border border-gray-300"
              title="Currently under maintenance"
            >
              <Lock className="mr-2 h-4 w-4" />
              Learn More
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
              {/* Light glassmorphism container with bubble animation */}
              <motion.div
                className="backdrop-blur-lg bg-slate-50/80 border border-slate-200 rounded-2xl p-6 shadow-lg"
                animate={
                  reduceMotion
                    ? {}
                    : {
                        y: [0, -8, 0],
                        boxShadow: [
                          "0 10px 30px rgba(0,0,0,0.1)",
                          "0 20px 40px rgba(0,0,0,0.15)",
                          "0 10px 30px rgba(0,0,0,0.1)",
                        ],
                      }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
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
                      className="p-3 rounded-full bg-slate-100 hover:bg-[#013F5C] hover:text-white backdrop-blur-md border border-slate-200 transition-all duration-300 text-slate-600"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Twitter className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      href="https://instagram.com/onetimer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-slate-100 hover:bg-[#013F5C] hover:text-white backdrop-blur-md border border-slate-200 transition-all duration-300 text-slate-600"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Instagram className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      href="https://linkedin.com/company/onetimer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-full bg-slate-100 hover:bg-[#013F5C] hover:text-white backdrop-blur-md border border-slate-200 transition-all duration-300 text-slate-600"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Linkedin className="w-5 h-5" />
                    </motion.a>
                  </motion.div>

                  {/* Email Input - Search Bar Style */}
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      required
                      disabled={isSubmitting}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#013F5C]/50 focus:border-transparent transition-all duration-300 disabled:opacity-50"
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
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </motion.div>

              {/* Subtle animated background glow */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-[#013F5C]/5 via-[#C1654B]/5 to-[#013F5C]/5 rounded-2xl blur-xl -z-10"
                animate={
                  reduceMotion
                    ? {}
                    : {
                        opacity: [0.2, 0.35, 0.2],
                      }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
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
