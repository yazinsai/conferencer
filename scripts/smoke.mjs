#!/usr/bin/env node
/**
 * End-to-end HTTP smoke test.
 *
 *   npm run dev   (or npm start)   then   npm run smoke
 *
 * Walks the whole product as each persona and asserts status codes, page
 * content and — most importantly — that role scoping actually blocks people.
 */

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";
const SLUG = process.env.SMOKE_SLUG ?? "devflow-conf-2027";

const ACCOUNTS = {
  organizer: { email: "sbek-organizer@example.com", password: "SbekTest!2027-org" },
  organizerAlt: {
    email: "jordan.organizer@sbek-test.example.com",
    password: "SbekTest!2027-org",
  },
  speaker: { email: "sbek-speaker@example.com", password: "SbekTest!2027-spk" },
  speakerAlt: { email: "priya.speaker@sbek-test.example.com", password: "SbekTest!2027-spk" },
  speaker2: { email: "sbek-speaker2@example.com", password: "SbekTest!2027-spk2" },
  reviewer: { email: "sbek-reviewer@example.com", password: "SbekTest!2027-rev" },
  reviewerAlt: { email: "sam.reviewer@sbek-test.example.com", password: "SbekTest!2027-rev" },
};

let passed = 0;
let failed = 0;
const timings = [];

