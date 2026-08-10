import { eq } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { id } from "../lib/id";
import { nowIso } from "../lib/dates";
import { ensureSchema } from "./ensure-schema";
import { seed } from "./seed";

async function main() {
  ensureSchema();
  await seed({ reset: false });
  const db = getDb();
  const event = db
    .select()
    .from(schema.events)
    .where(eq(schema.events.slug, "devflow-conf-2027"))
    .get();
  if (!event) throw new Error("Event missing — run seed first");
  const tracks = db.select().from(schema.tracks).where(eq(schema.tracks.eventId, event.id)).all();
  const formats = db.select().from(schema.formats).where(eq(schema.formats.eventId, event.id)).all();
  const createdAt = nowIso();

  for (let i = 0; i < 40; i++) {
    const contactId = id("ctc");
    db.insert(schema.contacts)
      .values({
        id: contactId,
        orgId: event.orgId,
        firstName: `Speaker${i}`,
        lastName: `Extra${i}`,
        email: `speaker-extra-${i}@example.com`,
        jobTitle: "Engineer",
        company: `Company ${i % 10}`,
        biography: `Auto-seeded speaker ${i}`,
        createdAt,
      })
      .run();
    db.insert(schema.eventContacts)
      .values({
        id: id("ec"),
        eventId: event.id,
        contactId,
        status: "active",
        speakerStatus: i % 3 === 0 ? "confirmed" : "invited",
        createdAt,
      })
      .run();
  }

  for (let i = 0; i < 60; i++) {
    db.insert(schema.submissions)
      .values({
        id: id("sub"),
        eventId: event.id,
        kind: "abstract",
        status: ["pending", "accepted", "declined", "draft"][i % 4],
        title: `Bulk Submission ${i + 1}: Scaling Topic ${i}`,
        description: `Generated abstract ${i} for performance demos.`,
        trackId: tracks[i % tracks.length]?.id,
        formatId: formats[i % formats.length]?.id,
        level: ["Beginner", "Intermediate", "Advanced"][i % 3],
        answers: "{}",
        isDraft: i % 4 === 3,
        approvalStatus: i % 4 === 1 ? "approved" : "draft",
        createdAt,
        updatedAt: createdAt,
      })
      .run();
  }
  console.log("Added 60 submissions and 40 speakers");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
