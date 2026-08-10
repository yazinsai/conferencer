import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    type: text("type").notNull().default("conference"),
    websiteUrl: text("website_url"),
    location: text("location"),
    timezone: text("timezone").notNull().default("America/Los_Angeles"),
    startsAt: text("starts_at").notNull(),
    endsAt: text("ends_at").notNull(),
    theme: text("theme"),
    logoUrl: text("logo_url"),
    accentColor: text("accent_color").default("#2563eb"),
    status: text("status").notNull().default("active"),
    agendaPublishedAt: text("agenda_published_at"),
    enableAcceptance: integer("enable_acceptance", { mode: "boolean" })
      .notNull()
      .default(true),
    allowWithdrawal: integer("allow_withdrawal", { mode: "boolean" })
      .notNull()
      .default(true),
    portalPendingLabel: text("portal_pending_label").default("Pending"),
    portalAcceptedLabel: text("portal_accepted_label").default("Accepted"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("events_org_idx").on(t.orgId)],
);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const eventMemberships = sqliteTable(
  "event_memberships",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role").notNull(), // organizer | reviewer | participant
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("memberships_event_idx").on(t.eventId),
    index("memberships_user_idx").on(t.userId),
    index("memberships_event_user_idx").on(t.eventId, t.userId),
  ],
);

export const contacts = sqliteTable(
  "contacts",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id),
    userId: text("user_id").references(() => users.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    headshotUrl: text("headshot_url"),
    biography: text("biography"),
    jobTitle: text("job_title"),
    company: text("company"),
    pronouns: text("pronouns"),
    phone: text("phone"),
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),
    facebookUrl: text("facebook_url"),
    websiteUrl: text("website_url"),
    dietary: text("dietary"),
    tshirtSize: text("tshirt_size"),
    salutation: text("salutation"),
    honorific: text("honorific"),
    gender: text("gender"),
    custom: text("custom").default("{}"),
    calendarToken: text("calendar_token"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("contacts_org_idx").on(t.orgId),
    index("contacts_user_idx").on(t.userId),
    index("contacts_email_idx").on(t.email),
  ],
);

export const eventContacts = sqliteTable(
  "event_contacts",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    contactId: text("contact_id")
      .notNull()
      .references(() => contacts.id),
    status: text("status").notNull().default("active"), // invited|active|declined
    speakerStatus: text("speaker_status").notNull().default("prospect"), // prospect|invited|confirmed|declined|cancelled
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("event_contacts_event_idx").on(t.eventId),
    index("event_contacts_contact_idx").on(t.contactId),
    index("event_contacts_status_idx").on(t.eventId, t.speakerStatus),
  ],
);

export const tracks = sqliteTable(
  "tracks",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    color: text("color").notNull().default("#2563eb"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("tracks_event_idx").on(t.eventId)],
);

export const formats = sqliteTable(
  "formats",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    color: text("color").notNull().default("#64748b"),
    sortOrder: integer("sort_order").notNull().default(0),
    durationMinutes: integer("duration_minutes"),
  },
  (t) => [index("formats_event_idx").on(t.eventId)],
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    color: text("color").notNull().default("#94a3b8"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("tags_event_idx").on(t.eventId)],
);

export const rooms = sqliteTable(
  "rooms",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    color: text("color").notNull().default("#0f766e"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("rooms_event_idx").on(t.eventId)],
);

export const levels = sqliteTable(
  "levels",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    color: text("color").notNull().default("#7c3aed"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("levels_event_idx").on(t.eventId)],
);

export const fields = sqliteTable(
  "fields",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    scope: text("scope").notNull(), // session|contact
    key: text("key").notNull(),
    label: text("label").notNull(),
    type: text("type").notNull(),
    options: text("options").default("[]"),
    maxLength: integer("max_length"),
    isStandard: integer("is_standard", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("fields_event_idx").on(t.eventId),
    index("fields_event_key_idx").on(t.eventId, t.key),
  ],
);

