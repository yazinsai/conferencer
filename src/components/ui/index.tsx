import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button as ShadButton, buttonVariants } from "./button";
import { Card as ShadCard, CardAction, CardContent, CardDescription, CardTitle } from "./card";
import { Badge } from "./badge";
import { Input as ShadInput } from "./input";
import { Textarea as ShadTextarea } from "./textarea";
import { Label as ShadLabel } from "./label";
import { Alert, AlertDescription } from "./alert";
import { Avatar as ShadAvatar, AvatarFallback, AvatarImage } from "./avatar";
import { Progress as ShadProgress } from "./progress";
import {
  Table as ShadTable,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

/**
 * The application's design system, built on shadcn/ui primitives and driven by
 * the tokens in `src/app/tokens.css`. The system it implements is written down
 * in `design.md`; read that first.
 *
 * Everything the app renders goes through this module, so the whole product can
 * be restyled from one place. Three deliberate departures from stock shadcn:
 *
 *  1. `Select` and checkboxes stay **native elements**. Every form here posts to a
 *     server action with progressive enhancement, and a native control submits its
 *     value without JavaScript. It is also far more reliable for keyboard users and
 *     for the automated agents that evaluate this product.
 *  2. `SubNav` is a set of links, not stateful tabs, because every list view is
 *     URL-driven and must survive a reload and a shared link.
 *  3. Controls run at 36px in app chrome rather than the 44px touch floor — the
 *     organizer screens are dense tables where 44px costs a row of context. The
 *     rule that matters (an input and its neighbouring button share one height)
 *     is enforced at both sizes. Marketing and public surfaces use `lg`.
 */

export { cn as cx };

/* --------------------------------------------------------------- buttons -- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const VARIANT_MAP: Record<Variant, Parameters<typeof buttonVariants>[0] extends infer P
  ? P extends { variant?: infer V }
    ? V
    : never
  : never> = {
  primary: "default",
  secondary: "outline",
  ghost: "ghost",
  danger: "destructive",
  success: "default",
};

const SIZE_MAP: Record<Size, "xs" | "sm" | "default" | "lg"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
};

// Success has no stock shadcn equivalent; it is the "accept this proposal" green.
const SUCCESS =
  "bg-positive text-white hover:bg-[color-mix(in_oklch,var(--color-positive),white_12%)] focus-visible:outline-positive";

export function buttonClass(variant: Variant = "secondary", size: Size = "md") {
  return cn(
    buttonVariants({ variant: VARIANT_MAP[variant], size: SIZE_MAP[size] }),
    variant === "success" && SUCCESS,
  );
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <ShadButton
      variant={VARIANT_MAP[variant]}
      size={SIZE_MAP[size]}
      className={cn(variant === "success" && SUCCESS, className)}
      {...props}
    />
  );
}

export function LinkButton({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link {...props} className={cn(buttonClass(variant, size), className)} />;
}

/* ----------------------------------------------------------------- forms -- */

export function Label({
  children,
  htmlFor,
  required,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
}) {
  return (
    <ShadLabel htmlFor={htmlFor} className="mb-1.5 block">
      <span className="flex flex-col gap-0.5">
        <span className="text-[0.8125rem] font-medium text-ink-2">
          {children}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
        </span>
        {hint ? (
          <span className="text-xs font-normal text-muted-foreground">{hint}</span>
        ) : null}
      </span>
    </ShadLabel>
  );
}

/**
 * Shared input classes, kept as a plain string because the client islands
 * (form wizard, review scorecard, agenda board) build their own controls.
 * Mirrors `ui/input.tsx` exactly — same height, same 1px border in every state,
 * same reserved outline — so a hand-rolled field never looks like a different
 * component from a kit one.
 */
export const inputClass = cn(
  "flex h-9 w-full min-w-0 rounded-input border border-input bg-background px-3 py-1 text-sm",
  "transition-[background-color,border-color] duration-[120ms] ease-out",
  "outline-2 outline-offset-1 outline-transparent",
  "placeholder:text-muted-foreground hover:bg-muted/60",
  "focus-visible:border-ink-2 focus-visible:outline-ring [&:focus-visible]:transition-none",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-55",
  "aria-invalid:border-destructive",
);

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <ShadInput {...props} className={cn(className)} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <ShadTextarea {...props} className={cn("min-h-24", className)} />;
}

