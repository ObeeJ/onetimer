import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-[#c0694b] hover:bg-[#a6583d] active:bg-[#8a4631] text-white focus-visible:ring-[#c0694b]/50",
        secondary: "bg-[#013e5c] hover:bg-[#012f46] active:bg-[#011e33] text-white focus-visible:ring-[#013e5c]/50",
        destructive: "bg-[#c0694b] hover:bg-[#a6583d] active:bg-[#8a4631] text-white focus-visible:ring-[#c0694b]/50",
        outline: "border-2 border-[#013e5c] bg-transparent hover:bg-[#013e5c] hover:text-white text-[#013e5c] focus-visible:ring-[#013e5c]/50",
        ghost: "bg-transparent hover:bg-[#013e5c]/10 text-[#013e5c] focus-visible:ring-[#013e5c]/50",
        link: "bg-transparent text-[#013e5c] underline-offset-4 hover:underline hover:text-[#012f46] focus-visible:ring-[#013e5c]/50",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
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