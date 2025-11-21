import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus:ring-2 focus:ring-offset-2 active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[#C1654B] hover:bg-[#a55440] text-white shadow-lg hover:shadow-xl focus-visible:ring-[#C1654B]/50",
        secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-md hover:shadow-lg focus-visible:ring-slate-400/50 border border-slate-200/50",
        destructive: "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl focus-visible:ring-red-500/50",
        outline: "border-2 border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-slate-50 hover:border-slate-300 text-slate-700 focus-visible:ring-slate-400/50 shadow-sm hover:shadow-md",
        ghost: "bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400/50 backdrop-blur-sm",
        link: "bg-transparent text-[#013F5C] underline-offset-4 hover:underline hover:text-[#012d42] focus-visible:ring-[#013F5C]/50",
        accent: "bg-[#013F5C] hover:bg-[#012d42] text-white shadow-lg hover:shadow-xl focus-visible:ring-[#013F5C]/50",
        filler: "bg-[#013F5C] hover:bg-[#012d42] text-white shadow-lg hover:shadow-xl focus-visible:ring-[#013F5C]/50",
        creator: "bg-[#C1654B] hover:bg-[#a55440] text-white shadow-lg hover:shadow-xl focus-visible:ring-[#C1654B]/50",
        "creator-outline": "border-2 border-[#013F5C] bg-white hover:bg-[#013F5C] text-[#013F5C] hover:text-white shadow-sm hover:shadow-md focus-visible:ring-[#013F5C]/50",
        "filler-outline": "border-2 border-[#013F5C] bg-white hover:bg-[#013F5C] text-[#013F5C] hover:text-white shadow-sm hover:shadow-md focus-visible:ring-[#013F5C]/50",
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
  ({ className, variant, size, asChild = false, type = "button", children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Guard against undefined children for Slot
    if (asChild && !children) {
      return null
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={type}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }