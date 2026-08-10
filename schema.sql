-- Conferencer schema. Applied idempotently at first DB access (src/lib/db.ts).
-- Datetime convention:
--   * created_at / updated_at / *_at audit columns   -> UTC ISO8601 ("2026-08-10T09:00:00.000Z")
--   * anything on the event timeline (starts_at, ends_at, opens_at, closes_at, due_at)
--     -> naive local wall clock in the event timezone ("2027-05-12T10:00")
-- JSON columns are stored as TEXT.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------- identity --

CREATE TABLE IF NOT EXISTS organizations (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash  TEXT,
  first_name     TEXT NOT NULL DEFAULT '',
  last_name      TEXT NOT NULL DEFAULT '',
  is_superadmin  INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);

CREATE TABLE IF NOT EXISTS invite_tokens (
  token       TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  event_id    TEXT REFERENCES events(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,               -- organizer | reviewer | participant
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  contact_id  TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  used_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_email ON invite_tokens(email);

-- ------------------------------------------------------------------- event --

CREATE TABLE IF NOT EXISTS events (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  type          TEXT NOT NULL DEFAULT 'conference',
  website_url   TEXT,
  location      TEXT,
  timezone      TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  starts_at     TEXT,
  ends_at       TEXT,
  theme         TEXT,
  tagline       TEXT,
  logo_url      TEXT,
  accent_color  TEXT NOT NULL DEFAULT '#4f46e5',
  status        TEXT NOT NULL DEFAULT 'active',
  -- record settings (R-SET-5)
  participant_acceptance_enabled INTEGER NOT NULL DEFAULT 1,
  allow_withdrawal               INTEGER NOT NULL DEFAULT 1,
  label_accepted                 TEXT NOT NULL DEFAULT 'Accepted',
  label_pending                  TEXT NOT NULL DEFAULT 'Pending',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_org ON events(org_id);

CREATE TABLE IF NOT EXISTS event_memberships (
  id          TEXT PRIMARY KEY,
  event_id    TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,               -- organizer | reviewer | participant
  created_at  TEXT NOT NULL,
  UNIQUE (event_id, user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON event_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_event ON event_memberships(event_id, role);

-- lookup tables ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tracks_event ON tracks(event_id);

CREATE TABLE IF NOT EXISTS formats (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#0ea5e9',
  duration_minutes INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_formats_event ON formats(event_id);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#14b8a6',
  capacity INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rooms_event ON rooms(event_id);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#a855f7',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tags_event ON tags(event_id);

CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#f59e0b',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_levels_event ON levels(event_id);

-- ---------------------------------------------------------------- contacts --

CREATE TABLE IF NOT EXISTS contacts (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       TEXT REFERENCES users(id) ON DELETE SET NULL,
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL COLLATE NOCASE,
  alt_email     TEXT COLLATE NOCASE,   -- second login that maps to the same person
  headshot_url  TEXT,
  biography     TEXT,
  job_title     TEXT,
  company       TEXT,
  pronouns      TEXT,
  salutation    TEXT,
  honorific     TEXT,
  gender        TEXT,
  phone         TEXT,
  linkedin_url  TEXT,
  twitter_url   TEXT,
  facebook_url  TEXT,
  website_url   TEXT,
  dietary       TEXT,
  tshirt_size   TEXT,
  travel_notes  TEXT,
  notes         TEXT,                        -- internal CRM notes
  tags          TEXT NOT NULL DEFAULT '[]',  -- json array of strings
  custom        TEXT NOT NULL DEFAULT '{}',  -- json, keyed by field id
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(org_id, email);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);

CREATE TABLE IF NOT EXISTS event_contacts (
  id             TEXT PRIMARY KEY,
  event_id       TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  contact_id     TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'active',    -- invited | active | declined
  speaker_status TEXT NOT NULL DEFAULT 'prospect',  -- prospect|invited|confirmed|declined|cancelled
  invited_at     TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  UNIQUE (event_id, contact_id)
);
CREATE INDEX IF NOT EXISTS idx_event_contacts_event ON event_contacts(event_id, speaker_status);

-- ------------------------------------------------------------------ fields --

CREATE TABLE IF NOT EXISTS fields (
  id          TEXT PRIMARY KEY,
  event_id    TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  scope       TEXT NOT NULL,               -- session | contact
  key         TEXT NOT NULL,
  label       TEXT NOT NULL,
  type        TEXT NOT NULL,
  options     TEXT NOT NULL DEFAULT '[]',  -- json array of {value,label,points?}
  max_length  INTEGER,
  help_text   TEXT,
  is_standard INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fields_event ON fields(event_id, scope);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fields_key ON fields(event_id, scope, key);

-- ------------------------------------------------------------------- forms --

CREATE TABLE IF NOT EXISTS submission_forms (
  id                     TEXT PRIMARY KEY,
  event_id               TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name                   TEXT NOT NULL,
  title                  TEXT NOT NULL,
  page_heading           TEXT,
  welcome_message        TEXT,
  show_welcome           INTEGER NOT NULL DEFAULT 1,
  collects               TEXT NOT NULL DEFAULT 'abstracts',  -- abstracts | sessions
  collect_participants   INTEGER NOT NULL DEFAULT 1,
  opens_at               TEXT,
  closes_at              TEXT,
  submission_limit       INTEGER,
  allow_drafts           INTEGER NOT NULL DEFAULT 1,
  allow_multiple_drafts  INTEGER NOT NULL DEFAULT 1,
  success_message        TEXT,
  auto_redirect_to_portal INTEGER NOT NULL DEFAULT 1,
  redirect_seconds       INTEGER NOT NULL DEFAULT 10,
  send_confirmation_email INTEGER NOT NULL DEFAULT 1,
  confirmation_email_subject TEXT,
  confirmation_email_body TEXT,
  notify_admin_user_ids  TEXT NOT NULL DEFAULT '[]',
  notify_on_revision     INTEGER NOT NULL DEFAULT 0,
  combined_limit         TEXT,              -- json {question_ids:[], max:int, label:str}
  track_routing          TEXT NOT NULL DEFAULT '[]', -- json [{track_id, round_id, reviewer_user_ids[]}]
  status                 TEXT NOT NULL DEFAULT 'open', -- open | closed
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_forms_event ON submission_forms(event_id);

CREATE TABLE IF NOT EXISTS form_sections (
  id          TEXT PRIMARY KEY,
  form_id     TEXT NOT NULL REFERENCES submission_forms(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,               -- welcome | submission | participant | review
  title       TEXT,
  heading     TEXT,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_form_sections_form ON form_sections(form_id);

CREATE TABLE IF NOT EXISTS form_questions (
  id             TEXT PRIMARY KEY,
  form_id        TEXT NOT NULL REFERENCES submission_forms(id) ON DELETE CASCADE,
  section_id     TEXT NOT NULL REFERENCES form_sections(id) ON DELETE CASCADE,
  field_id       TEXT NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  label_override TEXT,
  help_text      TEXT,
  is_required    INTEGER NOT NULL DEFAULT 0,
  is_locked      INTEGER NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  condition      TEXT                        -- json {question_id, operator, value}
);
CREATE INDEX IF NOT EXISTS idx_form_questions_form ON form_questions(form_id, section_id);

CREATE TABLE IF NOT EXISTS participant_role_configs (
  id        TEXT PRIMARY KEY,
  form_id   TEXT NOT NULL REFERENCES submission_forms(id) ON DELETE CASCADE,
  role      TEXT NOT NULL,                 -- speaker | moderator | chairperson | submitter
  enabled   INTEGER NOT NULL DEFAULT 1,
  min_count INTEGER NOT NULL DEFAULT 0,
  max_count INTEGER NOT NULL DEFAULT 5,
  UNIQUE (form_id, role)
);

-- ------------------------------------------------------------- submissions --

CREATE TABLE IF NOT EXISTS submissions (
  id                   TEXT PRIMARY KEY,
  event_id             TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  form_id              TEXT REFERENCES submission_forms(id) ON DELETE SET NULL,
  kind                 TEXT NOT NULL DEFAULT 'abstract',  -- abstract | session
  status               TEXT NOT NULL DEFAULT 'draft',
  title                TEXT NOT NULL DEFAULT '',
  description          TEXT,
  track_id             TEXT REFERENCES tracks(id) ON DELETE SET NULL,
  format_id            TEXT REFERENCES formats(id) ON DELETE SET NULL,
  level                TEXT,
  language             TEXT DEFAULT 'English',
  location_id          TEXT REFERENCES rooms(id) ON DELETE SET NULL,
  starts_at            TEXT,
  ends_at              TEXT,
  capacity             INTEGER,
  submitter_contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  answers              TEXT NOT NULL DEFAULT '{}',
  tags                 TEXT NOT NULL DEFAULT '[]',
  is_draft             INTEGER NOT NULL DEFAULT 0,
  withdrawn_at         TEXT,
  withdraw_reason      TEXT,
  approval_status      TEXT NOT NULL DEFAULT 'draft',   -- draft | in_review | approved
  notified_at          TEXT,
  notified_status      TEXT,
  client_session_id    TEXT,
  -- published schedule snapshot (public agenda reads these)
  pub_starts_at        TEXT,
  pub_ends_at          TEXT,
  pub_room_id          TEXT,
  pub_published_at     TEXT,
  -- AI triage
  ai_score             REAL,
  ai_rationale         TEXT,
  ai_override_score    REAL,
  ics_sequence         INTEGER NOT NULL DEFAULT 0,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_submissions_event_status ON submissions(event_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_event_kind ON submissions(event_id, kind);
CREATE INDEX IF NOT EXISTS idx_submissions_event_approval ON submissions(event_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_submissions_schedule ON submissions(event_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_submissions_submitter ON submissions(submitter_contact_id);
CREATE INDEX IF NOT EXISTS idx_submissions_form ON submissions(form_id);

CREATE TABLE IF NOT EXISTS submission_participants (
  id                TEXT PRIMARY KEY,
  submission_id     TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  contact_id        TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  role              TEXT NOT NULL DEFAULT 'speaker',  -- submitter|speaker|moderator|chairperson
  acceptance_status TEXT NOT NULL DEFAULT 'pending',  -- pending|accepted|declined
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sub_participants_sub ON submission_participants(submission_id);
CREATE INDEX IF NOT EXISTS idx_sub_participants_contact ON submission_participants(contact_id);

-- -------------------------------------------------------------- evaluation --

CREATE TABLE IF NOT EXISTS evaluation_plans (
  id                    TEXT PRIMARY KEY,
  event_id              TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  instructions          TEXT,
  is_open               INTEGER NOT NULL DEFAULT 1,
  opens_at              TEXT,
  closes_at             TEXT,
  scoring_method        TEXT NOT NULL DEFAULT 'points',  -- percentage | points
  mode                  TEXT NOT NULL DEFAULT 'parallel',-- funnel | parallel
  anonymize             INTEGER NOT NULL DEFAULT 0,
  show_other_scores     INTEGER NOT NULL DEFAULT 0,
  allow_abstain         INTEGER NOT NULL DEFAULT 1,
  require_abstain_reason INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_plans_event ON evaluation_plans(event_id);

CREATE TABLE IF NOT EXISTS evaluation_rounds (
  id           TEXT PRIMARY KEY,
  plan_id      TEXT NOT NULL REFERENCES evaluation_plans(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  opens_at     TEXT,
  closes_at    TEXT,
  anonymize    INTEGER NOT NULL DEFAULT 0,
  instructions TEXT,
  visible_fields TEXT NOT NULL DEFAULT '[]',       -- json array of field keys
  card_fields    TEXT NOT NULL DEFAULT '[]',
  filter_fields  TEXT NOT NULL DEFAULT '[]',
  show_participants INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rounds_plan ON evaluation_rounds(plan_id);

CREATE TABLE IF NOT EXISTS round_reviewers (
  id           TEXT PRIMARY KEY,
  round_id     TEXT NOT NULL REFERENCES evaluation_rounds(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_assignments INTEGER,
  created_at   TEXT NOT NULL,
  UNIQUE (round_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_round_reviewers_user ON round_reviewers(user_id);

CREATE TABLE IF NOT EXISTS scorecard_questions (
  id          TEXT PRIMARY KEY,
  round_id    TEXT NOT NULL REFERENCES evaluation_rounds(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,     -- scale_1_3|scale_1_5|scale_1_10|numeric|dropdown|free_text|file|separator
  label       TEXT NOT NULL,
  options     TEXT NOT NULL DEFAULT '[]',  -- json [{value,label,points}]
  weight      REAL NOT NULL DEFAULT 1,
  min         REAL,
  max         REAL,
  is_required INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_scorecard_round ON scorecard_questions(round_id);

CREATE TABLE IF NOT EXISTS evaluation_assignments (
  id               TEXT PRIMARY KEY,
  round_id         TEXT NOT NULL REFERENCES evaluation_rounds(id) ON DELETE CASCADE,
  submission_id    TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'pending', -- pending|in_progress|complete|abstained
  abstain_reason   TEXT,
  created_at       TEXT NOT NULL,
  UNIQUE (round_id, submission_id, reviewer_user_id)
);
CREATE INDEX IF NOT EXISTS idx_assignments_reviewer ON evaluation_assignments(reviewer_user_id, round_id);
CREATE INDEX IF NOT EXISTS idx_assignments_submission ON evaluation_assignments(submission_id);

CREATE TABLE IF NOT EXISTS reviews (
  id            TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL UNIQUE REFERENCES evaluation_assignments(id) ON DELETE CASCADE,
  round_id      TEXT NOT NULL REFERENCES evaluation_rounds(id) ON DELETE CASCADE,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers       TEXT NOT NULL DEFAULT '{}',
  score         REAL,
  raw_score     REAL,
  comment       TEXT,
  submitted_at  TEXT,
  updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_submission ON reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_reviews_round ON reviews(round_id);

-- ------------------------------------------------------------------- tasks --

CREATE TABLE IF NOT EXISTS tasks (
  id                   TEXT PRIMARY KEY,
  event_id             TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  description          TEXT,
  description_field_id TEXT,
  type                 TEXT NOT NULL DEFAULT 'action',  -- action | file_request | form
  target               TEXT NOT NULL DEFAULT 'contact', -- contact | submission
  link_url             TEXT,
  link_field_id        TEXT,
  form_id              TEXT REFERENCES submission_forms(id) ON DELETE SET NULL,
  form_schema          TEXT NOT NULL DEFAULT '[]',      -- json [{key,label,type,options,required}]
  accepted_types       TEXT NOT NULL DEFAULT '',
  max_size_mb          INTEGER NOT NULL DEFAULT 20,
  is_default           INTEGER NOT NULL DEFAULT 0,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tasks_event ON tasks(event_id);

CREATE TABLE IF NOT EXISTS task_assignments (
  id               TEXT PRIMARY KEY,
  task_id          TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  event_id         TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  contact_id       TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  submission_id    TEXT REFERENCES submissions(id) ON DELETE CASCADE,
  due_at           TEXT,
  extended_due_at  TEXT,
  is_required      INTEGER NOT NULL DEFAULT 1,
  lock_on_complete INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'not_started', -- not_started|in_progress|complete|approved|rejected
  response         TEXT,                                 -- json for form tasks
  completed_at     TEXT,
  reminded_at      TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_task_assign_event ON task_assignments(event_id, contact_id, status);
CREATE INDEX IF NOT EXISTS idx_task_assign_task ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assign_submission ON task_assignments(submission_id);

-- ----------------------------------------------------------------- uploads --

CREATE TABLE IF NOT EXISTS uploads (
  id                 TEXT PRIMARY KEY,
  event_id           TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  task_assignment_id TEXT REFERENCES task_assignments(id) ON DELETE CASCADE,
  submission_id      TEXT REFERENCES submissions(id) ON DELETE SET NULL,
  contact_id         TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  kind               TEXT NOT NULL DEFAULT 'deliverable', -- deliverable | headshot | form_answer
  filename           TEXT NOT NULL,
  content_type       TEXT NOT NULL,
  size               INTEGER NOT NULL,
  storage_key        TEXT NOT NULL,
  version            INTEGER NOT NULL DEFAULT 1,
  is_public          INTEGER NOT NULL DEFAULT 0,
  uploaded_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uploads_event ON uploads(event_id);
CREATE INDEX IF NOT EXISTS idx_uploads_assignment ON uploads(task_assignment_id, version);
CREATE INDEX IF NOT EXISTS idx_uploads_submission ON uploads(submission_id);

CREATE TABLE IF NOT EXISTS file_comments (
  id             TEXT PRIMARY KEY,
  upload_id      TEXT NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_name    TEXT NOT NULL DEFAULT '',
  body           TEXT NOT NULL,
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_file_comments_upload ON file_comments(upload_id);

-- ------------------------------------------------------------------ portal --

CREATE TABLE IF NOT EXISTS portals (
  id                       TEXT PRIMARY KEY,
  event_id                 TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL,
  is_default               INTEGER NOT NULL DEFAULT 1,
  welcome_message          TEXT,
  accent_color             TEXT,
  logo_url                 TEXT,
  show_tasks_always        INTEGER NOT NULL DEFAULT 1,
  show_sessions            INTEGER NOT NULL DEFAULT 1,
  allow_manage_profile     INTEGER NOT NULL DEFAULT 1,
  allow_manage_participants INTEGER NOT NULL DEFAULT 1,
  send_weekly_digest       INTEGER NOT NULL DEFAULT 0,
  final_deadline_days      INTEGER,
  heading_invited          TEXT NOT NULL DEFAULT 'Invited Sessions',
  heading_submissions      TEXT NOT NULL DEFAULT 'My Submissions',
  heading_confirmed        TEXT NOT NULL DEFAULT 'Confirmed Participation',
  filter                   TEXT NOT NULL DEFAULT '{}',
  created_at               TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_portals_event ON portals(event_id);

-- -------------------------------------------------------------------- mail --

CREATE TABLE IF NOT EXISTS email_templates (
  id         TEXT PRIMARY KEY,
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  name       TEXT NOT NULL,
  subject    TEXT NOT NULL,
  body_html  TEXT NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (event_id, key)
);

CREATE TABLE IF NOT EXISTS email_messages (
  id            TEXT PRIMARY KEY,
  event_id      TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  to_email      TEXT NOT NULL,
  to_name       TEXT,
  to_contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  subject       TEXT NOT NULL,
  body_html     TEXT NOT NULL,
  body_text     TEXT,
  template_key  TEXT,
  kind          TEXT NOT NULL DEFAULT 'auto',  -- auto | manual
  status        TEXT NOT NULL DEFAULT 'queued',-- queued | sent | failed
  provider_id   TEXT,
  error         TEXT,
  attachments   TEXT NOT NULL DEFAULT '[]',
  sent_at       TEXT,
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_emails_event ON email_messages(event_id, created_at);
CREATE INDEX IF NOT EXISTS idx_emails_contact ON email_messages(to_contact_id);

-- ------------------------------------------------------------------ embeds --

CREATE TABLE IF NOT EXISTS embeds (
  id         TEXT PRIMARY KEY,
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL,   -- sessions|speakers|agenda|itinerary|gallery
  format     TEXT NOT NULL,   -- styled_html|html|json|xml|ical
  config     TEXT NOT NULL DEFAULT '{}',
  token      TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_embeds_event ON embeds(event_id);

-- ------------------------------------------------------------------ audit ---

CREATE TABLE IF NOT EXISTS audit_entries (
  id             TEXT PRIMARY KEY,
  event_id       TEXT REFERENCES events(id) ON DELETE CASCADE,
  entity_type    TEXT NOT NULL,
  entity_id      TEXT NOT NULL,
  actor_user_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_name     TEXT NOT NULL DEFAULT 'System',
  action         TEXT NOT NULL,
  summary        TEXT,
  before         TEXT,
  after          TEXT,
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_entries(entity_type, entity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_entries(event_id, created_at);

CREATE TABLE IF NOT EXISTS agenda_publications (
  id            TEXT PRIMARY KEY,
  event_id      TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  summary       TEXT NOT NULL DEFAULT '[]',
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_publications_event ON agenda_publications(event_id, created_at);

CREATE TABLE IF NOT EXISTS saved_views (
  id         TEXT PRIMARY KEY,
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  surface    TEXT NOT NULL DEFAULT 'submissions',
  name       TEXT NOT NULL,
  config     TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_saved_views_event ON saved_views(event_id, surface);

CREATE TABLE IF NOT EXISTS api_tokens (
  id           TEXT PRIMARY KEY,
  event_id     TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  token        TEXT NOT NULL UNIQUE,
  created_at   TEXT NOT NULL,
  last_used_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_api_tokens_event ON api_tokens(event_id);

-- --------------------------------------------------------------------- crm --

CREATE TABLE IF NOT EXISTS pipeline_entries (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  stage      TEXT NOT NULL DEFAULT 'researching',
  score      INTEGER,
  rationale  TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (org_id, contact_id)
);
CREATE INDEX IF NOT EXISTS idx_pipeline_org ON pipeline_entries(org_id, stage);

CREATE TABLE IF NOT EXISTS pipeline_events (
  id         TEXT PRIMARY KEY,
  entry_id   TEXT NOT NULL REFERENCES pipeline_entries(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL DEFAULT 'stage_change',  -- stage_change | note
  from_stage TEXT,
  to_stage   TEXT,
  body       TEXT,
  actor_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pipeline_events_entry ON pipeline_events(entry_id, created_at);

CREATE TABLE IF NOT EXISTS segments (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'dynamic',  -- dynamic | curated
  config     TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_segments_org ON segments(org_id);
