import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

/**
 * The three faces of the design system — display, body, outlier (see `design.md`
 * § Typography). All three are **local**: `next build` runs inside a Docker build
 * with no network, so nothing may be fetched from a font CDN at build time.
 *
 *   Geist       → --font-display   headings, hero display
 *   Switzer     → --font-body      prose and UI
 *   Geist Mono  → --font-outlier   the wordmark and tabular figures, and nothing else
 *
 * Licences and provenance: src/fonts/NOTICE.md
 */

/** Body face. Vendored from Fontshare under the ITF Free Font Licence. */
export const switzer = localFont({
  src: [
    { path: "../fonts/switzer/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/switzer/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/switzer/Switzer-Semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
  // Metric-matched fallback so the swap doesn't shift the layout (CLS).
  adjustFontFallback: "Arial",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

/** Display face. `geist` is a dependency, so its woff2 files ship in node_modules. */
export const geistSans = GeistSans;

/** Outlier: the wordmark and tabular figures. Two slots, per the 2+1 rule. */
export const geistMono = GeistMono;

/** Everything the root layout needs to put on <html>. */
export const fontVariables = [switzer.variable, GeistSans.variable, GeistMono.variable].join(" ");
