# Conferencer — Product Requirements

**An open-source replacement for Sessionboard's Program module.**

Version 1.0 · Written 2026-08-10 · Target ship: 2026-08-12 22:00 PT

---

## 0. How to read this document

This is the build spec for a coding agent. It is decision-complete: where the source
material was ambiguous, this document makes the call and states it. Do not re-open
settled decisions; if you disagree with one, note it and build it as written.

Requirement IDs are `R-<MODULE>-<n>`. Every requirement carries a priority:

| Priority | Meaning |
| --- | --- |
| **P0** | Ship or the submission fails. Non-negotiable. |
| **P1** | Ship unless out of time. Each P0 across all modules comes first. |
| **P2** | Differentiator. Build only after every P0 and P1 is green. |

Appendix A maps every requirement to the organizer's published LLM-judge rubric so you
can self-check. **The rubric is a floor, not the spec** — it is the minimum set of
things that must pass. Build the product this document describes; the rubric items
should then fall out for free.

---

## 1. Context

### 1.1 What we are replacing

Sessionboard (~$40k/yr) is an event-management suite: Program, CRM, Marketing, CMS,
Studio. The buyer runs a conference and uses **only the Program side**: collect speaker
submissions, review them, decide, onboard accepted speakers, and publish a schedule.

The buyer's own words: *"we're probably only going to use the program side... not really
using the marketing side, not really using the CRM side."* And: *"this is so slow"* —
performance is a named complaint about the incumbent, repeated three times in the
walkthrough.

### 1.2 The core lifecycle

Everything in this product serves one loop:

```
  build CFP form ──▶ speakers submit ──▶ committee reviews ──▶ organizer decides
        ▲                                                            │
        │                                                            ▼
   public site ◀── build agenda ◀── speakers onboard (tasks) ◀── notify speakers
```

Anything that does not sit on that loop is out of scope for v1.

### 1.3 Scope decisions

**In scope**

1. Custom call-for-speakers submission forms with conditional logic and track routing
2. Self-service speaker portal (bio, headshot, slides, supporting documents, tasks)
3. Automated, templated speaker communications, incl. reminders and calendar invites
4. Submission evaluation and scoring workflows across multiple rounds
5. Drag-and-drop agenda building with conflict detection; list/day/week/track/room views
6. Real-time dashboard of speakers with outstanding onboarding tasks
7. Public, embeddable session list, speaker list, agenda, itinerary, speaker gallery

**Explicitly out of scope** (struck from the brief by the buyer)

- Accelevents or any registration-platform integration — *"skip accelevents its fine"*
- Payments, invoices, promo codes — *"we don't really care about payments"*
- Marketing module, Studio, content remix, live transcription, SMS
- Sponsor/exhibitor intake and group portals
- Multi-language. English only — *"we only care about English"*
- Awards programs
- 2FA, SSO, custom email domains

**Extra credit, build last**

- Speaker CRM: org-level cross-event contact database with a sourcing pipeline
- Wiki/resource pages in the portal
- AI-assisted agenda auto-packing and AI first-pass review scoring

### 1.4 A note on scope vs. time

This is a large product for the time available. Section 12 gives a build order with an
explicit cut line. Follow it. A complete, fast, working narrow product beats a broad
half-built one — the buyer said the eval is *"I will put it in front of them and they
will actually use it."* Ship the loop end-to-end before you ship depth anywhere.

---

## 2. Evaluation reality — constraints that change the design

The submission will be driven by an automated browser agent before any human sees it.
Several ordinary design choices will silently destroy the score. Treat this section as
hard requirements.

**R-EVAL-1 (P0) — Password authentication for every role.**
Organizer, speaker, and reviewer accounts must all support email+password signup and
sign-in. The evaluating agent has no inbox and cannot complete a magic-link or OAuth
flow. Magic links may exist as a *secondary* convenience; they must never be the only
way in. Every role must be provisionable to a working password without leaving the app.

**R-EVAL-2 (P0) — Public surfaces render with no session.**
The CFP form, session list, speaker list, agenda, itinerary, and speaker gallery must be
fully readable logged-out. No interstitial, no "sign in to view", no client-side auth
gate that flashes. The CFP form must be *fillable* to at least the point of showing its
track/format/conditional behaviour before an account is required.

**R-EVAL-3 (P0) — Seeded, non-empty demo state.**
A fresh deploy must already contain a populated event so every screen reads as a working
product, not an empty shell. Use the fixture data in §11 verbatim. Empty states are
judged as missing features.

**R-EVAL-4 (P0) — Server-rendered, fast, no spinner walls.**
Target < 200 ms server response and < 1 s to interactive on every list view. The buyer
named slowness as a reason to leave the incumbent, and the rubric grades polish. Do not
build a client-side SPA that fetches after mount.

**R-EVAL-5 (P0) — Deterministic, guessable navigation.**
The agent finds features by trying obvious routes and link text. Use conventional
labels: `Dashboard`, `Submissions`, `Forms`, `Reviews`/`Evaluations`, `Speakers`,
`Agenda`, `Tasks`, `Settings`, `Sign in`, `Sign up`. Expose `/admin`, `/portal`,
`/review` as working entry points.

**R-EVAL-6 (P1) — In-app email outbox.**
Every email the system sends must also be recorded in a browsable in-app log showing
recipient, subject, body, and timestamp, at `/admin/emails`. Real delivery cannot be
observed by the agent; the log is how email work gets credited. It is also genuinely
useful to the buyer.

---

## 3. Personas and roles

| Role | Scope | Enters via |
| --- | --- | --- |
| **Organizer / Admin** | Full access to one or more events | `/admin` |
| **Reviewer** | Only their assigned submissions, in their assigned rounds | `/review` |
| **Speaker / Participant** | Only their own submissions, profile, and tasks | `/portal` |
| **Public visitor** | Published content only, no account | `/` and `/e/:slug/*` |

**R-ROLE-1 (P0)** A reviewer signed in must see no organizer navigation and no organizer
capability. A speaker likewise. Enforce on the server, not by hiding links.

**R-ROLE-2 (P0)** Direct-URL access to another role's resource, or to a resource
belonging to another user, returns 403 or 404 — never the content. The evaluator
explicitly tries identifier-swapping.

**R-ROLE-3 (P1)** One person may hold several roles. A user who is both organizer and
reviewer can review; a role switcher in the account menu moves between surfaces. The
walkthrough shows a "Back to Admin Mode" item in the portal — reproduce that.

**R-ROLE-4 (P1)** Participant roles on a submission are: `submitter`, `speaker`,
`moderator`, `chairperson`. One person may hold several roles on one submission and
confirms each separately. Only organizers may assign moderator and chairperson.

---

## 4. Domain model

Use a relational store. Field names below are normative; deviate only with reason.

### 4.1 Core entities

**Organization** — `id, name, slug, created_at`
Exists so the extra-credit Speaker CRM has a home and so contacts survive across events.
A single default org is fine for v1.

**Event** — `id, org_id, name, slug, type, website_url, location, timezone, starts_at,
ends_at, theme, logo_url, accent_color, status, created_at`
`slug` is the public URL key. All program data hangs off an event.

**User** — `id, email (unique), password_hash, first_name, last_name, created_at`
One account, many memberships.

**EventMembership** — `id, event_id, user_id, role (organizer|reviewer|participant),
created_at`
A user's role is per-event.

