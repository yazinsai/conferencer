#!/usr/bin/env node
/**
 * Layout and accessibility audit of the rendered pages.
 *
 *   npm run dev   (or npm start)   then   npm run audit
 *
 * The design system makes promises that only the rendered page can keep, so this
 * checks them in a real browser rather than by reading CSS:
 *
 *   · no horizontal scroll at 320 / 375 / 414 / 768 / 1280 / 1440
 *   · no clickable label wrapping onto a second line at any of those widths
 *   · every interactive element has an accessible name
 *   · every image has alt text, and no above-the-fold image is lazy-loaded
 *   · the hero's headline, lede and primary action all fit a 1280x800 laptop
 *   · every focusable element paints a visible focus ring
 *
 * Dependency-free: Chrome over the DevTools protocol, the same way scripts/shots.mjs
 * drives it and the same sign-in scripts/smoke.mjs uses.
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";
const SLUG = process.env.AUDIT_SLUG ?? "devflow-conf-2027";
const CHROME = process.env.CHROME_BIN ?? "/usr/local/bin/google-chrome";
const ORGANIZER = { email: "sbek-organizer@example.com", password: "SbekTest!2027-org" };

const WIDTHS = [320, 375, 414, 768, 1280, 1440];
const PAGES = [
  { path: "/", name: "landing page", hero: true, scrollState: "frost", scrim: "[data-scrim]" },
  {
    path: `/e/${SLUG}`,
    name: "public event home",
    hero: true,
    scrollState: "retract",
    scrim: "[data-scrim]",
  },
  { path: `/e/${SLUG}/sessions`, name: "public sessions" },
  { path: `/e/${SLUG}/agenda`, name: "public agenda" },
  { path: `/admin/e/${SLUG}`, name: "organizer dashboard", auth: true },
  { path: `/admin/e/${SLUG}/submissions`, name: "submissions list", auth: true },
];

let passed = 0;
let failed = 0;
const ok = (name, extra = "") =>
  (passed++, console.log(`  \x1b[32m✓\x1b[0m ${name}${extra ? ` \x1b[90m${extra}\x1b[0m` : ""}`));
const fail = (name, detail) => {
  failed++;
  console.log(`  \x1b[31m✗ ${name}\x1b[0m`);
  if (detail) console.log(`      ${String(detail).slice(0, 600)}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------- pixels behind the text -- */

/**
 * Minimal PNG reader — 8-bit non-interlaced RGB/RGBA, which is what
 * `Page.captureScreenshot` returns. Dependency-free, like everything else in
 * scripts/; the repo already hand-rolls a PNG *writer* in seed/avatars.ts.
 */
function decodePng(buffer) {
  let width = 0;
  let height = 0;
  let channels = 4;
  const idat = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8) throw new Error("only 8-bit PNGs are supported");
      channels = data[9] === 6 ? 4 : data[9] === 2 ? 3 : 0;
      if (!channels) throw new Error(`unsupported PNG colour type ${data[9]}`);
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    offset += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[pos];
    pos += 1;
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const out = pixels.subarray(y * stride, (y + 1) * stride);
    const prior = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? out[x - channels] : 0;
      const b = prior ? prior[x] : 0;
      const c = prior && x >= channels ? prior[x - channels] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[x] = value & 0xff;
    }
  }
  return { width, height, channels, pixels };
}

const channelLuminance = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminanceAt = (image, x, y) => {
  const i = y * image.width * image.channels + x * image.channels;
  return (
    0.2126 * channelLuminance(image.pixels[i]) +
    0.7152 * channelLuminance(image.pixels[i + 1]) +
    0.0722 * channelLuminance(image.pixels[i + 2])
  );
};

const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/* -------------------------------------------------------- browser plumbing -- */

async function launch() {
  const profile = mkdtempSync(join(tmpdir(), "conferencer-audit-"));
  const port = 9400 + Math.floor(Math.random() * 300);
  const child = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-sandbox",
      "--disable-gpu",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let wsUrl = null;
  for (let i = 0; i < 100 && !wsUrl; i += 1) {
    await sleep(100);
    try {
      wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json())
        .webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
  }
  if (!wsUrl) throw new Error("Chrome never opened a DevTools endpoint");
  return { child, profile, port };
}

