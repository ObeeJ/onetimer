"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface AnimatedLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function AnimatedLogo({ className = "", size = "md" }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-12 w-auto"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className={`cursor-pointer ${className}`}
    >
      <Image
        src="/Logo.png"
        alt="Onetime Survey"
        width={256}
        height={256}
        priority
        quality={100}
        className={`${className || sizeClasses[size]} transition-all duration-300`}
      />
    </motion.div>
  )
}