**Contact** — `id, org_id, user_id (nullable), first_name, last_name, email, headshot_url,
biography, job_title, company, pronouns, phone, linkedin_url, twitter_url, facebook_url,
website_url, dietary, tshirt_size, custom (json), created_at`
The person record. Org-scoped so a returning speaker keeps their profile across events.
`user_id` links a contact to a login once they claim their portal.

**EventContact** — `id, event_id, contact_id, status (invited|active|declined),
speaker_status (prospect|invited|confirmed|declined|cancelled), created_at`
Per-event roster row. `speaker_status` is the filterable workflow status.

**Submission** — the central record.
`id, event_id, form_id, kind (abstract|session), status, title, description,
track_id, format_id, level, language, location_id, starts_at, ends_at, capacity,
submitter_contact_id, answers (json), is_draft, withdrawn_at, withdraw_reason,
approval_status (draft|in_review|approved), created_at, updated_at`

- `kind` distinguishes an *abstract* (proposal under consideration) from a *session*
  (a confirmed programme item, e.g. a sponsor slot entered directly). They share one
  table, one detail view, and one status pipeline. Do not build two systems.
- `answers` holds responses to custom form fields, keyed by field id.
- `approval_status` gates public visibility independently of accept/decline.

**SubmissionParticipant** — `id, submission_id, contact_id, role, acceptance_status
(pending|accepted|declined), sort_order`

**Field** — `id, event_id, scope (session|contact), key, label, type, options (json),
max_length, is_standard, created_at`
The reusable field library. `type` ∈ `text | textarea | wysiwyg | dropdown |
multiselect | checkbox | number | date | datetime | email | phone | url | file |
currency`.
Standard session fields: Title, Description, Format, Track, Tags, Level, Language,
Location, Starts At, Ends At, Capacity, Client Session ID.
Standard contact fields: First Name, Last Name, Email, Biography, Headshot, Job Title,
Company, Pronouns, Mobile Phone, LinkedIn URL, X URL, Website.

**Track**, **Format**, **Tag**, **Room** — `id, event_id, name, color, sort_order`
Simple lookup tables, editable by the organizer.

**SubmissionForm** — `id, event_id, name (internal), title (public), page_heading,
welcome_message, collects (abstracts|sessions), collect_participants (bool),
opens_at, closes_at, submission_limit, allow_drafts, allow_multiple_drafts,
success_message, auto_redirect_to_portal, send_confirmation_email,
confirmation_email_body, notify_admin_user_ids (json), status (open|closed),
created_at`

**FormSection** — `id, form_id, kind (welcome|submission|participant|review),
title, heading, description, sort_order`

**FormQuestion** — `id, form_id, section_id, field_id, label_override, help_text,
is_required, is_locked, sort_order, condition (json|null)`
`condition` = `{ "question_id": "...", "operator": "equals|not_equals|in",
"value": "..." }`. A question with a condition renders only when it evaluates true.

**ParticipantRoleConfig** — `id, form_id, role, enabled, min_count, max_count`
Per-form limits on how many speakers/moderators a submitter may add.

**EvaluationPlan** — `id, event_id, name, instructions, is_open, opens_at, closes_at,
scoring_method (percentage|points), mode (funnel|parallel), anonymize, show_other_scores,
allow_abstain, require_abstain_reason, created_at`

**EvaluationRound** — `id, plan_id, name, sort_order, opens_at, closes_at, anonymize,
instructions`

**ScorecardQuestion** — `id, round_id, type (scale_1_3|scale_1_5|scale_1_10|numeric|
dropdown|free_text|file|separator), label, options (json), weight, min, max,
is_required, sort_order`

**EvaluationAssignment** — `id, round_id, submission_id, reviewer_user_id, status
(pending|in_progress|complete|abstained), abstain_reason, created_at`

**Review** — `id, assignment_id, answers (json), score, comment, submitted_at,
updated_at`
`score` is the normalized numeric result used for aggregation and sorting.

**Task** — `id, event_id, name, description, description_field_id, type
(action|file_request|form), target (contact|submission), link_url, link_field_id,
form_id, created_at`

**TaskAssignment** — `id, task_id, event_id, contact_id, submission_id, due_at,
extended_due_at, is_required, lock_on_complete, status (not_started|in_progress|
complete|approved|rejected), completed_at, created_at`

**Upload** — `id, event_id, task_assignment_id, submission_id, contact_id, filename,
content_type, size, storage_key, version, uploaded_by_user_id, created_at`
Re-upload against the same assignment increments `version`; the highest version is
"latest" and prior versions stay retrievable.

**FileComment** — `id, upload_id, author_user_id, body, created_at`

**Portal** — `id, event_id, name, is_default, welcome_message, accent_color, logo_url,
show_tasks_always, show_sessions, allow_manage_profile, allow_manage_participants,
send_weekly_digest, final_deadline_days, filter (json), created_at`

**EmailTemplate** — `id, event_id, key, subject, body_html, is_enabled`
Seeded keys: `submission_confirmation`, `submission_admin_alert`, `decision_accepted`,
`decision_declined`, `portal_invite`, `task_assigned`, `task_reminder`,
`draft_deadline_reminder`, `evaluation_invite`, `evaluation_reminder`,
`speaker_announcement`.

**EmailMessage** — `id, event_id, to_email, to_contact_id, subject, body_html,
template_key, status (queued|sent|failed), provider_id, error, sent_at, created_at`
The outbox that backs R-EVAL-6.

**Embed** — `id, event_id, type (sessions|speakers|agenda|itinerary|gallery), format
(styled_html|html|json|xml|ical), config (json), token, created_at`

**AuditEntry** — `id, event_id, entity_type, entity_id, actor_user_id, action, before
(json), after (json), created_at`
Backs change history and restore.

### 4.2 Submission status pipeline

Seven statuses, matching the incumbent so the buyer's team recognises them:

| Status | Meaning | Speaker sees |
| --- | --- | --- |
| `draft` | Started, not submitted | Draft |
| `pending` | Submitted, awaiting review | Pending |
| `accept_queue` | Leaning accept, not final | Pending |
| `decline_queue` | Leaning decline, not final | Pending |
| `accepted` | Approved, appears on agenda | Accepted |
| `declined` | Rejected | Declined |
| `withdrawn` | Pulled by the submitter | Withdrawn |

**R-DATA-1 (P0)** Queue statuses are internal. A speaker must never see `accept_queue`
or `decline_queue` — both surface as "Pending".

**R-DATA-2 (P0)** Only `accepted` submissions are eligible for the agenda and for public
output. Approval status (§8) gates public output further.

---

## 5. Module F1 — Event setup and configuration

**R-SET-1 (P0)** Organizer can create an event and edit: name, slug, type, website URL,
location, timezone, start/end datetime, theme/description. Slug drives the public URL
and must be unique and URL-safe.

**R-SET-2 (P0)** Organizer can manage **Tracks**, **Formats**, and **Rooms** as lists
with name, colour, and order. A track or room added here is immediately selectable in
the form builder and the agenda builder with no reload or republish.

**R-SET-3 (P1)** Organizer can manage **Tags** and **Levels** the same way.

**R-SET-4 (P1)** A **Fields** library page lists standard and custom fields, and lets
the organizer create a custom field of any supported type with options and a character
limit. Custom fields become available to every form builder and every list view.

**R-SET-5 (P1)** A **Record Settings** page controls participant acceptance:
enable/disable acceptance, allow submission withdrawal, and reword the two portal status
labels.

**R-SET-6 (P2)** Event settings landing page grouping the above into Event Setup /
Library / Communications / Configuration, mirroring the incumbent's information
architecture.

**Layout.** Left sidebar with: Dashboard · Program (Overview, Submissions: View All /
Abstracts / Sessions / Files; Collect & Review: Forms / Evaluation / Agenda / Site;
Portals: Portals / Tasks / Forms / File Requests / Resources; Configure: Settings) ·
Speakers · Reports · Event Team · Settings. Header carries a global search box, a
**View Portal** button, and the account menu.

---

## 6. Module F2 — Submission forms (call for speakers)

This is the heart of the product. The buyer: *"you have a form builder, so that's what
you're being asked to build here. This is just a very fancy form builder."*

### 6.1 The builder

**R-FORM-1 (P0)** Organizer can create, duplicate, edit, and delete submission forms.
The forms index lists each form with its public/internal name, open/closed state, what
it collects, submission count, draft count, and close date. Tabs: All / Open / Closed.

**R-FORM-2 (P0)** The builder is a seven-step wizard with a persistent step sidebar and
Back / Next / Save controls. Steps, in order:

1. **Submission Setup** — collect Abstracts or Sessions; toggle collecting participants
2. **Welcome Screen** — internal name, public title, page heading, rich-text welcome
   message with a show/hide toggle
3. **Abstract Information** — section title, heading, rich-text instructions, and the
   question list for the submission itself
4. **Participant Information** — same, for the people; plus participant role config
5. **Payments & Fees** — render the step, state that payments are out of scope, move on
6. **Form Settings** — close date, submission limits, drafts, success page, validation
7. **Notifications** — admin alerts and the submitter confirmation email

Step 5 exists only so the wizard matches the buyer's mental model. Do not build payments.

**R-FORM-3 (P0)** In steps 3 and 4, the organizer can add a question from the field
library or create a new field inline. Each question row shows its label, field type,
character limit, a Required toggle, a Locked badge for system-required fields, a drag
handle for reordering, and an overflow menu (edit, duplicate, remove).

**R-FORM-4 (P0)** Question types available: short text, long text, rich text, dropdown,
multi-select, checkbox, number, date, datetime, email, phone, URL, file upload.
Minimum for a passing build: short text, long text, and dropdown with editable options.

**R-FORM-5 (P0)** Locked questions cannot be removed or made optional. Locked set:
submission Title; participant First Name, Last Name, Email.

**R-FORM-6 (P0) — Conditional logic.** Any question can be given a show-when rule
referencing an earlier question's answer. On the public form, the dependent question
appears and disappears as the controlling answer changes, **without a page reload**, in
both directions. Hidden questions are not validated and are not stored.

**R-FORM-7 (P1) — Track routing.** A form may be configured so that the selected track
determines which reviewers or evaluation round the submission is assigned to on arrival.
The buyer confirmed a single form with multiple track options is the expected shape.

**R-FORM-8 (P0)** Participant role config: which roles a submitter may add, with
optional min and max per role and an overall cap. Enforce on submit with a clear error.
Default: Speaker, min 1, max 5.

