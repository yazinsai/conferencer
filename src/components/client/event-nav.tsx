"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";

import { cx } from "@/components/ui";

/**
 * N12 — announcement banner over a retracting bar. The public event family's nav
 * archetype (see design.md § Macrostructure families).
 *
 * The banner is real content, not a promo strip: it carries the call-for-speakers
 * deadline, which is the single most time-sensitive fact on a conference site. On
 * scroll down it slides away and the bar docks to the top; on scroll up it comes
 * back. Dismissing it zeroes its height so the page reflows with no gap left.
 *
 * Everything degrades: with JavaScript off the banner simply stays put and the
 * bar stays sticky, which is the behaviour a static header would have had.
 */
export function EventNavShell({
  banner,
  bar,
}: {
  banner: React.ReactNode;
  bar: React.ReactNode;
}) {
  const [compact, setCompact] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const lastY = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    if (!banner || dismissed) return;
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const y = window.scrollY;
        if (y < 48) setCompact(false);
        else if (y > lastY.current + 4) setCompact(true);
        else if (y < lastY.current - 4) setCompact(false);
        lastY.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
      // Reset the handle, not just the frame. React double-invokes effects in
      // development, and a cancelled-but-non-zero handle makes the guard below
      // swallow every subsequent scroll — the bar would never frost again.
      frame.current = 0;
    };
  }, [banner, dismissed]);

  const showBanner = Boolean(banner) && !dismissed;

  return (
    <>
      <header
        data-compact={compact ? "" : undefined}
        className={cx(
          "fixed inset-x-0 top-0 z-[300]",
          "transition-transform duration-[320ms] ease-out",
          showBanner && compact && "-translate-y-[var(--banner-height)]",
        )}
      >
        {showBanner ? (
          <div className="flex h-[var(--banner-height)] items-center justify-center gap-3 bg-ink px-4 text-paper">
            <p className="min-w-0 truncate text-[0.8125rem]">{banner}</p>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss this announcement"
              className="shrink-0 rounded-full p-1 text-paper/70 outline-2 outline-offset-2 outline-transparent transition-colors duration-[120ms] ease-out hover:bg-paper/10 hover:text-paper focus-visible:outline-paper"
            >
              <XIcon aria-hidden className="size-3.5" />
            </button>
          </div>
        ) : null}
        <div className="border-b border-rule bg-paper/85 backdrop-blur-md">{bar}</div>
      </header>
      {/* Spacer: the header is fixed, so the document needs its height back. */}
      <div
        aria-hidden
        style={{
          height: showBanner
            ? "calc(var(--banner-height) + var(--nav-height))"
            : "var(--nav-height)",
        }}
      />
    </>
  );
}
