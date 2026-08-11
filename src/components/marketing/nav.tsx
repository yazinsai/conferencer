"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { buttonClass, cx } from "@/components/ui";
import { LogoMark } from "@/components/ui/logo";

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
  overMedia = false,
}: {
  links: Array<{ href: string; label: string }>;
  ctaHref: string;
  ctaLabel: string;
  /** Light type while transparent — use when the hero is photography/video. */
  overMedia?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const frame = useRef(0);
  const light = overMedia && !scrolled;

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
      // Reset the handle, not just the frame. React double-invokes effects in
      // development, and a cancelled-but-non-zero handle makes the guard below
      // swallow every subsequent scroll — the bar would never frost again.
      frame.current = 0;
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
      <div className="mx-auto grid h-[var(--nav-height)] w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link
          href="/"
          className={cx(
            "wordmark nowrap-affordance flex items-center gap-2 justify-self-start text-[0.9375rem]",
            light ? "text-paper" : "text-ink",
          )}
        >
          <LogoMark size={20} />
          Conferencer
        </Link>

        <nav aria-label="Sections" className="hidden justify-self-center lg:flex lg:items-center lg:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cx(
                "nowrap-affordance rounded-pill px-3 py-1.5 text-[0.8125rem] transition-colors duration-[120ms] ease-out",
                light
                  ? "text-paper/80 hover:bg-paper/10 hover:text-paper"
                  : "text-neutral hover:bg-paper-3 hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href="/sign-in"
            className={cx(
              buttonClass("ghost", "sm"),
              "nowrap-affordance hidden sm:inline-flex",
              light && "text-paper hover:bg-paper/10 hover:text-paper",
            )}
          >
            Sign in
          </Link>
          <Link
            href={ctaHref}
            className={cx(
              buttonClass("primary", "sm"),
              "nowrap-affordance",
              light && "border-transparent bg-paper text-ink hover:bg-paper-3",
            )}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