**R-FORM-9 (P0) — Form settings.** Close date/time (the buyer marked this *"kinda
impt"*), per-user submission limit, allow drafts, allow multiple drafts, success page
message (rich text), and auto-redirect to the speaker portal after N seconds. The buyer
marked the success page *"make sure this works"* — it is graded.

**R-FORM-10 (P1)** Cross-field character limits: a rule capping the combined length of
several text fields, with a live combined counter on the public form.

**R-FORM-11 (P0)** Notifications step: choose which admins are emailed on new submission
and on revised submission; toggle and customise the submitter confirmation email. The
confirmation email is marked **must have** by the buyer; the admin alerts are
*"nice to have"*.

**R-FORM-12 (P0)** Header actions on the builder: **View Form** (opens the public form),
**Copy Link**, **Save**.

### 6.2 The public form

**R-PUB-1 (P0)** Each form has a public URL: `/e/:eventSlug/submit/:formId`. It loads
with no session and shows event branding, event name, the close date, and the submission
limit.

**R-PUB-2 (P0)** The public form is a five-step wizard with a visible progress
indicator: **Welcome → Account → Submission → Participant → Review**. The Review step
shows every answer before submit.

**R-PUB-3 (P0)** Account step: create an account with email + password, or sign in.
Signup must never require email confirmation to proceed.

**R-PUB-4 (P0)** Required-field validation blocks advancing past a step and shows a
visible, field-adjacent error message.

**R-PUB-5 (P0)** After a closed date passes, the public URL renders a closed state with
no way to start or submit. Existing drafts are no longer submittable.

**R-PUB-6 (P1)** Save as draft: a submitter can save with as little as a title, leave,
return, and resume with their answers pre-filled. Show a visible draft indicator.

**R-PUB-7 (P0)** On submit: persist the submission, show the configured success message,
send the confirmation email, log it to the outbox, and (if enabled) redirect to the
portal after 10 seconds with a manual "Continue to portal" link always present.

**R-PUB-8 (P0)** A submitter can edit a submitted proposal while the form is open. Edits
are visible to the organizer immediately.

**R-PUB-9 (P1)** Once the form is closed, submissions become read-only in the portal:
the edit control disappears or the form renders disabled, and any save attempt is
rejected server-side.

**R-PUB-10 (P1)** Enforce the per-user submission limit, counting drafts and submitted
proposals together, with a clear message at the cap.

---

## 7. Module F3 — Submissions, review, and decisions

### 7.1 Submissions management

**R-SUB-1 (P0)** A submissions list at `/admin/e/:slug/submissions` with status-count
tabs: All · Accepted · Accept Queue · Pending · Decline Queue · Declined · Withdrawn ·
Drafts. Separate **Abstracts** and **Sessions** views filter the same list by `kind`.

**R-SUB-2 (P0)** The list is a table with: selection checkbox, quick-edit pencil, Status,
Source form, Title, Description, Speakers, Track, Tags, Format, Files, Rating, Notified.
Support keyword search across title, description, and speaker name.

**R-SUB-3 (P0)** Status is editable inline from the row — click the status chip, pick a
new status, save. Also support multi-select and bulk status change.

**R-SUB-4 (P1)** A **Columns** panel lets the organizer choose, order, and hide columns,
drawn from the full field library. A **Saved Views** control persists a named
column+filter+sort combination.

**R-SUB-5 (P1)** A **Filter** panel filters on any dropdown-type field (status, track,
format, tags, level, language, submitter). A **Sort** control sorts on any column,
including average review score.

**R-SUB-6 (P0)** A submission detail view shows every answer, the participant list with
roles, attached files, review results, and an activity/history trail. Two tabs: Details
and Participants.

**R-SUB-7 (P0)** Organizer can create a submission manually (**Add Abstract** /
**Add Session**) for sponsor slots and keynotes that never go through the CFP.

**R-SUB-8 (P1)** Organizer can edit any submission field, including title and abstract,
from the admin view. Edits are written to the audit trail with actor and timestamp.

**R-SUB-9 (P1)** CSV export of the current filtered view with the current columns.

**R-SUB-10 (P2)** Change history on a submission shows each edit with editor and
timestamp, and a prior version can be restored.

### 7.2 Evaluation

The buyer's minimum: *"go from unreviewed → approve/maybe/deny"*. The rubric asks for
considerably more. Build the minimum first, then the depth.

**R-EVL-1 (P0)** Organizer can create an **Evaluation Plan** with a name, rich-text
instructions, an open/close window, and an open/closed toggle.

**R-EVL-2 (P0)** Organizer can add reviewers to a plan by searching existing event users
or inviting a new one by email. Invitation must yield usable password credentials
without an inbox — show a copyable invite link that lands on a set-password page.

**R-EVL-3 (P0)** Organizer can assign specific submissions to a specific reviewer. The
reviewer's queue then contains **exactly** the assigned set and nothing else, enforced
server-side.

**R-EVL-4 (P0)** Each plan has at least one **round** with its own scorecard. A
scorecard question may be: 1–3 scale, 1–5 scale, 1–10 scale, numeric with min/max,
dropdown with per-option point values, free text, file upload, or a section separator.
All types must render on the reviewer side and persist their values.

**R-EVL-5 (P1)** A plan supports **two or more independent rounds**, each with its own
name, window, scorecard, anonymization setting, and reviewer pool. A reviewer scoped to
round 1 is not automatically in round 2.

**R-EVL-6 (P1) — Round mode.** `funnel` (submissions must be promoted between rounds)
or `parallel` (all rounds review everything). Provide Promote / Demote bulk actions on
the plan's Rounds tab.

**R-EVL-7 (P1) — Anonymized review.** With anonymization on for a round, the reviewer
view hides submitter and participant identity while the organizer view of the same
submission still shows it.

**R-EVL-8 (P1) — Assignment at scale.** At least one of: auto-distribute N reviewers per
submission, cap max submissions per reviewer, or bulk-assign by track filter. Show a
live impact preview (submissions × reviewers → new assignments) before applying.

**R-EVL-9 (P1) — Progress dashboard.** Per-reviewer and per-submission completion
counts and percentages, reflecting live state. Summary metrics: total evaluations,
evaluated submissions, plans, reviewers.

**R-EVL-10 (P1) — Aggregate results.** A results table with one row per submission
showing average score, review count, and each reviewer's score, sortable by average
score. Highest/lowest scoring and a top-10 list are welcome additions.

**R-EVL-11 (P1)** Export evaluation results as CSV, in two shapes: individual grades
(one row per reviewer per submission) and cumulative grades (one row per submission).

**R-EVL-12 (P1)** Bulk reminder: select reviewers with outstanding reviews and send them
a reminder email in one action, with a send confirmation.

**R-EVL-13 (P2)** Weighted criteria: each scorecard question carries a weight, and the
aggregate reflects the weighting.

**R-EVL-14 (P2)** Abstain / conflict of interest: a reviewer can mark an assignment
abstained, optionally with a required reason (free text or from a defined list). It
leaves their pending count and is flagged to the organizer.

**R-EVL-15 (P2)** AI first-pass scoring: an AI evaluator produces a numeric score and
written reasoning for a submission; a human override persists and is visually
distinguishable from the AI score. The buyer said *"I don't care about the AI workflow
thing"* — this is genuinely last.

### 7.3 The reviewer surface

**R-REV-1 (P0)** `/review` shows the reviewer's plans as cards with plan name, status,
round count, overall progress, and per-round assignment counts and deadlines.

**R-REV-2 (P0)** A round view lists assigned submissions as cards with title, truncated
description, and a Pending Review / Reviewed badge. A sidebar offers Quick Jump
(Pending / Reviewed counts) and filters on track, format, level, and language, plus
keyword search.

**R-REV-3 (P0)** The review view is two-panel: submission details on the left (only the
fields the organizer made visible for that round), scorecard on the right. Required
questions marked with an asterisk. **Save Review**, plus a "go to next submission after
saving" checkbox. An unsaved-changes warning.

**R-REV-4 (P0)** A saved review persists, flips the card to Reviewed, and is immediately
visible to the organizer on the submission detail with the reviewer's name, score, and
comment.

**R-REV-5 (P1)** A reviewer may change a review while the round is open, and cannot once
it closes.

**R-REV-6 (P1)** Reviewer View Configuration on the round: which submission fields are
visible, which are filterable, up to three fields on the submission card, and which
participant fields are visible.

### 7.4 Decisions and hand-off

**R-DEC-1 (P0)** Organizer can set any submission to Accepted or Declined, individually
or in bulk, and the list shows the distinct statuses.

**R-DEC-2 (P0)** Decision status propagates to the speaker's portal immediately.

**R-DEC-3 (P0) — Notify.** A **Send Decisions** action selects a recipient set
(all accepted, all declined, or a manual selection), opens a compose step pre-filled
from the `decision_accepted` / `decision_declined` template, supports merge fields
(`{speaker_name}`, `{talk_title}`, `{event_name}`, `{track}`), offers a preview, and on
send reports a count and marks each submission Notified. Every message lands in the
outbox.

**R-DEC-4 (P1)** The compose step accepts a free-text note that is appended to the body,
so the organizer can attach reviewer feedback or a request for changes when declining.
The buyer named this as the bonus on top of the minimum review workflow.

**R-DEC-5 (P0) — Hand-off.** Accepting a submission makes it available on the agenda
with title, speakers, track, and format carried across, with **no re-entry**. If an
explicit "add to agenda" action is used, it must copy all metadata automatically.

**R-DEC-6 (P0)** Accepting a submission also: creates or activates the speaker's
EventContact rows for every participant, grants portal access, and assigns the event's
default onboarding tasks. The buyer confirmed this should be automatic.

---

## 8. Module F4 — Speakers, portal, and tasks

### 8.1 Speaker roster

**R-SPK-1 (P0)** A **Speakers** list showing every event participant with headshot,
name, job title, company, email, speaker status, session count, and task completion.
Keyword search and filters on status, track, and task completion.

**R-SPK-2 (P0)** Organizer can add a speaker manually with full profile fields, and edit
any speaker's profile — including bio text and headshot — from the admin side, with
changes persisting.

**R-SPK-3 (P0)** Each speaker's record shows their sessions and their assigned tasks with
status.

**R-SPK-4 (P1) — CSV import.** Upload a CSV of speakers, map columns to fields, preview,
and import. Report created/updated/skipped counts. Accept the fixture
`speakers.csv` shape at minimum.

**R-SPK-5 (P1)** Speaker workflow status (`prospect | invited | confirmed | declined |
cancelled`) is editable, persists, and is filterable.

**R-SPK-6 (P1)** Custom logistics fields on a speaker record — dietary requirements,
t-shirt size, travel preferences — that persist and appear in list views.

**R-SPK-7 (P1) — Bulk email.** Select or filter a speaker group and send a templated
bulk email with merge-field personalization and a preview. Every send is logged to the
outbox and to a communications history on the speaker record.

### 8.2 The speaker portal

**R-POR-1 (P0)** `/portal` with four tabs: **Home**, **Submissions**, **Profile**,
**Tasks**. Home shows My Submissions (title, format, status), My Profile summary, and
the task list.

**R-POR-2 (P0)** Scoping: a speaker sees only their own submissions, their own profile,
and their own tasks. Server-enforced.

**R-POR-3 (P0)** Profile editing: biography (rich text, 5,000 char limit with a live
counter), salutation, first/last name, honorific, pronouns, gender, job title, company,
and a **My Links** panel for LinkedIn, X, Facebook, and website. Headshot upload with a
preview. The buyer annotated this *"update your own bio data"*.

**R-POR-4 (P0)** Changes made in the portal appear on the organizer's record
immediately, and vice versa.

**R-POR-5 (P0)** Submissions tab lists the speaker's submissions with status and, while
the form is open, an edit affordance that reopens the submission form pre-filled.

**R-POR-6 (P0)** Tasks tab lists assigned tasks grouped into **Submission Tasks** and
**My Tasks**, each showing name, description, due date, required flag, and status.
Completing a task persists and updates the organizer's dashboard.

**R-POR-7 (P1) — Participant acceptance.** For each accepted submission the speaker
holds a role on, a **Confirm** control opens a dialog to accept or decline that role.
If withdrawal is enabled, a **Withdraw** action removes the submission with a captured
reason, visible to the organizer with options to delete, decline, or undo.

**R-POR-8 (P1)** The portal groups sessions into **Invited Sessions**, **My
Submissions**, and **Confirmed Participation**, with organizer-renameable headings.

**R-POR-9 (P1)** Portal configuration: welcome message, accent colour, logo, which
contact and session fields are visible or editable, whether tasks always show or only
after acceptance, and whether the weekly digest is on.

**R-POR-10 (P2)** Multiple portals selected by filter, so accepted speakers, invited
speakers, and moderators can get different experiences.

### 8.3 Tasks and file requests

**R-TSK-1 (P0)** Organizer can create a task with a name, description, type
(**action** | **file request** | **form**), target (contact or submission), and an
optional link. Assign it to selected speakers or to all speakers on accepted sessions,
with a due date and a required flag.

**R-TSK-2 (P0)** A **file request** task lets the speaker upload a file from the portal.
The upload is recorded against the task and the submission, and the organizer can view
and download it with its metadata.

**R-TSK-3 (P0)** A **form** task renders an organizer-built form inside the portal and
stores the responses against the speaker. This is how the buyer's named examples work:
hotel stay requirements, flight reimbursement.

**R-TSK-4 (P1)** Re-uploading against the same file request creates a **new version**.
The latest is clearly marked; earlier versions remain downloadable.

**R-TSK-5 (P1)** Comments on an uploaded file, logged with author and timestamp, visible
to both the organizer and the speaker.

**R-TSK-6 (P1)** The upload control states accepted file types and the maximum size
before the speaker picks a file.

**R-TSK-7 (P1) — Deliverables dashboard.** A matrix of speakers × tasks showing status,
due date, and overdue flags, filterable by task, status, and track. This is the buyer's
requirement #6: *"real-time dashboard showing which speakers still have outstanding
onboarding tasks."* Treat it as a headline feature, not a report.

**R-TSK-8 (P1)** Bulk reminder: select speakers with outstanding tasks and send a
reminder email in one action, with a send confirmation.

**R-TSK-9 (P1)** A central **Files** library aggregating every upload across the event
with speaker, submission, task, version, and date, with search and filter.

**R-TSK-10 (P1)** Multi-select sessions or speakers and download a **ZIP** of the latest
file versions, with a grouping option (by session or by speaker).

**R-TSK-11 (P1) — Approval gate.** A submission carries an approval status
(`draft | in_review | approved`). Only `approved` content appears on public surfaces.
The organizer sets it from the submission detail and in bulk.

**Default task set** (seed these; the buyer named them):
Confirm participation · Upload headshot · Complete bio and profile · Upload final slides ·
Sign speaker release form · Hotel and travel reservations · Flight reimbursement form ·
Announce your participation · Invite colleagues with your speaker discount.

---

## 9. Module F5 — Agenda

**R-AGN-1 (P0)** An agenda builder at `/admin/e/:slug/agenda` with view tabs:
**List · Day · Week · Month · Rooms · Conflicts**. Day navigation moves between event
days. List, Day, Rooms, and Conflicts are required; Week and Month are P1.

**R-AGN-2 (P0)** An unscheduled-sessions tray shows accepted submissions with no time
slot. Dragging one onto a day/time/room cell schedules it. The placement persists across
a reload.

**R-AGN-3 (P0)** Click-to-assign must also work: opening a session lets the organizer
type or pick date, start time, end time, and room. Drag-and-drop alone is fragile under
an automated evaluator — provide both paths.

**R-AGN-4 (P0) — Speaker conflict detection.** Scheduling the same participant into two
time-overlapping sessions raises a visible warning on both sessions and lists the
conflict in the Conflicts view.

**R-AGN-5 (P0) — Room conflict detection.** Two sessions in the same room at overlapping
times are flagged or blocked, with a clear message.

**R-AGN-6 (P0)** Moving a session to a different slot or room takes effect immediately
and clears any conflict that no longer applies.

**R-AGN-7 (P0)** Rooms view puts rooms on one axis and time on the other, with a zoom
control to fit all rooms.

**R-AGN-8 (P0) — Publish.** A publish action makes the agenda live on the public
surfaces, reports success, and shows what changed since the last publish. Unpublished
edits are visible to organizers only.

**R-AGN-9 (P1)** Sessions in the agenda show track colour, format, room, time, and
speaker names. A conflicted session carries a red dot.

**R-AGN-10 (P2) — Auto-schedule assist.** One action packs all unscheduled sessions into
free, conflict-free slots respecting track and room capacity, presenting the result as a
reviewable draft the organizer commits or discards. Judged generously — any working
auto-placement counts.

---

## 10. Module F6 — Public site, embeds, and communications

### 10.1 Public surfaces

All five render approved, accepted, published content only, with no login, at
`/e/:eventSlug/…`. Each must be mobile-friendly.

**R-SITE-1 (P0) — Sessions list** `/e/:slug/sessions`
A card per session: title, truncated description with **Show more**, date and time,
room, speaker names with job title and company, and Format/Track tags. Keyword search
matching both session titles and speaker names, updating a visible result count.
A faceted filter on Track, and ideally Format and Location.

**R-SITE-2 (P0) — Speakers list** `/e/:slug/speakers`
A directory ordered alphabetically by surname with headshot, name, job title, and
company. Each entry drills into a detail view with bio and their sessions (title, date,
time, room). Search by speaker name.

**R-SITE-3 (P0) — Agenda** `/e/:slug/agenda`
A per-day schedule organized by time: a grid with room columns and a time gutter, or an
equivalent day/track/time layout, with blocks at the correct room and time showing at
least title and track. Day navigation switches days and re-renders. Clicking a block
opens a detail with full start–end range, room, description, format, and track, and a
back/close control that restores the agenda intact.

**R-SITE-4 (P0) — Schedule itinerary** `/e/:slug/itinerary`
Sessions listed chronologically inside day tabs, with cards showing track label, title,
description, full date and time, room, and the complete speaker list with titles and
companies.

**R-SITE-5 (P0) — Speaker gallery** `/e/:slug/gallery`
A visual photo grid of speaker cards (headshot, name, job title, company), alphabetized
by surname, with a search box. Degrade gracefully for a speaker with no photo or no
title. Clicking a card opens a detail modal with photo, name, job title, bio with
**Show more**, company, and a session list with title, date/time, and room; closing it
returns to the intact grid.

**R-SITE-6 (P0) — Consistency.** The same session shows an identical title, date/time,
room, and track on every surface and matches the organizer's record without a republish
step for content edits. Only agenda *scheduling* is gated behind publish.

**R-SITE-7 (P1) — Personal schedule.** An attendee can star sessions from the itinerary
and view a personal schedule containing exactly those sessions. It survives a full page
reload (localStorage is acceptable) and offers an add-to-calendar export.

### 10.2 Embeds

**R-EMB-1 (P1)** An organizer-side **Embeds** area generates, per widget type, a
copy-paste snippet and a shareable URL. Configuration covers output format
(styled HTML script tag · plain HTML · JSON · XML · iCal), branding colours, field
selection, and content filters (by track, format, or status).

**R-EMB-2 (P1)** The styled-HTML embed is a single `<script>` tag that renders the
widget into the host page. It must work cross-origin and must not require the host page
to load a framework.

**R-EMB-3 (P1)** JSON and iCal endpoints are public, cacheable, and stable:
`/e/:slug/embed/:token.json`, `.ics`. The iCal feed lists every approved accepted
session as an event.

**R-EMB-4 (P2)** Embed output is cached with a short TTL and a manual **Refresh cache**
action.

### 10.3 Communications

**R-COM-1 (P0)** Transactional email works for real. Use Resend or Cloudflare Email.
Every send also writes an `EmailMessage` row. If no provider key is configured, the
system still records the message and shows it in the outbox — the product must never
fail closed on missing credentials.

**R-COM-2 (P0)** Email templates are editable per event: subject and rich-text body,
with merge fields `{speaker_name}`, `{first_name}`, `{talk_title}`, `{event_name}`,
`{event_dates}`, `{track}`, `{portal_link}`, `{due_date}`. A preview renders the
template against a sample recipient.

**R-COM-3 (P0)** Automated sends, at minimum:

| Trigger | Template |
| --- | --- |
| Submission received | `submission_confirmation` → submitter |
| New submission | `submission_admin_alert` → selected admins |
| Decision recorded and dispatched | `decision_accepted` / `decision_declined` |
| Portal access granted | `portal_invite` |
| Task assigned | `task_assigned` |
| Evaluation plan opened | `evaluation_invite` → reviewers |

**R-COM-4 (P1)** Scheduled sends: draft-deadline reminders 5 days and 1 day before a
form closes; task reminders to speakers with incomplete tasks based on due dates; a
weekly portal digest. Implement with a scheduled worker (cron), not an in-request timer.

**R-COM-5 (P0) — Calendar invites.** This is the buyer's requirement #3 and it is easy
to under-build. When a session is scheduled and its speakers are confirmed, each speaker
receives a calendar invite for their own session:

- an `.ics` attachment on the notification email, with `METHOD:REQUEST`, the session
  title, description, start/end in the event timezone, location (room if assigned,
  otherwise the venue), and the organizer as ORGANIZER;
- "Add to Google Calendar" and "Add to Outlook" links in the email body;
- a per-speaker subscribable feed at `/portal/calendar/:token.ics` covering all their
  sessions, so a later room assignment propagates.

The buyer noted the first invite often has no room and the room is assigned later —
re-issuing an updated invite (same UID, incremented `SEQUENCE`) when time or room
changes is P1.

**R-COM-6 (P1)** A **Communications history** page lists every message sent for the
event with recipient, subject, template, status, and timestamp, filterable by recipient
and template, with a detail view of the rendered body.

**R-COM-7 (P1)** Ad-hoc compose: select speakers from any list view and send a one-off
email built on a template, with preview and merge fields.

---

## 11. Module F7 — Dashboard

The buyer's requirement #6. Build it as a real working screen, not a placeholder.

**R-DSH-1 (P0)** `/admin/e/:slug` opens on a dashboard with a date line, a days-to-event
countdown, and a greeting.

**R-DSH-2 (P0)** Headline counters: Submissions, Accepted Speakers, Sessions Scheduled,
Tasks Outstanding.

**R-DSH-3 (P0)** A **Submission Status** strip: Accepted · Pending · Declined · Drafts ·
Withdrawn, each a live count linking to that filtered list.

**R-DSH-4 (P0) — "Also check" nudges.** A row of actionable prompts computed from live
data, each linking to the screen that resolves it:

- "N accepted sessions still need a time slot on the agenda"
- "N session submissions are awaiting a decision"
- "N accepted speakers are missing a bio or headshot"
- "N speakers have overdue onboarding tasks"
- "N reviewers have not finished their assigned reviews"

**R-DSH-5 (P1)** Tabbed panels: **Submission Forms** (submission pacing over time),
**Participants** (participants by role, submission-status donut), **Evaluations**
(reviewer progress, average scores), **Agenda** (slots filled vs. empty by day).

**R-DSH-6 (P1)** A speaker-readiness table: one row per accepted speaker, one column per
onboarding task, showing complete / outstanding / overdue, filterable and exportable.

**R-DSH-7 (P2)** Multiple named dashboards with configurable widgets.

---

## 12. Module F8 — API (bonus)

The organizer awards bonus points for an API, referencing the incumbent's docs.

**R-API-1 (P1)** A read/write REST API under `/api/v1`, authenticated by a bearer token
issued from Settings → API Tokens, scoped to an event.

**R-API-2 (P1)** Resources, each with list/get and, where sensible, create/update/delete:
`events`, `submissions`, `sessions`, `contacts`, `participants`, `forms`, `tracks`,
`formats`, `rooms`, `tasks`, `task-assignments`, `evaluation-plans`, `reviews`,
`uploads`, `emails`.

**R-API-3 (P1)** List endpoints support `?limit`, `?cursor`, `?updated_since`, and
field filters. Responses are JSON with a consistent envelope and stable IDs.

**R-API-4 (P1)** Bulk endpoints for the operations that matter at scale: bulk contact
upsert, bulk submission status change, bulk task assignment.

**R-API-5 (P1)** Public read-only endpoints matching the embed feeds, requiring no token.

**R-API-6 (P2)** OpenAPI 3 document at `/api/v1/openapi.json` plus a rendered reference
page. Cheap to generate, and it is what the bonus is actually asking for.

**R-API-7 (P2)** Outbound webhooks on `submission.created`, `submission.status_changed`,
`task.completed`, `session.scheduled`.

---

## 13. Optional module F9 — Speaker CRM (extra credit)

Build only after everything above is green. The buyer said *"not really using the CRM
side"*, but the rubric carries it as a 10-point optional area.

**R-CRM-1** An org-level speaker directory outside any single event, listing contacts
across events in a searchable table.
**R-CRM-2** Multi-criteria filters on company, job title, and tags, clearable.
**R-CRM-3** Contact profiles with identity fields, persistent internal notes, and
cross-event history (linked events and sessions, plus an activity log).
**R-CRM-4** Organizer-defined custom fields and tags on a contact.
**R-CRM-5** Bulk CSV import into the directory.
**R-CRM-6** Duplicate detection (same name, different email) with a merge into a chosen
primary record.
**R-CRM-7** A kanban sourcing pipeline — Researching · Contacted · In discussion ·
Confirmed · Declined — with drag between stages that persists.
**R-CRM-8** Pipeline cards open to a detail with notes and a timestamped stage history.
**R-CRM-9** Save a filtered view as a named, reusable segment.
**R-CRM-10** Push a contact from the org database into a specific event, arriving in that
event's speakers module with profile data intact.
**R-CRM-11** Bulk email to selected contacts with merge-tag personalization and preview.
**R-CRM-12** A CRM overview page with org-wide metrics and at least one populated chart.

---

## 14. Non-functional requirements

**R-NFR-1 (P0) — Performance.** Server response under 200 ms p95 on list views with a
few hundred rows. Full page load under 1 s. Paginate at 25/50/100. Index every foreign
key and every column used in a filter tab count. This is a scored differentiator and the
buyer's stated reason for leaving the incumbent.

**R-NFR-2 (P0) — Deployment.** A single command deploys a working instance. Publish a
live URL. Cloudflare infrastructure earns a bonus.

**R-NFR-3 (P0) — Open source.** MIT or Apache-2.0, public repository, a README that
gets a reader from clone to running locally in under five minutes, with seed data.

**R-NFR-4 (P0) — Data safety.** Passwords hashed with bcrypt or argon2. Sessions in
signed, httpOnly cookies. Every list, detail, and mutation checks event membership and
row ownership server-side.

**R-NFR-5 (P1) — File storage.** Uploads to object storage (R2 or S3-compatible), with a
20 MB per-file limit, an accepted-type allowlist, and signed short-lived download URLs.

**R-NFR-6 (P1) — Accessibility.** Semantic HTML, labelled form controls, visible focus,
keyboard-operable navigation, and a colour-contrast-safe palette. Drag-and-drop must
have a keyboard/click equivalent (see R-AGN-3).

**R-NFR-7 (P1) — Airtable persistence (bonus).** Optional one-way sync that mirrors
submissions, speakers, and sessions into Airtable tables on write, and reads Airtable on
load so changes made there are picked up. The buyer confirmed read-only is enough and
that read/write comes nearly free. Make it opt-in by config; the product must run fully
without it.

**R-NFR-8 (P2) — Agentic interface.** An MCP server or chat surface over the API. The
buyer: *"admin ui first, agentic interface is bonus."*

### Recommended stack

Not mandatory, but chosen for the constraints (speed, Cloudflare bonus, two-day build,
agent-friendliness):

- **React Router v7** (framework mode, SSR) on **Cloudflare Workers**
- **D1** + **Drizzle ORM** for data; **R2** for uploads
- **Resend** for email; **Cloudflare Cron Triggers** for scheduled sends
- **Tailwind** + a small component set; no heavy client state library
- Server-rendered loaders and actions throughout; client JS only for the form builder,
  conditional-logic evaluation, agenda drag-and-drop, and embed widgets

If you prefer a different stack, keep the properties: server-rendered, fast, one-command
deploy, relational store, real file storage.

---

## 15. Seed data

**R-SEED-1 (P0)** `npm run seed` creates the demo event below and is run automatically on
first deploy. Use these exact values — they match the evaluation fixtures, so a fresh
deploy already contains everything the judge looks for.

**Event** — DevFlow Conf 2027 · "The developer workflow conference" ·
2027-05-12 to 2027-05-14 · Moscone West, San Francisco, CA · slug `devflow-conf-2027`

**Tracks** — AI Engineering · Platform & Infra · Developer Experience
**Formats** — Keynote (45 min) · Talk (30 min) · Lightning Talk (10 min) ·
Workshop (120 min) · Panel (45 min)
**Rooms** — Main Stage · Room 2A · Room 2B · Workshop Lab

**Accounts** (all with working passwords)

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Organizer | Minerva McGonagall | `sbek-organizer@example.com` | `SbekTest!2027-org` |
| Lead Speaker | Hermione Granger | `sbek-speaker@example.com` | `SbekTest!2027-spk` |
| Speaker | Harry Potter | `sbek-speaker2@example.com` | `SbekTest!2027-spk2` |
| Reviewer | Severus Snape | `sbek-reviewer@example.com` | `SbekTest!2027-rev` |

Hermione: Lead Speaker · Principal Engineer, Hogwarts Buildworks, `@hermionebuilds`, vegetarian, size M.
Harry: Speaker · Staff Developer Advocate, Order of the Phoenix Labs.

**A published CFP form** with the standard questions plus a required short-text
"Key takeaway" and a dropdown "Audience level" (Beginner / Intermediate / Advanced),
and a conditional long-text "Workshop prerequisites" shown only when format is
"Workshop (120 min)". Open now, closing 2027-04-30.

**Three submissions** — "Taming 40-Minute CI: Incremental Builds at Monorepo Scale"
(Platform & Infra, Talk, Intermediate), "Your AI Pair Programmer Is Lying to You:
Verification Patterns That Scale" (AI Engineering, Talk, Advanced), and "Docs That
Answer Back: Retrieval-Grounded Documentation Sites" (Developer Experience, Lightning
Talk, Beginner). Full abstracts are in `fixtures/sample-data.json`.

