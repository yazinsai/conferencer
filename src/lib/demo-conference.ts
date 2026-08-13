/**
 * The data the landing page's playables run on.
 *
 * design.md § Live product tiles, rule 4: a playable's rows are the demo
 * conference's own. Read them out of SQLite when the instance is seeded, and fall
 * back to the slice below when it is not, so a fresh clone's landing page looks
 * exactly like a seeded one instead of showing empty panels. Nothing here is
 * invented: the fallback is lifted from `seed/fixtures.ts`, which is what
 * `npm run seed` writes into the database. **Keep the two in step** — if a talk
 * title changes there, change it here.
 *
 * `landingDemo()` returns one shape either way, so `src/app/page.tsx` has no
 * branch in it.
 */

import { defaultEvent, listLookup } from "@/lib/repo/events";
import { parseOptions } from "@/lib/fields";
import { defaultForm, listQuestions } from "@/lib/repo/forms";
import { listPlans, listRounds, listScorecard, planProgress } from "@/lib/repo/evaluations";
import { unscheduledSessions, scheduledSessions } from "@/lib/repo/agenda";
import { listSubmissions, speakersForSubmissions } from "@/lib/repo/submissions";
import { listAssignments, isComplete, effectiveDue } from "@/lib/repo/tasks";
import { formatDate } from "@/lib/datetime";
import type { ScorecardQuestion } from "@/lib/scorecard";

/* ------------------------------------------------------------------ types -- */

export type DemoTalk = {
  id: string;
  title: string;
  speakers: string;
  track: string | null;
  trackColor: string | null;
  format: string | null;
  durationMinutes: number;
};

export type DemoRoom = { id: string; name: string };

/** A row of the submissions table, as the decisions playable needs it. */
export type DemoSubmission = {
  id: string;
  title: string;
  speakers: string;
  firstName: string;
  track: string | null;
  /** `null` when nobody has reviewed it yet — the real table shows an em dash. */
  score: number | null;
};

/** A question on the call for speakers, as both builder and preview need it. */
export type DemoQuestion = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  locked: boolean;
  maxLength: number | null;
  helpText: string | null;
  options: string[];
  /** Set on the question that only shows for a long format. */
  showWhenFormat?: string;
};

export type DemoTask = {
  id: string;
  title: string;
  /** Already-relative ("in 6 days"), because the portal shows it that way. */
  due: string;
  done: boolean;
  kind: string;
};

export type LandingDemo = {
  /** The event slug, for the "open the real one" links. `null` when unseeded. */
  slug: string | null;
  eventName: string;
  /** The first day of the conference, as the agenda board labels it. */
  day: string;
  rooms: DemoRoom[];
  slots: string[];
  tray: DemoTalk[];
  questions: DemoQuestion[];
  formatOptions: string[];
  scorecard: ScorecardQuestion[];
  /** `affiliation` is whatever the contact record says, and `null` when it is empty. */
  reviewOf: { title: string; author: string; affiliation: string | null };
  /** The longest format on the event — what the show-when rule keys on. */
  longFormat: string;
  queue: { done: number; total: number; nextTitle: string };
  submissions: DemoSubmission[];
  tasks: DemoTask[];
  speakerName: string;
};

/* --------------------------------------------------------------- fallback -- */

const FALLBACK_ROOMS: DemoRoom[] = [
  { id: "room-main", name: "Main Stage" },
  { id: "room-2a", name: "Room 2A" },
  { id: "room-2b", name: "Room 2B" },
  { id: "room-lab", name: "Workshop Lab" },
];

/** Half-hour slots, the granularity the real rooms grid uses. */
const FALLBACK_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];