export const submissionForms = sqliteTable(
  "submission_forms",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    title: text("title").notNull(),
    pageHeading: text("page_heading"),
    welcomeMessage: text("welcome_message"),
    showWelcome: integer("show_welcome", { mode: "boolean" })
      .notNull()
      .default(true),
    collects: text("collects").notNull().default("abstracts"), // abstracts|sessions
    collectParticipants: integer("collect_participants", { mode: "boolean" })
      .notNull()
      .default(true),
    opensAt: text("opens_at"),
    closesAt: text("closes_at"),
    submissionLimit: integer("submission_limit"),
    allowDrafts: integer("allow_drafts", { mode: "boolean" })
      .notNull()
      .default(true),
    allowMultipleDrafts: integer("allow_multiple_drafts", { mode: "boolean" })
      .notNull()
      .default(false),
    successMessage: text("success_message"),
    autoRedirectToPortal: integer("auto_redirect_to_portal", { mode: "boolean" })
      .notNull()
      .default(true),
    redirectSeconds: integer("redirect_seconds").notNull().default(10),
    sendConfirmationEmail: integer("send_confirmation_email", { mode: "boolean" })
      .notNull()
      .default(true),
    confirmationEmailBody: text("confirmation_email_body"),
    notifyAdminUserIds: text("notify_admin_user_ids").default("[]"),
    status: text("status").notNull().default("open"), // open|closed
    trackRouting: text("track_routing").default("{}"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("forms_event_idx").on(t.eventId)],
);

export const formSections = sqliteTable(
  "form_sections",
  {
    id: text("id").primaryKey(),
    formId: text("form_id")
      .notNull()
      .references(() => submissionForms.id),
    kind: text("kind").notNull(), // welcome|submission|participant|review
    title: text("title"),
    heading: text("heading"),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("form_sections_form_idx").on(t.formId)],
);

export const formQuestions = sqliteTable(
  "form_questions",
  {
    id: text("id").primaryKey(),
    formId: text("form_id")
      .notNull()
      .references(() => submissionForms.id),
    sectionId: text("section_id")
      .notNull()
      .references(() => formSections.id),
    fieldId: text("field_id")
      .notNull()
      .references(() => fields.id),
    labelOverride: text("label_override"),
    helpText: text("help_text"),
    isRequired: integer("is_required", { mode: "boolean" })
      .notNull()
      .default(false),
    isLocked: integer("is_locked", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    condition: text("condition"), // json or null
  },
  (t) => [
    index("form_questions_form_idx").on(t.formId),
    index("form_questions_section_idx").on(t.sectionId),
  ],
);

export const participantRoleConfigs = sqliteTable(
  "participant_role_configs",
  {
    id: text("id").primaryKey(),
    formId: text("form_id")
      .notNull()
      .references(() => submissionForms.id),
    role: text("role").notNull(), // submitter|speaker|moderator|chairperson
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    minCount: integer("min_count").notNull().default(0),
    maxCount: integer("max_count").notNull().default(5),
  },
  (t) => [index("role_configs_form_idx").on(t.formId)],
);

export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    formId: text("form_id").references(() => submissionForms.id),
    kind: text("kind").notNull().default("abstract"), // abstract|session
    status: text("status").notNull().default("draft"),
    title: text("title").notNull(),
    description: text("description"),
    trackId: text("track_id").references(() => tracks.id),
    formatId: text("format_id").references(() => formats.id),
    level: text("level"),
    language: text("language").default("English"),
    locationId: text("location_id").references(() => rooms.id),
    startsAt: text("starts_at"),
    endsAt: text("ends_at"),
    capacity: integer("capacity"),
    submitterContactId: text("submitter_contact_id").references(
      () => contacts.id,
    ),
    answers: text("answers").notNull().default("{}"),
    isDraft: integer("is_draft", { mode: "boolean" }).notNull().default(false),
    withdrawnAt: text("withdrawn_at"),
    withdrawReason: text("withdraw_reason"),
    approvalStatus: text("approval_status").notNull().default("draft"), // draft|in_review|approved
    notifiedAt: text("notified_at"),
    averageScore: integer("average_score"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    index("submissions_event_idx").on(t.eventId),
    index("submissions_status_idx").on(t.eventId, t.status),
    index("submissions_kind_idx").on(t.eventId, t.kind),
    index("submissions_form_idx").on(t.formId),
    index("submissions_submitter_idx").on(t.submitterContactId),
    index("submissions_schedule_idx").on(t.eventId, t.startsAt, t.locationId),
  ],
);

