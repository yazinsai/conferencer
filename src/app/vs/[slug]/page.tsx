import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { defaultEvent } from "@/lib/repo/events";
import { COMPARISONS, COMPARISONS_READ_DATE, comparisonBySlug } from "@/lib/compare";
import { LinkButton } from "@/components/ui";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Band } from "@/components/marketing/pieces";

/* Hallmark · genre: modern-minimal · design-system: design.md ·
 * family: marketing (N1b nav · Ft5 footer) · typographic.
 *
 * The evidence rule (design.md § Honest copy): every row about the other
 * product is sourced from the vendor's own public pages, linked below and
 * dated; the "genuinely better" section is required, not decorative.
 */

export const dynamic = "force-dynamic";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = comparisonBySlug(slug);
  if (!c) return {};
  return {
    title: `Conferencer vs ${c.name} — an honest comparison`,
    description: `${c.name}: ${c.tagline}. Published price: ${c.price}. Conferencer is free, open-source and self-hosted. Line-by-line comparison, every figure quoted from the vendor's own pages and dated.`,
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = comparisonBySlug(slug);
  if (!c) notFound();

  const event = defaultEvent();
  const ctaHref = event ? `/e/${event.slug}` : "/sign-up";
  const ctaLabel = event ? "Open the live demo" : "Create an account";
  const others = COMPARISONS.filter((o) => o.slug !== c.slug);

  return (
    <>
      <MarketingNav links={NAV_LINKS} ctaHref={ctaHref} ctaLabel={ctaLabel} />

      {/* ------------------------------------------------ hero ----------- */}
      <section className="border-b border-rule bg-paper">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-[calc(var(--nav-height)+3rem)] sm:px-6 sm:pb-20 sm:pt-[calc(var(--nav-height)+4.5rem)]">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Link href="/vs" className="underline-offset-4 hover:text-ink hover:underline">
              Compare
            </Link>
          </p>
          <h1 className="display mt-3 max-w-[20ch] text-display-m text-ink">
            Conferencer vs {c.name}.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-neutral">
            {c.name} is {c.tagline.charAt(0).toLowerCase()}
            {c.tagline.slice(1)}. Conferencer is free, open-source software for the same job —
            the call, the review, the decisions, the onboarding, the agenda and the public site —
            that you run yourself.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href={ctaHref} variant="primary" size="lg" className="nowrap-affordance">
              {ctaLabel}
            </LinkButton>
            <LinkButton href={c.pricingUrl} size="lg" className="nowrap-affordance">
              {c.name} pricing page
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ what it costs -- */}
      <Band band="paper-2" bordered={false}>
        <div className="py-20 sm:py-24">
          <Eyebrow>What it costs</Eyebrow>
          <h2 className="display mt-3 max-w-[24ch] text-2xl text-ink sm:text-3xl">
            {c.name}: {c.price}. Conferencer: $0.
          </h2>

          <dl className="mt-12 border-t border-rule">
            <div className="grid gap-x-8 gap-y-1.5 border-b border-rule py-6 md:grid-cols-[minmax(0,10rem)_minmax(0,12rem)_minmax(0,1fr)]">
              <dt className="display text-[0.9375rem] text-ink">
                <a
                  href={c.pricingUrl}
                  className="nowrap-affordance underline-offset-4 hover:underline"
                >
                  {c.name}
                </a>
              </dt>
              <dd className="wordmark tnum text-[0.9375rem] text-ink-2">{c.price}</dd>
              <dd className="text-sm leading-relaxed text-neutral">{c.priceDetail}</dd>
            </div>
          </dl>

          <div className="mt-8 grid gap-x-8 gap-y-2 rounded-card bg-ink p-6 text-paper sm:p-8 md:grid-cols-[minmax(0,10rem)_minmax(0,12rem)_minmax(0,1fr)]">
            <p className="display text-md">Conferencer</p>
            <p className="wordmark tnum text-md">$0, always</p>
            <p className="text-sm leading-relaxed text-paper/75">
              MIT licensed and self-hosted: no plan, no per-event fee, no limit on submissions, no
              share of your revenue. Your only bill is the box it runs on, and a $5 VPS covers it.
            </p>
          </div>
        </div>
      </Band>

      {/* ------------------------------------------------ what it is ----- */}
      <Band band="paper">
        <div className="py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <Eyebrow>What {c.name} is</Eyebrow>
              <h2 className="display mt-3 max-w-[18ch] text-xl text-ink sm:text-2xl">
                {c.tagline}.
              </h2>
            </div>
            <div className="mt-4 lg:mt-0">
              <p className="max-w-[60ch] text-[0.9375rem] leading-relaxed text-neutral">
                {c.whatItIs}
              </p>
              <p className="mt-4 max-w-[60ch] text-[0.9375rem] leading-relaxed text-neutral">
                <span className="text-ink">Who it is for:</span> {c.audience}
              </p>
            </div>
          </div>
        </div>
      </Band>

      {/* ------------------------------------------------ side by side --- */}
      <Band band="paper-2">
        <div className="py-20 sm:py-24">
          <Eyebrow>Side by side</Eyebrow>
          <h2 className="display mt-3 max-w-[24ch] text-2xl text-ink sm:text-3xl">
            The same job, line by line.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[0.9375rem] leading-relaxed text-neutral">
            The {c.name} column states only what their own public pages state; the sources are
            linked at the foot of the page. The Conferencer column is checkable in the repository.
          </p>

          <div className="mt-12 border-t border-rule">
            {/* Column heads */}
            <div className="hidden gap-x-8 border-b border-rule py-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground md:grid md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_minmax(0,1fr)]">
              <span />
              <span className="text-ink">Conferencer</span>
              <span>{c.name}</span>
            </div>
            {c.rows.map((row) => (
              <div
                key={row.aspect}
                className="grid gap-x-8 gap-y-2 border-b border-rule py-5 md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_minmax(0,1fr)]"
              >
                <p className="display text-[0.9375rem] text-ink">{row.aspect}</p>
                <p className="text-sm leading-relaxed text-neutral">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                    Conferencer
                  </span>
                  {row.us}
                </p>
                <p className="text-sm leading-relaxed text-neutral">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                    {c.name}
                  </span>
                  {row.them}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Band>

      {/* ------------------------------------------------ a fair fight --- */}
      <Band band="paper">
        <div className="py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-14">
            <div>
              <Eyebrow>Where {c.name} is genuinely better</Eyebrow>
              <dl className="mt-8 space-y-7">
                {c.theirStrengths.map((s) => (
                  <div key={s.title}>
                    <dt className="display text-[0.9375rem] text-ink">{s.title}</dt>
                    <dd className="mt-1 max-w-[52ch] text-sm leading-relaxed text-neutral">
                      {s.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <Eyebrow>Where Conferencer differs</Eyebrow>
              <dl className="mt-8 space-y-7">
                {c.differences.map((d) => (
                  <div key={d.title}>
                    <dt className="display text-[0.9375rem] text-ink">{d.title}</dt>
                    <dd className="mt-1 max-w-[52ch] text-sm leading-relaxed text-neutral">
                      {d.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <p className="mt-16 max-w-[68ch] border-t border-rule pt-6 text-xs leading-relaxed text-muted-foreground">
            Sources for every claim about {c.name} on this page, read on {COMPARISONS_READ_DATE}:{" "}
            {c.sources.map((s, i) => (
              <span key={s.href}>
                {i > 0 ? " · " : ""}
                <a href={s.href} className="underline underline-offset-4 hover:text-ink">
                  {s.label}
                </a>
              </span>
            ))}
            . If a figure here has gone stale, the linked page is the truth.
          </p>
        </div>
      </Band>

      {/* ------------------------------------------------ other comparisons */}
      <Band band="paper-2">
        <div className="py-16 sm:py-20">
          <Eyebrow>Keep comparing</Eyebrow>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/vs/${o.slug}`}
                  className="nowrap-affordance text-[0.9375rem] text-ink underline underline-offset-4 hover:text-ink-2"
                >
                  Conferencer vs {o.name}
                </Link>
              </li>
            ))}
          </ul>
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