const FALLBACK_TRAY: DemoTalk[] = [
  {
    id: "talk-1",
    title: "Shipping a Platform Team Nobody Resents",
    speakers: "Priya Raman",
    track: "Platform & Infra",
    trackColor: "#0ea5e9",
    format: "Talk (30 min)",
    durationMinutes: 30,
  },
  {
    id: "talk-2",
    title: "Evals Before Prompts",
    speakers: "Marcus Chen",
    track: "AI Engineering",
    trackColor: "#7c3aed",
    format: "Talk (30 min)",
    durationMinutes: 30,
  },
  {
    id: "talk-3",
    title: "The Build Is Too Slow. Now What?",
    speakers: "Dana Whitfield",
    track: "Developer Experience",
    trackColor: "#059669",
    format: "Talk (30 min)",
    durationMinutes: 30,
  },
];

const FALLBACK_QUESTIONS: DemoQuestion[] = [
  {
    id: "q-title",
    label: "Session title",
    type: "text",
    required: true,
    locked: true,
    maxLength: 120,
    helpText: null,
    options: [],
  },
  {
    id: "q-format",
    label: "Format",
    type: "dropdown",
    required: true,
    locked: false,
    maxLength: null,
    helpText: null,
    options: ["Talk (30 min)", "Lightning Talk (10 min)", "Workshop (120 min)"],
  },
  {
    id: "q-abstract",
    label: "Abstract",
    type: "textarea",
    required: true,
    locked: false,
    maxLength: 4000,
    helpText: "What will the audience be able to do afterwards?",
    options: [],
  },
  {
    id: "q-level",
    label: "Audience level",
    type: "dropdown",
    required: false,
    locked: false,
    maxLength: null,
    helpText: null,
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: "q-outline",
    label: "Workshop outline",
    type: "textarea",
    required: false,
    locked: false,
    maxLength: 2000,
    helpText: "Only asked for the 120-minute format.",
    options: [],
    showWhenFormat: "Workshop (120 min)",
  },
];

const FALLBACK_SCORECARD: ScorecardQuestion[] = [
  {
    id: "s-relevance",
    round_id: "round-1",
    type: "scale_1_5",
    label: "Relevance to the track",
    options: "",
    weight: 2,
    min: null,
    max: null,
    is_required: 1,
    sort_order: 0,
  },
  {
    id: "s-originality",
    round_id: "round-1",
    type: "scale_1_5",
    label: "Originality",
    options: "",
    weight: 1,
    min: null,
    max: null,
    is_required: 1,
    sort_order: 1,
  },
  {
    id: "s-speaker",
    round_id: "round-1",
    type: "scale_1_5",
    label: "Speaker experience",
    options: "",
    weight: 1,
    min: null,
    max: null,
    is_required: 0,
    sort_order: 2,
  },
];

const FALLBACK_SUBMISSIONS: DemoSubmission[] = [
  {
    id: "sub-1",
    title: "Shipping a Platform Team Nobody Resents",
    speakers: "Priya Raman",
    firstName: "Priya",
    track: "Platform & Infra",
    score: 4.6,
  },
  {
    id: "sub-2",
    title: "Evals Before Prompts",
    speakers: "Marcus Chen",
    firstName: "Marcus",
    track: "AI Engineering",
    score: 4.4,
  },
  {
    id: "sub-3",
    title: "The Build Is Too Slow. Now What?",
    speakers: "Dana Whitfield",
    firstName: "Dana",
    track: "Developer Experience",
    score: 4.1,
  },
  {
    id: "sub-4",
    title: "Observability on a Budget",
    speakers: "Aisha Bello",
    firstName: "Aisha",
    track: "Platform & Infra",
    score: 3.2,
  },
];

const FALLBACK_TASKS: DemoTask[] = [
  {
    id: "t-bio",
    title: "Complete bio and profile",
    due: "Due April 1, 2027",
    done: true,
    kind: "action",
  },
  {
    id: "t-headshot",
    title: "Upload headshot",
    due: "Due April 14, 2027",
    done: true,
    kind: "file_request",
  },
  {
    id: "t-slides",
    title: "Upload slides",
    due: "Due May 1, 2027",
    done: false,
    kind: "file_request",
  },
];

