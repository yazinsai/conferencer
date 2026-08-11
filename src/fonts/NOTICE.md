# Fonts shipped with this repository

Conferencer self-hosts every typeface it uses. Nothing is fetched from a CDN at build time or at
runtime — `next build` has to succeed inside a Docker build with no network access, and a page that
waits on `fonts.googleapis.com` is a page that flashes unstyled text on a slow connection.

## Switzer — `src/fonts/switzer/*.woff2`

- Designer: Indian Type Foundry
- Source: <https://www.fontshare.com/fonts/switzer>
- Licence: **ITF Free Font Licence (ITF FFL)** — <https://www.fontshare.com/licenses/itf-ffl>
- Weights vendored: 400 (Regular), 500 (Medium), 600 (Semibold), latin, `woff2` only — 56 KB total.

The ITF FFL permits free personal and commercial use, embedding, and redistribution as part of a
larger work; it does not permit selling the fonts on their own. Retain this notice if you fork.

Role in the design system: `--font-body`. See [`design.md`](../../design.md) § Typography.

## Geist and Geist Mono — `node_modules/geist`

- Designer: Vercel
- Source: <https://vercel.com/font>, distributed as the `geist` npm package
- Licence: **SIL Open Font License 1.1** — bundled with the package at `node_modules/geist/LICENSE.TXT`
- Loaded through `geist/font/sans` and `geist/font/mono`, which are `next/font/local` under the hood,
  so the woff2 files come from the dependency tree rather than the network.

Roles: `--font-display` (Geist) and `--font-outlier` (Geist Mono).

## Why not the reference's own body face

The design reference this system was studied from uses Inter for body copy. Hallmark's
`references/typography.md` bans Inter, Roboto, Open Sans and the rest of the LLM-default set outright.
The reference's *pairing logic* — two neutral sans faces with low display/body contrast, plus a mono
for figures — travels into this system; the specific faces do not.