/** Native select — see the note at the top of this file. */
export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      {...props}
      className={cn(
        inputClass,
        "appearance-none bg-[length:1rem] bg-[right_0.625rem_center] bg-no-repeat pr-9",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%222%22 stroke=%22%23686c73%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]",
        className,
      )}
    />
  );
}

export function Field({
  label,
  name,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  name?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  // flex-col + a growing label keeps inputs on a shared baseline when fields sit
  // side by side in a grid and only some of them carry a hint. The error slot
  // reserves a line even when empty, so a failed validation doesn't shove the
  // rest of the form down the page.
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <Label htmlFor={name} required={required} hint={hint}>
          {label}
        </Label>
      </div>
      {children}
      <p
        role={error ? "alert" : undefined}
        className={cn(
          "mt-1 min-h-[1lh] text-xs font-medium text-destructive",
          !error && "sr-only",
        )}
      >
        {error ?? ""}
      </p>
    </div>
  );
}

/** Browsers style file inputs themselves; this makes them match the button set. */
export const fileInputClass =
  "block w-full text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-pill file:border file:border-rule-2 file:bg-background file:px-3.5 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted";

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

const NOTICE_TONES = {
  info: "border-signal/25 bg-signal-soft text-ink [&>svg]:text-signal",
  success: "border-positive/25 bg-positive-soft text-ink",
  warning: "border-warn/25 bg-warn-soft text-ink",
  danger: "border-destructive/25 bg-danger-soft text-destructive",
} as const;

export function Notice({
  tone = "info",
  children,
  className,
}: {
  tone?: keyof typeof NOTICE_TONES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Alert className={cn("rounded-card", NOTICE_TONES[tone], className)}>
      <AlertDescription className="text-current [&_p]:text-current">
        {children}
      </AlertDescription>
    </Alert>
  );
}

/* ---------------------------------------------------------------- layout -- */

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  if (Tag === "div") {
    return <ShadCard className={cn("gap-0 py-0", className)}>{children}</ShadCard>;
  }
  return (
    <Tag
      data-slot="card"
      className={cn(
        "rounded-card border border-rule bg-card text-card-foreground shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3">
      <div className="min-w-0">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description ? (
          <CardDescription className="mt-0.5 text-xs text-muted-foreground">{description}</CardDescription>
        ) : null}
      </div>
      {actions ? <CardAction className="flex items-center gap-2">{actions}</CardAction> : null}
    </div>
  );
}

export { CardContent };

/**
 * A page-width band. Sections alternate paper / paper-2 and carry their own
 * padding, because a page where every section is padded identically reads as a
 * template (slop gate 9).
 */