const FALLBACK: LandingDemo = {
  slug: null,
  eventName: "DevFlow Conf 2027",
  day: "2027-05-12",
  rooms: FALLBACK_ROOMS,
  slots: FALLBACK_SLOTS,
  tray: FALLBACK_TRAY,
  questions: FALLBACK_QUESTIONS,
  formatOptions: ["Talk (30 min)", "Lightning Talk (10 min)", "Workshop (120 min)"],
  scorecard: FALLBACK_SCORECARD,
  reviewOf: {
    title: "Evals Before Prompts",
    author: "Marcus Chen",
    affiliation: "Loomstack",
  },
  longFormat: "Workshop (120 min)",
  queue: { done: 4, total: 12, nextTitle: "The Build Is Too Slow. Now What?" },
  submissions: FALLBACK_SUBMISSIONS,
  tasks: FALLBACK_TASKS,
  speakerName: "Priya Raman",
};

/* ------------------------------------------------------------------ read -- */

const firstNameOf = (full: string) => full.trim().split(/\s+/)[0] ?? full;

/**
 * A draft with no title is a real row in the demo database and a terrible thing to
 * put on a landing page — it reads as a bug rather than as a talk. Playables show
 * submitted work only.
 */
const isShowable = (row: { title: string; is_draft: number }) =>
  !row.is_draft && Boolean(row.title?.trim()) && !/^untitled/i.test(row.title);

/**
 * Server-only. Reads the demo conference for the landing page's playables, and
 * returns the checked-in slice when this instance has no event yet.
 */
