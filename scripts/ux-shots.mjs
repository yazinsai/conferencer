#!/usr/bin/env node
/**
 * Full-page screenshots for admin + speaker portal UX audit.
 *
 *   npm run seed && npm run dev
 *   node scripts/ux-shots.mjs --out /opt/cursor/artifacts/screenshots/before
 *   node scripts/ux-shots.mjs --out /opt/cursor/artifacts/screenshots/after
 *   node scripts/ux-shots.mjs --list
 */

import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.SHOTS_BASE ?? "http://localhost:3000";
const SLUG = process.env.SHOTS_SLUG ?? "devflow-conf-2027";
const CHROME =
  process.env.CHROME_BIN ??
  ["/usr/local/bin/google-chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(Boolean);

const ACCOUNTS = {
  organizer: { email: "demo-organizer@example.com", password: "SbekTest!2027-org" },
  speaker: { email: "demo-speaker@example.com", password: "SbekTest!2027-spk" },
};

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const OUT = flag("out", "/opt/cursor/artifacts/screenshots/before");
const WIDTH = Number(flag("width", "1440"));
const HEIGHT = Number(flag("height", "900"));
const SCALE = Number(flag("scale", "1"));

/* ------------------------------------------------------------------ CDP -- */

class Chrome {
  static async launch() {
    const profile = mkdtempSync(join(tmpdir(), "conferencer-ux-shots-"));
    const port = 9300 + Math.floor(Math.random() * 400);
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
    const target = await fetch(`http://127.0.0.1:${this.port}/json/new?about:blank`, {
      method: "PUT",
    }).then((r) => r.json());
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
        this.listeners.set(
          method,
          (this.listeners.get(method) ?? []).filter((f) => f !== fn),
        );
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

async function signInCookie(account) {
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
  form.set("email", account.email);
  form.set("password", account.password);
  form.set("next", "");
  const response = await fetch(`${BASE}/sign-in`, {
    method: "POST",
    body: form,
    redirect: "manual",
    headers: { cookie: cookieHeader(), origin: BASE },
  });
  absorb(response);

  const session = jar.get("cf_session");
  if (!session) throw new Error(`sign-in failed for ${account.email}`);
  return session;
}

async function fetchHtml(path, cookie) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { cookie: `cf_session=${cookie}` },
    redirect: "follow",
  });
  return response.text();
}

function firstMatch(html, pattern) {
  return pattern.exec(html)?.[1] ?? null;
}

/* -------------------------------------------------------------- inventory -- */

