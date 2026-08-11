/**
 * Adds 60 submissions and 40 speakers on top of the demo event so performance
 * claims are demonstrable (R-SEED-2). Safe to run repeatedly.
 */
import { get, run } from "../src/lib/db";
import { nowIso } from "../src/lib/datetime";
import { createContact, ensureEventContact } from "../src/lib/repo/contacts";
import { getEventBySlug, listLookup } from "../src/lib/repo/events";
import { addParticipant, createSubmission } from "../src/lib/repo/submissions";
import { assignTask, listTasks } from "../src/lib/repo/tasks";
import { storeBuffer } from "../src/lib/repo/uploads";
import { avatarSvg } from "./avatars";
import { EVENT } from "./fixtures";

const FIRST = [
  "Alex", "Blair", "Cameron", "Devon", "Emery", "Finley", "Gray", "Harper", "Indigo", "Jordan",
  "Kai", "Lennox", "Micah", "Noor", "Oakley", "Parker", "Quinn", "Rowan", "Sage", "Tatum",
];
const LAST = [
  "Adeyemi", "Bianchi", "Castillo", "Duarte", "Eriksen", "Fontaine", "Gulbrandsen", "Halvorsen",
  "Ibrahim", "Jansen", "Kovalenko", "Laurent", "Moreau", "Nakagawa", "Olsen", "Petrov",
  "Quintana", "Rasmussen", "Silva", "Tanaka",
];
const COMPANIES = [
  "Northwind Data", "Foldspace", "Kestrel Cloud", "Brightline", "Meridian Systems",
  "Tessellate", "Vantage Point", "Corvid AI", "Blueshift", "Lumen Works",
];
const TITLES = [
  "Staff Engineer", "Principal Engineer", "Engineering Manager", "Developer Advocate",
  "Site Reliability Engineer", "Platform Lead", "Head of Data", "Founding Engineer",
];
const TOPICS = [
  "Scaling CI on a shoestring",
  "The observability bill nobody budgeted for",
  "Type-safe database access without an ORM",
  "Feature flags after the honeymoon",
  "Running Postgres at the edge",
  "Testing agents that refuse to be deterministic",
  "Golden paths that engineers actually take",
  "Incident review without blame theatre",
  "Cutting cloud spend by 40% in a quarter",
  "Migrating a monolith one seam at a time",
  "Docs as a product surface",
  "Build caches that survive a rewrite",
];
const STATUSES = ["pending", "accept_queue", "accepted", "decline_queue", "declined", "draft"];

function main() {
  const event = getEventBySlug(EVENT.slug);
  if (!event) {
    console.error("Run `npm run seed` first.");
    process.exit(1);
  }

  const tracks = listLookup("tracks", event.id);
  const formats = listLookup("formats", event.id);
  const tasks = listTasks(event.id).filter((task) => task.is_default);

  let speakers = 0;
  const contacts: string[] = [];
  for (let i = 0; i < 40; i += 1) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7) % LAST.length];
    const email = `perf.${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`;
    if (get("SELECT id FROM contacts WHERE email = ?", email)) continue;
    const contact = createContact(event.org_id, {
      first_name: first,
      last_name: last,
      email,
      job_title: TITLES[i % TITLES.length],
      company: COMPANIES[i % COMPANIES.length],
      biography: `${first} ${last} works on developer platforms at ${
        COMPANIES[i % COMPANIES.length]
      } and has been shipping to production for longer than they care to admit.`,
    });
    const upload = storeBuffer({
      eventId: event.id,
      filename: `${first.toLowerCase()}-${last.toLowerCase()}.svg`,
      contentType: "image/svg+xml",
      buffer: Buffer.from(avatarSvg(first, last), "utf8"),
      kind: "headshot",
      contactId: contact.id,
      isPublic: true,
    });
    run("UPDATE contacts SET headshot_url = ? WHERE id = ?", `/f/${upload.id}`, contact.id);
    ensureEventContact(event.id, contact.id, {
      speaker_status: i % 3 === 0 ? "confirmed" : i % 3 === 1 ? "invited" : "prospect",
    });
    contacts.push(contact.id);
    speakers += 1;
  }

  let created = 0;
  for (let i = 0; i < 60; i += 1) {
    const status = STATUSES[i % STATUSES.length];
    const contactId = contacts[i % Math.max(contacts.length, 1)];
    if (!contactId) break;
    const submission = createSubmission(event.id, {
      kind: "abstract",
      status: status as never,
      title: `${TOPICS[i % TOPICS.length]} (#${i + 1})`,
      description: `A practical, numbers-first session on ${TOPICS[
        i % TOPICS.length
      ].toLowerCase()}. Includes what we tried first, why it failed, and the graphs that convinced the team to try again.`,
      track_id: tracks[i % tracks.length]?.id ?? null,
      format_id: formats[i % formats.length]?.id ?? null,
      level: ["Beginner", "Intermediate", "Advanced"][i % 3],
      submitter_contact_id: contactId,
      answers: JSON.stringify({
        key_takeaway: "One concrete change you can make on Monday",
        audience_level: ["Beginner", "Intermediate", "Advanced"][i % 3],
      }),
      approval_status: status === "accepted" ? "approved" : "draft",
      is_draft: status === "draft" ? 1 : 0,
    });
    addParticipant(submission.id, contactId, "submitter");
    addParticipant(submission.id, contactId, "speaker");

    if (status === "accepted") {
      for (const task of tasks.slice(0, 4)) {
        const assignment = assignTask({
          taskId: task.id,
          eventId: event.id,
          contactId,
          dueAt: "2027-04-15",
        });
        if (i % 2 === 0) {
          run(
            "UPDATE task_assignments SET status = 'complete', completed_at = ? WHERE id = ?",
            nowIso(),
            assignment.id,
          );
        }
      }
    }
    created += 1;
  }

  console.log(`seed:big — added ${speakers} speakers and ${created} submissions`);
}

main();
