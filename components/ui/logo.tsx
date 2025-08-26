"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  showText?: boolean
  href?: string
  className?: string
  textClassName?: string
  imageClassName?: string
  priority?: boolean
}

const sizeClasses = {
  xs: {
    image: "h-6 w-auto",
    text: "text-sm font-semibold",
    container: "gap-1.5"
  },
  sm: {
    image: "h-8 w-auto",
    text: "text-base font-semibold",
    container: "gap-2"
  },
  md: {
    image: "h-10 w-auto",
    text: "text-lg font-bold",
    container: "gap-2.5"
  },
  lg: {
    image: "h-12 w-auto",
    text: "text-xl font-bold",
    container: "gap-3"
  },
  xl: {
    image: "h-16 w-auto",
    text: "text-2xl font-bold",
    container: "gap-3"
  }
}

export function Logo({
  size = "md",
  showText = true,
  href = "/",
  className,
  textClassName,
  imageClassName,
  priority = false
}: LogoProps) {
  const sizes = sizeClasses[size]
  
  const logoContent = (
    <div className={cn("flex items-center transition-opacity duration-200 hover:opacity-90", sizes.container, className)}>
      <Image
        src="/images/onetime-logo.png"
        alt="Onetime Survey"
        width={200}
        height={80}
        className={cn(sizes.image, "object-contain", imageClassName)}
        priority={priority}
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
  {/* Removed Onetime Survey text as requested */}
    </div>
  )

  if (href) {
    return (
      <Link 
        href={href} 
        className="inline-flex transition-transform duration-200 hover:scale-105"
        aria-label="Onetime Survey - Home"
      >
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

// Alternative compact version for sidebars
export function LogoCompact({
  size = "sm",
  className,
  href = "/",
  priority = false
}: {
  size?: "xs" | "sm" | "md"
  className?: string
  href?: string
  priority?: boolean
}) {
  const sizeMap = {
    xs: "h-6 w-auto",
    sm: "h-8 w-auto", 
    md: "h-10 w-auto"
  }

  const logoContent = (
    <Image
      src="/images/onetime-logo.png"
      alt="Onetime Survey"
      width={200}
      height={80}
      className={cn(sizeMap[size], "object-contain transition-opacity duration-200 hover:opacity-90", className)}
      priority={priority}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  )

  if (href) {
    return (
      <Link 
        href={href} 
        className="inline-flex transition-transform duration-200 hover:scale-105"
        aria-label="Onetime Survey - Home"
      >
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

// Icon-only version for mobile or minimal layouts  
export function LogoIcon({
  size = "sm",
  href = "/",
  className
}: {
  size?: "xs" | "sm" | "md" | "lg"
  href?: string
  className?: string
}) {
  const sizeMap = {
    xs: "h-5 w-auto",
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-10 w-auto"
  }

  const logoContent = (
    <Image
      src="/images/onetime-logo.png"
      alt="Onetime Survey"
      width={200}
      height={80}
      className={cn(sizeMap[size], "object-contain transition-opacity duration-200 hover:opacity-90", className)}
      priority
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  )

  if (href) {
    return (
      <Link 
        href={href} 
        className="inline-flex transition-transform duration-200 hover:scale-105"
        aria-label="Onetime Survey"
      >
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