Seed a mix of statuses so every tab is populated, an evaluation plan with a scorecard
and one completed review (rating 4), the default task set assigned to accepted speakers
with a mix of complete and outstanding, and at least four scheduled sessions across two
days and three rooms so the agenda and every public widget render full.

**R-SEED-2 (P1)** `npm run seed:reset` wipes and reseeds. `npm run seed:big` adds 60
submissions and 40 speakers so performance claims are demonstrable.

---

## 16. Build order

The cut line is after Phase 4. Everything before it must be complete and working.

**Phase 0 — Foundation (2–3 h)**
Project skeleton, database schema and migrations, auth (signup, sign-in, sessions,
password hashing), role middleware, seed script, deployment pipeline with a live URL.
*Exit: all four seeded accounts can sign in and land on the right surface.*

**Phase 1 — The spine (6–8 h)**
Event settings with tracks/formats/rooms. Form builder with the seven-step wizard,
question types, required flags, and conditional logic. Public five-step submission
wizard with validation, account creation, confirmation, and success page. Submissions
list with status tabs and inline status change. Submission detail.
*Exit: a stranger can submit a talk and an organizer sees it with every field intact.*

**Phase 2 — Review and decide (5–6 h)**
Evaluation plan with one round and a scorecard. Reviewer provisioning with usable
passwords. Assignment. Reviewer surface: queue, review view, save. Reviews visible to
the organizer. Accept/decline with bulk. Decision emails with templates, merge fields,
preview, and the outbox. Auto-creation of speaker records and default tasks on accept.
*Exit: submitted → reviewed → decided → speaker notified, end to end.*

