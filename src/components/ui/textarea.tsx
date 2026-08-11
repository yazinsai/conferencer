import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Same state contract as Input: 1px border in every state, the focus ring
        // is a reserved outline, and it never transitions.
        "flex field-sizing-content min-h-24 w-full resize-y rounded-input border border-input bg-background px-3 py-2 text-base md:text-sm",
        "transition-[background-color,border-color] duration-[120ms] ease-out",
        "outline-2 outline-offset-1 outline-transparent",
        "placeholder:text-muted-foreground",
        "hover:bg-muted/60",
        "focus-visible:border-ink-2 focus-visible:bg-background focus-visible:outline-ring [&:focus-visible]:transition-none",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-55",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
