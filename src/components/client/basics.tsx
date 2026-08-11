"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { buttonClass, cx, inputClass } from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

/**
 * Submit button that asks first. Every destructive action confirms
 * (Appendix B #10) — via a real dialog rather than window.confirm, so it is
 * styled, focus-trapped and keyboard-navigable.
 */
export function ConfirmSubmit({
  message,
  children,
  className,
  variant = "danger",
  size = "sm",
  name,
  value,
  "aria-label": ariaLabel,
}: {
  message: string;
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  name?: string;
  value?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const hidden = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      {/* The real submit button, clicked programmatically once confirmed, so the
          server action still receives the form (and its name/value pair). */}
      <button ref={hidden} type="submit" name={name} value={value} className="hidden" />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            className={cx(buttonClass(variant, size), className)}
          >
            {children}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonClass(variant === "danger" ? "danger" : "primary", "md")}
              onClick={() => hidden.current?.click()}
            >
              Yes, continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function CopyButton({
  value,
  label = "Copy link",
  className,
  size = "sm",
  /** Copy the value as-is (tokens, secrets, snippets) instead of resolving a site-relative URL. */
  raw = false,
  "aria-label": ariaLabel,
}: {
  value: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
  raw?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cx(buttonClass("secondary", size), className)}
      onClick={async () => {
        const text =
          raw || value.startsWith("http") ? value : `${window.location.origin}${value}`;
        try {
          await navigator.clipboard.writeText(text);
          toast.success("Copied to your clipboard", {
            description: raw && text.length > 48 ? `${text.slice(0, 12)}…${text.slice(-4)}` : text,
          });
        } catch {
          window.prompt(raw ? "Copy this value" : "Copy this link", text);
        }
      }}
    >
      {label}
    </button>
  );
}

/** Truncated text with an in-place expander (EMB-01 "Show more"). */
export function ShowMore({
  text,
  limit = 220,
  className,
}: {
  text: string;
  limit?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const clean = (text ?? "").trim();
  if (clean.length <= limit) return <p className={className}>{clean}</p>;
  return (
    <div className={className}>
      <p>
        {open ? clean : `${clean.slice(0, limit).trimEnd()}…`}{" "}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        >
          {open ? "Show less" : "Show more"}
        </button>
      </p>
    </div>
  );
}

/** URL-driven search box: types into ?<param>= and re-renders on the server. */
export function SearchBox({
  param = "q",
  placeholder = "Search…",
  className,
  label,
  autoFocus,
}: {
  param?: string;
  placeholder?: string;
  className?: string;
  label?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get(param) ?? "";
  const input = useRef<HTMLInputElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(next: string) {
    const sp = new URLSearchParams(params.toString());
    if (next) sp.set(param, next);
    else sp.delete(param);
    sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <form
      role="search"
      className={cx("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        push(input.current?.value ?? "");
      }}
    >
      {label ? (
        <label htmlFor={`search-${param}`} className="sr-only">
          {label}
        </label>
      ) : null}
      <input
        id={`search-${param}`}
        key={current}
        ref={input}
        type="search"
        name={param}
        autoFocus={autoFocus}
        defaultValue={current}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className={cx(inputClass, "pr-16")}
        onChange={(e) => {
          const next = e.target.value;
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => push(next), 320);
        }}
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        Search
      </button>
    </form>
  );
}

/** <select> that navigates on change — used for every filter dropdown. */
export function FilterSelect({
  param,
  options,
  label,
  allLabel = "All",
  className,
}: {
  param: string;
  options: Array<{ value: string; label: string }>;
  label: string;
  allLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get(param) ?? "";
  return (
    <span className={cx("inline-flex items-center gap-1.5", className)}>
      <label htmlFor={`filter-${param}`} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        id={`filter-${param}`}
        className={cx(inputClass, "h-8 w-auto py-0 text-xs")}
        value={value}
        onChange={(e) => {
          const sp = new URLSearchParams(params.toString());
          if (e.target.value) sp.set(param, e.target.value);
          else sp.delete(param);
          sp.delete("page");
          router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
        }}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}

/** Popover used for filter panels, the columns picker and saved views. */
export function Disclosure({
  label,
  children,
  className,
  align = "left",
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <Popover>
      <PopoverTrigger className={cx(buttonClass("secondary", "sm"), className)}>
        {label}
      </PopoverTrigger>
      <PopoverContent
        align={align === "right" ? "end" : "start"}
        className="w-auto min-w-56 max-w-[min(92vw,26rem)] p-3"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