**Phase 3 — Portal and agenda (6–8 h)**
Speaker portal: home, submissions, profile with headshot, tasks. Task creation and
assignment, file-request uploads, form tasks. Agenda builder: list, day, rooms views;
place a session by drag and by click; speaker and room conflict detection; publish.
Calendar invites with `.ics`.
*Exit: an accepted speaker completes onboarding and appears on a scheduled agenda.*

**Phase 4 — Public surfaces and dashboard (5–6 h)**
All five public widgets, logged-out, with search and filters. Dashboard with counters,
status strip, and "also check" nudges. Deliverables dashboard. Approval gate.
*Exit: the full loop is visible from the outside; the dashboard tells the truth.*

**— CUT LINE —** Everything above must be green before anything below starts.

**Phase 5 — Depth (as time allows, in this order)**
Multi-round evaluation, anonymized review, aggregate results table and export ·
Embeds area and JSON/iCal feeds · CSV import and bulk email · File versioning, comments,
ZIP export · Change history and restore · Scheduled reminder emails.

**Phase 6 — Bonus**
REST API and OpenAPI · Airtable sync · Auto-schedule assist · AI first-pass review ·
Speaker CRM · MCP/agentic interface.

**Final hour, non-negotiable.** Re-run the seed on a clean deploy and walk the whole
loop as a stranger: submit a talk logged-out, review it as Severus, decide as Minerva,
onboard as Hermione, schedule it, and open all five public pages. Fix whatever breaks.
Record a 3-minute walkthrough. Write the README.