async function buildManifest(organizerCookie, speakerCookie) {
  const base = `/admin/e/${SLUG}`;
  const adminHtml = {
    forms: await fetchHtml(`${base}/forms`, organizerCookie),
    evaluation: await fetchHtml(`${base}/evaluation`, organizerCookie),
    submissions: await fetchHtml(`${base}/submissions`, organizerCookie),
    speakers: await fetchHtml(`${base}/speakers`, organizerCookie),
  };
  const portalHtml = {
    submissions: await fetchHtml("/portal/submissions", speakerCookie),
    tasks: await fetchHtml("/portal/tasks", speakerCookie),
  };

  const formId = firstMatch(adminHtml.forms, /\/forms\/([A-Za-z0-9]{12,})/);
  const planId = firstMatch(adminHtml.evaluation, /\/evaluation\/([A-Za-z0-9]{12,})/);
  let roundId = null;
  if (planId) {
    const planHtml = await fetchHtml(`${base}/evaluation/${planId}`, organizerCookie);
    roundId = firstMatch(planHtml, new RegExp(`/evaluation/${planId}/rounds/([A-Za-z0-9]{12,})`));
  }
  const submissionId = firstMatch(
    adminHtml.submissions,
    new RegExp(`/submissions/([A-Za-z0-9]{12,})`),
  );
  const contactId = firstMatch(
    adminHtml.speakers,
    new RegExp(`/speakers/([A-Za-z0-9]{12,})`),
  );
  const portalSubmissionId = firstMatch(
    portalHtml.submissions,
    /\/portal\/submissions\/([A-Za-z0-9]{12,})/,
  );
  const portalTaskId = firstMatch(portalHtml.tasks, /\/portal\/tasks\/([A-Za-z0-9]{12,})/);

  /** @type {Array<{ name: string, path: string, role: 'organizer'|'speaker' }>} */
  const pages = [
    // A — sidebar
    { name: "admin__dashboard", path: base, role: "organizer" },
    { name: "admin__submissions", path: `${base}/submissions`, role: "organizer" },
    { name: "admin__abstracts", path: `${base}/abstracts`, role: "organizer" },
    { name: "admin__sessions", path: `${base}/sessions`, role: "organizer" },
    { name: "admin__files", path: `${base}/files`, role: "organizer" },
    { name: "admin__forms", path: `${base}/forms`, role: "organizer" },
    { name: "admin__evaluation", path: `${base}/evaluation`, role: "organizer" },
    { name: "admin__agenda", path: `${base}/agenda`, role: "organizer" },
    { name: "admin__embeds", path: `${base}/embeds`, role: "organizer" },
    { name: "admin__portals", path: `${base}/portals`, role: "organizer" },
    { name: "admin__tasks", path: `${base}/tasks`, role: "organizer" },
    { name: "admin__tasks-deliverables", path: `${base}/tasks/deliverables`, role: "organizer" },
    { name: "admin__speakers", path: `${base}/speakers`, role: "organizer" },
    { name: "admin__team", path: `${base}/team`, role: "organizer" },
    { name: "admin__emails", path: `${base}/emails`, role: "organizer" },
    { name: "admin__emails-templates", path: `${base}/emails/templates`, role: "organizer" },
    { name: "admin__reports", path: `${base}/reports`, role: "organizer" },
    { name: "admin__settings", path: `${base}/settings`, role: "organizer" },
    // B — settings children
    { name: "admin__settings-event", path: `${base}/settings/event`, role: "organizer" },
    { name: "admin__settings-records", path: `${base}/settings/records`, role: "organizer" },
    { name: "admin__settings-tracks", path: `${base}/settings/tracks`, role: "organizer" },
    { name: "admin__settings-formats", path: `${base}/settings/formats`, role: "organizer" },
    { name: "admin__settings-rooms", path: `${base}/settings/rooms`, role: "organizer" },
    { name: "admin__settings-tags", path: `${base}/settings/tags`, role: "organizer" },
    { name: "admin__settings-levels", path: `${base}/settings/levels`, role: "organizer" },
    { name: "admin__settings-fields", path: `${base}/settings/fields`, role: "organizer" },
    { name: "admin__settings-api", path: `${base}/settings/api`, role: "organizer" },
    { name: "admin__settings-airtable", path: `${base}/settings/airtable`, role: "organizer" },
    { name: "admin__settings-webhooks", path: `${base}/settings/webhooks`, role: "organizer" },
    // C — nested
    formId
      ? { name: "admin__forms-id", path: `${base}/forms/${formId}?step=3`, role: "organizer" }
      : null,
    planId
      ? { name: "admin__evaluation-plan", path: `${base}/evaluation/${planId}`, role: "organizer" }
      : null,
    planId && roundId
      ? {
          name: "admin__evaluation-round",
          path: `${base}/evaluation/${planId}/rounds/${roundId}`,
          role: "organizer",
        }
      : null,
    submissionId
      ? {
          name: "admin__submissions-id",
          path: `${base}/submissions/${submissionId}`,
          role: "organizer",
        }
      : null,
    { name: "admin__submissions-new", path: `${base}/submissions/new`, role: "organizer" },
    contactId
      ? { name: "admin__speakers-id", path: `${base}/speakers/${contactId}`, role: "organizer" }
      : null,
    { name: "admin__speakers-new", path: `${base}/speakers/new`, role: "organizer" },
    { name: "admin__speakers-import", path: `${base}/speakers/import`, role: "organizer" },
    { name: "admin__emails-compose", path: `${base}/emails/compose`, role: "organizer" },
    { name: "admin__search", path: `${base}/search?q=priya`, role: "organizer" },
    // D — portal
    { name: "portal__home", path: "/portal", role: "speaker" },
    { name: "portal__submissions", path: "/portal/submissions", role: "speaker" },
    portalSubmissionId
      ? {
          name: "portal__submissions-id",
          path: `/portal/submissions/${portalSubmissionId}`,
          role: "speaker",
        }
      : null,
    { name: "portal__profile", path: "/portal/profile", role: "speaker" },
    { name: "portal__tasks", path: "/portal/tasks", role: "speaker" },
    portalTaskId
      ? { name: "portal__tasks-id", path: `/portal/tasks/${portalTaskId}`, role: "speaker" }
      : null,
  ].filter(Boolean);

  return {
    pages,
    discovered: {
      formId,
      planId,
      roundId,
      submissionId,
      contactId,
      portalSubmissionId,
      portalTaskId,
    },
  };
}

