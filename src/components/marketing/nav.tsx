"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { buttonClass, cx } from "@/components/ui";

/**
 * N1b — the canonical SaaS three-section bar: wordmark hard-left, a centred
 * cluster of section links, sign-in plus the filled CTA hard-right. The
 * marketing family's nav archetype (see design.md § Macrostructure families).
 *
 * Transparent over the hero at rest, frosting past 24px of scroll. That frost is
 * one of the three motion primitives the whole product is allowed; the handler is
 * rAF-throttled and passive.
 *
 * The centre cluster is hidden below 900px rather than wrapped — a nav link that
 * breaks onto a second line reads as a styling error.
 */
export function MarketingNav({
  links,
  ctaHref,
  ctaLabel,
}: {
  links: Array<{ href: string; label: string }>;
  ctaHref: string;
  ctaLabel: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-[300] border-b",
        "transition-[background-color,border-color,box-shadow] duration-[180ms] ease-out",
        scrolled
          ? "border-rule bg-paper/80 shadow-[var(--shadow-nav)] backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto grid h-[var(--nav-height)] w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="wordmark nowrap-affordance justify-self-start text-[0.9375rem] text-ink">
          Conferencer
        </Link>

        <nav aria-label="Sections" className="hidden justify-self-center lg:flex lg:items-center lg:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nowrap-affordance rounded-pill px-3 py-1.5 text-[0.8125rem] text-neutral transition-colors duration-[120ms] ease-out hover:bg-paper-3 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href="/sign-in"
            className={cx(buttonClass("ghost", "sm"), "nowrap-affordance hidden sm:inline-flex")}
          >
            Sign in
          </Link>
          <Link href={ctaHref} className={cx(buttonClass("primary", "sm"), "nowrap-affordance")}>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
