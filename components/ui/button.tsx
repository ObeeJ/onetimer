import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#004AAD] hover:bg-[#003080] text-white shadow-sm focus-visible:ring-[#004AAD]/50",
        accent: "bg-[#FF7A00] hover:bg-[#E56A00] text-white shadow-sm focus-visible:ring-[#FF7A00]/50",
        destructive: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:ring-red-600/50",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-sm focus-visible:ring-slate-600/50",
        secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 shadow-sm focus-visible:ring-slate-600/50",
        ghost: "hover:bg-slate-100 text-slate-900 focus-visible:ring-slate-600/50",
        link: "text-[#004AAD] underline-offset-4 hover:underline focus-visible:ring-[#004AAD]/50",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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