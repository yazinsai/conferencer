import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { getDb, getSqlite, schema } from "../lib/db";
import { id } from "../lib/id";
import { nowIso } from "../lib/dates";
import { hashPassword } from "../lib/auth/password";
import { DEFAULT_EMAIL_TEMPLATES } from "../lib/email/templates";

const ROOT = process.cwd();

function loadSample() {
  const p = path.join(ROOT, "fixtures/sample-data.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as {
    event: {
      name: string;
      tagline: string;
      dates: string;
      location: string;
      description: string;
      tracks: string[];
      session_formats: string[];
      rooms: string[];
    };
    identities: {
      organizer: { name: string; email: string; password: string };
      speaker: {
        name: string;
        email: string;
        password: string;
        title: string;
        company: string;
        bio: string;
        twitter: string;
        linkedin: string;
        dietary: string;
        tshirt: string;
      };
      speaker2: {
        name: string;
        email: string;
        password: string;
        title: string;
        company: string;
        bio: string;
      };
      reviewer: { name: string; email: string; password: string };
    };
    submissions: Array<{
      title: string;
      format: string;
      track: string;
      abstract: string;
      audience_level: string;
      notes_for_reviewers?: string;
    }>;
    review: {
      rating_example: number;
      comment_example: string;
    };
  };
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts[0] || "User", lastName: parts.slice(1).join(" ") || "" };
}

const EMAIL_TEMPLATES = DEFAULT_EMAIL_TEMPLATES;

const DEFAULT_TASKS = [
  "Confirm participation",
  "Upload headshot",
  "Complete bio and profile",
  "Upload final slides",
  "Sign speaker release form",
  "Hotel and travel reservations",
  "Flight reimbursement form",
  "Announce your participation",
  "Invite colleagues with your speaker discount",
];