export function landingDemo(): LandingDemo {
  const event = defaultEvent();
  if (!event) return FALLBACK;

  try {
    const rooms = listLookup("rooms", event.id)
      .slice(0, 4)
      .map((room) => ({ id: room.id, name: room.name }));

    // A format carries its own length, so a Lightning Talk is ten minutes on this
    // board exactly as it is in the product — not a uniform 30-minute block.
    const formatRows = listLookup("formats", event.id);
    const formats = formatRows.map((row) => row.name);
    const minutesByFormat = new Map(
      formatRows.map((row) => [row.name, row.duration_minutes ?? 30] as const),
    );
    const longFormat =
      [...minutesByFormat.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? FALLBACK.longFormat;

    const accepted = unscheduledSessions(event.id).filter(isShowable);
    const alreadyPlaced = scheduledSessions(event.id).filter(isShowable);
    const source = accepted.length >= 3 ? accepted : [...accepted, ...alreadyPlaced];
    const tray: DemoTalk[] = source.slice(0, 3).map((row) => ({
      id: row.id,
      title: row.title,
      speakers: row.speakers ?? row.submitter_name ?? "",
      track: row.track_name,
      trackColor: row.track_color,
      format: row.format_name,
      durationMinutes: minutesByFormat.get(row.format_name ?? "") ?? 30,
    }));

    const form = defaultForm(event.id);
    // Track and Format are lookup-backed in this product, so their options live on
    // the event rather than on the question. The preview needs the real values.
    const optionsFor = (question: { label: string; options: string }) => {
      const own = parseOptions(question.options).map((option) => option.label);
      if (own.length) return own;
      if (/format/i.test(question.label)) return formats;
      if (/track/i.test(question.label)) return listLookup("tracks", event.id).map((r) => r.name);
      if (/level/i.test(question.label)) return listLookup("levels", event.id).map((r) => r.name);
      return [];
    };

    const questions: DemoQuestion[] = form
      ? listQuestions(form.id, "submission")
          .slice(0, 5)
          .map((question, index, all) => ({
            id: question.id,
            label: question.label,
            type: question.type,
            required: Boolean(question.is_required),
            locked: Boolean(question.is_locked),
            maxLength: question.max_length,
            helpText: question.help_text,
            options: optionsFor(question),
            // The last question starts with a show-when rule on it, because a rule
            // the reader can see working is worth more than one they have to build
            // first — and the builder lets them switch it off again.
            showWhenFormat: index === all.length - 1 ? longFormat : undefined,
          }))
      : FALLBACK.questions;

    const plan = listPlans(event.id)[0];
    const round = plan ? listRounds(plan.id)[0] : undefined;
    const scorecard = round ? listScorecard(round.id).filter((q) => q.type !== "separator") : [];
    const progress = plan
      ? planProgress(plan.id)
      : { assigned: FALLBACK.queue.total, complete: FALLBACK.queue.done };

    // Pending is the status a decision is actually taken from, so it is the right
    // shortlist for the decisions playable. Reviewed rows first, so the score
    // column has something real in it.
    const pending = listSubmissions(event.id, { status: "pending" }).filter(isShowable);
    const shortlist = (
      pending.length >= 4 ? pending : listSubmissions(event.id, {}).filter(isShowable)
    )
      .slice()
      .sort((a, b) => (b.avg_score ?? -1) - (a.avg_score ?? -1));
    const submissions: DemoSubmission[] = shortlist.slice(0, 4).map((row) => {
      const who = row.speakers ?? row.submitter_name ?? "";
      return {
        id: row.id,
        title: row.title,
        speakers: who,
        firstName: firstNameOf(who),
        track: row.track_name,
        score: row.avg_score,
      };
    });

    // The scorecard playable is about a talk somebody has actually reviewed, and
    // the affiliation beside the author is that contact's own — never a stand-in.
    const reviewTarget = shortlist.find((row) => row.avg_score !== null) ?? shortlist[0];
    const reviewSpeaker = reviewTarget
      ? speakersForSubmissions([reviewTarget.id]).get(reviewTarget.id)?.[0]
      : undefined;

    // One accepted speaker's real onboarding checklist, with the deadlines the
    // organizer actually set. The portal shows a task's own due date, so this does
    // too, and a task already complete arrives already ticked.
    const everyAssignment = listAssignments(event.id, { limit: 200 });
    const speakerContact = everyAssignment.find((row) =>
      everyAssignment.filter((other) => other.contact_id === row.contact_id).length >= 2,
    );
    const tasks: DemoTask[] = speakerContact
      ? listAssignments(event.id, { contactId: speakerContact.contact_id })
          .slice(0, 3)
          .map((row) => ({
            id: row.id,
            title: row.task_name,
            due: effectiveDue(row) ? `Due ${formatDate(effectiveDue(row))}` : "No deadline",
            done: isComplete(row.status),
            kind: row.task_type,
          }))
      : [];

    return {
      slug: event.slug,
      eventName: event.name,
      day: (event.starts_at ?? FALLBACK.day).slice(0, 10),
      rooms: rooms.length ? rooms : FALLBACK.rooms,
      slots: FALLBACK.slots,
      tray: tray.length ? tray : FALLBACK.tray,
      questions: questions.length ? questions : FALLBACK.questions,
      formatOptions: formats.length ? formats : FALLBACK.formatOptions,
      scorecard: scorecard.length ? scorecard : FALLBACK.scorecard,
      longFormat,
      reviewOf: reviewTarget
        ? {
            title: reviewTarget.title,
            author:
              reviewSpeaker
                ? `${reviewSpeaker.first_name} ${reviewSpeaker.last_name}`.trim()
                : (reviewTarget.speakers ?? reviewTarget.submitter_name ?? FALLBACK.reviewOf.author),
            affiliation: reviewSpeaker?.company ?? null,
          }
        : FALLBACK.reviewOf,
      // The reviewer's progress bar counts this plan's real assignments. A
      // landing page does not get to invent a fraction any more than it gets to
      // invent a percentage (design.md § Honest copy).
      queue: {
        done: progress.complete,
        total: progress.assigned || FALLBACK.queue.total,
        nextTitle: submissions[1]?.title ?? FALLBACK.queue.nextTitle,
      },
      submissions: submissions.length ? submissions : FALLBACK.submissions,
      tasks: tasks.length ? tasks : FALLBACK.tasks,
      speakerName: speakerContact
        ? `${speakerContact.contact_first} ${speakerContact.contact_last}`.trim()
        : (submissions[0]?.speakers || FALLBACK.speakerName),
    };
  } catch {
    // A landing page must never 500 because a demo panel could not find a row.
    return FALLBACK;
  }
}
