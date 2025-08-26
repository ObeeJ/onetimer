"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        {/* Crisp SVG grid for sharp lines on all resolutions */}
        <svg
          className="absolute inset-0 w-full h-full -z-10 opacity-30 landing-grid-svg"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0 L0 0 0 10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            </pattern>
            <linearGradient id="gridFade" x1="0" x2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#gridFade)" opacity="0.3" />
        </svg>

        {/* Subtle animated blobs behind the grid */}
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />

        <motion.div
          className="absolute inset-0 opacity-12"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
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
            duration: 22,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        <div className="absolute inset-0 backdrop-blur-md bg-white/6 border-t border-white/10" />
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
        </motion.div>
      </div>
    </section>
  )
}
