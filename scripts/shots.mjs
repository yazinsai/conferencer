#!/usr/bin/env node
/**
 * Screenshot the running app with headless Chrome, over the DevTools protocol.
 *
 *   npm run dev            (or npm start)
 *   npm run shots          # writes public/screens/*.png — the landing page's captures
 *   npm run shots -- --set responsive --out /tmp/shots
 *
 * Two jobs, one script:
 *
 *  1. `--set product` (default) regenerates the real product captures the landing
 *     page shows. They are real screenshots on purpose: hand-drawn browser chrome
 *     around an invented UI is the most obvious "this was generated" tell there is,
 *     so the page shows the actual app instead.
 *  2. `--set responsive` sweeps the three redesigned surfaces across the viewport
 *     widths the design system promises to survive.
 *
 * Dependency-free, like scripts/smoke.mjs: Chrome over CDP through Node's native
 * WebSocket, and the same server-action sign-in the smoke test uses.
 */

import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.SHOTS_BASE ?? "http://localhost:3000";
const SLUG = process.env.SHOTS_SLUG ?? "devflow-conf-2027";
const CHROME =
  process.env.CHROME_BIN ??
  ["/usr/local/bin/google-chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(Boolean);

const ORGANIZER = { email: "demo-organizer@example.com", password: "SbekTest!2027-org" };

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const SET = flag("set", "product");
const OUT = flag("out", SET === "product" ? "public/screens" : "/tmp/shots");

/* ------------------------------------------------------------------ CDP -- */

class Chrome {
  static async launch() {
    const profile = mkdtempSync(join(tmpdir(), "conferencer-shots-"));
    const port = 9200 + Math.floor(Math.random() * 400);
    const child = spawn(
      CHROME,
      [
        "--headless=new",
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${profile}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-color-profile=srgb",
        "--font-render-hinting=none",
        "about:blank",
      ],
      { stdio: "ignore" },
    );

    let wsUrl = null;
    for (let i = 0; i < 100 && !wsUrl; i += 1) {
      await sleep(100);
      try {
        const info = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());
        wsUrl = info.webSocketDebuggerUrl;
      } catch {
        /* not up yet */
      }
    }
    if (!wsUrl) throw new Error("Chrome never opened a DevTools endpoint");
    return new Chrome(child, profile, port, wsUrl);
  }

  constructor(child, profile, port, wsUrl) {
    this.child = child;
    this.profile = profile;
    this.port = port;
    this.wsUrl = wsUrl;
  }

  async openPage() {
    const target = await fetch(
      `http://127.0.0.1:${this.port}/json/new?about:blank`,
      { method: "PUT" },
    ).then((r) => r.json());
    return Page.connect(target.webSocketDebuggerUrl);
  }

  close() {
    this.child.kill("SIGTERM");
    try {
      rmSync(this.profile, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }
}

class Page {
  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    return new Page(socket);
  }

  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
      } else if (message.method) {
        for (const fn of this.listeners.get(message.method) ?? []) fn(message.params);
      }
    });
  }

  send(method, params = {}) {
    const id = (this.id += 1);
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  once(method) {
    return new Promise((resolve) => {
      const list = this.listeners.get(method) ?? [];
      const fn = (params) => {
        this.listeners.set(method, (this.listeners.get(method) ?? []).filter((f) => f !== fn));
        resolve(params);
      };
      this.listeners.set(method, [...list, fn]);
    });
  }

  close() {
    this.socket.close();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ auth -- */

/** Signs in the way scripts/smoke.mjs does and returns the session cookie value. */
async function organizerCookie() {
  const jar = new Map();
  const absorb = (response) => {
    for (const raw of response.headers.getSetCookie?.() ?? []) {
      const [pair] = raw.split(";");
      const idx = pair.indexOf("=");
      jar.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
    }
  };
  const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");

  const page = await fetch(`${BASE}/sign-in`, { headers: { cookie: cookieHeader() } });
  absorb(page);
  const html = await page.text();
  const actionId = /name="\$ACTION_ID_([^"]+)"/.exec(html)?.[1];
  if (!actionId) throw new Error("could not find the sign-in action id");

  const form = new FormData();
  form.set(`$ACTION_ID_${actionId}`, "");
  form.set("email", ORGANIZER.email);
  form.set("password", ORGANIZER.password);
  form.set("next", "");
  const response = await fetch(`${BASE}/sign-in`, {
    method: "POST",
    body: form,
    redirect: "manual",
    headers: { cookie: cookieHeader(), origin: BASE },
  });
  absorb(response);

  const session = jar.get("cf_session");
  if (!session) throw new Error("sign-in did not return a cf_session cookie");
  return session;
}

/* ----------------------------------------------------------------- shots -- */