export const submissionParticipants = sqliteTable(
  "submission_participants",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submissions.id),
    contactId: text("contact_id")
      .notNull()
      .references(() => contacts.id),
    role: text("role").notNull().default("speaker"),
    acceptanceStatus: text("acceptance_status").notNull().default("pending"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    index("participants_submission_idx").on(t.submissionId),
    index("participants_contact_idx").on(t.contactId),
  ],
);

export const submissionTags = sqliteTable(
  "submission_tags",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submissions.id),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [index("submission_tags_sub_idx").on(t.submissionId)],
);

export const evaluationPlans = sqliteTable(
  "evaluation_plans",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    instructions: text("instructions"),
    isOpen: integer("is_open", { mode: "boolean" }).notNull().default(true),
    opensAt: text("opens_at"),
    closesAt: text("closes_at"),
    scoringMethod: text("scoring_method").notNull().default("points"),
    mode: text("mode").notNull().default("parallel"), // funnel|parallel
    anonymize: integer("anonymize", { mode: "boolean" })
      .notNull()
      .default(false),
    showOtherScores: integer("show_other_scores", { mode: "boolean" })
      .notNull()
      .default(false),
    allowAbstain: integer("allow_abstain", { mode: "boolean" })
      .notNull()
      .default(false),
    requireAbstainReason: integer("require_abstain_reason", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("eval_plans_event_idx").on(t.eventId)],
);

export const evaluationRounds = sqliteTable(
  "evaluation_rounds",
  {
    id: text("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => evaluationPlans.id),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    opensAt: text("opens_at"),
    closesAt: text("closes_at"),
    anonymize: integer("anonymize", { mode: "boolean" })
      .notNull()
      .default(false),
    instructions: text("instructions"),
    visibleFields: text("visible_fields").default("[]"),
  },
  (t) => [index("eval_rounds_plan_idx").on(t.planId)],
);

export const scorecardQuestions = sqliteTable(
  "scorecard_questions",
  {
    id: text("id").primaryKey(),
    roundId: text("round_id")
      .notNull()
      .references(() => evaluationRounds.id),
    type: text("type").notNull(),
    label: text("label").notNull(),
    options: text("options").default("[]"),
    weight: integer("weight").notNull().default(1),
    min: integer("min"),
    max: integer("max"),
    isRequired: integer("is_required", { mode: "boolean" })
      .notNull()
      .default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("scorecard_round_idx").on(t.roundId)],
);

export const evaluationAssignments = sqliteTable(
  "evaluation_assignments",
  {
    id: text("id").primaryKey(),
    roundId: text("round_id")
      .notNull()
      .references(() => evaluationRounds.id),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submissions.id),
    reviewerUserId: text("reviewer_user_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull().default("pending"), // pending|in_progress|complete|abstained
    abstainReason: text("abstain_reason"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("eval_assign_round_idx").on(t.roundId),
    index("eval_assign_reviewer_idx").on(t.reviewerUserId),
    index("eval_assign_submission_idx").on(t.submissionId),
  ],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => evaluationAssignments.id)
      .unique(),
    answers: text("answers").notNull().default("{}"),
    score: integer("score"),
    comment: text("comment"),
    submittedAt: text("submitted_at"),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [index("reviews_assignment_idx").on(t.assignmentId)],
);

export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    description: text("description"),
    descriptionFieldId: text("description_field_id"),
    type: text("type").notNull().default("action"), // action|file_request|form
    target: text("target").notNull().default("contact"), // contact|submission
    linkUrl: text("link_url"),
    linkFieldId: text("link_field_id"),
    formId: text("form_id"),
    acceptedTypes: text("accepted_types").default(
      "application/pdf,image/png,image/jpeg",
    ),
    maxSizeMb: integer("max_size_mb").notNull().default(20),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("tasks_event_idx").on(t.eventId)],
);

export const taskAssignments = sqliteTable(
  "task_assignments",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    contactId: text("contact_id").references(() => contacts.id),
    submissionId: text("submission_id").references(() => submissions.id),
    dueAt: text("due_at"),
    extendedDueAt: text("extended_due_at"),
    isRequired: integer("is_required", { mode: "boolean" })
      .notNull()
      .default(true),
    lockOnComplete: integer("lock_on_complete", { mode: "boolean" })
      .notNull()
      .default(false),
    status: text("status").notNull().default("not_started"), // not_started|in_progress|complete|approved|rejected
    formAnswers: text("form_answers").default("{}"),
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("task_assign_event_idx").on(t.eventId),
    index("task_assign_contact_idx").on(t.contactId),
    index("task_assign_status_idx").on(t.eventId, t.status),
    index("task_assign_task_idx").on(t.taskId),
  ],
);

