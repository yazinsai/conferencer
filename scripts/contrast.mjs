#!/usr/bin/env node
/**
 * Contrast audit for the design system.
 *
 *   npm run contrast
 *
 * Parses the OKLCH tokens straight out of src/app/tokens.css and computes the
 * WCAG 2.1 ratio for every (text, surface) pair the product actually renders.
 * Hallmark slop gates 40 and 41 require this to be computed rather than eyeballed,
 * and the two failures that ship most often — ink-on-ink after a surface flip, and
 * button text that matches its own fill — are both caught here.
 *
 * Thresholds: body text 4.5:1 · large text, icons, focus rings and component
 * boundaries 3:1.
 */

import { readFileSync } from "node:fs";

const CSS = readFileSync(new URL("../src/app/tokens.css", import.meta.url), "utf8");

/* ------------------------------------------------------------- colour -- */

/** OKLCH → linear sRGB (Björn Ottosson's matrices). */
function oklchToLinearRgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)));
}

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function hex([r, g, b]) {
  const enc = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);
  return `#${[r, g, b]
    .map((v) => Math.round(enc(v) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

/* -------------------------------------------------------------- tokens -- */

const TOKENS = new Map();
for (const [, name, body] of CSS.matchAll(
  /(--color-[a-z0-9-]+):\s*oklch\(([^)]+)\)/gi,
)) {
  const parts = body.trim().split(/\s+/);
  const L = parseFloat(parts[0]) / (parts[0].includes("%") ? 100 : 1);
  const C = parseFloat(parts[1] ?? "0");
  const H = parseFloat(parts[2] ?? "0");
  if (!TOKENS.has(name)) TOKENS.set(name, oklchToLinearRgb(L, C, H));
}

const rgb = (name) => {
  const value = TOKENS.get(`--color-${name}`);
  if (!value) throw new Error(`unknown token --color-${name}`);
  return value;
};

/* --------------------------------------------------------------- pairs -- */

const BODY = 4.5;
const LARGE = 3;

const PAIRS = [
  // Text on the three surfaces.
  ["ink", "paper", BODY, "primary text on page white"],
  ["ink", "paper-2", BODY, "primary text on the alternating band"],
  ["ink", "paper-3", BODY, "primary text on an inset surface"],
  ["ink-2", "paper", BODY, "subheads on page white"],
  ["ink-2", "paper-3", BODY, "subheads on an inset surface"],
  ["neutral", "paper", BODY, "secondary text on page white"],
  ["neutral", "paper-3", BODY, "secondary text on an inset surface"],
  ["muted", "paper", BODY, "meta text on page white"],
  ["muted", "paper-2", BODY, "meta text on the alternating band"],
  ["muted", "paper-3", BODY, "meta text on a table head — the classic near-miss"],

  // Fills that carry text. Gate 41's first clause.
  ["accent-ink", "accent", BODY, "primary CTA label on the ink pill"],
  ["signal-ink", "signal", BODY, "label on a signal fill"],
  ["paper", "ink", BODY, "text on a flipped dark surface"],

  // The one chromatic colour.
  ["signal", "paper", BODY, "link text in app chrome"],
  ["signal", "paper-2", BODY, "link text on the alternating band"],
  ["signal", "signal-soft", BODY, "active sidebar item on its own tint"],

  // Status vocabulary.
  ["positive", "paper", LARGE, "accepted marker on white"],
  ["positive", "positive-soft", BODY, "accepted chip"],
  ["warn", "paper", LARGE, "overdue marker on white"],
  ["warn", "warn-soft", BODY, "overdue chip"],
  ["danger", "paper", BODY, "destructive text on white"],
  ["danger", "danger-soft", BODY, "declined chip"],

  // Non-text contrast: rings and control boundaries.
  ["focus", "paper", LARGE, "focus ring against the page"],
  ["focus", "accent", LARGE, "focus ring against the ink pill it surrounds"],
  ["focus", "paper-3", LARGE, "focus ring against an inset surface"],
  ["field", "paper", LARGE, "input border against the page"],
  ["field", "paper-3", LARGE, "input border on an inset surface"],
];

let failures = 0;
console.log("\x1b[1mContrast audit — src/app/tokens.css\x1b[0m\n");
console.log(
  `  ${"pair".padEnd(30)} ${"ratio".padStart(7)}  ${"min".padStart(4)}   what`,
);
console.log(`  ${"-".repeat(88)}`);

for (const [fg, bg, min, label] of PAIRS) {
  const value = ratio(rgb(fg), rgb(bg));
  const pass = value >= min;
  if (!pass) failures += 1;
  const mark = pass ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(
    `${mark} ${`${fg} on ${bg}`.padEnd(30)} ${value.toFixed(2).padStart(7)}  ${String(min).padStart(4)}   ${label}`,
  );
}

// Gate 41: a fill and its own label must not be within touching distance.
const SAME = [
  ["accent-ink", "accent"],
  ["signal-ink", "signal"],
];
for (const [ink, fill] of SAME) {
  const delta = Math.abs(luminance(rgb(ink)) - luminance(rgb(fill)));
  if (delta < 0.05) {
    failures += 1;
    console.log(`\x1b[31m✗ ${ink} is indistinguishable from ${fill}\x1b[0m`);
  }
}

console.log(`\n  resolved values:`);
for (const name of ["paper", "paper-2", "paper-3", "rule", "rule-2", "muted", "neutral", "ink-2", "ink", "signal"]) {
  console.log(`    --color-${name.padEnd(9)} ${hex(rgb(name))}`);
}

if (failures) {
  console.log(`\n\x1b[31m${failures} pair(s) below threshold — gates 40/41 fail.\x1b[0m`);
  process.exit(1);
}
console.log(`\n\x1b[32m${PAIRS.length} pairs pass — gates 40 and 41 clear.\x1b[0m`);