---

## Appendix A — Acceptance criteria (evaluation floor)

The organizer publishes an LLM-judge harness at
`forge.smol.ai/swyx/killmysaas-evals`. It scores 96 items across 7 areas: 84 required
items (178 weighted points), 12 extra-credit. **This is the minimum bar, not the
specification** — a build that passes every item but does not feel like a product will
still lose, because the tiebreaker is *"whoever has made subjective judgment calls for
the product that we would actually use/buy."*

Area weights: Call for Papers 20 · Abstract Management 20 · Public Widgets 20 ·
Speaker Management 15 · Content Management 15 · AI Agenda 10 · Speaker CRM 10 (optional).

The harness reports that `exists` and `crud` items rarely discriminate — nearly
everything that ships passes them. Clones fail on **`rule`** (is the constraint actually
enforced), **`scoping`** (does each role see exactly what it should), and **`handoff`**
(does data cross a module boundary without re-entry). Spend disproportionate care there:
close-date enforcement, edit locking, reviewer queue isolation, portal scoping, the
approval gate, conflict detection, and accepted-submission → session → public agenda.

| Rubric | Covered by |
| --- | --- |
| CFP-01 custom form fields render + validate | R-FORM-3, R-FORM-4, R-PUB-4 |
| CFP-02 conditional logic | R-FORM-6 |
| CFP-03 public portal, logged-out, branded, deadline | R-PUB-1, R-EVAL-2 |
| CFP-04 close date blocks submission | R-PUB-5 |
| CFP-05 speaker account → submit → dashboard | R-PUB-3, R-PUB-7, R-POR-5 |
| CFP-06 data round-trips to organizer | R-SUB-2, R-SUB-6 |
| CFP-07 save + resume draft | R-PUB-6 |
| CFP-08 confirmation email | R-COM-3, R-EVAL-6 |
| CFP-09 submitter edit visible to organizer | R-PUB-8 |
| CFP-10 reviewer provisioning + role separation | R-EVL-2, R-ROLE-1, R-EVAL-1 |
| CFP-11 review recorded, visible to organizer | R-REV-4 |
| CFP-12 accept/reject decisions | R-DEC-1 |
| CFP-13 decisions propagate to speaker | R-DEC-2 |
| CFP-14 decision notification emails | R-DEC-3 |
| CFP-15 accepted → session with metadata intact | R-DEC-5 |
| CFP-16 editing locks after close | R-PUB-9 |
| ABS-01 multi-round plans | R-EVL-5 |
| ABS-02 per-round reviewer pools | R-EVL-5 |
| ABS-03 numeric + dropdown + free-text scorecard | R-EVL-4 |
| ABS-04 weighted criteria | R-EVL-13 |
| ABS-05 reviewer queue is exactly the assigned set | R-EVL-3, R-ROLE-2 |
| ABS-06 caps / auto-distribution / bulk assign | R-EVL-8 |
| ABS-07 anonymized review | R-EVL-7 |
| ABS-08 progress dashboard | R-EVL-9 |
| ABS-09 bulk reviewer reminder | R-EVL-12 |
| ABS-10 aggregate score table, sortable | R-EVL-10 |
| ABS-11 co-presenters persist with roles | R-FORM-8, R-SUB-6 |
| ABS-12 conflict of interest / recuse | R-EVL-14 |
| ABS-13 export scores | R-EVL-11 |
| ABS-14 AI triage with human override | R-EVL-15 |
| SPK-01…04 roster, add, CSV, status | R-SPK-1, R-SPK-2, R-SPK-4, R-SPK-5 |
| SPK-05 general tasks with due dates | R-TSK-1 |
| SPK-06 portal invitation email | R-COM-3 |
| SPK-07 portal scoped to own content | R-POR-2 |
| SPK-08 bio/links/headshot round-trip | R-POR-3, R-POR-4 |
| SPK-09 tasks completable in portal | R-POR-6 |
| SPK-10 organizer downloads deliverable | R-TSK-2 |
| SPK-11 session assignments both sides | R-SPK-3, R-POR-5 |
| SPK-12 progress view | R-TSK-7 |
| SPK-13 bulk email, logged | R-SPK-7 |
| SPK-14 merge-field templates | R-COM-2 |
| SPK-15 travel/logistics custom fields | R-SPK-6 |
| SPK-16 automated task reminders | R-COM-4 |
| CNT-01/02 file requests and uploads | R-TSK-1, R-TSK-2 |
| CNT-03 speaker scoping | R-POR-2, R-ROLE-2 |
| CNT-04 file versioning | R-TSK-4 |
| CNT-05 file comments | R-TSK-5 |
| CNT-06 upload constraints shown | R-TSK-6 |
| CNT-07 deliverables dashboard | R-TSK-7 |
| CNT-08 bulk deliverable reminders | R-TSK-8 |
| CNT-09/10 central content editing | R-SUB-8, R-SPK-2 |
| CNT-11 change history + restore | R-SUB-10 |
| CNT-12 approval gate excludes from public | R-TSK-11 |
| CNT-13 central files library | R-TSK-9 |
| CNT-14 bulk ZIP export | R-TSK-10 |
| AIA-01 agenda builder, multi-day | R-AGN-1 |
| AIA-02 rooms/tracks immediately usable | R-SET-2 |
| AIA-03 placement persists | R-AGN-2, R-AGN-3 |
| AIA-04 speaker double-booking warning | R-AGN-4 |
| AIA-05 room conflict flagged | R-AGN-5 |
| AIA-06 move clears conflicts | R-AGN-6 |
| AIA-07 publish hand-off | R-AGN-8 |
| AIA-08 auto-place assist | R-AGN-10 |
| EMB-01…03 sessions list, search, filters | R-SITE-1 |
| EMB-04/05 speakers list + detail + search | R-SITE-2 |
| EMB-06…08 agenda grid, day nav, detail | R-SITE-3 |
| EMB-09 schedule itinerary | R-SITE-4 |
| EMB-10/11 personal schedule + persistence | R-SITE-7 |
| EMB-12/13 speaker gallery + detail | R-SITE-5 |
| EMB-14 all five public without login | R-EVAL-2 |
| EMB-15 embed generation | R-EMB-1 |
| EMB-16 cross-surface consistency | R-SITE-6 |
| CRM-01…12 | R-CRM-1…12 |