async function openPage(port) {
  const target = await (
    await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })
  ).json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  const events = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else if (message.method) {
      for (const fn of events.get(message.method) ?? []) fn(message.params);
    }
  });
  const send = (method, params = {}) => {
    const i = (id += 1);
    socket.send(JSON.stringify({ id: i, method, params }));
    return new Promise((resolve, reject) => pending.set(i, { resolve, reject }));
  };
  const once = (method) =>
    new Promise((resolve) => {
      const list = events.get(method) ?? [];
      const fn = (params) => {
        events.set(method, (events.get(method) ?? []).filter((f) => f !== fn));
        resolve(params);
      };
      events.set(method, [...list, fn]);
    });
  return { send, once, close: () => socket.close() };
}

/** Same server-action sign-in the smoke test uses. */
async function organizerCookie() {
  const jar = new Map();
  const absorb = (response) => {
    for (const raw of response.headers.getSetCookie?.() ?? []) {
      const [pair] = raw.split(";");
      const i = pair.indexOf("=");
      jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    }
  };
  const header = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  const page = await fetch(`${BASE}/sign-in`, { headers: { cookie: header() } });
  absorb(page);
  const actionId = /name="\$ACTION_ID_([^"]+)"/.exec(await page.text())?.[1];
  const form = new FormData();
  form.set(`$ACTION_ID_${actionId}`, "");
  form.set("email", ORGANIZER.email);
  form.set("password", ORGANIZER.password);
  form.set("next", "");
  absorb(
    await fetch(`${BASE}/sign-in`, {
      method: "POST",
      body: form,
      redirect: "manual",
      headers: { cookie: header(), origin: BASE },
    }),
  );
  return jar.get("cf_session");
}

/* ---------------------------------------------------------------- the probe -- */

/** Runs in the page. Returns everything the audit needs in one round trip. */
const PROBE = `(() => {
  const box = (el) => el.getBoundingClientRect();
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0") return false;
    const r = box(el);
    return r.width > 0 && r.height > 0;
  };

  // Slop gate 49 is about *labels* — a button, a nav link, a tab, a breadcrumb, a
  // CTA. It is not about a card that happens to be wrapped in an anchor, which is
  // a block of content and is supposed to wrap. So the candidate set is scoped to
  // chrome and to button-shaped anchors, and anything containing a block-level
  // child is skipped.
  const isLabel = (el) => {
    if (!visible(el)) return false;
    if ((el.textContent || "").trim().length === 0) return false;
    for (const child of el.querySelectorAll("*")) {
      const d = getComputedStyle(child).display;
      if (d === "block" || d === "grid" || d === "list-item" || d === "flex") return false;
    }
    return true;
  };
  const affordances = [
    ...document.querySelectorAll(
      'button, summary, [role="tab"], nav a, header a, footer a, a[data-slot="button"], a[class*="rounded-pill"]',
    ),
  ].filter(isLabel);

  // Cluster the text's client rects by line box rather than by exact pixel: a
  // flex row whose children sit a pixel apart is one line, not two.
  const wrapped = [];
  for (const el of affordances) {
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 16;
    const tops = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (r.width === 0 && r.height === 0) continue;
        if (!tops.some((t) => Math.abs(t - r.top) < lh * 0.6)) tops.push(r.top);
      }
    }
    if (tops.length > 1) wrapped.push((el.textContent || "").trim().slice(0, 48));
  }

  const nameless = affordances
    .filter((el) => {
      const label = (el.getAttribute("aria-label") || el.textContent || "").trim();
      return label.length === 0;
    })
    .map((el) => el.outerHTML.slice(0, 80));

  const images = [...document.images];
  const noAlt = images.filter((i) => !i.hasAttribute("alt")).map((i) => i.currentSrc || i.src);
  const lazyAboveFold = images
    .filter((i) => i.loading === "lazy" && box(i).top < window.innerHeight)
    .map((i) => i.currentSrc || i.src);

  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    wrapped,
    nameless,
    noAlt,
    lazyAboveFold,
    overflowX: getComputedStyle(document.documentElement).overflowX,
    bodyOverflowX: getComputedStyle(document.body).overflowX,
  };
})()`;

