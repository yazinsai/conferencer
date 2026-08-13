import fs from "node:fs";
import path from "node:path";

import { db, run, get, DATABASE_PATH, UPLOAD_DIR } from "../src/lib/db";
import { id, token } from "../src/lib/ids";
import { nowIso, addDays, localToday } from "../src/lib/datetime";
import {
  addMembership,
  createUser,
  findUserByEmail,
  setUserPassword,
} from "../src/lib/auth";
import {
  createEvent,
  createLookup,
  ensureLookup,
  getEventBySlug,
} from "../src/lib/repo/events";
import {
  createContact,
  ensureEventContact,
  findContactByEmail,
  updateContact,
  type Contact,
} from "../src/lib/repo/contacts";
import {
  addQuestion,
  createField,
  createForm,
  findField,
  sectionOfKind,
  setRoleConfig,
  updateForm,
  updateSection,
} from "../src/lib/repo/forms";
import { STANDARD_CONTACT_FIELDS, STANDARD_SESSION_FIELDS } from "../src/lib/fields";
import {
  addParticipant,
  createSubmission,
  updateSubmission,
} from "../src/lib/repo/submissions";
import {
  addRoundReviewer,
  addScorecardQuestion,
  assign,
  computeScore,
  createPlan,
  createRound,
  listScorecard,
  saveReview,
  setAssignmentStatus,
} from "../src/lib/repo/evaluations";
import {
  assignTask,
  createTask,
  DEFAULT_TASKS,
  setAssignmentStatus as setTaskStatus,
  updateAssignment,
} from "../src/lib/repo/tasks";
import { addComment, storeBuffer } from "../src/lib/repo/uploads";
import { ensureTemplates } from "../src/lib/repo/emails";
import { sendEmail } from "../src/lib/email";
import { logAudit } from "../src/lib/repo/audit";
import { headshotFor, makePdf, makePng } from "./avatars";
import {
  EVENT,
  FIXTURE_ABSTRACTS,
  FORMATS,
  LEVELS,
  ORG,
  OTHER_SUBMISSIONS,
  PEOPLE,
  REVIEW_COMMENT,
  ROOMS,
  SCHEDULED_SESSIONS,
  SPEAKERS_CSV,
  TAGS,
  TRACKS,
  UNSCHEDULED_SESSIONS,
  type PersonSeed,
} from "./fixtures";

const RESET = process.argv.includes("--reset");

function wipe() {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as Array<{ name: string }>;
  db.pragma("foreign_keys = OFF");
  for (const t of tables) db.prepare(`DELETE FROM ${t.name}`).run();
  db.pragma("foreign_keys = ON");
  if (fs.existsSync(UPLOAD_DIR)) {
    for (const file of fs.readdirSync(UPLOAD_DIR)) {
      fs.rmSync(path.join(UPLOAD_DIR, file), { force: true });
    }
  }
}

function writeFixtureFiles() {
  const dir = path.join(process.cwd(), "fixtures");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "speakers.csv"), SPEAKERS_CSV);
  fs.writeFileSync(path.join(dir, "headshot.png"), makePng(400, [79, 70, 229]));
  fs.writeFileSync(
    path.join(dir, "slides.pdf"),
    makePdf("Taming 40-Minute CI - DevFlow Conf 2027"),
  );
}

