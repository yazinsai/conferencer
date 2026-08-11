<!-- Hallmark · design system · studied: yes · DNA-source: image (user-supplied reference)
     genre: modern-minimal · designed-as-app · produced by `hallmark redesign` (multi-page flow) -->

# Design — Conferencer

A locked design system for this app. Every page redesign reads this file before emitting code.
Do not regenerate it per page — extend or amend this file when the system needs to grow.

The diversification rule is **inverted** here. Across pages of one product, consistency is the goal.
Two pages may differ in *macrostructure*; they may not differ in theme, type, accent or CTA voice.
A page that drifts from this file is the bug.

---

## Genre

`modern-minimal`.

Conferencer is a B2B SaaS replacement for the Program module of a $40k/yr event suite. The genre's
overrides apply and are used deliberately:

- **pure-white paper is allowed** (slop gate 7 loosened),
- **zero- and near-zero-chroma neutrals are allowed** (gate 22 loosened),
- **pill CTAs** — black-filled primary + hairline-outlined secondary — are the canonical pair,
- **two-column heroes** (title left, proof/product right) are canonical, not a fallback.

What the genre forbids and this system therefore never ships: italic serif body, gradient text,
glassmorphism, bouncy easings, drop caps, ornament.

## Macrostructure families

Three page types, three shapes. Pages within a family share the family's shape and vary only in
component archetype.

| Family | Routes | Macrostructure | Nav | Footer |
| --- | --- | --- | --- | --- |
| **Marketing** | `/` | **05 Workbench** — real product captures are the argument | **N1b** canonical SaaS three-section | **Ft5** Statement |
| **Public event** | `/e/[slug]/**` | **03 Marquee Hero** — the event name fills the fold, then the page becomes a list | **N12** announcement banner + retracting bar | **Ft1** Mast-headed |
| **App** | `/admin/**`, `/portal/**`, `/review/**`, `/crm/**` | **04 Stat-Led** — a real figure leads, every panel beneath qualifies it | **N3** side-rail + a frosted top bar | none |

Why each:

- **Workbench** for the landing page because the product *is* the pitch, and we can ship genuine
  screenshots of the agenda board, the review scorecard and the dashboard. No mockups, no invented UI.
- **Marquee Hero** for the public conference site because a conference home page's job is to say
  *which conference, when, where* at poster scale before it says anything else.
- **Stat-Led** for the dashboard because its hero genuinely *is* a number — days until the event —
  and every panel below it qualifies that number.

Nav and footer archetypes differ across the three families by design (slop gates 42 and 43); no two
surfaces in this product share a nav or a footer shape.

## Theme

`studied-DNA (source: image)`. Catalog themes are suspended for this project (SKILL.md § 2.6,
condition 0; slop gate 57). The DNA came from a reference the user supplied as their design north star:
white paper with near-white alternating bands, hairline borders, 12–16 px radii, very soft shadows,
generous density, a left-biased hero paired with a product capture, and **no chromatic accent at all** —
the "accent" is ink itself, worn as a black pill CTA.

```
--color-paper        oklch(100%   0     0    )   page white                          #ffffff
--color-paper-2      oklch(98.2%  0.002 265  )   alternating section band            #f8f9fa
--color-paper-3      oklch(96.4%  0.003 265  )   inset surfaces, table heads         #f2f3f5
--color-rule         oklch(92.5%  0.004 265  )   hairline borders                    #e5e6e9
--color-rule-2       oklch(87%    0.005 265  )   stronger dividers                   #d2d4d8
--color-field        oklch(63%    0.013 265  )   form-control boundary (3.5:1)       #83878f
--color-muted        oklch(53%    0.012 265  )   meta text        (4.76:1 on paper-3) #686c73
--color-neutral      oklch(44%    0.012 265  )   secondary text                      #4f5359
--color-ink-2        oklch(32%    0.010 265  )   subheads                            #303338
--color-ink          oklch(17%    0.008 265  )   primary text                        #0e0f13
--color-accent       oklch(17%    0.008 265  )   = ink. Primary CTA fill.
--color-accent-ink   oklch(99%    0     0    )   text on accent   (18.6:1)
--color-signal       oklch(51.1%  0.262 277  )   the product's indigo — active, links in app chrome  #4f39f6
--color-signal-ink   oklch(99%    0     0    )
--color-signal-soft  oklch(96.5%  0.016 277  )   the active item's tint
--color-focus        oklch(58%    0.235 277  )   focus ring — a shade brighter than the signal
--color-positive     oklch(50%    0.13  155  )   accepted / complete
--color-warn         oklch(52%    0.12  68   )   overdue / pending
--color-danger       oklch(53%    0.21  27   )   declined / destructive
```

