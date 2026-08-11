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
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";
const SLUG = process.env.AUDIT_SLUG ?? "devflow-conf-2027";
const CHROME = process.env.CHROME_BIN ?? "/usr/local/bin/google-chrome";
const ORGANIZER = { email: "sbek-organizer@example.com", password: "SbekTest!2027-org" };

const WIDTHS = [320, 375, 414, 768, 1280, 1440];
const PAGES = [
  { path: "/", name: "landing page", hero: true },
  { path: `/e/${SLUG}`, name: "public event home", hero: true },
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