function main() {
  console.log(`seeding ${DATABASE_PATH}`);
  if (RESET) {
    wipe();
    console.log("· wiped existing data");
  }
  if (getEventBySlug(EVENT.slug)) {
    console.log("· event already seeded — run `npm run seed:reset` to start clean");
    return;
  }

  /* ------------------------------------------------------- org and event -- */
  const orgId = id();
  run(
    "INSERT INTO organizations (id, name, slug, created_at) VALUES (?,?,?,?)",
    orgId,
    ORG.name,
    ORG.slug,
    nowIso(),
  );
  const event = createEvent({ org_id: orgId, ...EVENT });
  console.log(`· event ${event.name} (${event.slug})`);

  const trackId: Record<string, string> = {};
  for (const t of TRACKS) {
    trackId[t.name] = createLookup("tracks", event.id, { name: t.name, color: t.color }).id;
  }
  const formatId: Record<string, string> = {};
  for (const f of FORMATS) {
    formatId[f.name] = createLookup("formats", event.id, {
      name: f.name,
      color: f.color,
      duration_minutes: f.duration,
    }).id;
  }
  const roomId: Record<string, string> = {};
  for (const r of ROOMS) {
    roomId[r.name] = createLookup("rooms", event.id, { name: r.name, capacity: r.capacity }).id;
  }
  for (const t of TAGS) ensureLookup("tags", event.id, t);
  for (const l of LEVELS) ensureLookup("levels", event.id, l);

  /* ------------------------------------------------------------- fields -- */
  for (const f of STANDARD_SESSION_FIELDS) {
    createField(event.id, {
      scope: "session",
      key: f.key,
      label: f.label,
      type: f.type,
      is_standard: true,
      options:
        f.key === "level" ? JSON.stringify(LEVELS.map((l) => ({ value: l, label: l }))) : "[]",
      max_length: f.key === "description" ? 4000 : null,
    });
  }
  for (const f of STANDARD_CONTACT_FIELDS) {
    createField(event.id, {
      scope: "contact",
      key: f.key,
      label: f.label,
      type: f.type,
      is_standard: true,
      options:
        f.key === "tshirt_size"
          ? JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"].map((s) => ({ value: s, label: s })))
          : "[]",
      max_length: f.key === "biography" ? 5000 : null,
    });
  }
  const takeawayField = createField(event.id, {
    scope: "session",
    key: "key_takeaway",
    label: "Key takeaway",
    type: "text",
    max_length: 160,
    help_text: "One sentence: what will the audience be able to do afterwards?",
  });
  const audienceField = createField(event.id, {
    scope: "session",
    key: "audience_level",
    label: "Audience level",
    type: "dropdown",
    options: JSON.stringify(LEVELS.map((l) => ({ value: l, label: l }))),
  });
  const prereqField = createField(event.id, {
    scope: "session",
    key: "workshop_prerequisites",
    label: "Workshop prerequisites",
    type: "textarea",
    max_length: 800,
    help_text: "What should attendees install or know before the workshop?",
  });
  const notesField = createField(event.id, {
    scope: "session",
    key: "notes_for_reviewers",
    label: "Notes for reviewers",
    type: "textarea",
    max_length: 1000,
    help_text: "Private — only the program committee sees this.",
  });

  /* --------------------------------------------------------------- form -- */
  const form = createForm(event.id, {
    name: "DevFlow Conf 2027 — Call for Speakers",
    title: "DevFlow Conf 2027 Call for Speakers",
    page_heading: "Submit a talk to DevFlow Conf 2027",
    welcome_message: `<p>We are looking for practical, specific talks about the developer workflow: build systems, platform engineering, AI-assisted development and the tooling that makes teams faster.</p>
<p>Submissions close <strong>30 April 2027</strong>. You can save a draft and come back at any time.</p>`,
    collects: "abstracts",
    collect_participants: 1,
    opens_at: `${addDays(localToday(), -30)}T09:00`,
    closes_at: "2027-04-30T23:59",
    submission_limit: 3,
    allow_drafts: 1,
    success_message: `<p><strong>Thank you — your submission has been received.</strong></p>
<p>We have emailed you a confirmation. The programme committee reviews every proposal and you will hear from us with a decision. You can edit your submission from your speaker portal until the call closes.</p>`,
    send_confirmation_email: 1,
    status: "open",
  });
  updateForm(form.id, {
    combined_limit: JSON.stringify({
      question_keys: ["description", "key_takeaway"],
      max: 2400,
      label: "Abstract and key takeaway combined",
    }),
  });

  const submissionSection = sectionOfKind(form.id, "submission");
  updateSection(submissionSection.id, {
    title: "Abstract Information",
    heading: "Tell us about your talk",
    description:
      "<p>Write for the audience, not for the committee. Concrete beats comprehensive.</p>",
  });
  const participantSection = sectionOfKind(form.id, "participant");
  updateSection(participantSection.id, {
    title: "Participant Information",
    heading: "Who is speaking?",
    description: "<p>Add every speaker. Each of them will get their own speaker portal.</p>",
  });
  sectionOfKind(form.id, "welcome");
  sectionOfKind(form.id, "review");

  const sessionField = (key: string) => findField(event.id, "session", key)!;
  const contactField = (key: string) => findField(event.id, "contact", key)!;

  addQuestion({
    formId: form.id,
    sectionId: submissionSection.id,
    fieldId: sessionField("title").id,
    isRequired: true,
    isLocked: true,
    helpText: "Make it specific. “Taming 40-minute CI” beats “CI at scale”.",
  });
  addQuestion({
    formId: form.id,
    sectionId: submissionSection.id,
    fieldId: sessionField("description").id,
    isRequired: true,
    labelOverride: "Abstract",
    helpText: "150–300 words. This is what attendees will read.",
  });
  addQuestion({
    formId: form.id,
    sectionId: submissionSection.id,
    fieldId: sessionField("track").id,
    isRequired: true,
  });
  const formatQuestion = addQuestion({
    formId: form.id,
    sectionId: submissionSection.id,
    fieldId: sessionField("format").id,
    isRequired: true,
  });
  addQuestion({
    formId: form.id,
    sectionId: submissionSection.id,
    fieldId: takeawayField.id,
    isRequired: true,
  });
  addQuestion({
    formId: form.id,
    sectionId: submissionSection.id,
    fieldId: audienceField.id,
    isRequired: false,
  });
  addQuestion({
    formId: form.id,
    sectionId: submissionSection.id,
    fieldId: prereqField.id,
    isRequired: false,
    condition: JSON.stringify({
      question_id: formatQuestion.id,
      operator: "equals",
      value: "Workshop (120 min)",
    }),
  });
  addQuestion({
    formId: form.id,
    sectionId: submissionSection.id,
    fieldId: notesField.id,
    isRequired: false,
  });

  addQuestion({
    formId: form.id,
    sectionId: participantSection.id,
    fieldId: contactField("first_name").id,
    isRequired: true,
    isLocked: true,
  });
  addQuestion({
    formId: form.id,
    sectionId: participantSection.id,
    fieldId: contactField("last_name").id,
    isRequired: true,
    isLocked: true,
  });
  addQuestion({
    formId: form.id,
    sectionId: participantSection.id,
    fieldId: contactField("email").id,
    isRequired: true,
    isLocked: true,
  });
  addQuestion({
    formId: form.id,
    sectionId: participantSection.id,
    fieldId: contactField("job_title").id,
    isRequired: true,
  });
  addQuestion({
    formId: form.id,
    sectionId: participantSection.id,
    fieldId: contactField("company").id,
    isRequired: true,
  });
  addQuestion({
    formId: form.id,
    sectionId: participantSection.id,
    fieldId: contactField("biography").id,
    isRequired: true,
    labelOverride: "Speaker bio",
    helpText: "Up to 5,000 characters. Written in the third person.",
  });
  addQuestion({
    formId: form.id,
    sectionId: participantSection.id,
    fieldId: contactField("twitter_url").id,
  });
  addQuestion({
    formId: form.id,
    sectionId: participantSection.id,
    fieldId: contactField("linkedin_url").id,
  });

  setRoleConfig(form.id, "speaker", { enabled: true, min_count: 1, max_count: 5 });
  setRoleConfig(form.id, "moderator", { enabled: false, min_count: 0, max_count: 1 });
  setRoleConfig(form.id, "chairperson", { enabled: false, min_count: 0, max_count: 1 });
  console.log("· call for speakers form built");

  /* -------------------------------------------------------------- people -- */
  const contacts: Record<string, Contact> = {};
  const users: Record<string, string> = {};

  for (const person of PEOPLE) {
    const contact = createContact(orgId, {
      first_name: person.first,
      last_name: person.last,
      email: person.email,
      alt_email: person.altEmail ?? null,
      job_title: person.title ?? null,
      company: person.company ?? null,
      biography: person.bio ?? null,
      twitter_url: person.twitter ?? null,
      linkedin_url: person.linkedin ?? null,
      website_url: person.website ?? null,
      pronouns: person.pronouns ?? null,
      dietary: person.dietary ?? null,
      tshirt_size: person.tshirt ?? null,
      travel_notes: person.travel ?? null,
    });
    contacts[person.key] = contact;

    // Headshot for everyone who appears publicly, except one speaker so the
    // gallery's no-photo fallback is demonstrable (EMB-12).
    if (person.role === "speaker" && person.key !== "jonas") {
      const headshot = headshotFor(person.key, person.first, person.last);
      const upload = storeBuffer({
        eventId: event.id,
        filename: `${person.first.toLowerCase()}-${person.last.toLowerCase()}.${headshot.extension}`,
        contentType: headshot.contentType,
        buffer: headshot.buffer,
        kind: "headshot",
        contactId: contact.id,
        isPublic: true,
      });
      updateContact(contact.id, { headshot_url: `/f/${upload.id}` });
      contacts[person.key] = findContactByEmail(orgId, person.email)!;
    }

    ensureEventContact(event.id, contact.id, {
      status: "active",
      speaker_status: person.speakerStatus ?? (person.role === "speaker" ? "prospect" : "prospect"),
    });

    const membershipRole =
      person.role === "organizer" ? "organizer" : person.role === "reviewer" ? "reviewer" : "participant";

    for (const [index, address] of [person.email, person.altEmail].filter(Boolean).entries()) {
      const email = address as string;
      let user = findUserByEmail(email);
      if (!user) {
        user = createUser({
          email,
          password: person.password ?? defaultPasswordFor(person),
          firstName: person.first,
          lastName: person.last,
        });
      } else {
        setUserPassword(user.id, person.password ?? defaultPasswordFor(person));
      }
      addMembership(event.id, user.id, membershipRole);
      if (index === 0) {
        users[person.key] = user.id;
        updateContact(contact.id, { user_id: user.id });
      }
    }
  }
  console.log(`· ${PEOPLE.length} people (each with both fixture email aliases)`);

  /* --------------------------------------------------------- submissions -- */
  const days = ["2027-05-12", "2027-05-13", "2027-05-14"];

  function makeSubmission(input: {
    title: string;
    track: string;
    format: string;
    level: string;
    abstract: string;
    takeaway: string;
    speakers: string[];
    status: string;
    approval?: string;
    kind?: "abstract" | "session";
    day?: number;
    start?: string;
    end?: string;
    room?: string;
    tags?: string[];
    notes?: string;
    isDraft?: boolean;
    createdOffsetDays?: number;
  }) {
    const answers: Record<string, unknown> = {
      key_takeaway: input.takeaway,
      audience_level: input.level,
    };
    if (input.notes) answers.notes_for_reviewers = input.notes;
    if (input.format === "Workshop (120 min)") {
      answers.workshop_prerequisites =
        "A laptop with Docker and Node 20 installed, plus a GitHub account.";
    }
    const submitter = contacts[input.speakers[0]];
    const scheduled =
      input.day !== undefined && input.start
        ? {
            starts_at: `${days[input.day]}T${input.start}`,
            ends_at: `${days[input.day]}T${input.end ?? input.start}`,
            location_id: input.room ? roomId[input.room] : null,
          }
        : {};
    const submission = createSubmission(event.id, {
      form_id: form.id,
      kind: input.kind ?? "abstract",
      status: input.status as never,
      title: input.title,
      description: input.abstract,
      track_id: trackId[input.track] ?? null,
      format_id: formatId[input.format] ?? null,
      level: input.level,
      language: "English",
      submitter_contact_id: submitter?.id ?? null,
      answers: JSON.stringify(answers),
      tags: JSON.stringify(input.tags ?? []),
      is_draft: input.isDraft ? 1 : 0,
      approval_status: input.approval ?? (input.status === "accepted" ? "approved" : "draft"),
      ...scheduled,
    });
    if (submitter) addParticipant(submission.id, submitter.id, "submitter");
    input.speakers.forEach((key) => {
      const contact = contacts[key];
      if (contact) addParticipant(submission.id, contact.id, "speaker");
    });
    if (input.status === "accepted" && input.day !== undefined) {
      updateSubmission(submission.id, {
        pub_starts_at: `${days[input.day]}T${input.start}`,
        pub_ends_at: `${days[input.day]}T${input.end ?? input.start}`,
        pub_room_id: input.room ? roomId[input.room] : null,
        pub_published_at: nowIso(),
      });
    }
    if (input.createdOffsetDays) {
      const created = new Date(Date.now() - input.createdOffsetDays * 86_400_000).toISOString();
      run("UPDATE submissions SET created_at = ?, updated_at = ? WHERE id = ?", created, created, submission.id);
    }
    return submission;
  }

  // The three fixture proposals, with statuses chosen so every workflow is live.
  const taming = makeSubmission({
    ...FIXTURE_ABSTRACTS.taming,
    abstract: FIXTURE_ABSTRACTS.taming.abstract,
    speakers: ["priya", "marcus"],
    status: "accepted",
    approval: "approved",
    day: 0,
    start: "10:00",
    end: "10:30",
    room: "Room 2A",
    tags: ["CI/CD", "Testing"],
    notes: FIXTURE_ABSTRACTS.taming.notes,
    createdOffsetDays: 21,
  });
  const aiPair = makeSubmission({
    ...FIXTURE_ABSTRACTS.aiPair,
    speakers: ["priya"],
    status: "pending",
    tags: ["LLMs", "Testing"],
    notes: FIXTURE_ABSTRACTS.aiPair.notes,
    createdOffsetDays: 18,
  });
  const docs = makeSubmission({
    ...FIXTURE_ABSTRACTS.docs,
    speakers: ["priya"],
    status: "accept_queue",
    tags: ["Open Source"],
    createdOffsetDays: 14,
  });

  const scheduled = SCHEDULED_SESSIONS.map((s, index) =>
    makeSubmission({
      ...s,
      status: "accepted",
      approval: "approved",
      kind: s.title.startsWith("Opening Keynote") ? "session" : "abstract",
      createdOffsetDays: 25 - index,
    }),
  );
  for (const s of UNSCHEDULED_SESSIONS) {
    makeSubmission({ ...s, status: "accepted", approval: "in_review", createdOffsetDays: 9 });
  }
  for (const s of OTHER_SUBMISSIONS) {
    makeSubmission({ ...s, createdOffsetDays: 12 });
  }

  // Two drafts so the Drafts tab is populated (R-PUB-6 / R-SUB-1).
  makeSubmission({
    title: "Untitled: testing strategy talk",
    track: "Developer Experience",
    format: "Talk (30 min)",
    level: "Intermediate",
    abstract: "Rough notes — a talk about what to test when the machine writes the code.",
    takeaway: "",
    speakers: ["priya"],
    status: "draft",
    isDraft: true,
    createdOffsetDays: 3,
  });
  makeSubmission({
    title: "Notes on WASM at the edge",
    track: "Platform & Infra",
    format: "Lightning Talk (10 min)",
    level: "Advanced",
    abstract: "Draft: what we learned running WASM workloads at 30 PoPs.",
    takeaway: "",
    speakers: ["marcus"],
    status: "draft",
    isDraft: true,
    createdOffsetDays: 2,
  });

  const withdrawn = get<{ id: string }>(
    "SELECT id FROM submissions WHERE event_id = ? AND status = 'withdrawn' LIMIT 1",
    event.id,
  );
  if (withdrawn) {
    updateSubmission(withdrawn.id, {
      withdrawn_at: nowIso(),
      withdraw_reason: "Speaker has a scheduling conflict on the event dates.",
    });
  }
  console.log("· submissions seeded across every status");

  /* --------------------------------------------------------- evaluations -- */
  const plan = createPlan(event.id, {
    name: "Program Committee Review",
    instructions:
      "<p>Score every proposal on originality and relevance to the DevFlow audience. Leave a comment the speaker could act on — we share anonymised feedback with declined submitters.</p>",
    is_open: 1,
    opens_at: "2026-08-01T09:00",
    closes_at: "2026-11-30T23:59",
    mode: "funnel",
    anonymize: 1,
    allow_abstain: 1,
  });
  const round1 = createRound(plan.id, {
    name: "Initial Review",
    opens_at: "2026-08-01T09:00",
    closes_at: "2026-10-15T23:59",
    anonymize: 1,
    instructions: "<p>Blind round — author identity is hidden. Score on the abstract alone.</p>",
    sort_order: 0,
  });
  const round2 = createRound(plan.id, {
    name: "Final Review",
    opens_at: "2026-10-16T09:00",
    closes_at: "2026-11-30T23:59",
    anonymize: 0,
    instructions: "<p>Final round — the shortlist, with author identity visible.</p>",
    sort_order: 1,
  });

  addScorecardQuestion(round1.id, {
    type: "scale_1_5",
    label: "Originality",
    weight: 2,
    is_required: 1,
    sort_order: 0,
  });
  addScorecardQuestion(round1.id, {
    type: "scale_1_5",
    label: "Relevance",
    weight: 1,
    is_required: 1,
    sort_order: 1,
  });
  addScorecardQuestion(round1.id, {
    type: "dropdown",
    label: "Recommendation",
    options: JSON.stringify([
      { value: "Accept", label: "Accept", points: 5 },
      { value: "Maybe", label: "Maybe", points: 3 },
      { value: "Reject", label: "Reject", points: 1 },
    ]),
    weight: 0,
    is_required: 1,
    sort_order: 2,
  });
  addScorecardQuestion(round1.id, {
    type: "free_text",
    label: "Comments",
    is_required: 0,
    sort_order: 3,
  });
  addScorecardQuestion(round2.id, {
    type: "scale_1_10",
    label: "Final Score",
    weight: 1,
    is_required: 1,
    sort_order: 0,
  });
  addScorecardQuestion(round2.id, {
    type: "free_text",
    label: "Comments",
    is_required: 0,
    sort_order: 1,
  });

  addRoundReviewer(round1.id, users.sam, 10);
  addRoundReviewer(round1.id, users.robin, 10);
  addRoundReviewer(round2.id, users.robin, null);

  const reviewPool = [taming, aiPair, docs, ...scheduled.slice(0, 3)];
  for (const submission of reviewPool) assign(round1.id, submission.id, users.sam);
  for (const submission of [taming, aiPair, ...scheduled.slice(0, 2)]) {
    assign(round1.id, submission.id, users.robin);
  }

  const card = listScorecard(round1.id);
  function recordReview(
    submissionId: string,
    reviewerId: string,
    values: { originality: number; relevance: number; recommendation: string; comment: string },
  ) {
    const assignment = get<{ id: string; round_id: string; submission_id: string; reviewer_user_id: string; status: string; abstain_reason: string | null; created_at: string }>(
      "SELECT * FROM evaluation_assignments WHERE round_id = ? AND submission_id = ? AND reviewer_user_id = ?",
      round1.id,
      submissionId,
      reviewerId,
    );
    if (!assignment) return;
    const answers: Record<string, unknown> = {};
    for (const q of card) {
      if (q.label === "Originality") answers[q.id] = values.originality;
      if (q.label === "Relevance") answers[q.id] = values.relevance;
      if (q.label === "Recommendation") answers[q.id] = values.recommendation;
      if (q.label === "Comments") answers[q.id] = values.comment;
    }
    const computed = computeScore(card, answers);
    saveReview({
      assignment,
      answers,
      comment: values.comment,
      score: computed.score,
      rawScore: computed.raw,
      submitted: true,
    });
    setAssignmentStatus(assignment.id, "complete");
  }

  recordReview(taming.id, users.sam, {
    originality: 4,
    relevance: 4,
    recommendation: "Accept",
    comment: REVIEW_COMMENT,
  });
  recordReview(taming.id, users.robin, {
    originality: 4,
    relevance: 5,
    recommendation: "Accept",
    comment: "Exactly the kind of hard-numbers platform talk our audience asks for.",
  });
  recordReview(aiPair.id, users.robin, {
    originality: 5,
    relevance: 5,
    recommendation: "Accept",
    comment: "Excellent fit for the AI Engineering track.",
  });
  console.log("· evaluation plan, two rounds, scorecards and reviews");

  /* --------------------------------------------------------------- tasks -- */
  const taskIds: Record<string, string> = {};
  DEFAULT_TASKS.forEach((t, index) => {
    const task = createTask(event.id, {
      name: t.name,
      description: t.description,
      type: t.type,
      target: t.target,
      accepted_types: t.accepted_types ?? "",
      form_schema: t.form_schema ? JSON.stringify(t.form_schema) : "[]",
      is_default: 1,
      sort_order: index,
    });
    taskIds[t.name] = task.id;
  });

  const acceptedSpeakerKeys = [
    "priya",
    "marcus",
    "grace",
    "hugo",
    "elena",
    "ana",
    "keiko",
    "farid",
    "iris",
    "chen",
    "dana",
  ];
  const dueDates: Record<string, string> = {
    "Confirm participation": "2027-04-01",
    "Upload headshot": "2027-04-14",
    "Complete bio and profile": "2027-04-01",
    "Upload final slides": "2027-05-01",
    "Sign speaker release form": "2027-04-15",
    "Hotel and travel reservations": "2027-04-20",
    "Flight reimbursement form": "2027-05-20",
    "Announce your participation": "2027-04-25",
    "Invite colleagues with your speaker discount": "2027-04-25",
  };

  let toggle = 0;
  for (const key of acceptedSpeakerKeys) {
    const contact = contacts[key];
    if (!contact) continue;
    for (const t of DEFAULT_TASKS) {
      const assignment = assignTask({
        taskId: taskIds[t.name],
        eventId: event.id,
        contactId: contact.id,
        dueAt: dueDates[t.name] ?? null,
      });
      toggle += 1;
      // A deliberate mix of complete / outstanding / overdue.
      if (toggle % 3 === 0) setTaskStatus(assignment.id, "complete");
      else if (toggle % 7 === 0) updateAssignment(assignment.id, { due_at: addDays(localToday(), -4) });
    }
  }

  // Hermione's slides deliverable: two versions plus a cross-role comment thread.
  const slidesAssignment = get<{ id: string }>(
    `SELECT ta.id FROM task_assignments ta JOIN tasks t ON t.id = ta.task_id
      WHERE ta.contact_id = ? AND t.name = 'Upload final slides'`,
    contacts.priya.id,
  );
  if (slidesAssignment) {
    updateAssignment(slidesAssignment.id, { status: "not_started" });
    const v1 = storeBuffer({
      eventId: event.id,
      filename: "devflow-ci-slides.pdf",
      contentType: "application/pdf",
      buffer: makePdf("Taming 40-Minute CI - draft"),
      taskAssignmentId: slidesAssignment.id,
      submissionId: taming.id,
      contactId: contacts.priya.id,
      userId: users.priya,
    });
    addComment({
      uploadId: v1.id,
      authorUserId: users.priya,
      authorName: "Hermione Granger",
      body: "Draft deck — final version coming Friday.",
    });
    storeBuffer({
      eventId: event.id,
      filename: "devflow-ci-slides.pdf",
      contentType: "application/pdf",
      buffer: makePdf("Taming 40-Minute CI - final"),
      taskAssignmentId: slidesAssignment.id,
      submissionId: taming.id,
      contactId: contacts.priya.id,
      userId: users.priya,
    });
    setTaskStatus(slidesAssignment.id, "complete");
  }
  console.log("· onboarding tasks assigned with a mix of statuses");

  /* -------------------------------------------------------------- portal -- */
  run(
    `INSERT INTO portals (id, event_id, name, is_default, welcome_message, accent_color,
        show_tasks_always, show_sessions, allow_manage_profile, allow_manage_participants,
        send_weekly_digest, created_at)
     VALUES (?,?,?,1,?,?,1,1,1,1,0,?)`,
    id(),
    event.id,
    "Speaker Portal",
    `<p>Welcome to the DevFlow Conf 2027 speaker portal. Complete your profile, confirm your sessions and work through your checklist here.</p>`,
    EVENT.accent_color,
    nowIso(),
  );

  /* -------------------------------------------------------------- emails -- */
  ensureTemplates(event.id);

  /* -------------------------------------------------------------- embeds -- */
  const embedTypes: Array<{ type: string; name: string; format: string }> = [
    { type: "sessions", name: "Session list", format: "styled_html" },
    { type: "speakers", name: "Speaker directory", format: "styled_html" },
    { type: "agenda", name: "Agenda grid", format: "styled_html" },
    { type: "itinerary", name: "Schedule itinerary", format: "json" },
    { type: "gallery", name: "Speaker gallery", format: "styled_html" },
  ];
  for (const embed of embedTypes) {
    run(
      `INSERT INTO embeds (id, event_id, name, type, format, config, token, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      id(),
      event.id,
      embed.name,
      embed.type,
      embed.format,
      JSON.stringify({ accent: EVENT.accent_color, showSpeakers: true }),
      token().slice(0, 24),
      nowIso(),
      nowIso(),
    );
  }

  run(
    "INSERT INTO api_tokens (id, event_id, name, token, created_at) VALUES (?,?,?,?,?)",
    id(),
    event.id,
    "Demo read/write token",
    `cft_${token().slice(0, 32)}`,
    nowIso(),
  );

  /* ----------------------------------------------------------------- crm -- */
  const pipelineSeed: Array<{ key: string; stage: string; score: number; rationale: string }> = [
    { key: "jonas", stage: "researching", score: 3, rationale: "Great SDK talk at another event." },
    { key: "chen", stage: "contacted", score: 4, rationale: "Retrieval infrastructure depth we lack." },
    { key: "keiko", stage: "in_discussion", score: 4, rationale: "Codemod migration story, strong data." },
    { key: "dana", stage: "confirmed", score: 5, rationale: "Confirmed for the platform track." },
    { key: "ana", stage: "declined", score: 3, rationale: "Unavailable on the event dates." },
  ];
  for (const entry of pipelineSeed) {
    const contact = contacts[entry.key];
    if (!contact) continue;
    const entryId = id();
    run(
      `INSERT INTO pipeline_entries (id, org_id, contact_id, stage, score, rationale, sort_order, created_at, updated_at)
       VALUES (?,?,?,?,?,?,0,?,?)`,
      entryId,
      orgId,
      contact.id,
      entry.stage,
      entry.score,
      entry.rationale,
      nowIso(),
      nowIso(),
    );
    run(
      `INSERT INTO pipeline_events (id, entry_id, kind, from_stage, to_stage, body, actor_name, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      id(),
      entryId,
      "stage_change",
      null,
      entry.stage,
      null,
      "Minerva McGonagall",
      nowIso(),
    );
  }
  run(
    "INSERT INTO segments (id, org_id, name, kind, config, created_at) VALUES (?,?,?,?,?,?)",
    id(),
    orgId,
    "AI Experts",
    "dynamic",
    JSON.stringify({ q: "AI" }),
    nowIso(),
  );

  /* ----------------------------------------------------------- audit log -- */
  logAudit({
    eventId: event.id,
    entityType: "event",
    entityId: event.id,
    actorName: "Seed",
    action: "created",
    summary: "Demo event seeded",
  });

  writeFixtureFiles();
  console.log("· fixtures/ written (speakers.csv, headshot.png, slides.pdf)");
}

function defaultPasswordFor(person: PersonSeed): string {
  return `Devflow!${person.first}2027`;
}

async function withEmails() {
  main();
  const event = getEventBySlug(EVENT.slug);
  if (!event) return;
  const already = get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM email_messages WHERE event_id = ?",
    event.id,
  );
  if (already && already.n > 0) return;

  const priya = findContactByEmail(event.org_id, "sbek-speaker@example.com");
  const marcus = findContactByEmail(event.org_id, "sbek-speaker2@example.com");
  const sam = findContactByEmail(event.org_id, "sbek-reviewer@example.com");

  await sendEmail({
    eventId: event.id,
    to: priya!.email,
    toName: "Hermione Granger",
    contactId: priya!.id,
    subject: "We received your submission to DevFlow Conf 2027",
    body: `<p>Hi Hermione,</p><p>Thanks for submitting <strong>Taming 40-Minute CI: Incremental Builds at Monorepo Scale</strong> to DevFlow Conf 2027.</p>`,
    templateKey: "submission_confirmation",
  });
  await sendEmail({
    eventId: event.id,
    to: priya!.email,
    toName: "Hermione Granger",
    contactId: priya!.id,
    subject: "Your talk has been accepted to DevFlow Conf 2027",
    body: `<p>Hi Hermione Granger, congratulations! Your session 'Taming 40-Minute CI: Incremental Builds at Monorepo Scale' has been accepted. Please confirm your participation and complete your speaker profile by April 1, 2027.</p>`,
    templateKey: "decision_accepted",
  });
  await sendEmail({
    eventId: event.id,
    to: marcus!.email,
    toName: "Harry Potter",
    contactId: marcus!.id,
    subject: "Your DevFlow Conf 2027 speaker portal",
    body: `<p>Hi Harry, your speaker portal is ready.</p>`,
    templateKey: "portal_invite",
  });
  await sendEmail({
    eventId: event.id,
    to: sam!.email,
    toName: "Severus Snape",
    contactId: sam!.id,
    subject: "You are reviewing for DevFlow Conf 2027",
    body: `<p>Hi Severus, you have been added to the review committee. Your queue is ready.</p>`,
    templateKey: "evaluation_invite",
  });
  console.log("· outbox seeded");
  console.log("seed complete");
}

void withEmails();