Four of those values were tuned by the audit rather than picked by eye:

- **`--color-field`** is much darker than the decorative rules. When an input's fill matches the page,
  its border is the only thing identifying it as a control, and WCAG 1.4.11 wants 3:1 for that. The
  studied reference uses a near-invisible field border; this system does not follow it there.
- **`--color-focus`** is a shade brighter than `--color-signal`, because the ring has to clear 3:1
  against the **ink pill** it surrounds as well as against paper. At the signal's own lightness it
  measured 2.97:1 on ink.
- **`--color-warn`** and **`--color-positive`** were darkened until their chips cleared 4.5:1 against
  their own soft tints (the amber chip measured 3.94:1 at first).

`npm run contrast` recomputes all 27 pairs from `src/app/tokens.css` and exits non-zero on a
regression, so this is checked rather than asserted.

**The accent is monochrome and the signal is rationed.** `--color-signal` is the one chromatic colour
in the system. It is allowed on focus rings, on links inside app chrome, and on the one chart series —
and nothing else. Held under 5 % of any viewport (gate 23). Marketing and public surfaces are
ink-on-paper only.

The **active navigation item** is *not* signal-coloured. It is a `--color-paper-3` fill with ink text
at medium weight — the same quiet fill the hover state uses, one step stronger. Tinting fifteen
sidebar rows with the brand hue would blow the 5 % budget on chrome, and the item that matters
(the CTA) would stop being the loudest thing on screen.

**On the accent budget and the dark band.** Slop gate 23 caps accent coverage at ~5 % of a viewport.
Read literally, an ink-filled section band would fail it, because `--color-accent` and `--color-ink`
are the same value here. They are not the same *role*: `accent` is the CTA fill, and a full-bleed ink
band is a **surface flip** — the oldest editorial device there is — which flips its text colour in the
same rule so nothing inherits ink onto ink. The budget the gate is actually protecting is the
chromatic one, and `--color-signal` sits far under 5 % on every screen in the product.

**Per-event accent survives.** `--event-accent` still carries `event.accent_color` on the public site.
That is product behaviour — a conference brands its own page — not decoration.

## Typography

Three families, which is the ceiling (gate 37).

- **Display** — `Geist` 600, `letter-spacing: -0.03em`, display line-height `1.05`. Roman always (gate 38a).
- **Body** — `Switzer` 400 / 500, line-height `1.6`, measure capped at `65ch`.
- **Outlier** — `Geist Mono` 500, in exactly two roles: **the wordmark** and **tabular figures**
  (dashboard stats, agenda times, countdowns, IDs). Two slots, per gate 38.

Both are self-hosted and loaded through `next/font/local`. **Nothing is fetched at build time** — the
Docker image builds with no network, and that invariant is older than this design system.
`Geist` and `Geist Mono` arrive via the `geist` npm package; `Switzer` woff2 files live in `src/fonts/`
under the ITF Free Font Licence.

Neither face is on Hallmark's banned list. Inter — which the studied reference actually uses for body —
is banned outright by `references/typography.md`, so the DNA's *pairing logic* (two neutral sans faces,
low display/body contrast, mono for figures) travels while the specific faces do not.

Type scale — 1.25 major third from a 16 px body:

```
--text-xs        0.75rem
--text-sm        0.875rem
--text-base      1rem
--text-md        1.125rem
--text-lg        1.375rem
--text-xl        1.75rem
--text-2xl       2.25rem
--text-3xl       2.75rem
--text-display-s clamp(1.875rem, 2.4vw + 1rem, 2.75rem)
--text-display-m clamp(2.25rem,  3.2vw + 0.9rem, 3.375rem)
--text-display   clamp(2.5rem,   4.4vw + 1rem,   4.5rem)
```

Three display steps, because a headline's size has to answer to the width it is given:
`display` is for type that owns the full measure (the event marquee), `display-m` for a split
hero where the headline only has half the page, `display-s` for a closing statement.

Display caps at 4.5 rem (72 px) — under the 5.5 rem ceiling — because every headline in this product
runs 40–60 characters and a bigger clamp would push the hero past the fold at 1280×800 (gate 44b).

## Iconography

**Solar** ([Iconify](https://icon-sets.iconify.design/solar/), MIT), one set, no exceptions —
two icon libraries on one page is a stroke-voice mismatch the eye reads before it reads anything else.

Two style families, mirroring the display/body split in the type:

- **`linear`** — the single voice. A hairline stroke that sits at the same weight as the 1 px rules.
- **`bold`** — one register only, for filled status markers that have to read at 14 px (toasts).

Solar ships 7,627 icons; `scripts/icons.mjs` extracts only the ones the product renders into
`src/components/ui/icons.generated.ts` (37 icons, 14 KB of path data). `@iconify-json/solar` is a
devDependency that nothing at build time or runtime imports. Adding an icon means adding it to the
manifest at the top of that script and re-running `npm run icons`; the script fails on an unknown
name rather than emitting a hole.

`<Icon>` has no hooks, so it renders in server and client components alike, and is `aria-hidden` by
default — an icon beside a label repeats the label, and a screen reader should not hear it twice.
Pass `label` when the icon is the only thing naming a control.

**Where icons go.** Only where they carry information: sidebar wayfinding, the kind of thing a
dashboard nudge is about, the two different data types on a session's meta line, disclosure state,
empty states, toasts. **Not** on the landing page's numbered loop steps or its spec sheet — the
numerals and the row labels already carry those, and an icon per feature card is the icon-tile grid
slop gate 3 exists to stop.

`npx shadcn@latest add <name>` writes `lucide-react` imports. They have to be swapped for `<Icon>`
before the component ships; there is no Lucide in this project and there should not be.

## Spacing

4-point named scale, mirrored onto Tailwind's `--spacing-*` so both `gap-md` and `var(--space-md)` work.
Values live in `src/app/tokens.css`. Pages use named tokens, never raw values (gate 24).

```
3xs 0.25 · 2xs 0.5 · xs 0.75 · sm 1 · md 1.5 · lg 2 · xl 3 · 2xl 4.5 · 3xl 7 · 4xl 10   (rem)
```

Section rhythm is deliberately uneven (gate 9): bands alternate `paper` / `paper-2`, and no two
consecutive sections share a padding value.

## Motion

Three primitives on the whole product. That is the budget.

1. **Nav frost on scroll** — background + border-color, `--dur-short`, rAF-throttled.
2. **Hero orchestrated entrance** — once, on the landing page only, staggered by DOM index, capped at 300 ms.
3. **Button press** — `translateY(1px)` on `:active`, `--dur-micro`.

```
--ease-out    cubic-bezier(0.16, 1, 0.3, 1)
--ease-in     cubic-bezier(0.7, 0, 0.84, 0)
--ease-in-out cubic-bezier(0.65, 0, 0.35, 1)
--dur-micro   120ms
--dur-short   180ms
--dur-long    320ms
```

- Only `transform` and `opacity` are animated.
- No scroll-triggered reveals. No parallax. No hover-scale. No `transition: all`.
- **Focus rings never transition.** They appear instantly (gate 15).
- `prefers-reduced-motion: reduce` collapses every animation to a ≤ 150 ms opacity change.

## Microinteractions stance

- **Silent success.** A saved form redirects with a `<Notice>` the user can see; no celebratory toast.
  Toasts are for failures and for effects the user cannot see (a copied token, a queued email).
- **Undo over confirm** where the action is reversible; type-to-confirm where it is not. The existing
  `<ConfirmSubmit>` messages already state consequences ("6 submissions currently use it") — keep that.
- Hover tooltips delay 800 ms; focus tooltips delay 0 ms.
- Every hover affordance has a focus equivalent and works on a coarse pointer.

## CTA voice

| Level | Shape | Fill | Copy pattern |
| --- | --- | --- | --- |
| Primary | pill (`--radius-pill`) | `--color-accent` fill, `--color-accent-ink` label, weight 500 | a verb and its object — *Open the live demo*, *Submit a talk*, *Save changes* |
| Secondary | pill | paper fill, `1px --color-rule-2` border | *Sign in*, *View the agenda* |
| Tertiary | none | ink text, 1 px underline at 2 px offset, trailing `→` | *All 23 sessions →* |

Labels never wrap to two lines at any width from 320 px up (gate 49). When a row cannot fit, the row
reflows or an item drops — the label does not break.

## What pages MUST share

- The wordmark, set in `Geist Mono` 500 with `-0.02em` tracking.
- `--font-display` / `--font-body` / `--font-outlier`.
- The CTA voice above — shape, radius, padding rhythm, weight.
- Hairline rule weight (`--rule-hair: 1px`) and card radius (`--radius-card: 12px`).
- The accent footprint rule: ink for emphasis, signal only for focus/active/app links, ≤ 5 % per viewport.
- The focus ring: `outline: 2px solid var(--color-focus); outline-offset: 2px`, instant, never animated.
- Section heads as a **vertical stack** — eyebrow above heading, same column, never beside it (gate 54).

## What pages MAY differ on

- Macrostructure, within the family declared above.
- Hero archetype within the family's allowance (`H8` on marketing, marquee statement on public event,
  `H4` figure + worded headline on app).
- Enrichment — real screenshots, **marketing pages only**.
- Section band alternation and padding rhythm.

## Per-page allowances and documented deviations

These are deliberate departures. Each names the rule it bends and why.

1. **App pages use a 36 px control height**, not the 44 px floor in slop gate 39. The organizer surfaces
   are dense data tables where 44 px controls cost a row of context on a laptop. The *intent* of the gate
   — an input and its adjacent button share one height — is enforced strictly at both sizes.
   Marketing and public pages use 44 px.
2. **`<select>` and checkboxes stay native.** Every form posts to a server action with progressive
   enhancement; a native control submits without JavaScript and is more reliable for keyboard users and
   automated agents. They are styled to match, not replaced with Radix.
3. **List-view tabs are links, not stateful tabs.** Every filtered view must survive a reload and be
   shareable as a URL.
4. **`tokens.css` lives at `src/app/tokens.css`**, not the repo root, because Tailwind v4's entry
   stylesheet has to `@import` it and a root-relative import from `src/app/globals.css` would be
   `../../tokens.css`. The portable copies live in § Exports below.
5. **The `H8` hero uses the `frame = minimal hairline` knob.** The archetype's sample markup draws a fake
   browser bar with traffic-light dots; slop gate 47 bans exactly that. Real screenshots go in a
   `<figure>` with a hairline border and a caption — no re-drawn chrome anywhere in this product.
6. **`--color-paper` is pure white and several neutrals are near-zero chroma.** Genre-sanctioned
   (gates 7 and 22 are loosened for modern-minimal) and true to the studied DNA.
7. **The inert `.dark` block stays in `globals.css`.** The product is light-only on purpose; the block
   costs nothing and removing it would be an unrelated change.
8. **Photography is allowed in exactly three places**, and the system is otherwise photograph-free:
   - **speaker headshots**, everywhere `<Avatar>` renders — a conference's speakers are its content,
     and initials on a gradient are the most placeholder-looking thing a programme site can show;
   - **the public event fold**, as a single full-bleed photograph behind the marquee, which
     Macrostructure 03 already sanctions;
   - **the landing page's proof band**, which was already a dark surface flip.

   Everything else — the landing hero, feature blocks, session and speaker cards, the spec sheet —
   stays typographic. A photograph must be saying something true about the page it is on; a mood is
   not a reason.

   **The scrim contract.** Any photograph carrying text sits under a two-stop gradient of
   `--color-ink`, on the *background* and never on the text, and the surface sets its `color` in the
   same rule it sets the background. Contrast is *measured* on the rendered pixels — `npm run audit`
   removes every glyph, photographs the surface, and finds the worst-case pixel behind each line —
   because a gradient over a photograph cannot be checked from tokens. Photographs are desaturated
   before encoding so they read as part of a monochrome system rather than as stock colour.

## Honest copy

The landing page carries no logo cloud, no testimonials and no percentage claims. Conferencer has no
customers to name, and slop gate 46 bans fabricated proof. In their place:

- **real product screenshots** of this repository's own UI,
- **real repository facts** — MIT, one container and one volume, a SQLite file with no database server,
  no API key required to boot, Node 22+, 13 field types, multi-round blind review, HMAC webhooks,
- **live counts read from the database at request time** for the seeded demo event, labelled as such.
  When the database is empty the strip renders `—` placeholders with the same label. A number-shaped
  hole is honest; a fabricated number is not.
- **quoted competitor pricing**, in `/` § the price. The landing page's whole argument is ownership,
  and ownership is only legible next to what renting costs, so this is the one section that names
  other products. It has its own rule, and a future edit may not relax it: every figure is quoted
  from the vendor's **own public pricing page**, linked inline, and dated in a footnote under the
  table. A row states cost and nothing else — no claim about anyone else's product quality, because
  that is not checkable from a pricing page and the comparison does not need it. Where a vendor
  publishes no price, the row says so instead of estimating one. Re-read the links before shipping a
  change to that table; a stale price is the one number on this page that can rot on its own.

## Exports

Drop-in formats for re-using this system elsewhere. `src/app/tokens.css` is the source of truth;
everything below is a translation of it.

### tokens.css

```css
:root {
  --color-paper:      oklch(100%   0     0);
  --color-paper-2:    oklch(98.2%  0.002 265);
  --color-paper-3:    oklch(96.4%  0.003 265);
  --color-rule:       oklch(92.5%  0.004 265);
  --color-rule-2:     oklch(87%    0.005 265);
  --color-field:      oklch(63%    0.013 265);
  --color-muted:      oklch(53%    0.012 265);
  --color-neutral:    oklch(44%    0.012 265);
  --color-ink-2:      oklch(32%    0.010 265);
  --color-ink:        oklch(17%    0.008 265);
  --color-accent:     oklch(17%    0.008 265);
  --color-accent-ink: oklch(99%    0     0);
  --color-signal:     oklch(51.1%  0.262 277);
  --color-focus:      oklch(58%    0.235 277);

  --font-display: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Switzer", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --space-3xs: 0.25rem; --space-2xs: 0.5rem;  --space-xs:  0.75rem;
  --space-sm:  1rem;    --space-md:  1.5rem;  --space-lg:  2rem;
  --space-xl:  3rem;    --space-2xl: 4.5rem;  --space-3xl: 7rem;   --space-4xl: 10rem;

  --text-xs: 0.75rem;  --text-sm: 0.875rem; --text-md: 1.125rem;
  --text-lg: 1.375rem; --text-xl: 1.75rem;  --text-2xl: 2.25rem; --text-3xl: 2.75rem;
  --text-display-s: clamp(1.875rem, 2.4vw + 1rem, 2.75rem);
  --text-display-m: clamp(2.25rem, 3.2vw + 0.9rem, 3.375rem);
  --text-display:   clamp(2.5rem, 4.4vw + 1rem, 4.5rem);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:  cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms; --dur-short: 180ms; --dur-long: 320ms;

  --rule-hair: 1px; --rule-fine: 2px;
  --radius-card: 12px; --radius-pill: 999px; --radius-input: 10px;
  --shadow-card:   0 1px 2px oklch(17% 0.008 265 / 0.05);
  --shadow-raised: 0 12px 32px -16px oklch(17% 0.008 265 / 0.22);
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper:      oklch(100%   0     0);
  --color-paper-2:    oklch(98.2%  0.002 265);
  --color-paper-3:    oklch(96.4%  0.003 265);
  --color-rule:       oklch(92.5%  0.004 265);
  --color-rule-2:     oklch(87%    0.005 265);
  --color-field:      oklch(63%    0.013 265);
  --color-muted:      oklch(53%    0.012 265);
  --color-neutral:    oklch(44%    0.012 265);
  --color-ink-2:      oklch(32%    0.010 265);
  --color-ink:        oklch(17%    0.008 265);
  --color-accent:     oklch(17%    0.008 265);
  --color-signal:     oklch(51.1%  0.262 277);

  --font-display: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Switzer", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Geist Mono", ui-monospace, monospace;

  --spacing-3xs: 0.25rem; --spacing-2xs: 0.5rem; --spacing-xs: 0.75rem;
  --spacing-sm: 1rem;     --spacing-md: 1.5rem;  --spacing-lg: 2rem;
  --spacing-xl: 3rem;     --spacing-2xl: 4.5rem; --spacing-3xl: 7rem;

  --text-md: 1.125rem; --text-lg: 1.375rem; --text-xl: 1.75rem; --text-2xl: 2.25rem;

  --radius-card: 12px; --radius-pill: 999px; --radius-input: 10px;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:  cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper":      { "$value": "oklch(100% 0 0)",           "$type": "color" },
    "paper-2":    { "$value": "oklch(98.2% 0.002 265)",    "$type": "color" },
    "paper-3":    { "$value": "oklch(96.4% 0.003 265)",    "$type": "color" },
    "rule":       { "$value": "oklch(92.5% 0.004 265)",    "$type": "color" },
    "rule-2":     { "$value": "oklch(87% 0.005 265)",      "$type": "color" },
    "field":      { "$value": "oklch(63% 0.013 265)",      "$type": "color" },
    "muted":      { "$value": "oklch(53% 0.012 265)",      "$type": "color" },
    "neutral":    { "$value": "oklch(44% 0.012 265)",      "$type": "color" },
    "ink-2":      { "$value": "oklch(32% 0.010 265)",      "$type": "color" },
    "ink":        { "$value": "oklch(17% 0.008 265)",      "$type": "color" },
    "accent":     { "$value": "oklch(17% 0.008 265)",      "$type": "color" },
    "accent-ink": { "$value": "oklch(99% 0 0)",            "$type": "color" },
    "signal":     { "$value": "oklch(51.1% 0.262 277)",    "$type": "color" },
    "focus":      { "$value": "oklch(58% 0.235 277)",      "$type": "color" }
  },
  "font": {
    "display": { "$value": "Geist, ui-sans-serif, system-ui, sans-serif",   "$type": "fontFamily" },
    "body":    { "$value": "Switzer, ui-sans-serif, system-ui, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "Geist Mono, ui-monospace, monospace",           "$type": "fontFamily" }
  },
  "space": {
    "3xs": { "$value": "0.25rem", "$type": "dimension" },
    "2xs": { "$value": "0.5rem",  "$type": "dimension" },
    "xs":  { "$value": "0.75rem", "$type": "dimension" },
    "sm":  { "$value": "1rem",    "$type": "dimension" },
    "md":  { "$value": "1.5rem",  "$type": "dimension" },
    "lg":  { "$value": "2rem",    "$type": "dimension" },
    "xl":  { "$value": "3rem",    "$type": "dimension" },
    "2xl": { "$value": "4.5rem",  "$type": "dimension" },
    "3xl": { "$value": "7rem",    "$type": "dimension" },
    "4xl": { "$value": "10rem",   "$type": "dimension" }
  },
  "duration": {
    "micro": { "$value": "120ms", "$type": "duration" },
    "short": { "$value": "180ms", "$type": "duration" },
    "long":  { "$value": "320ms", "$type": "duration" }
  }
}
```

### shadcn/ui CSS variables

The values are full `oklch()` functions rather than bare triples, because this project's
`components.json` was generated with `cssVariables: true` against the `radix-nova` style, which
consumes them directly.

```css
:root {
  --background:             oklch(100%   0     0);      /* paper */
  --foreground:             oklch(17%    0.008 265);    /* ink */
  --card:                   oklch(100%   0     0);      /* paper */
  --card-foreground:        oklch(17%    0.008 265);
  --popover:                oklch(100%   0     0);
  --popover-foreground:     oklch(17%    0.008 265);
  --primary:                oklch(17%    0.008 265);    /* accent = ink */
  --primary-foreground:     oklch(99%    0     0);      /* accent-ink */
  --secondary:              oklch(96.4%  0.003 265);    /* paper-3 */
  --secondary-foreground:   oklch(32%    0.010 265);    /* ink-2 */
  --muted:                  oklch(96.4%  0.003 265);    /* paper-3 */
  --muted-foreground:       oklch(53%    0.012 265);    /* muted */
  --accent:                 oklch(96.4%  0.003 265);    /* hover surface */
  --accent-foreground:      oklch(17%    0.008 265);
  --destructive:            oklch(53%    0.21  27);
  --border:                 oklch(92.5%  0.004 265);    /* rule */
  --input:                  oklch(63%    0.013 265);    /* field — 3.5:1 against paper */
  --ring:                   oklch(58%    0.235 277);    /* focus */
  --radius:                 0.625rem;
}
```

## Provenance

- **Source mode** — image (user-attached reference).
- **Extracted** — 2026-08-11.
- **Attestation** — the user supplied the reference as their own design north star for this product.
- **Confidence** — tokens are estimated from the source image's colour bands and rendered into OKLCH;
  fonts are role-based with named candidates from the Hallmark canon (the source's actual body face is
  banned by `references/typography.md`, so the role travels and the face does not); rhythm is from a
  vision pass on the source.
- Nothing from the source is reproduced: no copy, no imagery, no logos, no component code.

## Notes — what the reference does that this system does not

Carried over: the surface (white + near-white bands), the hairline/12–16 px radius/soft-shadow card
voice, the generous density, the left-biased hero paired with a product capture, the N1b nav, the
FAQ accordion, and the black-pill CTA.

Deliberately **not** carried over:

- the **four-column index footer** (Product / Company / Resources / Legal + social row) — slop gate 43,
  the most-recognised AI-footer fingerprint;
- the **icon-tile feature grid** — gates 3 and 30;
- the **logo cloud** and the **testimonial wall** — gate 46; there is no real proof of this shape to show;
- **uniform section padding** — gate 9;
- **Inter** as the body face — banned by `references/typography.md`.