/* ----------------------------------------------------------------- shots -- */

async function capture(chrome, shot, cookie) {
  const page = await chrome.openPage();
  try {
    await page.send("Page.enable");
    await page.send("Network.enable");
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: SCALE,
      mobile: false,
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

    await page.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        const hide = document.createElement("style");
        hide.textContent = "nextjs-portal,[data-nextjs-toast],#__next-build-watcher{display:none !important}";
        document.addEventListener("DOMContentLoaded", () => document.head.append(hide));
      `,
    });

    const loaded = page.once("Page.loadEventFired");
    await page.send("Page.navigate", { url: `${BASE}${shot.path}` });
    await Promise.race([loaded, sleep(20000)]);
    await page.send("Runtime.evaluate", {
      expression: "document.fonts.ready.then(() => 1)",
      awaitPromise: true,
    });
    await sleep(600);

    const { data } = await page.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    const file = join(OUT, `${shot.name}.png`);
    writeFileSync(file, Buffer.from(data, "base64"));
    const kb = Math.round(Buffer.from(data, "base64").length / 1024);
    console.log(
      `  \x1b[32m✓\x1b[0m ${shot.name.padEnd(32)} ${String(kb).padStart(5)} KB  [${shot.role}] ${shot.path}`,
    );
    return file;
  } finally {
    page.close();
  }
}

async function main() {
  if (!CHROME) throw new Error("No Chrome binary found — set CHROME_BIN");

  console.log(`Signing in…`);
  const organizerCookie = await signInCookie(ACCOUNTS.organizer);
  const speakerCookie = await signInCookie(ACCOUNTS.speaker);
  const { pages, discovered } = await buildManifest(organizerCookie, speakerCookie);

  const manifestPath = join(OUT, "_manifest.json");
  mkdirSync(OUT, { recursive: true });
  writeFileSync(manifestPath, JSON.stringify({ base: BASE, slug: SLUG, discovered, pages }, null, 2));

  if (has("list")) {
    console.log(`\n${pages.length} pages:\n`);
    for (const p of pages) console.log(`  ${p.name.padEnd(32)} ${p.role.padEnd(10)} ${p.path}`);
    console.log(`\nDiscovered: ${JSON.stringify(discovered, null, 2)}`);
    console.log(`Manifest → ${manifestPath}`);
    return;
  }

  console.log(`\x1b[1mUX screenshots\x1b[0m → ${OUT} (${pages.length} pages)\n`);
  const chrome = await Chrome.launch();
  const cookies = { organizer: organizerCookie, speaker: speakerCookie };
  try {
    for (const shot of pages) await capture(chrome, shot, cookies[shot.role]);
  } finally {
    chrome.close();
  }
  console.log(`\n${pages.length} written. Manifest → ${manifestPath}`);
}

main().catch((error) => {
  console.error(`\x1b[31m${error.stack ?? error.message}\x1b[0m`);
  process.exit(1);
});
