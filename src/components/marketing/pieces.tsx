import type { ReactNode } from "react";

import { cx } from "@/components/ui";
import { Icon } from "@/components/ui/icon";

/**
 * Shared parts of the marketing page. Macrostructure 05 · Workbench: real
 * product captures are the argument, so the important component here is Shot.
 */

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
}: {
  children: ReactNode;
  band?: "paper" | "paper-2" | "ink";
  className?: string;
  id?: string;
  bordered?: boolean;
  /** Only an ink band may carry a photograph, and only under a scrim. */
  photo?: { src: string; width: number; height: number };
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
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
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
