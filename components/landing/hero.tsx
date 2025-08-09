"use client"

import type React from "react"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { usePwaInstall } from "@/hooks/use-pwa-install"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Hero() {
  const reduceMotion = useReducedMotion()
  const { canInstall, promptInstall, isStandalone } = usePwaInstall()

  return (
    <section className="relative overflow-hidden">
      {/* Fluid animated background blobs (brand primary + accent). Reduced motion respected. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          initial={{ x: "-10%", y: "-10%", scale: 1 }}
          animate={reduceMotion ? { opacity: 0.12 } : { x: "10%", y: "0%", scale: 1.1, opacity: 0.12 }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute left-[-10%] top-[-10%] h-[60vh] w-[60vw] rounded-[999px] bg-[#013F5C]"
          style={{ filter: "blur(60px)" }}
        />
        <motion.div
          initial={{ x: "20%", y: "30%", scale: 1 }}
          animate={reduceMotion ? { opacity: 0.12 } : { x: "-10%", y: "20%", scale: 1.15, opacity: 0.12 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute right-[-10%] bottom-[-10%] h-[55vh] w-[55vw] rounded-[999px] bg-[#C1654B]"
          style={{ filter: "blur(70px)" }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-16 sm:py-20 md:grid-cols-2 md:gap-10">
        <div className="space-y-6 text-center md:text-left">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-[#013F5C]">
            OneTime Survey
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Earn more by taking one-time surveys</h1>
          <p className="text-slate-600">
            Join thousands of Nigerians earning extra income. Simple, fast, and rewarding.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
            <Button asChild size="lg" className="h-12 rounded-2xl bg-[#C1654B] px-6 text-white hover:bg-[#b25a43]">
              <Link href="/filler/auth/sign-up">Sign Up</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-2xl border-[#013F5C] px-6 text-[#013F5C] hover:bg-[#013F5C]/5 bg-transparent"
            >
              <Link href="/filler/auth/sign-in">Sign In</Link>
            </Button>

            {/* On mobile and when PWA not installed, show Install App */}
            {!isStandalone && canInstall ? (
              <Button
                size="lg"
                className="h-12 rounded-2xl bg-[#013F5C] px-6 text-white sm:hidden"
                onClick={promptInstall}
              >
                Install App
              </Button>
            ) : null}
          </div>
          <div className="flex items-center justify-center gap-6 md:justify-start">
            <Stat label="Surveys Completed" value="120k+" />
            <Stat label="Avg. per Survey" value="₦1,000" />
          </div>
        </div>

        {/* Visual card using provided reference image on the right */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="rounded-3xl border border-slate-200/60 bg-white/70 p-4 shadow-xl backdrop-blur-xl">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
              <Image
                src="/images/landing-illustration.jpg"
                alt="Illustration of a person completing a one-time survey on a phone"
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
                priority
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <BadgePill color="#013F5C">Quick Payouts</BadgePill>
              <BadgePill color="#C1654B">One-Time</BadgePill>
              <BadgePill color="#013F5C">No Fuss</BadgePill>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  )
}

function BadgePill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
      style={{ borderColor: color, color }}
    >
      {children}
    </span>
  )
}
