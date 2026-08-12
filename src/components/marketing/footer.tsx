import Link from "next/link";

import { COMPARISONS } from "@/lib/compare";
import { LogoMark } from "@/components/ui/logo";

/**
 * Ft5 — the statement footer over photography, shared by every marketing page
 * (design.md § Macrostructure families, § rule 8.4: the fourth sanctioned
 * photograph is an empty hall, because the closing argument is permanence).
 * The scrim contract holds: the gradient lives on the background and the
 * surface flips its text in the same rule.
 */
export function MarketingFooter({
  ctaHref,
  ctaLabel,
  eventName,
  eventHref,
  showCompareLinks = false,
}: {
  ctaHref: string;
  ctaLabel: string;
  eventName?: string;
  eventHref?: string;
  /** Renders the strip of /compare links above the meta row (used on `/`). */
  showCompareLinks?: boolean;
}) {
  return (
    <footer
      data-scrim
      className="relative isolate overflow-hidden border-t border-rule bg-ink text-paper"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed local
          asset, eager because it is the closing surface. */}
      <img
        src="/media/hall.webp"
        alt=""
        width={2000}
        height={1125}
        loading="eager"
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,var(--color-ink)_0%,color-mix(in_oklch,var(--color-ink)_92%,transparent)_55%,color-mix(in_oklch,var(--color-ink)_72%,transparent)_100%)]"
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <p className="display max-w-[16ch] text-display-s">Rent nothing. Own the programme.</p>
        <p className="mt-5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-paper/75">
          Clone it, run it, fork it, never pay for it. One container, one volume, and a conference
          you can back up with{" "}
          <code className="wordmark rounded-md bg-paper/10 px-1.5 py-0.5 text-[0.85em] text-paper">
            cp
          </code>
          .
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          {/* On ink, the primary's own fill disappears, so the pair inverts:
              paper fill for the verb, a paper hairline for the alternative. */}
          <Link
            href={ctaHref}
            className="nowrap-affordance inline-flex h-11 items-center rounded-pill bg-paper px-6 text-[0.9375rem] font-medium text-ink transition-colors duration-[120ms] ease-out hover:bg-paper-3 active:translate-y-px"
          >
            {ctaLabel}
          </Link>
          <Link
            href="https://github.com/yazinsai/conferencer"
            className="nowrap-affordance inline-flex h-11 items-center rounded-pill border border-paper/30 px-6 text-[0.9375rem] font-medium text-paper transition-colors duration-[120ms] ease-out hover:border-paper/60 active:translate-y-px"
          >
            Read the source
          </Link>
        </div>

        <div className="mt-16 border-t border-paper/20 pt-6 text-xs text-paper/65">
          {showCompareLinks ? (
            <nav aria-label="Compare Conferencer with other tools" className="mb-8">
              <p className="text-paper/45">Compare</p>
              <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
                {COMPARISONS.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/vs/${c.slug}`}
                      className="nowrap-affordance underline-offset-4 hover:text-paper hover:underline"
                    >
                      Conferencer vs {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
            <p className="wordmark flex items-center gap-2 text-paper">
              <LogoMark size={18} />
              Conferencer
            </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/vs"
              className="nowrap-affordance underline-offset-4 hover:text-paper hover:underline"
            >
              Compare
            </Link>
            <Link
              href="/api-docs"
              className="nowrap-affordance underline-offset-4 hover:text-paper hover:underline"
            >
              API reference
            </Link>
            <a
              href="https://github.com/yazinsai/conferencer"
              className="nowrap-affordance underline-offset-4 hover:text-paper hover:underline"
            >
              Source
            </a>
            {eventName && eventHref ? (
              <Link
                href={eventHref}
                className="nowrap-affordance underline-offset-4 hover:text-paper hover:underline"
              >
                {eventName}
              </Link>
            ) : null}
            <span>MIT</span>
          </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