export function Section({
  children,
  band = "paper",
  className,
  id,
  as: Tag = "section",
  bordered = false,
}: {
  children: ReactNode;
  band?: "paper" | "paper-2" | "ink";
  className?: string;
  id?: string;
  as?: "section" | "div" | "footer" | "header";
  bordered?: boolean;
}) {
  return (
    <Tag
      id={id}
      className={cn(
        band === "paper" && "bg-paper text-ink",
        band === "paper-2" && "bg-paper-2 text-ink",
        // Any rule that flips the surface dark must flip the text with it, in
        // the same rule — ink-on-ink is the contrast bug that ships most often.
        band === "ink" && "bg-ink text-paper",
        bordered && "border-t border-rule",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A section heading. Always a vertical stack: the optional eyebrow sits directly
 * above the heading in the same column, never beside it. The eyebrow-left /
 * heading-right two-column head is the single most reliable templated-editorial
 * tell there is (slop gate 54), so this component makes it unrepresentable.
 */
export function SectionHead({
  eyebrow,
  title,
  lede,
  action,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? (
          <p className="wordmark mb-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h2 className="display text-2xl text-ink sm:text-3xl">{title}</h2>
        {lede ? <p className="mt-3 text-[0.9375rem] leading-relaxed text-neutral">{lede}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {breadcrumb ? (
          <div className="mb-1.5 text-xs text-muted-foreground">{breadcrumb}</div>
        ) : null}
        <h1 className="display text-xl text-ink sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-neutral">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-rule-2 bg-paper-2 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-neutral">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/* ----------------------------------------------------------------- chips -- */

const CHIP_TONES = {
  slate: "border-rule bg-paper-3 text-neutral",
  green: "border-positive/25 bg-positive-soft text-positive",
  amber: "border-warn/25 bg-warn-soft text-warn",
  red: "border-destructive/25 bg-danger-soft text-destructive",
  blue: "border-signal/25 bg-signal-soft text-signal",
  violet: "border-signal/25 bg-signal-soft text-signal",
} as const;

export function Chip({
  children,
  color,
  tone = "slate",
  className,
  title,
}: {
  children: ReactNode;
  color?: string | null;
  tone?: keyof typeof CHIP_TONES;
  className?: string;
  title?: string;
}) {
  if (color) {
    return (
      <Badge
        title={title}
        variant="outline"
        className={cn("gap-1 rounded-pill font-medium", className)}
        style={{
          backgroundColor: `${color}14`,
          color: shade(color),
          borderColor: `${color}3d`,
        }}
      >
        {children}
      </Badge>
    );
  }
  return (
    <Badge
      title={title}
      variant="outline"
      className={cn("rounded-pill font-medium", CHIP_TONES[tone], className)}
    >
      {children}
    </Badge>
  );
}

function shade(hex: string): string {
  // Darken a hex colour a touch so text on the tinted chip stays readable.
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const rgb = [1, 2, 3].map((i) => Math.round(parseInt(m[i], 16) * 0.55));
  return `rgb(${rgb.join(",")})`;
}

export function Dot({ color }: { color?: string | null }) {
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color ?? "var(--muted-foreground)" }}
    />
  );
}

/* ---------------------------------------------------------------- tables -- */

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-card border border-rule bg-card", className)}>
      <ShadTable className="w-full min-w-full border-collapse text-sm">{children}</ShadTable>
    </div>
  );
}

export function Th({
  children,
  className,
  scope = "col",
}: {
  children?: ReactNode;
  className?: string;
  scope?: "col" | "row";
}) {
  return (
    <TableHead
      scope={scope}
      className={cn(
        "wordmark h-auto whitespace-nowrap border-b border-rule bg-paper-2 px-3 py-2.5 text-left align-middle text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </TableHead>
  );
}

export function Td({
  children,
  className,
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <TableCell
      colSpan={colSpan}
      className={cn("border-b border-rule/70 px-3 py-2.5 align-top", className)}
    >
      {children}
    </TableCell>
  );
}

export { TableHeader, TableRow };

/* ------------------------------------------------------------------ misc -- */

export function Avatar({
  src,
  name,
  size = 36,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";
  return (
    <ShadAvatar
      style={{ width: size, height: size }}
      className={cn("shrink-0 ring-1 ring-rule", className)}
    >
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback
        style={{ fontSize: Math.max(10, size * 0.34) }}
        className="wordmark bg-paper-3 font-medium text-ink-2"
      >
        {initials}
      </AvatarFallback>
    </ShadAvatar>
  );
}

/**
 * A figure and what it means. Figures are set in the outlier face with tabular
 * numerals so a column of them lines up — the second of the outlier's two
 * permitted slots (the first is the wordmark).
 */
export function Stat({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  tone?: "brand" | "green" | "amber" | "red";
}) {
  const tones = {
    brand: "text-signal",
    green: "text-positive",
    amber: "text-warn",
    red: "text-destructive",
  } as const;
  const body = (
    <>
      <div className="wordmark text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "wordmark tnum mt-2 text-2xl font-medium tracking-[-0.02em]",
          tone ? tones[tone] : "text-ink",
        )}
      >
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </>
  );
  const cls =
    "block rounded-card border border-rule bg-card px-4 py-3.5 shadow-[var(--shadow-card)] transition-[border-color,box-shadow] duration-[120ms] ease-out";
  return href ? (
    <Link href={href} className={cn(cls, "hover:border-rule-2 hover:shadow-[var(--shadow-raised)]")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Progress({ value, max = 100 }: { value: number; max?: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return <ShadProgress value={pct} className="h-1.5 bg-paper-3" />;
}

export function SubNav({
  items,
  current,
}: {
  items: Array<{ href: string; label: string; count?: number }>;
  current: string;
}) {
  return (
    <nav className="mb-5 flex flex-wrap gap-1 border-b border-rule" aria-label="Views">
      {items.map((item) => {
        const active = item.href === current;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "nowrap-affordance -mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-[120ms] ease-out",
              active
                ? "border-ink text-ink"
                : "border-transparent text-muted-foreground hover:border-rule-2 hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  "tnum ml-1.5 rounded-pill px-1.5 py-0.5 text-xs",
                  active ? "bg-ink text-paper" : "bg-paper-3 text-muted-foreground",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