export async function seed(opts?: { reset?: boolean }) {
  const db = getDb();
  const sqlite = getSqlite();

  if (opts?.reset) {
    sqlite.exec("PRAGMA foreign_keys = OFF");
    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as Array<{ name: string }>;
    for (const t of tables) {
      sqlite.exec(`DELETE FROM ${t.name}`);
    }
    sqlite.exec("PRAGMA foreign_keys = ON");
  }

  const existing = db.select().from(schema.events).where(eq(schema.events.slug, "devflow-conf-2027")).get();
  if (existing && !opts?.reset) {
    console.log("Seed skipped — DevFlow Conf 2027 already exists. Use seed:reset to wipe.");
    return;
  }

  const sample = loadSample();
  const createdAt = nowIso();
  const orgId = id("org");
  const eventId = id("evt");

  db.insert(schema.organizations)
    .values({ id: orgId, name: "DevFlow Foundation", slug: "devflow", createdAt })
    .run();

  db.insert(schema.events)
    .values({
      id: eventId,
      orgId,
      name: sample.event.name,
      slug: "devflow-conf-2027",
      type: "conference",
      location: sample.event.location,
      timezone: "America/Los_Angeles",
      startsAt: "2027-05-12T09:00:00-07:00",
      endsAt: "2027-05-14T18:00:00-07:00",
      theme: sample.event.description,
      accentColor: "#2563eb",
      status: "active",
      agendaPublishedAt: createdAt,
      createdAt,
    })
    .run();

  const trackColors = ["#7c3aed", "#2563eb", "#059669"];
  const trackIds: Record<string, string> = {};
  sample.event.tracks.forEach((name, i) => {
    const tid = id("trk");
    trackIds[name] = tid;
    db.insert(schema.tracks)
      .values({ id: tid, eventId, name, color: trackColors[i % trackColors.length], sortOrder: i })
      .run();
  });

  const formatDurations: Record<string, number> = {
    "Keynote (45 min)": 45,
    "Talk (30 min)": 30,
    "Lightning Talk (10 min)": 10,
    "Workshop (120 min)": 120,
    "Panel (45 min)": 45,
  };
  const formatIds: Record<string, string> = {};
  sample.event.session_formats.forEach((name, i) => {
    const fid = id("fmt");
    formatIds[name] = fid;
    db.insert(schema.formats)
      .values({
        id: fid,
        eventId,
        name,
        color: "#64748b",
        sortOrder: i,
        durationMinutes: formatDurations[name] ?? 30,
      })
      .run();
  });

  const roomIds: Record<string, string> = {};
  sample.event.rooms.forEach((name, i) => {
    const rid = id("rm");
    roomIds[name] = rid;
    db.insert(schema.rooms)
      .values({ id: rid, eventId, name, color: "#0f766e", sortOrder: i })
      .run();
  });

  ["Beginner", "Intermediate", "Advanced"].forEach((name, i) => {
    db.insert(schema.levels)
      .values({ id: id("lvl"), eventId, name, color: "#7c3aed", sortOrder: i })
      .run();
  });

  async function createUser(
    fullName: string,
    email: string,
    password: string,
    role: "organizer" | "reviewer" | "participant",
  ) {
    const { firstName, lastName } = splitName(fullName);
    const userId = id("usr");
    db.insert(schema.users)
      .values({
        id: userId,
        email: email.toLowerCase(),
        passwordHash: await hashPassword(password),
        firstName,
        lastName,
        createdAt,
      })
      .run();
    db.insert(schema.eventMemberships)
      .values({ id: id("mem"), eventId, userId, role, createdAt })
      .run();
    return userId;
  }

  const organizerId = await createUser(
    sample.identities.organizer.name,
    sample.identities.organizer.email,
    sample.identities.organizer.password,
    "organizer",
  );
  const speakerUserId = await createUser(
    sample.identities.speaker.name,
    sample.identities.speaker.email,
    sample.identities.speaker.password,
    "participant",
  );
  const speaker2UserId = await createUser(
    sample.identities.speaker2.name,
    sample.identities.speaker2.email,
    sample.identities.speaker2.password,
    "participant",
  );
  const reviewerId = await createUser(
    sample.identities.reviewer.name,
    sample.identities.reviewer.email,
    sample.identities.reviewer.password,
    "reviewer",
  );

  function createContact(
    userId: string | null,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      jobTitle?: string;
      company?: string;
      biography?: string;
      twitterUrl?: string;
      linkedinUrl?: string;
      dietary?: string;
      tshirtSize?: string;
      headshotUrl?: string;
    },
    speakerStatus: string,
  ) {
    const contactId = id("ctc");
    db.insert(schema.contacts)
      .values({
        id: contactId,
        orgId,
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        jobTitle: data.jobTitle,
        company: data.company,
        biography: data.biography,
        twitterUrl: data.twitterUrl,
        linkedinUrl: data.linkedinUrl,
        dietary: data.dietary,
        tshirtSize: data.tshirtSize,
        headshotUrl: data.headshotUrl,
        calendarToken: id("cal"),
        createdAt,
      })
      .run();
    db.insert(schema.eventContacts)
      .values({
        id: id("ec"),
        eventId,
        contactId,
        status: "active",
        speakerStatus,
        createdAt,
      })
      .run();
    return contactId;
  }

  const priya = splitName(sample.identities.speaker.name);
  const marcus = splitName(sample.identities.speaker2.name);
  const jordan = splitName(sample.identities.organizer.name);

  const priyaContactId = createContact(
    speakerUserId,
    {
      ...priya,
      email: sample.identities.speaker.email,
      jobTitle: sample.identities.speaker.title,
      company: sample.identities.speaker.company,
      biography: sample.identities.speaker.bio,
      twitterUrl: sample.identities.speaker.twitter,
      linkedinUrl: sample.identities.speaker.linkedin,
      dietary: sample.identities.speaker.dietary,
      tshirtSize: sample.identities.speaker.tshirt,
      headshotUrl: "/fixtures/headshot.png",
    },
    "confirmed",
  );
  const marcusContactId = createContact(
    speaker2UserId,
    {
      ...marcus,
      email: sample.identities.speaker2.email,
      jobTitle: sample.identities.speaker2.title,
      company: sample.identities.speaker2.company,
      biography: sample.identities.speaker2.bio,
    },
    "invited",
  );
  createContact(
    organizerId,
    { ...jordan, email: sample.identities.organizer.email, jobTitle: "Event Organizer" },
    "prospect",
  );

  // Field library
  const fieldDefs: Array<{
    key: string;
    label: string;
    type: string;
    scope: "session" | "contact";
    options?: string[];
    maxLength?: number;
  }> = [
    { key: "title", label: "Title", type: "text", scope: "session", maxLength: 200 },
    { key: "description", label: "Description", type: "textarea", scope: "session", maxLength: 5000 },
    {
      key: "format",
      label: "Format",
      type: "dropdown",
      scope: "session",
      options: sample.event.session_formats,
    },
    { key: "track", label: "Track", type: "dropdown", scope: "session", options: sample.event.tracks },
    {
      key: "level",
      label: "Audience level",
      type: "dropdown",
      scope: "session",
      options: ["Beginner", "Intermediate", "Advanced"],
    },
    { key: "language", label: "Language", type: "text", scope: "session" },
    { key: "key_takeaway", label: "Key takeaway", type: "text", scope: "session", maxLength: 280 },
    { key: "workshop_prerequisites", label: "Workshop prerequisites", type: "textarea", scope: "session" },
    { key: "notes_for_reviewers", label: "Notes for reviewers", type: "textarea", scope: "session" },
    { key: "first_name", label: "First Name", type: "text", scope: "contact" },
    { key: "last_name", label: "Last Name", type: "text", scope: "contact" },
    { key: "email", label: "Email", type: "email", scope: "contact" },
    { key: "biography", label: "Biography", type: "textarea", scope: "contact", maxLength: 5000 },
    { key: "job_title", label: "Job Title", type: "text", scope: "contact" },
    { key: "company", label: "Company", type: "text", scope: "contact" },
  ];
  const fieldIds: Record<string, string> = {};
  for (const f of fieldDefs) {
    const fid = id("fld");
    fieldIds[f.key] = fid;
    db.insert(schema.fields)
      .values({
        id: fid,
        eventId,
        scope: f.scope,
        key: f.key,
        label: f.label,
        type: f.type,
        options: JSON.stringify(f.options ?? []),
        maxLength: f.maxLength ?? null,
        isStandard: true,
        createdAt,
      })
      .run();
  }

  const formId = id("frm");
  db.insert(schema.submissionForms)
    .values({
      id: formId,
      eventId,
      name: "DevFlow CFP 2027",
      title: "Submit a talk",
      pageHeading: "Call for Speakers",
      welcomeMessage:
        "<p>Welcome to the DevFlow Conf 2027 call for speakers. Share your talk idea with our program committee.</p>",
      showWelcome: true,
      collects: "abstracts",
      collectParticipants: true,
      opensAt: "2026-01-01T00:00:00Z",
      closesAt: "2027-04-30T23:59:59-07:00",
      submissionLimit: 5,
      allowDrafts: true,
      allowMultipleDrafts: true,
      successMessage:
        "<p>Thanks for submitting! A confirmation email is on its way. You can manage your proposal from the speaker portal.</p>",
      autoRedirectToPortal: true,
      redirectSeconds: 10,
      sendConfirmationEmail: true,
      confirmationEmailBody: null,
      notifyAdminUserIds: JSON.stringify([organizerId]),
      status: "open",
      createdAt,
    })
    .run();

  const sectionSub = id("sec");
  const sectionPart = id("sec");
  db.insert(schema.formSections)
    .values([
      {
        id: sectionSub,
        formId,
        kind: "submission",
        title: "Abstract Information",
        heading: "Tell us about your session",
        description: "<p>Share the details of your proposed talk.</p>",
        sortOrder: 0,
      },
      {
        id: sectionPart,
        formId,
        kind: "participant",
        title: "Participant Information",
        heading: "Who is speaking?",
        description: "<p>Add speakers for this submission.</p>",
        sortOrder: 1,
      },
    ])
    .run();

  const qTitle = id("q");
  const qDesc = id("q");
  const qTrack = id("q");
  const qFormat = id("q");
  const qLevel = id("q");
  const qTakeaway = id("q");
  const qPrereq = id("q");
  const qNotes = id("q");

  const submissionQuestions = [
    { id: qTitle, fieldKey: "title", required: true, locked: true, sort: 0 },
    { id: qDesc, fieldKey: "description", required: true, locked: false, sort: 1 },
    { id: qTrack, fieldKey: "track", required: true, locked: false, sort: 2 },
    { id: qFormat, fieldKey: "format", required: true, locked: false, sort: 3 },
    { id: qLevel, fieldKey: "level", required: true, locked: false, sort: 4 },
    { id: qTakeaway, fieldKey: "key_takeaway", required: true, locked: false, sort: 5 },
    {
      id: qPrereq,
      fieldKey: "workshop_prerequisites",
      required: false,
      locked: false,
      sort: 6,
      condition: {
        question_id: qFormat,
        operator: "equals",
        value: "Workshop (120 min)",
      },
    },
    { id: qNotes, fieldKey: "notes_for_reviewers", required: false, locked: false, sort: 7 },
  ] as const;

  for (const q of submissionQuestions) {
    db.insert(schema.formQuestions)
      .values({
        id: q.id,
        formId,
        sectionId: sectionSub,
        fieldId: fieldIds[q.fieldKey],
        isRequired: q.required,
        isLocked: q.locked,
        sortOrder: q.sort,
        condition: "condition" in q && q.condition ? JSON.stringify(q.condition) : null,
      })
      .run();
  }

  for (const [i, key] of ["first_name", "last_name", "email", "biography", "job_title", "company"].entries()) {
    db.insert(schema.formQuestions)
      .values({
        id: id("q"),
        formId,
        sectionId: sectionPart,
        fieldId: fieldIds[key],
        isRequired: ["first_name", "last_name", "email"].includes(key),
        isLocked: ["first_name", "last_name", "email"].includes(key),
        sortOrder: i,
        condition: null,
      })
      .run();
  }

  db.insert(schema.participantRoleConfigs)
    .values({
      id: id("prc"),
      formId,
      role: "speaker",
      enabled: true,
      minCount: 1,
      maxCount: 5,
    })
    .run();

  // Submissions with mixed statuses
  const statuses = [
    "accepted",
    "pending",
    "declined",
    "accept_queue",
    "decline_queue",
    "draft",
    "withdrawn",
  ] as const;
  const submissionIds: string[] = [];

  sample.submissions.forEach((s, i) => {
    const sid = id("sub");
    submissionIds.push(sid);
    const status = i === 0 ? "accepted" : i === 1 ? "pending" : "accepted";
    const answers = {
      [qTitle]: s.title,
      [qDesc]: s.abstract,
      [qTrack]: s.track,
      [qFormat]: s.format,
      [qLevel]: s.audience_level,
      [qTakeaway]:
        i === 0
          ? "A decision framework for which incremental-build investments pay off"
          : i === 1
            ? "Verification patterns that scale beyond code review"
            : "Turn docs into a cited Q&A surface under $50/mo",
      [qNotes]: s.notes_for_reviewers ?? "",
    };
    db.insert(schema.submissions)
      .values({
        id: sid,
        eventId,
        formId,
        kind: "abstract",
        status,
        title: s.title,
        description: s.abstract,
        trackId: trackIds[s.track],
        formatId: formatIds[s.format],
        level: s.audience_level,
        language: "English",
        submitterContactId: priyaContactId,
        answers: JSON.stringify(answers),
        isDraft: false,
        approvalStatus: status === "accepted" ? "approved" : "in_review",
        averageScore: i === 0 ? 4 : null,
        createdAt,
        updatedAt: createdAt,
      })
      .run();
    db.insert(schema.submissionParticipants)
      .values({
        id: id("sp"),
        submissionId: sid,
        contactId: priyaContactId,
        role: "speaker",
        acceptanceStatus: status === "accepted" ? "accepted" : "pending",
        sortOrder: 0,
      })
      .run();
    if (i === 0) {
      db.insert(schema.submissionParticipants)
        .values({
          id: id("sp"),
          submissionId: sid,
          contactId: marcusContactId,
          role: "speaker",
          acceptanceStatus: "accepted",
          sortOrder: 1,
        })
        .run();
    }
  });

  // Extra status-tab fillers
  const fillers: Array<{ title: string; status: (typeof statuses)[number]; kind: "abstract" | "session" }> = [
    { title: "Sponsor Keynote: Shipping Platform at Scale", status: "accepted", kind: "session" },
    { title: "Draft: Observability for Agent Loops", status: "draft", kind: "abstract" },
    { title: "Maybe: WASM Toolchains in CI", status: "accept_queue", kind: "abstract" },
    { title: "Lean Decline: Another GraphQL Talk", status: "decline_queue", kind: "abstract" },
    { title: "Withdrawn: Live Coding Roulette", status: "withdrawn", kind: "abstract" },
    { title: "Declined: Blockchain for Docs", status: "declined", kind: "abstract" },
    { title: "Lightning: Agents in Production Q&A", status: "accepted", kind: "session" },
  ];
  for (const f of fillers) {
    const sid = id("sub");
    submissionIds.push(sid);
    const contactId = f.title.includes("Agents in Production") ? marcusContactId : priyaContactId;
    db.insert(schema.submissions)
      .values({
        id: sid,
        eventId,
        formId: f.kind === "session" ? null : formId,
        kind: f.kind,
        status: f.status,
        title: f.title,
        description: `${f.title} — seeded programme item.`,
        trackId: trackIds["AI Engineering"],
        formatId: formatIds["Lightning Talk (10 min)"],
        level: "Intermediate",
        submitterContactId: contactId,
        answers: "{}",
        isDraft: f.status === "draft",
        approvalStatus: f.status === "accepted" ? "approved" : "draft",
        createdAt,
        updatedAt: createdAt,
      })
      .run();
    db.insert(schema.submissionParticipants)
      .values({
        id: id("sp"),
        submissionId: sid,
        contactId,
        role: "speaker",
        acceptanceStatus: f.status === "accepted" ? "accepted" : "pending",
        sortOrder: 0,
      })
      .run();
  }

  // Schedule accepted sessions across days/rooms
  const schedulePlan = [
    {
      title: sample.submissions[0].title,
      day: "2027-05-12",
      start: "10:00",
      end: "10:30",
      room: "Room 2A",
    },
    {
      title: sample.submissions[2].title,
      day: "2027-05-12",
      start: "11:00",
      end: "11:10",
      room: "Main Stage",
    },
    {
      title: "Sponsor Keynote: Shipping Platform at Scale",
      day: "2027-05-13",
      start: "09:00",
      end: "09:45",
      room: "Main Stage",
    },
    {
      title: "Lightning: Agents in Production Q&A",
      day: "2027-05-13",
      start: "14:00",
      end: "14:10",
      room: "Room 2B",
    },
  ];
  for (const slot of schedulePlan) {
    const row = db
      .select()
      .from(schema.submissions)
      .where(eq(schema.submissions.title, slot.title))
      .get();
    if (!row) continue;
    db.update(schema.submissions)
      .set({
        startsAt: `${slot.day}T${slot.start}:00-07:00`,
        endsAt: `${slot.day}T${slot.end}:00-07:00`,
        locationId: roomIds[slot.room],
        status: "accepted",
        approvalStatus: "approved",
        updatedAt: createdAt,
      })
      .where(eq(schema.submissions.id, row.id))
      .run();
  }

  // Evaluation
  const planId = id("plan");
  db.insert(schema.evaluationPlans)
    .values({
      id: planId,
      eventId,
      name: "Program Committee Review",
      instructions: "<p>Score each submission on originality and relevance.</p>",
      isOpen: true,
      opensAt: "2026-08-01T00:00:00Z",
      closesAt: "2027-04-01T00:00:00Z",
      scoringMethod: "points",
      mode: "parallel",
      anonymize: false,
      createdAt,
    })
    .run();
  const roundId = id("rnd");
  db.insert(schema.evaluationRounds)
    .values({
      id: roundId,
      planId,
      name: "Initial Review",
      sortOrder: 0,
      opensAt: "2026-08-01T00:00:00Z",
      closesAt: "2027-04-01T00:00:00Z",
      anonymize: false,
      instructions: "Complete all required scorecard fields.",
      visibleFields: JSON.stringify(["title", "description", "track", "format", "level"]),
    })
    .run();
  const scoreQs = [
    { type: "scale_1_5", label: "Originality", weight: 2 },
    { type: "scale_1_5", label: "Relevance", weight: 1 },
    {
      type: "dropdown",
      label: "Recommendation",
      options: [
        { label: "Accept", points: 3 },
        { label: "Maybe", points: 2 },
        { label: "Reject", points: 1 },
      ],
    },
    { type: "free_text", label: "Comments", weight: 0 },
  ];
  scoreQs.forEach((q, i) => {
    db.insert(schema.scorecardQuestions)
      .values({
        id: id("scq"),
        roundId,
        type: q.type,
        label: q.label,
        options: JSON.stringify(q.options ?? []),
        weight: q.weight ?? 1,
        min: q.type.startsWith("scale") ? 1 : null,
        max: q.type === "scale_1_5" ? 5 : null,
        isRequired: true,
        sortOrder: i,
      })
      .run();
  });

  const taming = db
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.title, sample.submissions[0].title))
    .get()!;
  const assignmentId = id("asg");
  db.insert(schema.evaluationAssignments)
    .values({
      id: assignmentId,
      roundId,
      submissionId: taming.id,
      reviewerUserId: reviewerId,
      status: "complete",
      createdAt,
    })
    .run();
  db.insert(schema.reviews)
    .values({
      id: id("rev"),
      assignmentId,
      answers: JSON.stringify({
        Originality: 4,
        Relevance: 5,
        Recommendation: "Accept",
        Comments: sample.review.comment_example,
      }),
      score: sample.review.rating_example,
      comment: sample.review.comment_example,
      submittedAt: createdAt,
      updatedAt: createdAt,
    })
    .run();

  // Also assign AI talk as pending for Sam
  const aiTalk = db
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.title, sample.submissions[1].title))
    .get();
  if (aiTalk) {
    db.insert(schema.evaluationAssignments)
      .values({
        id: id("asg"),
        roundId,
        submissionId: aiTalk.id,
        reviewerUserId: reviewerId,
        status: "pending",
        createdAt,
      })
      .run();
  }

  // Tasks
  const taskIds: string[] = [];
  DEFAULT_TASKS.forEach((name, i) => {
    const tid = id("tsk");
    taskIds.push(tid);
    const type =
      name.includes("Upload") || name.includes("slides") || name.includes("headshot")
        ? "file_request"
        : name.includes("form") || name.includes("Flight") || name.includes("Hotel")
          ? "form"
          : "action";
    db.insert(schema.tasks)
      .values({
        id: tid,
        eventId,
        name,
        description: `${name} for DevFlow Conf 2027.`,
        type,
        target: "contact",
        acceptedTypes: "application/pdf,image/png,image/jpeg",
        maxSizeMb: 20,
        createdAt,
      })
      .run();
  });

  const acceptedContacts = [priyaContactId, marcusContactId];
  for (const contactId of acceptedContacts) {
    taskIds.forEach((taskId, i) => {
      const status =
        contactId === priyaContactId && i < 3
          ? "complete"
          : contactId === priyaContactId && i === 3
            ? "in_progress"
            : i === 0
              ? "complete"
              : "not_started";
      const dueAt =
        i < 2 ? "2027-04-01T00:00:00Z" : i < 5 ? "2027-04-15T00:00:00Z" : "2027-05-01T00:00:00Z";
      db.insert(schema.taskAssignments)
        .values({
          id: id("ta"),
          taskId,
          eventId,
          contactId,
          dueAt,
          isRequired: true,
          status,
          completedAt: status === "complete" ? createdAt : null,
          createdAt,
        })
        .run();
    });
  }

  // Portal
  db.insert(schema.portals)
    .values({
      id: id("por"),
      eventId,
      name: "Speaker Portal",
      isDefault: true,
      welcomeMessage: "<p>Welcome to the DevFlow Conf 2027 speaker portal.</p>",
      accentColor: "#2563eb",
      showTasksAlways: true,
      showSessions: true,
      allowManageProfile: true,
      createdAt,
    })
    .run();

  for (const tpl of EMAIL_TEMPLATES) {
    db.insert(schema.emailTemplates)
      .values({
        id: id("et"),
        eventId,
        key: tpl.key,
        subject: tpl.subject,
        bodyHtml: tpl.bodyHtml,
        isEnabled: true,
      })
      .run();
  }

  db.insert(schema.emailMessages)
    .values({
      id: id("em"),
      eventId,
      toEmail: sample.identities.speaker.email,
      toContactId: priyaContactId,
      subject: "We received your submission to DevFlow Conf 2027",
      bodyHtml: "<p>Hi Priya Raman, thanks for submitting.</p>",
      templateKey: "submission_confirmation",
      status: "sent",
      providerId: "local-outbox",
      sentAt: createdAt,
      createdAt,
    })
    .run();

  for (const type of ["sessions", "speakers", "agenda", "itinerary", "gallery"] as const) {
    db.insert(schema.embeds)
      .values({
        id: id("emb"),
        eventId,
        type,
        format: "styled_html",
        config: JSON.stringify({}),
        token: id("tok"),
        createdAt,
      })
      .run();
  }

  console.log("Seeded DevFlow Conf 2027");
  console.log("  Organizer:", sample.identities.organizer.email);
  console.log("  Speaker:  ", sample.identities.speaker.email);
  console.log("  Speaker2: ", sample.identities.speaker2.email);
  console.log("  Reviewer: ", sample.identities.reviewer.email);
}

async function main() {
  const reset = process.argv.includes("--reset");
  const { ensureSchema } = await import("./ensure-schema");
  ensureSchema();
  await seed({ reset });
}

const isDirect =
  typeof process.argv[1] === "string" &&
  (process.argv[1].endsWith("seed.ts") || process.argv[1].endsWith("seed.js"));

if (isDirect) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
