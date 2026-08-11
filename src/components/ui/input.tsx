import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A text field that keeps its geometry in every state.
 *
 * `border-width` is 1px at rest, on hover, on focus, in error and when disabled —
 * state changes go to background, border colour and the outline, never to the
 * border's thickness, because that shifts the layout under the user's cursor.
 * The focus outline is reserved as 2px transparent at rest for the same reason.
 *
 * Height matches the button at the same size (36px in app chrome, 44px on
 * marketing and public surfaces via `data-size="lg"`); a 38px input beside a 44px
 * button is the most common form-tuning slop there is.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-input border border-input bg-background px-3 py-1 text-base md:text-sm",
        "transition-[background-color,border-color] duration-[120ms] ease-out",
        "outline-2 outline-offset-1 outline-transparent",
        "placeholder:text-muted-foreground",
        "hover:bg-muted/60",
        "focus-visible:border-ink-2 focus-visible:bg-background focus-visible:outline-ring [&:focus-visible]:transition-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-55",
        "aria-invalid:border-destructive",
        "data-[size=lg]:h-11 data-[size=lg]:px-3.5",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
