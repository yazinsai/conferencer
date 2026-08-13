import Link from "next/link";
import type { ReactNode } from "react";

import { Chip, cx } from "@/components/ui";
import { Icon } from "@/components/ui/icon";

/**
 * Shared parts of the marketing pages.
 *
 * `/` is Macrostructure 01 · Bento Grid with **live product tiles** — the running
 * product is the argument, so the important components here are Tile and
 * Playable. `/vs/**` is still 05 · Workbench, where the argument is a sourced
 * ledger and the enrichment is a real capture, so Shot stays exactly as it was.
 * See design.md § Macrostructure families and § Live product tiles.
 */

/** The vertical rhythm steps. No two consecutive sections share one (gate 9). */
const PAD = {
  md: "py-16 sm:py-20",
  lg: "py-20 sm:py-28",
  xl: "py-24 sm:py-32",
  "2xl": "py-28 sm:py-40",
} as const;

/**
 * A page band. Sections alternate paper / paper-2 and set their own vertical
 * rhythm — a page where every section is padded identically reads as a template.
 */
export function Band({
  children,
  band = "paper",
  className,
  id,
  bordered = true,
  photo,
  pad,
}: {
  children: ReactNode;
  band?: "paper" | "paper-2" | "ink";
  className?: string;
  id?: string;
  bordered?: boolean;
  /** Only an ink band may carry a photograph, and only under a scrim. */
  photo?: { src: string; width: number; height: number };
  /** Vertical rhythm. Omit and the caller pads the inner element itself. */
  pad?: keyof typeof PAD;
}) {
  return (
    <section
      id={id}
      data-scrim={photo ? "" : undefined}
      className={cx(
        // Any rule that flips the surface dark flips the text with it, in the
        // same rule. Inheriting ink onto ink is the contrast bug that ships most.
        band === "paper" && "bg-paper text-ink",
        band === "paper-2" && "bg-paper-2 text-ink",
        band === "ink" && "bg-ink text-paper",
        photo && "relative isolate overflow-hidden",
        bordered && band !== "ink" && "border-t border-rule",
        className,
      )}
    >
      {photo && band === "ink" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- see Shot below. */}
          <img
            src={photo.src}
            alt=""
            width={photo.width}
            height={photo.height}
            // The band is the second section, inside the first viewport on a
            // laptop, so it is not a lazy-load candidate.
            loading="eager"
            decoding="async"
            className="absolute inset-0 -z-10 size-full object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,var(--color-ink)_0%,color-mix(in_oklch,var(--color-ink)_90%,transparent)_60%,color-mix(in_oklch,var(--color-ink)_74%,transparent)_100%)]"
          />
        </>
      ) : null}
      <div className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6", pad && PAD[pad])}>{children}</div>
    </section>
  );
}

/**
 * A section head: centred, six words or fewer, one sentence of lede beneath.
 *
 * Centring is `/`-only and deliberate (design.md allowance 10) — it is what gives
 * the page air, and it is what the studied reference does. There is no eyebrow
 * slot: eyebrows were on eight of nine sections here, which made every section
 * look like the same section, and a centred head carries itself (design.md
 * § Marketing voice). Gate 54 bans the tag-left/heading-right two-column head,
 * which this is not.
 */
