import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-muted-foreground/10 text-muted-foreground ring-muted-foreground/20",
        primary: "bg-primary/10 text-primary ring-primary/20",
        accent: "bg-accent/10 text-accent ring-accent/20",
        success: "bg-success/12 text-success ring-success/25",
        warning: "bg-warning/12 text-warning ring-warning/25",
        destructive: "bg-destructive/10 text-destructive ring-destructive/20",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone, className }))} {...props} />
  )
}

export { Badge, badgeVariants }
