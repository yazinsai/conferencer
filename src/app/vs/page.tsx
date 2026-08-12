import Link from "next/link";
import type { Metadata } from "next";

import { defaultEvent } from "@/lib/repo/events";
import { COMPARISONS, COMPARISONS_READ_DATE } from "@/lib/compare";
import { LinkButton } from "@/components/ui";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Band } from "@/components/marketing/pieces";

/* Hallmark · genre: modern-minimal · design-system: design.md ·
 * family: marketing (N1b nav · Ft5 footer) · typographic, no captures —
 * the ledger is the argument here.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare Conferencer — Sessionboard, Sessionize, pretalx and more",
  description:
    "Line-by-line comparisons of Conferencer with the major call-for-speakers and conference programme tools: Sessionboard, Sessionize, Oxford Abstracts, Ex Ordo, pretalx, PaperCall, Sched and Whova. Every figure quoted from the vendor's own public pages, linked and dated.",
};

const NAV_LINKS = [
  { href: "/#loop", label: "How it works" },
  { href: "/#tour", label: "The product" },
  { href: "/#inside", label: "Features" },
  { href: "/#price", label: "What it costs" },
  { href: "/vs", label: "Compare" },
  { href: "/api-docs", label: "API" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function CompareIndex() {
  const event = defaultEvent();
  const ctaHref = event ? `/e/${event.slug}` : "/sign-up";
  const ctaLabel = event ? "Open the live demo" : "Create an account";

  return (
    <>
      <MarketingNav links={NAV_LINKS} ctaHref={ctaHref} ctaLabel={ctaLabel} />

      {/* ------------------------------------------------ hero ----------- */}
      <section className="border-b border-rule bg-paper">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-[calc(var(--nav-height)+3rem)] sm:px-6 sm:pb-20 sm:pt-[calc(var(--nav-height)+4.5rem)]">
          <Eyebrow>Compare</Eyebrow>
          <h1 className="display mt-3 max-w-[18ch] text-display-m text-ink">
            Conferencer vs the field.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-neutral">
            Eight tools that run a call for speakers or a conference programme, compared line by
            line. Every figure and feature on these pages is quoted from the vendor&rsquo;s own
            public site, linked, and dated — and where a vendor publishes nothing, the page says
            so instead of estimating.
          </p>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            Each comparison also names where the other tool is genuinely better. A page that only
            lists our wins would be marketing, not information.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ the ledger ----- */}
      <Band band="paper-2" bordered={false}>
        <div className="py-20 sm:py-24">
          <Eyebrow>The field</Eyebrow>
          <h2 className="display mt-3 max-w-[24ch] text-2xl text-ink sm:text-3xl">
            Published prices at a glance.
          </h2>

          <dl className="mt-12 border-t border-rule">
            {COMPARISONS.map((c) => (
              <div
                key={c.slug}
                className="grid gap-x-8 gap-y-1.5 border-b border-rule py-6 md:grid-cols-[minmax(0,10rem)_minmax(0,12rem)_minmax(0,1fr)]"
              >
                <dt className="display text-[0.9375rem] text-ink">
                  <Link
                    href={`/vs/${c.slug}`}
                    className="nowrap-affordance underline-offset-4 hover:underline"
                  >
                    {c.name}
                  </Link>
                </dt>
                <dd className="wordmark tnum text-[0.9375rem] text-ink-2">{c.price}</dd>
                <dd className="text-sm leading-relaxed text-neutral">
                  {c.tagline}.{" "}
                  <Link
                    href={`/vs/${c.slug}`}
                    className="nowrap-affordance text-ink underline underline-offset-4 hover:text-ink-2"
                  >
                    Conferencer vs {c.name} →
                  </Link>
                </dd>
              </div>
            ))}
          </dl>

          {/* The last row is the argument, so it leaves the ledger entirely —
              the same device the landing page's price section uses. */}
          <div className="mt-8 grid gap-x-8 gap-y-2 rounded-card bg-ink p-6 text-paper sm:p-8 md:grid-cols-[minmax(0,10rem)_minmax(0,12rem)_minmax(0,1fr)]">
            <p className="display text-md">Conferencer</p>
            <p className="wordmark tnum text-md">$0, always</p>
            <p className="text-sm leading-relaxed text-paper/75">
              MIT licensed and self-hosted: no plan, no per-event fee, no limit on submissions, no
              share of your revenue. Your only bill is the box it runs on, and a $5 VPS covers it.
            </p>
          </div>

          <p className="mt-6 max-w-[68ch] text-xs leading-relaxed text-muted-foreground">
            Public pricing pages, read on {COMPARISONS_READ_DATE}; every comparison page links its
            sources so you can check us. Vendors change prices; if a figure here has gone stale,
            the linked page is the truth.
          </p>
        </div>
      </Band>

      {/* ------------------------------------------------ how to read ---- */}
      <Band band="paper">
        <div className="py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <Eyebrow>How to read these pages</Eyebrow>
              <h2 className="display mt-3 max-w-[16ch] text-xl text-ink sm:text-2xl">
                Sourced, dated, and fair to the other tool.
              </h2>
            </div>
            <div className="mt-4 lg:mt-0">
              <dl className="space-y-8">
                <div>
                  <dt className="display text-[0.9375rem] text-ink">Everything is checkable</dt>
                  <dd className="mt-1 max-w-[56ch] text-sm leading-relaxed text-neutral">
                    Every price and every feature claim about another product comes from that
                    vendor&rsquo;s own public pages — pricing page first, feature pages second —
                    linked at the foot of each comparison and read on {COMPARISONS_READ_DATE}.
                    Where a vendor publishes no price, the page says &ldquo;not published&rdquo;
                    rather than estimating one.
                  </dd>
                </div>
                <div>
                  <dt className="display text-[0.9375rem] text-ink">
                    The other tool gets its due
                  </dt>
                  <dd className="mt-1 max-w-[56ch] text-sm leading-relaxed text-neutral">
                    Every page carries a &ldquo;where they are genuinely better&rdquo; section.
                    Sessionize has a speaker network, pretalx will host for you, Sched sells the
                    attendee half of the event. If one of them fits your conference better, these
                    pages should help you notice.
                  </dd>
                </div>
                <div>
                  <dt className="display text-[0.9375rem] text-ink">
                    Our side is checkable too
                  </dt>
                  <dd className="mt-1 max-w-[56ch] text-sm leading-relaxed text-neutral">
                    Everything claimed for Conferencer is in the repository: the source, the
                    schema, and a seeded demo conference you can click through.{" "}
                    <Link
                      href="/"
                      className="text-ink underline underline-offset-4 hover:text-ink-2"
                    >
                      Back to the landing page →
                    </Link>
                  </dd>
                </div>
              </dl>

              <div className="mt-10 flex flex-wrap gap-3">
                <LinkButton href={ctaHref} variant="primary" size="lg" className="nowrap-affordance">
                  {ctaLabel}
                </LinkButton>
                <LinkButton
                  href="https://github.com/yazinsai/conferencer"
                  size="lg"
                  className="nowrap-affordance"
                >
                  Read the source
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </Band>

      <MarketingFooter
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        eventName={event?.name}
        eventHref={event ? `/e/${event.slug}` : undefined}
      />
    </>
  );
}