---

## Appendix B — Assumptions and judgment calls

Recorded so they can be challenged rather than rediscovered.

1. **Abstracts and sessions are one record type** with a `kind` discriminator. The
   incumbent presents them as separate modules over what is clearly one table. Merging
   them removes an entire duplicate CRUD surface without losing any capability.
2. **Password auth everywhere.** The incumbent leans on magic links. Magic-link-only
   login is unjudgeable by the evaluating agent and is worse for a buyer who wants to
   log in from a shared laptop. Magic links may be added as a convenience.
3. **Payments are stubbed, not built.** The buyer said skip. The wizard step remains so
   the flow matches their mental model.
4. **Publishing gates scheduling only.** Content edits (a fixed typo in an abstract)
   propagate to public surfaces immediately; agenda *placement* changes need a publish.
   This matches how organizers actually work and satisfies the consistency rubric item.
5. **The approval gate is separate from accept/decline.** A talk can be accepted but not
   yet content-approved. Only approved-and-accepted content is public.
6. **Conflict detection is advisory for speakers, blocking for rooms.** A double-booked
   speaker is sometimes intentional (a 5-minute overlap on a panel); two sessions in one
   room never is.
7. **Multi-tenant from day one, single-org in practice.** Organization exists in the
   schema so the CRM extra credit and returning-speaker reuse work, but the UI does not
   expose org management in v1.
8. **English only, no i18n scaffolding.** Confirmed by the buyer.
9. **Airtable is optional and off by default.** It is a bonus, not a dependency; a
   required external service would be a liability during judging.
10. **The buyer's team is non-technical.** *"They are event production professionals."*
    Every destructive action confirms, every list is searchable, and no screen requires
    knowing an ID. Empty states explain what to do next.