export const uploads = sqliteTable(
  "uploads",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    taskAssignmentId: text("task_assignment_id").references(
      () => taskAssignments.id,
    ),
    submissionId: text("submission_id").references(() => submissions.id),
    contactId: text("contact_id").references(() => contacts.id),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    storageKey: text("storage_key").notNull(),
    version: integer("version").notNull().default(1),
    uploadedByUserId: text("uploaded_by_user_id").references(() => users.id),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("uploads_event_idx").on(t.eventId),
    index("uploads_assignment_idx").on(t.taskAssignmentId),
    index("uploads_contact_idx").on(t.contactId),
  ],
);

export const fileComments = sqliteTable(
  "file_comments",
  {
    id: text("id").primaryKey(),
    uploadId: text("upload_id")
      .notNull()
      .references(() => uploads.id),
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("file_comments_upload_idx").on(t.uploadId)],
);

export const portals = sqliteTable(
  "portals",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(true),
    welcomeMessage: text("welcome_message"),
    accentColor: text("accent_color").default("#2563eb"),
    logoUrl: text("logo_url"),
    showTasksAlways: integer("show_tasks_always", { mode: "boolean" })
      .notNull()
      .default(true),
    showSessions: integer("show_sessions", { mode: "boolean" })
      .notNull()
      .default(true),
    allowManageProfile: integer("allow_manage_profile", { mode: "boolean" })
      .notNull()
      .default(true),
    allowManageParticipants: integer("allow_manage_participants", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    sendWeeklyDigest: integer("send_weekly_digest", { mode: "boolean" })
      .notNull()
      .default(false),
    finalDeadlineDays: integer("final_deadline_days"),
    filter: text("filter").default("{}"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("portals_event_idx").on(t.eventId)],
);

export const emailTemplates = sqliteTable(
  "email_templates",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    key: text("key").notNull(),
    subject: text("subject").notNull(),
    bodyHtml: text("body_html").notNull(),
    isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [
    index("email_templates_event_idx").on(t.eventId),
    index("email_templates_key_idx").on(t.eventId, t.key),
  ],
);

export const emailMessages = sqliteTable(
  "email_messages",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    toEmail: text("to_email").notNull(),
    toContactId: text("to_contact_id").references(() => contacts.id),
    subject: text("subject").notNull(),
    bodyHtml: text("body_html").notNull(),
    templateKey: text("template_key"),
    status: text("status").notNull().default("queued"), // queued|sent|failed
    providerId: text("provider_id"),
    error: text("error"),
    sentAt: text("sent_at"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("email_messages_event_idx").on(t.eventId),
    index("email_messages_to_idx").on(t.toEmail),
    index("email_messages_created_idx").on(t.eventId, t.createdAt),
  ],
);

export const embeds = sqliteTable(
  "embeds",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    type: text("type").notNull(), // sessions|speakers|agenda|itinerary|gallery
    format: text("format").notNull().default("styled_html"),
    config: text("config").default("{}"),
    token: text("token").notNull().unique(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("embeds_event_idx").on(t.eventId)],
);

export const auditEntries = sqliteTable(
  "audit_entries",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    actorUserId: text("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    before: text("before"),
    after: text("after"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("audit_event_idx").on(t.eventId),
    index("audit_entity_idx").on(t.entityType, t.entityId),
  ],
);

export const inviteTokens = sqliteTable("invite_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  eventId: text("event_id").references(() => events.id),
  token: text("token").notNull().unique(),
  purpose: text("purpose").notNull().default("set_password"),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull(),
});

export const apiTokens = sqliteTable(
  "api_tokens",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull(),
    tokenPrefix: text("token_prefix").notNull(),
    createdAt: text("created_at").notNull(),
    lastUsedAt: text("last_used_at"),
  },
  (t) => [index("api_tokens_event_idx").on(t.eventId)],
);

export const savedViews = sqliteTable(
  "saved_views",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    entity: text("entity").notNull().default("submissions"),
    config: text("config").notNull().default("{}"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [index("saved_views_event_idx").on(t.eventId)],
);
