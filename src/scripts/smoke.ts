/**
 * Lightweight route smoke: public pages 200; auth gates redirect; seed present.
 * Usage: npm run smoke  (server must be running on BASE_URL)
 */
import { eq } from "drizzle-orm";
import { getDb, schema } from "../lib/db";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function check(path: string, expectStatus: number | number[]) {
  const allowed = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const ok = allowed.includes(res.status);
  console.log(
    `${ok ? "OK" : "FAIL"} ${res.status} ${path}${ok ? "" : ` (expected ${allowed.join("|")})`}`,
  );
  return ok;
}

async function main() {
  let failed = 0;
  const mark = (ok: boolean) => {
    if (!ok) failed++;
  };

  mark(await check("/", 200));
  mark(await check("/sign-in", 200));
  mark(await check("/e/devflow-conf-2027/sessions", 200));
  mark(await check("/e/devflow-conf-2027/speakers", 200));
  mark(await check("/e/devflow-conf-2027/agenda", 200));
  mark(await check("/e/devflow-conf-2027/itinerary", 200));
  mark(await check("/e/devflow-conf-2027/gallery", 200));
  mark(await check("/api/v1/public/devflow-conf-2027/sessions", 200));
  mark(await check("/api/v1/openapi.json", 200));
  mark(await check("/api/v1/events", 401));

  mark(await check("/admin", [307, 302, 303]));
  mark(await check("/portal", [307, 302, 303]));
  mark(await check("/review", [307, 302, 303]));

  const db = getDb();
  const event = db
    .select()
    .from(schema.events)
    .where(eq(schema.events.slug, "devflow-conf-2027"))
    .get();
  if (!event) {
    console.log("FAIL seeded event missing");
    failed++;
  } else {
    const form = db
      .select()
      .from(schema.submissionForms)
      .where(eq(schema.submissionForms.eventId, event.id))
      .get();
    if (form) {
      mark(await check(`/e/devflow-conf-2027/submit/${form.id}`, 200));
    } else {
      console.log("FAIL no seeded form");
      failed++;
    }
  }

  const users = db.select().from(schema.users).all();
  console.log(`seed users: ${users.length}`);
  if (users.length < 4) {
    console.log("FAIL expected >= 4 seeded users");
    failed++;
  }

  if (failed) {
    console.error(`\nSmoke failed: ${failed} check(s)`);
    process.exit(1);
  }
  console.log("\nSmoke passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
