"use client";

import * as React from "react";

/**
 * React's `<ViewTransition>`, typed and made optional.
 *
 * Next aliases `react` to its own bundled copy (`next/dist/compiled/react`, see
 * `create-compiler-aliases.js`), and that copy exports `ViewTransition` — but
 * `@types/react@19` does not declare it, so importing it directly fails
 * `npm run typecheck`. Reaching for it through the namespace keeps the types
 * honest, and the `?? fragment` fallback means a React without it degrades to an
 * instant swap rather than a build error.
 *
 * Two of the eleven marketing motion primitives ride on this (design.md § Motion
 * · marketing surfaces, items 5 and 6):
 *
 *   · a **morph**, when a talk moves from the tray into a grid cell — pass a
 *     stable `name` on both sides and update state inside `startTransition`;
 *   · a **crossfade**, when a panel is replaced — pass a `key` that changes.
 *
 * `default="none"` matters on every named use: without it, every named transition
 * on the page animates whenever any transition runs anywhere on the page.
 */
type ViewTransitionProps = {
  children: React.ReactNode;
  name?: string;
  share?: string;
  enter?: string;
  exit?: string;
  default?: string;
};

const Impl = (React as unknown as { ViewTransition?: React.ComponentType<ViewTransitionProps> })
  .ViewTransition;

export function ViewTransition({ children, ...rest }: ViewTransitionProps) {
  if (!Impl) return <>{children}</>;
  return <Impl {...rest}>{children}</Impl>;
}

/** True when the browser will actually animate a view transition. */
export function supportsViewTransitions(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof (document as Document & { startViewTransition?: unknown }).startViewTransition ===
      "function"
  );
}
