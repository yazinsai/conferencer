import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * The CTA voice of the design system (see design.md § CTA voice): a pill, an ink
 * fill for primary, a hairline outline for secondary.
 *
 * Eight states are styled, not two: default · hover · focus-visible · active ·
 * disabled · loading · error · success. The last three hang off `data-state` and
 * `aria-invalid` so a server-action form can drive them without JavaScript.
 *
 * Two deliberate departures from stock shadcn:
 *   - the focus ring is an `outline`, reserved at 2px transparent at rest, so
 *     activating it can never shift geometry, and it is never transitioned;
 *   - `transition-all` is replaced with a named property list.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-1.5",
    "rounded-pill border border-transparent bg-clip-padding",
    "font-medium whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-[120ms] ease-out",
    // Focus: an outline, reserved so it costs no layout when it appears, and
    // never animated — a ring that fades in leaves keyboard users blind to it.
    "outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring [&:focus-visible]:transition-none",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-55",
    // Error / loading / success, driven by attributes rather than extra classes.
    "aria-invalid:border-destructive aria-invalid:text-destructive",
    "data-[state=loading]:pointer-events-none data-[state=loading]:opacity-70",
    "data-[state=success]:border-positive/40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),white_14%)]",
        outline:
          "border-rule-2 bg-background text-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_6%)] aria-expanded:bg-secondary",
        ghost: "text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive:
          "border-destructive/25 bg-destructive/8 text-destructive hover:bg-destructive/15 focus-visible:outline-destructive",
        link: "rounded-none px-0 text-foreground underline decoration-rule-2 underline-offset-4 hover:decoration-current",
      },
      size: {
        // App chrome runs at 36px — see design.md § Per-page allowances. Marketing
        // and public surfaces use `lg`, which is the 44px touch-target floor.
        default: "h-9 px-3.5 text-sm",
        xs: "h-7 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 px-5 text-[0.9375rem]",
        icon: "size-9",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
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
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
