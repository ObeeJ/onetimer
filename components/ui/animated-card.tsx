"use client"

import { motion } from "framer-motion"
import { Card, CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends CardProps {
  delay?: number
  hover?: boolean
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0, 
  hover = true,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? { 
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
    >
      <Card 
        className={cn(
          "transition-shadow duration-200",
          hover && "hover:shadow-lg",
          className
        )} 
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
}

export function StaggeredCards({ 
  children, 
  className,
  staggerDelay = 0.1 
}: {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: index * staggerDelay,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}