export function Head({
  title,
  lede,
  className,
  size = "md",
}: {
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className={cx("hm-reveal mx-auto max-w-3xl text-center", className)}>
      <h2
        className={cx(
          "display mx-auto max-w-[22ch] text-balance text-ink",
          size === "lg" ? "text-display-s" : "text-2xl sm:text-3xl",
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p className="mx-auto mt-4 max-w-[58ch] text-pretty text-md leading-relaxed text-neutral">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

/**
 * One cell of the bento. Mixed spans are the grid's rhythm, so `span` is the
 * knob that matters; tracks are declared `minmax(0, 1fr)` by the parent so an
 * over-wide child scrolls inside its own cell rather than pushing the viewport
 * sideways (gate 50).
 */
export function Tile({
  children,
  title,
  body,
  span = "1x1",
  className,
  bare = false,
}: {
  children?: ReactNode;
  title?: ReactNode;
  body?: ReactNode;
  span?: "1x1" | "2x1" | "1x2" | "2x2";
  className?: string;
  /** Skip the padded header/body frame — the child owns the whole tile. */
  bare?: boolean;
}) {
  return (
    <article
      className={cx(
        "hm-reveal hm-lift flex min-w-0 flex-col overflow-hidden rounded-tile border border-rule bg-paper shadow-[var(--shadow-tile)]",
        span === "2x1" && "sm:col-span-2",
        span === "1x2" && "lg:row-span-2",
        span === "2x2" && "sm:col-span-2 lg:row-span-2",
        className,
      )}
    >
      {title ? (
        <div className="min-w-0 p-5 pb-0 sm:p-6 sm:pb-0">
          <h3 className="display text-md text-ink">{title}</h3>
          {body ? (
            <p className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-neutral">{body}</p>
          ) : null}
        </div>
      ) : null}
      <div className={cx("min-w-0 flex-1", bare ? (title ? "mt-4" : "") : "p-5 sm:p-6")}>
        {children}
      </div>
    </article>
  );
}

/**
 * The frame every playable sits in.
 *
 * design.md § Live product tiles rules 3 and 5 are enforced here rather than
 * trusted: `note` and `href` are required props, so a tile cannot ship without
 * saying what the real screen does that it does not, and without a way to go and
 * look at that screen. The chip is the one place the signal colour appears on
 * this page, and it is doing work — it tells a reader the panel is not a picture.
 */
export function Playable({
  children,
  note,
  href,
  hrefLabel,
  hint,
  className,
}: {
  children: ReactNode;
  /** What the real screen does that this panel does not. One sentence. */
  note: ReactNode;
  /** The real screen, in the demo. */
  href: string;
  hrefLabel: string;
  /** What to do with it, shown beside the chip. */
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("min-w-0", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Chip tone="blue">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-signal" />
            Live
          </span>
        </Chip>
        {hint ? <p className="min-w-0 text-sm text-neutral">{hint}</p> : null}
      </div>

      {children}

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {note}{" "}
        <Link
          href={href}
          className="nowrap-affordance text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
        >
          {hrefLabel} <span aria-hidden>→</span>
        </Link>
      </p>
    </div>
  );
}

/**
 * A hairline row of repository facts.
 *
 * This occupies the slot the studied reference fills with a customer logo strip.
 * Conferencer has no customers to name, and an invented logo would make every
 * checkable claim beside it stop being believed (design.md § Honest copy). Every
 * item here is true of this repository and checkable in it.
 */
export function FactStrip({ items }: { items: readonly string[] }) {
  return (
    <ul className="hm-reveal flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-8">
      {items.map((item) => (
        <li
          key={item}
          className="wordmark text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * A real screenshot of the product, in a hairline figure with a caption.
 *
 * No browser chrome is drawn around it: the reader already has a browser, and a
 * hand-built URL pill with traffic-light dots is one of the strongest tells that
 * an interface was invented rather than photographed.
 */
export function Shot({
  src,
  alt,
  caption,
  priority = false,
  className,
  width = 1200,
  height = 760,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className={cx("min-w-0", className)}>
      <div className="overflow-hidden rounded-card border border-rule bg-paper shadow-[var(--shadow-raised)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- the captures are
            fixed-size local assets; next/image would add a runtime optimiser for
            no benefit and this page must render in one server pass. */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          decoding={priority ? "sync" : "async"}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="block h-auto w-full"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Conversational FAQ, built on native <details>. No client bundle, no focus trap
 * to get wrong, and it opens with JavaScript switched off — which is the same
 * contract every form in this product already keeps.
 */
export function Faq({ items }: { items: Array<{ q: string; a: ReactNode }> }) {
  return (
    <div className="border-t border-rule">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-rule">
          <summary
            className={cx(
              "flex cursor-pointer list-none items-center justify-between gap-6 py-5",
              "text-[0.9375rem] font-medium text-ink outline-2 outline-offset-2 outline-transparent",
              "focus-visible:outline-ring [&::-webkit-details-marker]:hidden",
            )}
          >
            <span className="min-w-0">{item.q}</span>
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-rule text-muted-foreground transition-transform duration-[180ms] ease-out group-open:rotate-180">
              <Icon name="chevronDown" size={16} />
            </span>
          </summary>
          <div className="max-w-[68ch] pb-5 text-[0.9375rem] leading-relaxed text-neutral">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}