async function capture(chrome, shot, cookie) {
  const page = await chrome.openPage();
  try {
    await page.send("Page.enable");
    await page.send("Network.enable");
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: shot.width,
      height: shot.height,
      deviceScaleFactor: shot.scale ?? 2,
      mobile: Boolean(shot.mobile),
    });
    if (cookie) {
      const url = new URL(BASE);
      await page.send("Network.setCookie", {
        name: "cf_session",
        value: cookie,
        domain: url.hostname,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      });
    }

    // The dev server paints its own floating indicator over the bottom-left
    // corner; it is not part of the product and must not appear in a capture.
    await page.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        const hide = document.createElement("style");
        hide.textContent = "nextjs-portal,[data-nextjs-toast],#__next-build-watcher{display:none !important}";
        document.addEventListener("DOMContentLoaded", () => document.head.append(hide));
      `,
    });

    const loaded = page.once("Page.loadEventFired");
    await page.send("Page.navigate", { url: `${BASE}${shot.path}` });
    await Promise.race([loaded, sleep(15000)]);
    // Let webfonts settle so the capture isn't of the metric-matched fallback.
    await page.send("Runtime.evaluate", {
      expression: "document.fonts.ready.then(() => 1)",
      awaitPromise: true,
    });
    // Scroll the whole document once before a full-page capture, then return to
    // the top. The landing page reveals its sections on first sight, and a capture
    // taken without scrolling would photograph the un-revealed state. The reveals
    // are one-shot and sticky (design.md § Motion · marketing surfaces, item 4),
    // so one pass is enough and the page ends up where it started.
    if (shot.full) {
      await page.send("Runtime.evaluate", {
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
    }

    await sleep(shot.settle ?? 500);

    // WebP for the shipped product captures: a 2× PNG of a dense admin screen is
    // ~400 KB, which is not a reasonable thing to put on a landing page.
    const format = flag("format", null) ?? shot.format ?? (SET === "product" ? "webp" : "png");
    const { data } = await page.send("Page.captureScreenshot", {
      format,
      ...(format === "webp" ? { quality: 92 } : {}),
      captureBeyondViewport: Boolean(shot.full),
      ...(shot.full
        ? {}
        : {
            clip: {
              x: 0,
              y: 0,
              width: shot.width,
              height: shot.height,
              scale: 1,
            },
          }),
    });
    const file = join(OUT, `${shot.name}.${format}`);
    writeFileSync(file, Buffer.from(data, "base64"));
    const kb = Math.round(Buffer.from(data, "base64").length / 1024);
    console.log(`  \x1b[32m✓\x1b[0m ${shot.name.padEnd(28)} ${shot.width}×${shot.height}  ${kb} KB  ${shot.path}`);
  } finally {
    page.close();
  }
}

/**
 * The captures the landing page renders. Real UI, never a drawn mockup — a
 * hand-built browser frame around an invented interface is the loudest "this was
 * generated" tell there is.
 *
 * Record ids are seeded randomly, so they're discovered by scraping the index
 * page for the first link rather than hardcoded.
 */
async function discover(path, pattern) {
  const html = await fetch(`${BASE}${path}`, {
    headers: { cookie: `cf_session=${await cookiePromise}` },
  }).then((r) => r.text());
  const match = pattern.exec(html);
  return match?.[1] ?? null;
}

let cookiePromise = null;

async function productShots() {
  const formId = await discover(`/admin/e/${SLUG}/forms`, /\/forms\/([A-Za-z0-9]{12,})/);
  const planId = await discover(`/admin/e/${SLUG}/evaluation`, /\/evaluation\/([A-Za-z0-9]{12,})/);

  // The tour captures run at full measure on the page, so a 1200px viewport
  // lands near 1:1 and stays readable. The hero capture is shown at half a
  // column, so it is taken narrower still — otherwise it scales to ~38% and the
  // dashboard reads as grey texture instead of as software.
  const tour = { width: 1200, height: 760, auth: true };

  return [
    { name: "dashboard", path: `/admin/e/${SLUG}`, width: 1040, height: 680, auth: true },
    // Step 3 is the question list — the part of the builder worth showing.
    formId
      ? { name: "cfp-builder", path: `/admin/e/${SLUG}/forms/${formId}?step=3`, ...tour }
      : null,
    planId ? { name: "review", path: `/admin/e/${SLUG}/evaluation/${planId}`, ...tour } : null,
    { name: "agenda", path: `/admin/e/${SLUG}/agenda`, ...tour },
    { name: "public-agenda", path: `/e/${SLUG}/agenda`, width: 1200, height: 760 },
  ].filter(Boolean);
}

const RESPONSIVE = ["/", `/e/${SLUG}`, `/admin/e/${SLUG}`].flatMap((path) =>
  [320, 375, 414, 768, 1280, 1440].map((width) => ({
    name: `${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root"}-${width}`,
    path,
    width,
    height: width < 500 ? 812 : 900,
    mobile: width < 500,
    scale: 1,
    full: true,
    auth: path.startsWith("/admin"),
  })),
);

async function main() {
  if (!CHROME) throw new Error("No Chrome binary found — set CHROME_BIN");
  mkdirSync(OUT, { recursive: true });

  cookiePromise = organizerCookie();
  const cookie = await cookiePromise;
  const shots = SET === "responsive" ? RESPONSIVE : await productShots();

  console.log(`\x1b[1mConferencer screenshots\x1b[0m → ${OUT} (${SET}, ${shots.length} shots)\n`);
  const chrome = await Chrome.launch();
  try {
    for (const shot of shots) await capture(chrome, shot, shot.auth ? cookie : null);
  } finally {
    chrome.close();
  }
  console.log(`\n${shots.length} written.`);
}

main().catch((error) => {
  console.error(`\x1b[31m${error.stack ?? error.message}\x1b[0m`);
  process.exit(1);
});
