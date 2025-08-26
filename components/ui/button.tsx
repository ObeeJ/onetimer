import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#013f5c] text-white hover:bg-[#024a6b] focus:ring-[#013f5c]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
        outline:
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        link: "text-[#013f5c] underline-offset-4 hover:underline focus:ring-[#013f5c]",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-8 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-4 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