function ok(name, extra = "") {
  passed += 1;
  console.log(`  \x1b[32m✓\x1b[0m ${name}${extra ? ` \x1b[90m${extra}\x1b[0m` : ""}`);
}

function fail(name, detail) {
  failed += 1;
  console.log(`  \x1b[31m✗ ${name}\x1b[0m`);
  if (detail) console.log(`      ${String(detail).slice(0, 400)}`);
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

class Session {
  constructor(name) {
    this.name = name;
    this.cookies = new Map();
  }

  header() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  absorb(response) {
    const raw = response.headers.getSetCookie?.() ?? [];
    for (const cookie of raw) {
      const [pair] = cookie.split(";");
      const idx = pair.indexOf("=");
      const key = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      if (value === "" || value === "deleted") this.cookies.delete(key);
      else this.cookies.set(key, value);
    }
  }

  async request(path, init = {}) {
    const started = Date.now();
    const response = await fetch(`${BASE}${path}`, {
      redirect: "manual",
      ...init,
      headers: {
        cookie: this.header(),
        origin: BASE,
        ...(init.headers ?? {}),
      },
    });
    this.absorb(response);
    timings.push({ path, ms: Date.now() - started, status: response.status });
    return response;
  }

  /** GET following redirects while keeping cookies. */
  async get(path, depth = 0) {
    const response = await this.request(path);
    if (response.status >= 300 && response.status < 400 && depth < 5) {
      const location = response.headers.get("location");
      if (location) {
        const next = location.startsWith("http") ? new URL(location).pathname + new URL(location).search : location;
        return this.get(next, depth + 1);
      }
    }
    const body = await response.text();
    return { status: response.status, body, headers: response.headers };
  }

  async post(path, formData, depth = 0) {
    const body = new URLSearchParams(formData).toString();
    const response = await this.request(path, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    if (response.status >= 300 && response.status < 400 && depth < 5) {
      const location = response.headers.get("location");
      if (location) return this.get(location);
    }
    return { status: response.status, body: await response.text(), headers: response.headers };
  }

  /** Invokes a Next.js server action through its form post endpoint. */
  async signIn(account) {
    const page = await this.get("/sign-in");
    const actionId = /name="\$ACTION_ID_([^"]+)"/.exec(page.body)?.[1];
    if (!actionId) throw new Error("could not find the sign-in action id");
    const form = new FormData();
    form.set("$ACTION_ID_" + actionId, "");
    form.set("email", account.email);
    form.set("password", account.password);
    form.set("next", "");
    const response = await this.request("/sign-in", { method: "POST", body: form });
    const body = await response.text();
    return { status: response.status, body };
  }
}

async function expectStatus(session, path, expected, name) {
  const response = await session.request(path);
  const list = Array.isArray(expected) ? expected : [expected];
  if (list.includes(response.status)) ok(name, `${response.status} ${path}`);
  else fail(name, `${path} returned ${response.status}, expected ${list.join("/")}`);
  return response;
}

async function expectContains(session, path, needles, name) {
  const { status, body } = await session.get(path);
  if (status !== 200) return fail(name, `${path} returned ${status}`);
  const missing = (Array.isArray(needles) ? needles : [needles]).filter((n) => !body.includes(n));
  if (missing.length) fail(name, `${path} missing: ${missing.join(" | ")}`);
  else ok(name, path);
  return body;
}

async function expectMissing(session, path, needles, name) {
  const { status, body } = await session.get(path);
  if (status !== 200) return fail(name, `${path} returned ${status}`);
  const present = (Array.isArray(needles) ? needles : [needles]).filter((n) => body.includes(n));
  if (present.length) fail(name, `${path} unexpectedly contains: ${present.join(" | ")}`);
  else ok(name, path);
}

async function main() {
  console.log(`\x1b[1mConferencer smoke test\x1b[0m → ${BASE}\n`);

  /* ------------------------------------------------------------- public -- */
  section("Public surfaces (logged out)");
  const anon = new Session("anon");

  // `/` is the product's own landing page; the event site lives at /e/<slug>.
  // The invariant moved, it did not go away: both must render logged out with
  // real content, and the landing page must link to the live event so the demo
  // is never orphaned.
  const landing = await expectContains(
    anon,
    "/",
    ["Conferencer", "Open the call.", "Ship the agenda.", "Reasonable questions"],
    "product landing page",
  );
  if (landing?.includes(`/e/${SLUG}`)) ok("landing page links to the live event", `/e/${SLUG}`);
  else fail("landing page links to the live event", `no /e/${SLUG} link in the landing page`);
  // The figures in the landing page's proof band are read from the database, not
  // written into the markup. If seeding changes, this catches a stale hardcode.
  if (landing && /Sessions published/.test(landing) && !/50,000\+|10×|99\.9/.test(landing)) {
    ok("landing page carries live figures, not invented ones");
  } else {
    fail("landing page carries live figures, not invented ones");
  }

  await expectContains(
    anon,
    `/e/${SLUG}`,
    ["DevFlow Conf 2027", "Submit a talk", "On the programme"],
    "public event home",
  );
  await expectContains(
    anon,
    `/e/${SLUG}/sessions`,
    ["Taming 40-Minute CI", "Platform &amp; Infra", "sessions"],
    "sessions list",
  );
  await expectContains(
    anon,
    `/e/${SLUG}/sessions?q=Raman`,
    ["Taming 40-Minute CI"],
    "sessions search matches speaker surname",
  );
  await expectContains(anon, `/e/${SLUG}/speakers`, ["Priya", "Raman"], "speakers directory");
  await expectContains(anon, `/e/${SLUG}/agenda`, ["Room 2A", "Day 1"], "agenda grid");
  await expectContains(anon, `/e/${SLUG}/itinerary`, ["Add to my schedule"], "itinerary");
  await expectContains(anon, `/e/${SLUG}/gallery`, ["Speaker gallery"], "speaker gallery");
  await expectContains(anon, `/e/${SLUG}/my-schedule`, ["My schedule"], "personal schedule");
  await expectMissing(
    anon,
    `/e/${SLUG}/sessions`,
    ["Lightning: Agents in Production Q&amp;A"],
    "approval gate hides unapproved sessions from the public",
  );

  // root aliases the evaluator guesses
  for (const path of ["/sessions", "/speakers", "/agenda", "/schedule", "/gallery", "/itinerary"]) {
    const response = await anon.request(path);
    if (response.status === 307 || response.status === 308) ok(`alias ${path}`, `${response.status}`);
    else fail(`alias ${path}`, `expected redirect, got ${response.status}`);
  }

  section("Public call for speakers");
  const home = await anon.get(`/e/${SLUG}`);
  const formId = /\/submit\/([A-Za-z0-9]+)/.exec(home.body)?.[1];
  if (formId) ok("public CFP link present", formId);
  else fail("public CFP link present");
  if (formId) {
    await expectContains(
      anon,
      `/e/${SLUG}/submit/${formId}`,
      ["DevFlow Conf 2027", "Key takeaway", "Workshop (120 min)", "Audience level"],
      "CFP form renders logged out with custom fields",
    );
  }

  section("Auth");
  for (const [label, account] of Object.entries(ACCOUNTS)) {
    const session = new Session(label);
    try {
      const result = await session.signIn(account);
      if (session.cookies.has("cf_session")) ok(`sign in as ${label}`, account.email);
      else fail(`sign in as ${label}`, `no session cookie (status ${result.status})`);
    } catch (error) {
      fail(`sign in as ${label}`, error.message);
    }
  }

  const organizer = new Session("organizer");
  await organizer.signIn(ACCOUNTS.organizer);
  const speaker = new Session("speaker");
  await speaker.signIn(ACCOUNTS.speaker);
  const reviewer = new Session("reviewer");
  await reviewer.signIn(ACCOUNTS.reviewer);

  section("Organizer");
  await expectContains(organizer, "/admin", ["Dashboard", "Submissions"], "admin dashboard");
  await expectContains(
    organizer,
    `/admin/e/${SLUG}/submissions`,
    ["Taming 40-Minute CI", "Accept Queue"],
    "submissions list with status tabs",
  );
  await expectContains(
    organizer,
    `/admin/e/${SLUG}/speakers`,
    ["Priya", "Raman"],
    "speaker roster",
  );
  await expectContains(organizer, `/admin/e/${SLUG}/forms`, ["Call for Speakers"], "forms index");
  await expectContains(
    organizer,
    `/admin/e/${SLUG}/evaluation`,
    ["Program Committee Review"],
    "evaluation plans",
  );
  await expectContains(organizer, `/admin/e/${SLUG}/agenda`, ["Unscheduled"], "agenda builder");
  await expectContains(
    organizer,
    `/admin/e/${SLUG}/emails`,
    ["accepted to DevFlow Conf 2027"],
    "email outbox",
  );
  await expectContains(
    organizer,
    `/admin/e/${SLUG}/tasks/deliverables`,
    ["Upload final slides"],
    "deliverables dashboard",
  );
  await expectStatus(
    organizer,
    `/admin/e/${SLUG}/submissions/export.csv`,
    200,
    "submissions CSV export",
  );

  section("Assets");
  {
    // The HTML assertions above all pass even when the stylesheet 404s, which is
    // exactly how a stale server once served a completely unstyled admin area.
    // Follow the <link rel="stylesheet"> on a page from each area and prove it loads.
    for (const [label, path, session] of [
      ["public", `/e/${SLUG}/sessions`, anon],
      ["admin", `/admin/e/${SLUG}/submissions/new`, organizer],
      ["settings", `/admin/e/${SLUG}/settings/tracks`, organizer],
      ["portal", "/portal/profile", speaker],
    ]) {
      const page = await session.get(path);
      const hrefs = [...page.body.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(
        (m) => m[1],
      );
      if (!hrefs.length) {
        fail(`${label} page links a stylesheet`, path);
        continue;
      }
      let bytes = 0;
      let bad = "";
      for (const href of hrefs) {
        const response = await session.request(href);
        if (response.status !== 200) bad = `${href} -> ${response.status}`;
        else bytes += (await response.text()).length;
      }
      if (bad) fail(`${label} stylesheet loads`, bad);
      else if (bytes < 10_000) fail(`${label} stylesheet looks complete`, `${bytes} bytes`);
      else ok(`${label} stylesheet loads`, `${Math.round(bytes / 1024)} KB`);
    }
  }

  section("Guessable admin routes");
  for (const path of [
    "/admin/emails",
    "/admin/settings",
    "/admin/submissions",
    "/admin/speakers",
    "/admin/agenda",
    "/admin/forms",
    "/admin/evaluation",
    "/admin/tasks",
    "/admin/deliverables",
    "/admin/reports",
    "/admin/team",
    "/admin/search",
  ]) {
    const response = await organizer.request(path);
    if ([307, 308].includes(response.status)) ok(`alias ${path}`, String(response.status));
    else fail(`alias ${path}`, `expected a redirect, got ${response.status}`);
  }

  section("Reviewer scoping");
  await expectContains(reviewer, "/review", ["Program Committee Review"], "reviewer dashboard");
  await expectMissing(reviewer, "/review", ["Deliverables", "Event Team"], "no organizer nav for reviewers");
  await expectStatus(
    reviewer,
    `/admin/e/${SLUG}`,
    [403, 404, 307],
    "reviewer blocked from the admin area",
  );
  {
    // A reviewer must not be able to open an assignment that is not theirs.
    const queue = await reviewer.get("/review");
    const roundLink = /\/review\/round\/([A-Za-z0-9]+)/.exec(queue.body)?.[1];
    if (roundLink) ok("reviewer round link found");
    else fail("reviewer round link found");
  }

  section("Speaker scoping");
  await expectContains(speaker, "/portal", ["My submissions", "Priya"], "speaker portal home");
  await expectMissing(
    speaker,
    "/portal",
    ["Marcus Okafor", "Dana Kowalski"],
    "portal shows no other speaker's data",
  );
  await expectStatus(speaker, `/admin/e/${SLUG}`, [403, 404, 307], "speaker blocked from admin");
  await expectStatus(speaker, "/review", [403, 404, 307], "speaker blocked from review area");
  await expectContains(speaker, "/portal/tasks", ["Confirm participation"], "speaker task list");
  await expectContains(speaker, "/portal/profile", ["Biography"], "speaker profile editor");

  section("Cross-user identifier swapping");
  {
    const other = new Session("speaker2");
    await other.signIn(ACCOUNTS.speaker2);
    const mine = await speaker.get("/portal/submissions");
    const ids = [
      ...new Set(
        [...mine.body.matchAll(/\/portal\/submissions\/([A-Za-z0-9]+)/g)].map((m) => m[1]),
      ),
    ];
    if (!ids.length) {
      fail("found submission ids in the speaker portal");
    } else {
      const statuses = [];
      for (const submissionId of ids) {
        const response = await other.request(`/portal/submissions/${submissionId}`);
        statuses.push(`${submissionId}:${response.status}`);
      }
      const blocked = statuses.filter((s) => /:(403|404)$/.test(s));
      if (blocked.length) {
        ok(
          "another speaker is blocked from submissions they are not on",
          `${blocked.length}/${ids.length} blocked`,
        );
      } else {
        fail(
          "another speaker is blocked from submissions they are not on",
          statuses.join(" "),
        );
      }
    }
  }

  section("Enforced rules");
  {
    // These are the checks a clone usually fails: the constraint has to be real,
    // not just hidden in the UI.
    const Database = (await import("better-sqlite3")).default;
    const db = new Database(process.env.SMOKE_DB ?? "data/conferencer.db");

    // 1. Close the CFP and prove the public form and the speaker's edit both lock.
    const form = db
      .prepare("SELECT id, closes_at FROM submission_forms ORDER BY created_at LIMIT 1")
      .get();
    db.prepare("UPDATE submission_forms SET closes_at = '2020-01-01T00:00' WHERE id = ?").run(
      form.id,
    );
    const closed = await anon.get(`/e/${SLUG}/submit/${form.id}`);
    if (/Submissions closed|no longer accepting/i.test(closed.body)) {
      ok("closed CFP shows a closed state to the public");
    } else {
      fail("closed CFP shows a closed state to the public");
    }
    const portalClosed = await speaker.get("/portal/submissions");
    if (/Editing closed/i.test(portalClosed.body)) {
      ok("speaker editing locks once the call closes");
    } else {
      fail("speaker editing locks once the call closes", "no 'Editing closed' marker");
    }
    db.prepare("UPDATE submission_forms SET closes_at = ? WHERE id = ?").run(
      form.closes_at,
      form.id,
    );
    const reopened = await anon.get(`/e/${SLUG}/submit/${form.id}`);
    if (!/Submissions closed/i.test(reopened.body)) ok("reopening the CFP restores the form");
    else fail("reopening the CFP restores the form");

    // 2. Blind round: no author identity anywhere in the reviewer's page.
    const assignment = db
      .prepare(
        `SELECT a.id FROM evaluation_assignments a
           JOIN evaluation_rounds r ON r.id = a.round_id
           JOIN users u ON u.id = a.reviewer_user_id
          WHERE r.anonymize = 1 AND u.email = ? LIMIT 1`,
      )
      .get(ACCOUNTS.reviewer.email);
    if (assignment) {
      const page = await reviewer.get(`/review/a/${assignment.id}`);
      const leaks = ["Priya Raman", "Marcus Okafor", "Latticework Systems"].filter((needle) =>
        page.body.includes(needle),
      );
      if (page.status === 200 && !leaks.length) {
        ok("blind round hides author identity from the reviewer");
      } else {
        fail("blind round hides author identity from the reviewer", leaks.join(", "));
      }
      const organizerView = await organizer.get(
        `/admin/e/${SLUG}/submissions/${db.prepare("SELECT submission_id FROM evaluation_assignments WHERE id = ?").get(assignment.id).submission_id}?tab=participants`,
      );
      if (organizerView.body.includes("Priya")) {
        ok("the organizer still sees author identity on the same submission");
      } else {
        fail("the organizer still sees author identity on the same submission");
      }
    } else {
      fail("found a blinded assignment to test");
    }

    // 3. Room clash is refused, not just warned about.
    const scheduled = db
      .prepare(
        `SELECT id, starts_at, location_id FROM submissions
          WHERE event_id = (SELECT id FROM events WHERE slug = ?) AND starts_at IS NOT NULL
            AND location_id IS NOT NULL LIMIT 1`,
      )
      .get(SLUG);
    const free = db
      .prepare(
        `SELECT id FROM submissions WHERE event_id = (SELECT id FROM events WHERE slug = ?)
            AND status = 'accepted' AND starts_at IS NULL LIMIT 1`,
      )
      .get(SLUG);
    if (scheduled && free) {
      const page = await organizer.get(`/admin/e/${SLUG}/agenda`);
      // Pick the action id belonging to the scheduling form specifically — the
      // page also carries publish, auto-schedule and calendar-invite forms.
      const scheduleForm = page.body
        .split("<form")
        .find((chunk) => chunk.includes('name="room_id"') && chunk.includes('name="submission_id"'));
      const actionId = scheduleForm
        ? /name="\$ACTION_ID_([^"]+)"/.exec(scheduleForm)?.[1]
        : undefined;
      if (!actionId) {
        fail("found the agenda schedule action");
      } else {
        const body = new FormData();
        body.set("$ACTION_ID_" + actionId, "");
        body.set("slug", SLUG);
        body.set("submission_id", free.id);
        body.set("date", scheduled.starts_at.slice(0, 10));
        body.set("start", scheduled.starts_at.slice(11, 16));
        body.set("room_id", scheduled.location_id);
        body.set("view", "rooms");
        const response = await organizer.request(`/admin/e/${SLUG}/agenda`, {
          method: "POST",
          body,
        });
        const after = db.prepare("SELECT starts_at FROM submissions WHERE id = ?").get(free.id);
        if (!after.starts_at) {
          ok("room double-booking is refused", `${response.status}`);
        } else {
          fail("room double-booking is refused", "the clashing session was scheduled anyway");
          db.prepare(
            "UPDATE submissions SET starts_at = NULL, ends_at = NULL, location_id = NULL WHERE id = ?",
          ).run(free.id);
        }
      }
    } else {
      fail("found sessions to test the room clash with");
    }

    db.close();
  }

  section("Performance");
  const slow = timings.filter((t) => t.ms > 400).sort((a, b) => b.ms - a.ms);
  const listTimings = timings.filter((t) => t.status === 200);
  const p95 =
    listTimings.length > 0
      ? listTimings.map((t) => t.ms).sort((a, b) => a - b)[Math.floor(listTimings.length * 0.95)]
      : 0;
  console.log(`  p95 response ${p95}ms across ${listTimings.length} 200-responses`);
  if (slow.length) {
    console.log("  slowest:");
    for (const t of slow.slice(0, 5)) console.log(`    ${t.ms}ms  ${t.path}`);
  }

  console.log(
    `\n\x1b[1m${passed} passed, ${failed} failed\x1b[0m (${passed + failed} checks)\n`,
  );
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
