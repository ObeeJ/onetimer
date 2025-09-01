import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#c0694b] to-[#a6583d] hover:from-[#a6583d] hover:to-[#8a4631] text-white shadow-lg hover:shadow-xl focus-visible:ring-[#c0694b]/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        secondary: "bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 shadow-md hover:shadow-lg focus-visible:ring-slate-400/50 border border-slate-200/50",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl focus-visible:ring-red-500/50",
        outline: "border-2 border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-slate-50 hover:border-slate-300 text-slate-700 focus-visible:ring-slate-400/50 shadow-sm hover:shadow-md",
        ghost: "bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400/50 backdrop-blur-sm",
        link: "bg-transparent text-[#013e5c] underline-offset-4 hover:underline hover:text-[#012f46] focus-visible:ring-[#013e5c]/50",
        accent: "bg-gradient-to-r from-[#013e5c] to-[#012f46] hover:from-[#012f46] hover:to-[#011e33] text-white shadow-lg hover:shadow-xl focus-visible:ring-[#013e5c]/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }