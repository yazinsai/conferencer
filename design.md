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
| **Marketing** | `/` | **01 Bento Grid — live product tiles** — the running product is the argument | **N1b** canonical SaaS three-section | **Ft5** Statement |
| **Marketing** | `/vs/**` | **05 Workbench** — the sourced ledger is the argument | **N1b** canonical SaaS three-section | **Ft5** Statement |
| **Public event** | `/e/[slug]/**` | **03 Marquee Hero** — the event name fills the fold, then the page becomes a list | **N12** announcement banner + retracting bar | **Ft1** Mast-headed |
| **App** | `/admin/**`, `/portal/**`, `/review/**`, `/crm/**` | **04 Stat-Led** — a real figure leads, every panel beneath qualifies it | **N3** side-rail + a frosted top bar | none |

Why each:

- **Bento Grid** for the landing page because the product *is* the pitch and the page now ships the
  product itself rather than pictures of it. `/` was **05 Workbench** while screenshots were the
  argument; a capture of software is a claim a reader has to take on trust, and at the width a landing
  page can give it, a dense organizer screen reads as grey texture rather than as software. The tiles
  are now **playable** — real components, real demo data, operable in the page — which is Bento's shape
  (a fixed-height centred hero, then an asymmetric grid of mixed spans, imagery cropped inside tiles and
  never full-bleed) carrying the one idea worth borrowing from 21 Component Playground: *the previews
  ARE the imagery*. The rules that keep that honest are in § Live product tiles.
- **Workbench** stays on `/vs/**`, where the argument is a sourced, line-by-line ledger rather than
  something a reader can touch.
- **Marquee Hero** for the public conference site because a conference home page's job is to say
  *which conference, when, where* at poster scale before it says anything else.
- **Stat-Led** for the dashboard because its hero genuinely *is* a number — days until the event —
  and every panel below it qualifies that number.

Nav and footer archetypes differ across the three families by design (slop gates 42 and 43); no two
surfaces in this product share a nav or a footer shape.

## Live product tiles

The enrichment tier for `/` is **the product, running in the page**. Where the landing page used to show
a `.webp` of the agenda board, it now ships an agenda board you can drag a talk onto. This replaces
"Enrichment — real screenshots" for `/` (screenshots remain the tier for `/vs/**`).

A *playable* lives in `src/components/marketing/demo/`, is a client island with no dependencies beyond
this repository, and is bound by five rules. They exist because "live UI on a landing page" is one small
step from "invented UI on a landing page", which is the same offence as an invented metric (gate 46).

1. **A playable mirrors a screen that exists.** Every playable corresponds to a real route in this
   repository and mirrors that screen's behaviour rule-for-rule: two talks in one room is *blocked*
   because that is never right, a speaker in two rooms is *flagged* because it can be deliberate, an
   anonymized round hides the author, a show-when rule hides its question until the controlling answer
   arrives, a character limit turns the counter red at the same number the product uses. It is built
   from `src/components/ui/index.tsx` primitives at the sizes the app uses. Inventing an interaction the
   product does not have is forbidden.
2. **Local state only. Nothing on `/` writes.** No server action, no mutation, no `refresh()`. A reader
   can hammer any control on this page without touching the demo conference.
3. **Say where it is simplified.** Every playable carries a one-line footnote naming what the real screen
   does that the panel does not — *"the real board posts to a server action and re-renders from SQLite"* —
   and a tertiary link to that screen in the demo. The `<Playable>` wrapper takes both as required props,
   so a future tile cannot quietly skip them.
4. **Real data.** Rows are the demo conference's: read from SQLite server-side when the instance is
   seeded, and otherwise from the checked-in slice in `src/lib/demo-conference.ts`, which mirrors
   `seed/fixtures.ts`. No invented talk titles, speakers, tracks or rooms — a fabricated session title is
   a fabricated fact.
5. **Server-rendered first frame; JavaScript only enhances.** Each playable's initial state is real
   markup from the server and reads as a screenshot of a real screen with scripting off. Drag, the tab
   strip and the publish flip need JavaScript (§ Per-page allowances, item 9).

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
in the system. It is allowed on focus rings, on links inside app chrome, on the one chart series, and
in **the logo mark** (`src/components/ui/logo.tsx`) — an open ink ring with a signal-coloured handoff
wedge and dot. The ring is drawn in `currentColor`, so the same SVG sits on paper (ink ring) and on
the dark bands (paper ring) with no variant prop. Nothing else. Held under 5 % of any viewport
(gate 23). Marketing and public surfaces are otherwise ink-on-paper only.

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
`src/components/ui/icons.generated.ts` (44 icons, 16.7 KB of path data). `@iconify-json/solar` is a
devDependency that nothing at build time or runtime imports. Adding an icon means adding it to the
manifest at the top of that script and re-running `npm run icons`; the script fails on an unknown
name rather than emitting a hole.

`<Icon>` has no hooks, so it renders in server and client components alike, and is `aria-hidden` by
default — an icon beside a label repeats the label, and a screen reader should not hear it twice.
Pass `label` when the icon is the only thing naming a control.

**Where icons go.** Only where they carry information: sidebar wayfinding, the kind of thing a
dashboard nudge is about, the two different data types on a session's meta line, disclosure state,
empty states, toasts.

On the landing page, two places qualify, and the test both pass is that the glyph is *the same
glyph the reader will meet again in the product* — not a picture chosen to fill a card:

- **the spec sheet's ten rows** carry the organizer sidebar's icon for that module, at the
  sidebar's own 17 px / `--color-muted-foreground`, so the row is an index into the product;
- **the three ownership guarantees** under § the price carry one glyph each at 20 px /
  `--color-ink-2`, because that block was a paragraph of prose and the glyphs are what make three
  separate claims scannable as three.

**Not** the numbered loop steps: the `01`–`06` numerals are the ordinal device there, a glyph beside
a numeral says the same thing twice, and six cards each with an icon is precisely the icon-tile grid
slop gate 3 exists to stop. Nothing else on `/` gets an icon — an icon per feature is a decoration
budget, and this system does not have one.

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

Two budgets, because the two surfaces are doing different jobs. An organizer works in the app for eight
hours and every animation is a tax on that; a reader spends ninety seconds on `/` and motion is how the
page explains what the software does. **The rules below hold on both sides. Only the item count differs.**

```
--ease-out    cubic-bezier(0.16, 1, 0.3, 1)
--ease-in     cubic-bezier(0.7, 0, 0.84, 0)
--ease-in-out cubic-bezier(0.65, 0, 0.35, 1)
--dur-micro   120ms
--dur-short   180ms
--dur-long    320ms
--dur-reveal  320ms
--dur-morph   400ms   marketing only — the shared-element morph, the ceiling of the budget
```

- Only `transform`, `opacity` and `filter` are animated. Never a layout property.
- The three named easings only — never the browser default `ease`, never bounce or overshoot on UI state.
- No parallax. No hover-**scale**. No `transition: all`. No autoplaying carousel.
- **Focus rings never transition.** They appear instantly (gate 15).
- `prefers-reduced-motion: reduce` collapses every animation to a ≤ 150 ms opacity change — including
  every `::view-transition-*` pseudo-element.
- **Nothing may be hidden by default.** A reveal is additive: the server sends the content visible and
  the animation only hides what it is about to bring back, one shot, and never hides it again. A
  reader with JavaScript off, a crawler, a print stylesheet and a full-page screenshot all see the
  page.

  This rule is written from a real failure. The scroll reveal was first built on CSS
  `animation-timeline: view()`, which is the prettier implementation and the wrong one: a view()
  timeline is a *function of scroll position*, so an element below the fold sits at progress 0 and
  goes back to progress 0 every time it leaves the viewport. Measured on `/`, 36 of 41 revealed
  elements were still at `opacity: 0` after scrolling the whole document and back, and
  `npm run shots` captured a blank page. `@supports` does not save you here, because the property
  *is* supported — it is doing exactly what it says. Sticky one-shot reveals only.

### Motion · app and public-event surfaces

Three primitives. `/admin/**`, `/portal/**`, `/review/**`, `/crm/**`, `/e/[slug]/**`. Unchanged.

1. **Nav frost on scroll** — background + border-color, `--dur-short`, rAF-throttled.
2. **Hero orchestrated entrance** — once, staggered by DOM index, capped at 300 ms.
3. **Button press** — `translateY(1px)` on `:active`, `--dur-micro`.

### Motion · marketing surfaces

`/` and `/vs/**`. Eleven primitives, itemised — a bigger budget, still a closed list. Anything not on
this list does not ship. Items 1–3 are the same three primitives as above.

| # | Primitive | Where | How |
| --- | --- | --- | --- |
| 1 | Nav frost on scroll | every marketing page | as above |
| 2 | Hero entrance stagger | the `/` fold | `.reveal`, staggered by DOM index, capped at 300 ms |
| 3 | Button press | every control | `translateY(1px)` on `:active` |
| 4 | Scroll reveal | section heads and tiles | `.hm-reveal`: opacity + `translateY(12px)`, `--dur-reveal`, **one-shot and sticky**, driven by a single `IntersectionObserver` in `components/marketing/reveal.tsx`. The default state is *visible* — the CSS only hides an element the observer has marked, and only if it was off-screen at mount |
| 5 | Shared-element morph | a talk moving from the tray into a grid cell | `view-transition-name` on the card plus `document.startViewTransition` with `flushSync` inside it, at `--dur-morph` (400 ms) with a 2 px blur mid-flight via `view-transition-class: hm-morph`. The browser API directly rather than React's `<ViewTransition>`: the pair is two different subtrees rather than one keyed boundary, and reduced motion has to skip the transition rather than shorten it |
| 6 | Crossfade | the three-step panel; the publish flip | React `<ViewTransition key>` with `enter`/`share="auto"`, `default="none"`, at `--dur-reveal` |
| 7 | Insert reveal | a row arriving (a show-when question, an added question, a bulk-action bar) | `@starting-style`, opacity + `translateY(-4px)`, `--dur-short` |
| 8 | Draw-on check | publish; a task completing | SVG `stroke-dashoffset`, `--dur-reveal`, once, never looping |
| 9 | Count-up | the four live figures | one `IntersectionObserver`, 700 ms, `tnum` so the column cannot jitter; renders the final value immediately under reduced motion and whenever the figure is an em dash |
| 10 | Tile lift | bento tiles and spec-sheet rows | `translateY(-2px)` plus `--color-rule` → `--color-rule-2`, `--dur-micro`, inside `@media (hover: hover) and (pointer: fine)`. A translate, not a scale, and no shadow bloom |
| 11 | Drag affordance | tray cards and drop cells | `cursor: grab`, 1.5° rotate while dragging, dashed drop outline (the `.dropzone-active` idiom already in `globals.css`) |

The absolutes this amends, stated plainly so the next reader does not think the file contradicts itself:
*"no scroll-triggered reveals"* now means **no scroll-triggered reveals on app or public-event
surfaces**; on marketing surfaces there is exactly one, it is CSS-driven, and it is additive-only.
*"No hover-scale"* is unchanged — item 10 is a translate.

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

- The wordmark, set in `Geist Mono` 500 with `-0.02em` tracking, **paired with the logo mark**
  (`<LogoMark>`, 18–20 px, a `gap-2` to its left) wherever the wordmark anchors a nav rail, a
  marketing bar, or the landing footer.
- `--font-display` / `--font-body` / `--font-outlier`.
- The CTA voice above — shape, radius, padding rhythm, weight.
- Hairline rule weight (`--rule-hair: 1px`) and card radius (`--radius-card: 12px`; `/` may also use
  `--radius-tile: 16px` for a tile that holds a whole screen — allowance 11).
- The accent footprint rule: ink for emphasis, signal only for focus/active/app links, ≤ 5 % per viewport.
- The focus ring: `outline: 2px solid var(--color-focus); outline-offset: 2px`, instant, never animated.
- Section heads as a **vertical stack** — eyebrow above heading, same column, never beside it (gate 54).

## What pages MAY differ on

- Macrostructure, within the family declared above.
- Hero archetype within the family's allowance (`H8` on marketing, marquee statement on public event,
  `H4` figure + worded headline on app).
- Enrichment — **live product tiles** on `/` (§ Live product tiles), real screenshots on `/vs/**`.
  Marketing pages only, either way.
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
8. **Photography is allowed in exactly four places**, and the system is otherwise photograph-free:
   - **speaker headshots**, everywhere `<Avatar>` renders — a conference's speakers are its content,
     and initials on a gradient are the most placeholder-looking thing a programme site can show;
   - **the public event fold**, as a single full-bleed photograph behind the marquee, which
     Macrostructure 03 already sanctions;
   - **the landing page's proof band**, which was already a dark surface flip;
   - **the landing page's closing statement band** — an empty, unpeopled hall, because the closing
     argument is permanence ("nobody can switch it off") and a room that stands whether or not a
     vendor does is the photograph of that sentence.

   Everything else — the landing hero, feature blocks, session and speaker cards, the spec sheet —
   stays typographic. A photograph must be saying something true about the page it is on; a mood is
   not a reason.

9. **`/`'s playables require JavaScript** for drag, the tab strip and the publish flip. Every one of them
   server-renders a real first frame, so the page reads as complete with scripting off, and none of them
   is a form that must post — which is why this does not breach the progressive-enhancement contract the
   rest of the product keeps (allowance 2). It is the only surface in the product where an interaction is
   JavaScript-only, and the reason is that a reader who can drag a talk onto the agenda understands the
   software in three seconds, which no paragraph on this page has ever managed.
10. **Section heads on `/` are centred.** The rest of the product is left-aligned, and stays so. The Bento
    macrostructure and the studied DNA both centre, and a centred head is what gives the page its air.
    `/` only.
11. **`/` uses a 16 px tile radius** (`--radius-tile`) beside the app's 12 px `--radius-card`. A tile that
    holds a whole screen needs a softer corner than a table card; both are inside the studied DNA's
    12–16 px band.

   **The scrim contract.** Any photograph carrying text sits under a two-stop gradient of
   `--color-ink`, on the *background* and never on the text, and the surface sets its `color` in the
   same rule it sets the background. Contrast is *measured* on the rendered pixels — `npm run audit`
   removes every glyph, photographs the surface, and finds the worst-case pixel behind each line —
   because a gradient over a photograph cannot be checked from tokens. Photographs are desaturated
   before encoding so they read as part of a monochrome system rather than as stock colour.

## Honest copy

The landing page carries no logo cloud, no testimonials and no percentage claims. Conferencer has no
customers to name, and slop gate 46 bans fabricated proof. **No generated imagery either** — no
model-made photograph or video of a conference that did not happen, anywhere in the product. The
four sanctioned photographs are stock shots of real rooms, credited in `public/media/NOTICE.md`;
everything else that looks like the product is a screenshot of the product. In place of proof we
cannot have:

- **real product screenshots** of this repository's own UI,
- **real repository facts** — MIT, one container and one volume, a SQLite file with no database server,
  no API key required to boot, Node 22+, 13 field types, multi-round blind review, HMAC webhooks,
- **live counts read from the database at request time** for the seeded demo event, labelled as such.
  When the database is empty the strip renders `—` placeholders with the same label. A number-shaped
  hole is honest; a fabricated number is not.
- **quoted competitor pricing**, in `/` § the price. The landing page argues simplicity first, then
  that simple does not mean small, and closes on ownership — and ownership is only legible next to
  what renting costs, so this is the one section that names other products. It has its own rule,
  and a future edit may not relax it: every figure is quoted from the vendor's **own public pricing
  page**, linked inline, and dated in a footnote under the table. A row states cost and nothing
  else — no claim about anyone else's product quality, because that is not checkable from a pricing
  page and the comparison does not need it. Where a vendor publishes no price, the row says so
  instead of estimating one. Re-read the links before shipping a change to that table; a stale
  price is the one number on this page that can rot on its own.
- **the `/vs/**` pages**, which extend that rule from cost to features. Every claim about
  another product — a price, a feature, a limit, a shutdown date — is sourced from that vendor's
  own public pages (pricing first, feature pages second), linked at the foot of the page, and
  dated; the scrapes live in `.firecrawl/compare/`. Where a vendor publishes nothing, the page
  says "not published" rather than estimating. Two further requirements keep a comparison honest:
  every page carries a **"where they are genuinely better"** section — a page that only lists our
  wins is marketing, not information, and gate 46's spirit covers selective truth as much as
  invented truth — and the Conferencer column states only what is checkable in this repository.

Clarity outranks voice on `/`. The fold names the job in plain verbs and the category in one
sentence — *"free, open-source software for running a conference programme"* — before the page
argues anything, and section heads say what the section is rather than what it is called. Every caption
beside a screenshot describes what is visible in that screenshot, in the words the UI itself uses:
*show-when*, *anonymized*, *Place*, *Publish agenda*. When a capture is regenerated, re-read its caption.

### Marketing voice

`/` is read in ninety seconds by someone who does not yet know what this is. The long-form argument
belongs on `/vs/**`, which is read by someone comparing two products with a budget in hand. So the
landing page is written short and the comparison pages are written long, and neither borrows the other's
register.

- **Section heads: six words or fewer**, sentence case, centred, with **one sentence** of lede beneath —
  two lines at 1280 px, about 90 characters. State the claim; do not argue it.
  *Free. Not freemium.* · *Your all-purpose programme tool.* · *And then it's just a website.*
- **Body copy on `/`: two sentences per paragraph, maximum.** A third sentence is a sign the idea belongs
  in the FAQ, on `/vs/**`, or nowhere.
- **Eyebrows are retired from `/`.** They were on eight of nine sections, which made every section look
  like the same section. A centred head carries itself. Gate 54 is unaffected — it bans the
  tag-left/heading-right two-column head, and a centred stack is not that.
- **Verbs stay plain**: *collect · review · publish · own*. No *supercharge*, no *unlock*, no *seamless*.
- **The product's own words** are used for the product's own things: a *call for speakers*, a *show-when*
  rule, an *anonymized* round, a *scorecard*, the *agenda board*. If the UI says it, the page says it.
- **Never a number the reader cannot check.** Counts come from the database, repository facts come from
  the repository, prices come from the vendor's page.

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
  --dur-reveal: 320ms; --dur-morph: 400ms;

  --rule-hair: 1px; --rule-fine: 2px;
  --radius-card: 12px; --radius-tile: 16px; --radius-pill: 999px; --radius-input: 10px;
  --shadow-card:   0 1px 2px oklch(17% 0.008 265 / 0.05);
  --shadow-raised: 0 12px 32px -16px oklch(17% 0.008 265 / 0.22);
  --shadow-tile:   0 1px 2px oklch(17% 0.008 265 / 0.04),
                   0 12px 24px -18px oklch(17% 0.008 265 / 0.14);
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

  --radius-card: 12px; --radius-tile: 16px; --radius-pill: 999px; --radius-input: 10px;

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
    "micro":  { "$value": "120ms", "$type": "duration" },
    "short":  { "$value": "180ms", "$type": "duration" },
    "long":   { "$value": "320ms", "$type": "duration" },
    "reveal": { "$value": "320ms", "$type": "duration" },
    "morph":  { "$value": "400ms", "$type": "duration" }
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
voice, the generous density, the N1b nav, the FAQ accordion, and the black-pill CTA. As of the Bento
revision, also carried over: the **centred section head** with a one-sentence lede beneath it, the
**very generous vertical rhythm**, the **bento of feature tiles**, and the **short bold heading** —
six words or fewer, the claim stated rather than argued.

Deliberately **not** carried over:

- the **four-column index footer** (Product / Company / Resources / Legal + social row) — slop gate 43,
  the most-recognised AI-footer fingerprint;
- the **icon-tile feature grid** — gates 3 and 30. The spec sheet's ten rows do carry a glyph, but it is
  the organizer sidebar's own glyph for that module, so the row is an index into the product rather than
  a decorated tile (§ Iconography);
- **uniform section padding** — gate 9;
- **Inter** as the body face — banned by `references/typography.md`;
- **four of the reference's twelve sections**, all of them fabricated proof for a product with no
  customers to name (gate 46, § Honest copy): the **logo strip** under the fold, the **single-quote
  spotlight**, the **integrations logo wall**, and the **testimonial masonry**. Together they are a third
  of the reference page, so their slots are filled rather than left empty — by proof a reader can check:

  | The reference's slot | What sits there instead |
  | --- | --- |
  | Logo strip under the hero | the **repository-fact strip** — MIT, one container, one SQLite file, no per-event fee, no cut of your tickets |
  | Quote spotlight · testimonial masonry | the **live counts band** — four figures counted in this instance's database at request time, em dashes when it is empty |
  | Integrations logo wall | the **sourced pricing ledger** — what the same job costs elsewhere, every figure quoted from that vendor's own pricing page and dated |

  A landing page with no proof is weaker than one with proof. A landing page with *invented* proof is
  worthless, and the moment one invented logo appears, every checkable claim beside it stops being
  believed.