/** Above-the-fold check for a hero: headline, lede and the primary action. */
const HERO_PROBE = `(() => {
  const h1 = document.querySelector("h1");
  if (!h1) return { ok: false, why: "no h1" };
  const section = h1.closest("section") || h1.parentElement;
  const cta = section.querySelector('a[class*="bg-primary"], a[data-variant="default"], button[data-variant="default"]')
    || section.querySelector("a[href]");
  const bottom = Math.max(
    h1.getBoundingClientRect().bottom,
    cta ? cta.getBoundingClientRect().bottom : 0,
  );
  return { ok: bottom <= window.innerHeight, bottom: Math.round(bottom), viewport: window.innerHeight };
})()`;

/**
 * Reads the ring on whatever currently has focus.
 *
 * `:focus-visible` is a keyboard heuristic, so calling `.focus()` from script
 * does not trigger it in Chrome — the tab has to be driven with real Tab key
 * events, which is what the caller does.
 */
const FOCUSED_RING_PROBE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  // The dev server's own overlay is a focus stop and is not part of the product.
  if (el.tagName.toLowerCase() === "nextjs-portal") return null;

  const rings = (node) => {
    const s = getComputedStyle(node);
    const outline =
      s.outlineStyle !== "none" &&
      parseFloat(s.outlineWidth) > 0 &&
      !/transparent|rgba\\(0, 0, 0, 0\\)/.test(s.outlineColor);
    return Boolean(outline || (s.boxShadow && s.boxShadow !== "none"));
  };

  // A control wrapped in a styled shell (the search pill) legitimately paints its
  // ring on the shell, so walk up a few levels before calling it bare.
  let node = el;
  let ring = false;
  for (let i = 0; node && i < 4; i += 1) {
    if (rings(node)) { ring = true; break; }
    node = node.parentElement;
  }

  return {
    ring,
    tag: el.tagName.toLowerCase(),
    label: (el.getAttribute("aria-label") || el.textContent || el.name || "").trim().slice(0, 28),
  };
})()`;

async function main() {
  console.log(`\x1b[1mConferencer layout + a11y audit\x1b[0m → ${BASE}\n`);
  const cookie = await organizerCookie();
  const browser = await launch();

  try {
    for (const page of PAGES) {
      console.log(`\x1b[1m${page.name}\x1b[0m \x1b[90m${page.path}\x1b[0m`);
      for (const width of WIDTHS) {
        const tab = await openPage(browser.port);
        try {
          await tab.send("Page.enable");
          await tab.send("Network.enable");
          await tab.send("Emulation.setDeviceMetricsOverride", {
            width,
            height: width < 500 ? 812 : 800,
            deviceScaleFactor: 1,
            mobile: width < 500,
          });
          if (page.auth) {
            await tab.send("Network.setCookie", {
              name: "cf_session",
              value: cookie,
              domain: new URL(BASE).hostname,
              path: "/",
            });
          }
          const loaded = tab.once("Page.loadEventFired");
          await tab.send("Page.navigate", { url: `${BASE}${page.path}` });
          await Promise.race([loaded, sleep(20000)]);
          await tab.send("Runtime.evaluate", {
            expression: "document.fonts.ready.then(() => 1)",
            awaitPromise: true,
          });

          // Scroll the document once, then return to the top. Marketing surfaces
          // reveal their sections on first sight (design.md § Motion · marketing
          // surfaces, item 4); the reveals are one-shot and sticky, so one pass
          // leaves every section measurable. Without it this audit would only ever
          // check the first viewport of a long page.
          await tab.send("Runtime.evaluate", {
            expression: `(async () => {
              const step = Math.max(200, window.innerHeight * 0.75);
              for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
                window.scrollTo(0, y);
                await new Promise((r) => requestAnimationFrame(r));
              }
              window.scrollTo(0, 0);
              await new Promise((r) => setTimeout(r, 400));
            })()`,
            awaitPromise: true,
          });
          await sleep(250);

          const { result } = await tab.send("Runtime.evaluate", {
            expression: PROBE,
            returnByValue: true,
          });
          const r = result.value;

          const label = `${width}px`;
          if (r.scrollWidth <= r.clientWidth + 1) ok(`${label} no horizontal scroll`);
          else fail(`${label} no horizontal scroll`, `scrollWidth ${r.scrollWidth} > ${r.clientWidth}`);

          if (r.overflowX === "clip" && r.bodyOverflowX === "clip") {
            if (width === WIDTHS[0]) ok("overflow-x: clip on html and body");
          } else if (width === WIDTHS[0]) {
            fail("overflow-x: clip on html and body", `${r.overflowX} / ${r.bodyOverflowX}`);
          }

          if (!r.wrapped.length) ok(`${label} no clickable label on two lines`);
          else fail(`${label} no clickable label on two lines`, r.wrapped.join(" | "));

          if (width === 1280) {
            if (!r.nameless.length) ok("every interactive element has a name");
            else fail("every interactive element has a name", r.nameless.join(" | "));

            if (!r.noAlt.length) ok("every image has alt text");
            else fail("every image has alt text", r.noAlt.join(" | "));

            if (!r.lazyAboveFold.length) ok("no above-the-fold image is lazy-loaded");
            else fail("no above-the-fold image is lazy-loaded", r.lazyAboveFold.join(" | "));

            // Text over a photograph cannot be checked from tokens: what matters
            // is the pixel that actually lands behind each glyph. Hide the text,
            // photograph the surface, and read the worst case underneath it.
            if (page.scrim) {
              // Only text inside the viewport can be measured against the pixels
              // behind it, so each scrim is scrolled into view and measured in
              // turn. Before this, a scrim below the fold scored "0 runs" and the
              // check passed without having looked at anything.
              const { result: scrimCount } = await tab.send("Runtime.evaluate", {
                expression: `document.querySelectorAll(${JSON.stringify(page.scrim)}).length`,
                returnByValue: true,
              });
              const scrimRuns = [];
              const scrimFailures = [];

              for (let index = 0; index < scrimCount.value; index += 1) {
              await tab.send("Runtime.evaluate", {
                expression: `(async () => {
                  const el = document.querySelectorAll(${JSON.stringify(page.scrim)})[${index}];
                  if (!el) return;
                  el.scrollIntoView({ block: "center", behavior: "instant" });
                  await new Promise((r) => setTimeout(r, 350));
                })()`,
                awaitPromise: true,
              });
              const measured = await tab.send("Runtime.evaluate", {
                expression: `(() => {
                  const runs = [];
                  // Resolve the text colour to sRGB bytes in the browser. This used
                  // to be a regex for rgb() in Node, which silently fell back to
                  // white for any colour Chrome reports in another space — and
                  // every colour in this product is an oklch() custom property, so
                  // Chrome reports oklab(). White ink assumed over a white pill
                  // scored 1.00 and failed a surface that is actually 18:1.
                  const probe = document.createElement("canvas");
                  probe.width = probe.height = 1;
                  const ctx = probe.getContext("2d", { willReadFrequently: true });
                  const toRgb = (color) => {
                    ctx.clearRect(0, 0, 1, 1);
                    ctx.fillStyle = "#000";
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, 1, 1);
                    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                    return [r, g, b];
                  };
                  for (const scrim of [document.querySelectorAll(${JSON.stringify(page.scrim)})[${index}]].filter(Boolean)) {
                    for (const el of scrim.querySelectorAll("h1,h2,h3,p,dd,dt,span,a")) {
                      const text = (el.textContent || "").trim();
                      if (!text) continue;
                      // Only the element that actually paints the glyphs.
                      if ([...el.children].some((c) => (c.textContent || "").trim())) continue;
                      const s = getComputedStyle(el);
                      const size = parseFloat(s.fontSize);
                      const large = size >= 24 || (size >= 18.66 && parseInt(s.fontWeight, 10) >= 700);
                      // Measure the **glyphs**, not the element box. A padded pill
                      // is the case that matters: its box includes 24px of padding
                      // and two rounded corners, and the corners show the surface
                      // behind the pill rather than the pill's own fill — so the
                      // worst pixel in the box was the dark band outside a white
                      // button, and an 18:1 label scored 1.01. Text-node rects also
                      // give one box per line for free, where the element's box
                      // covers space a wrapped inline never reaches.
                      const rects = [];
                      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
                      let textNode;
                      while ((textNode = walker.nextNode())) {
                        if (!textNode.nodeValue.trim()) continue;
                        const range = document.createRange();
                        range.selectNodeContents(textNode);
                        rects.push(...range.getClientRects());
                      }
                      for (const r of rects) {
                        if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) continue;
                        runs.push({
                          text: text.slice(0, 32), color: s.color, rgb: toRgb(s.color), large,
                          rect: {
                            x: Math.round(r.x), y: Math.round(r.y + r.height * 0.2),
                            w: Math.round(r.width), h: Math.max(1, Math.round(r.height * 0.6)),
                          },
                        });
                      }
                    }
                  }
                  // Take every glyph out without touching a single background.
                  const style = document.createElement("style");
                  style.id = "audit-hide";
                  style.textContent =
                    "[data-scrim] *{color:transparent !important;text-shadow:none !important;" +
                    "text-decoration-color:transparent !important;-webkit-text-fill-color:transparent !important}";
                  document.head.append(style);
                  return runs;
                })()`,
                returnByValue: true,
              });
              const runs = measured.result.value;
              const shot = await tab.send("Page.captureScreenshot", { format: "png" });
              await tab.send("Runtime.evaluate", {
                expression: `document.getElementById("audit-hide")?.remove()`,
              });

              if (process.env.AUDIT_DUMP) {
                const { writeFileSync } = await import("node:fs");
                writeFileSync(
                  `/tmp/scrim-${page.name.replace(/\W+/g, "-")}-${index}.png`,
                  Buffer.from(shot.data, "base64"),
                );
              }
              const image = decodePng(Buffer.from(shot.data, "base64"));
              const failures = [];
              for (const run of runs) {
                const rgb = run.rgb ?? [255, 255, 255];
                const ink =
                  0.2126 * channelLuminance(rgb[0]) +
                  0.7152 * channelLuminance(rgb[1]) +
                  0.0722 * channelLuminance(rgb[2]);
                // Worst case is the background pixel closest in luminance to the
                // text, so scan the whole run rather than sampling its centre.
                let worst = Infinity;
                for (let y = run.rect.y; y < Math.min(run.rect.y + run.rect.h, image.height); y += 2) {
                  for (let x = run.rect.x; x < Math.min(run.rect.x + run.rect.w, image.width); x += 3) {
                    if (x < 0 || y < 0) continue;
                    const ratio = contrast(ink, luminanceAt(image, x, y));
                    if (ratio < worst) worst = ratio;
                  }
                }
                const min = run.large ? 3 : 4.5;
                // The rect and the resolved ink are in the message because the two
                // ways this check goes wrong are both invisible otherwise: it
                // measured the wrong pixels, or it resolved the wrong text colour.
                if (worst < min) {
                  failures.push(
                    `"${run.text}" ${worst.toFixed(2)} < ${min} · ink rgb(${run.rgb.join(",")}) · at ${run.rect.x},${run.rect.y} ${run.rect.w}x${run.rect.h}`,
                  );
                }
              }
              scrimRuns.push(...runs);
              scrimFailures.push(...failures);
              }

              await tab.send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
              await sleep(200);

              if (scrimFailures.length) {
                fail("text over photography clears its threshold", scrimFailures.join(" | "));
              } else if (!scrimRuns.length) {
                // Never report a pass for a check that measured nothing.
                fail(
                  "text over photography clears its threshold",
                  `no text runs found inside ${page.scrim} — the check measured nothing`,
                );
              } else {
                ok(
                  "text over photography clears its threshold",
                  `${scrimRuns.length} runs across ${scrimCount.value} scrim${scrimCount.value === 1 ? "" : "s"}`,
                );
              }
            }

            // The two scroll-driven navs are the only stateful chrome in the
            // product, and they fail silently when they fail — the bar simply
            // never frosts. Assert the state actually changes.
            if (page.scrollState) {
              const state = await tab.send("Runtime.evaluate", {
                expression: `new Promise((resolve) => {
                  const header = document.querySelector("header");
                  const read = () => {
                    const s = getComputedStyle(header);
                    return { bg: s.backgroundColor, top: Math.round(header.getBoundingClientRect().top) };
                  };
                  // Establish the rest state rather than assuming the page is
                  // already in it: earlier checks scroll, and the frost has a
                  // 180ms transition, so reading immediately catches it mid-fade.
                  window.scrollTo(0, 0);
                  setTimeout(() => {
                  const rest = read();
                  window.scrollTo(0, 700);
                  setTimeout(() => {
                    const moved = read();
                    window.scrollTo(0, 0);
                    setTimeout(() => resolve({ rest, moved }), 500);
                  }, 900);
                  }, 600);
                })`,
                awaitPromise: true,
                returnByValue: true,
              });
              const { rest, moved } = state.result.value;
              const transparent = (c) => /rgba\(0, 0, 0, 0\)|transparent/.test(c);
              const changed =
                page.scrollState === "frost"
                  ? transparent(rest.bg) && !transparent(moved.bg)
                  : rest.top === 0 && moved.top < 0;
              const what = page.scrollState === "frost" ? "nav frosts on scroll" : "banner retracts on scroll";
              if (changed) ok(what, `${JSON.stringify(rest)} → ${JSON.stringify(moved)}`);
              else fail(what, `${JSON.stringify(rest)} → ${JSON.stringify(moved)}`);
            }

            // Before the tab sweep, which scrolls the page off the top.
            if (page.hero) {
              const hero = await tab.send("Runtime.evaluate", {
                expression: HERO_PROBE,
                returnByValue: true,
              });
              const h = hero.result.value;
              if (h.ok) ok("hero fits a 1280x800 laptop", `${h.bottom}px of ${h.viewport}px`);
              else fail("hero fits a 1280x800 laptop", `${h.bottom}px of ${h.viewport}px`);
            }

            // Tab through the first 30 stops with real key events so
            // :focus-visible actually applies, and read the ring at each one.
            const bare = [];
            let stops = 0;
            for (let i = 0; i < 30; i += 1) {
              for (const type of ["rawKeyDown", "keyUp"]) {
                await tab.send("Input.dispatchKeyEvent", {
                  type,
                  key: "Tab",
                  code: "Tab",
                  windowsVirtualKeyCode: 9,
                  nativeVirtualKeyCode: 9,
                });
              }
              const probe = await tab.send("Runtime.evaluate", {
                expression: FOCUSED_RING_PROBE,
                returnByValue: true,
              });
              const focused = probe.result.value;
              if (!focused) continue;
              stops += 1;
              if (!focused.ring) bare.push(`${focused.tag}:${focused.label}`);
            }
            if (!bare.length) ok("every keyboard stop paints a focus ring", `${stops} stops`);
            else fail("every keyboard stop paints a focus ring", bare.join(" | "));


          }
        } finally {
          tab.close();
        }
      }
      console.log("");
    }
  } finally {
    browser.child.kill("SIGTERM");
    try {
      rmSync(browser.profile, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }

  console.log(
    failed
      ? `\x1b[1m\x1b[31m${passed} passed, ${failed} failed\x1b[0m`
      : `\x1b[1m\x1b[32m${passed} passed, 0 failed\x1b[0m`,
  );
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(`\x1b[31m${error.stack ?? error.message}\x1b[0m`);
  process.exit(1);
});
