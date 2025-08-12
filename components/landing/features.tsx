"use client"

import { motion, useReducedMotion } from "framer-motion"
import { CheckCircle, Clock, DollarSign, Users } from "lucide-react"

const features = [
  {
    name: "Quick Surveys",
    description: "Complete surveys in just 5-15 minutes and earn points instantly.",
    icon: Clock,
  },
  {
    name: "Instant Payouts",
    description: "Withdraw your earnings directly to your bank account with no delays.",
    icon: DollarSign,
  },
  {
    name: "Verified Opportunities",
    description: "All surveys are from legitimate companies looking for genuine feedback.",
    icon: CheckCircle,
  },
  {
    name: "Growing Community",
    description: "Join over 25,000 active users earning money across Nigeria.",
    icon: Users,
  },
]

export default function Features() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 backdrop-blur-md bg-white/10 border-y border-white/20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Why Choose OneTime Survey?</h2>
          <p className="mt-4 text-lg text-white/90">Everything you need to start earning money from surveys today.</p>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0.1 : 0.8,
                delay: reduceMotion ? 0 : index * 0.1,
              }}
              viewport={{ once: true }}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{feature.name}</h3>
              <p className="mt-2 text-sm text-white/80">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
