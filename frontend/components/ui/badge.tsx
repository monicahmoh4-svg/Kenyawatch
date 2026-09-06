import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
  variants: {
    variant: { default: "border-transparent bg-primary text-primary-foreground", secondary: "border-transparent bg-secondary text-secondary-foreground", destructive: "border-transparent bg-destructive text-destructive-foreground", outline: "text-foreground", documented: "border-green-300 bg-green-100 text-green-800", live_sync: "border-blue-300 bg-blue-100 text-blue-800", manual_scan: "border-yellow-300 bg-yellow-100 text-yellow-800", reference: "border-red-300 bg-red-100 text-red-800", risk_low: "border-green-300 bg-green-100 text-green-800", risk_medium: "border-yellow-300 bg-yellow-100 text-yellow-800", risk_high: "border-orange-300 bg-orange-100 text-orange-800", risk_critical: "border-red-300 bg-red-100 text-red-800" }
  }, defaultVariants: { variant: "default" }
})
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) { return <div className={cn(badgeVariants({ variant }), className)} {...props} /> }
export { Badge, badgeVariants }