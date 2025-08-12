"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTA() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 backdrop-blur-md bg-white/10 border-t border-white/20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Start Earning?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
            Join thousands of Nigerians who are already earning extra income. Sign up today and complete your first
            survey in minutes.
          </p>
          <div className="mt-10">
            <Button
              asChild
              className="min-h-[48px] px-4 py-2 rounded-lg bg-[#013f5c] text-white font-medium hover:bg-[#012f49]"
            >
              <Link href="/filler/auth/sign-up">Get Started Now</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
