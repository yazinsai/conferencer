"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";

import { buttonClass, cx, inputClass } from "@/components/ui";

/** Submit button that asks first. Every destructive action confirms (Appendix B #10). */
export function ConfirmSubmit({
  message,
  children,
  className,
  variant = "danger",
  size = "sm",
  name,
  value,
}: {
  message: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  name?: string;
  value?: string;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={cx(buttonClass(variant, size), className)}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function CopyButton({
  value,
  label = "Copy link",
  className,
  size = "sm",
}: {
  value: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={cx(buttonClass("secondary", size), className)}
      onClick={async () => {
        const absolute = value.startsWith("http")
          ? value
          : `${window.location.origin}${value}`;
        try {
          await navigator.clipboard.writeText(absolute);
        } catch {
          window.prompt("Copy this link", absolute);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? "Copied!" : label}
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
          className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
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
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
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
      <label htmlFor={`filter-${param}`} className="text-xs font-medium text-slate-500">
        {label}
      </label>
      <select
        id={`filter-${param}`}
        className={cx(inputClass, "w-auto py-1.5 text-xs")}
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

/** Small disclosure used for filter panels and overflow menus. */
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
    <details className={cx("relative", className)}>
      <summary
        className={cx(
          buttonClass("secondary", "sm"),
          "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
        )}
      >
        {label}
      </summary>
      <div
        className={cx(
          "absolute z-30 mt-1 min-w-56 rounded-md border border-slate-200 bg-white p-3 shadow-lg",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        {children}
      </div>
    </details>
  );
}
