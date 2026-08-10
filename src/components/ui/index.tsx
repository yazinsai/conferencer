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
 * The application's design system, built on shadcn/ui primitives.
 *
 * Everything the app renders goes through this module, so the whole product can
 * be restyled from one place. Two deliberate departures from stock shadcn:
 *
 *  1. `Select` and checkboxes stay **native elements**. Every form here posts to a
 *     server action with progressive enhancement, and a native control submits its
 *     value without JavaScript. It is also far more reliable for keyboard users and
 *     for the automated agents that evaluate this product.
 *  2. `SubNav` is a set of links, not stateful tabs, because every list view is
 *     URL-driven and must survive a reload and a shared link.
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
  "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600/30";

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
    <ShadLabel htmlFor={htmlFor} className="mb-1 block">
      <span className="flex flex-col gap-0.5">
        <span>
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
 */
export const inputClass =
  "flex h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

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
        "appearance-none bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat pr-8",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%222%22 stroke=%22%236b7280%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]",
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
  return (
    <div>
      <Label htmlFor={name} required={required} hint={hint}>
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

const NOTICE_TONES = {
  info: "border-sky-200 bg-sky-50 text-sky-900 [&>svg]:text-sky-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-destructive/30 bg-destructive/5 text-destructive",
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
    <Alert className={cn(NOTICE_TONES[tone], className)}>
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
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
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
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
      <div className="min-w-0">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description ? (
          <CardDescription className="mt-0.5 text-xs">{description}</CardDescription>
        ) : null}
      </div>
      {actions ? <CardAction className="flex items-center gap-2">{actions}</CardAction> : null}
    </div>
  );
}

export { CardContent };

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
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {breadcrumb ? (
          <div className="mb-1 text-xs text-muted-foreground">{breadcrumb}</div>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
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
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/* ----------------------------------------------------------------- chips -- */

const CHIP_TONES = {
  slate: "border-transparent bg-muted text-muted-foreground",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-destructive/20 bg-destructive/10 text-destructive",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
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
        className={cn("gap-1", className)}
        style={{
          backgroundColor: `${color}18`,
          color: shade(color),
          borderColor: `${color}44`,
        }}
      >
        {children}
      </Badge>
    );
  }
  return (
    <Badge title={title} variant="outline" className={cn(CHIP_TONES[tone], className)}>
      {children}
    </Badge>
  );
}

function shade(hex: string): string {
  // Darken a hex colour a touch so text on the tinted chip stays readable.
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const rgb = [1, 2, 3].map((i) => Math.round(parseInt(m[i], 16) * 0.62));
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
    <div className={cn("overflow-x-auto rounded-xl border border-border bg-card", className)}>
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
        "h-auto whitespace-nowrap border-b border-border bg-muted/50 px-3 py-2 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
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
      className={cn("border-b border-border/60 px-3 py-2 align-top", className)}
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
      className={cn("shrink-0 ring-1 ring-border", className)}
    >
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback
        style={{ fontSize: Math.max(10, size * 0.36) }}
        className="bg-primary/10 font-semibold text-primary"
      >
        {initials}
      </AvatarFallback>
    </ShadAvatar>
  );
}

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
    brand: "text-primary",
    green: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-destructive",
  } as const;
  const body = (
    <>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 text-2xl font-semibold", tone ? tones[tone] : undefined)}>
        {value}
      </div>
      {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
    </>
  );
  const cls = "block rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-shadow";
  return href ? (
    <Link href={href} className={cn(cls, "hover:border-primary/40 hover:shadow")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Progress({ value, max = 100 }: { value: number; max?: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return <ShadProgress value={pct} className="h-2" />;
}

export function SubNav({
  items,
  current,
}: {
  items: Array<{ href: string; label: string; count?: number }>;
  current: string;
}) {
  return (
    <nav className="mb-4 flex flex-wrap gap-1 border-b border-border" aria-label="Views">
      {items.map((item) => {
        const active = item.href === current;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                  active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
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
