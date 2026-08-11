import Link from "next/link";

import { all, get } from "@/lib/db";
import { listLookup } from "@/lib/repo/events";
import { listPlans, reviewerProgress, results } from "@/lib/repo/evaluations";
import { Card, Chip, cx, Progress, SubNav } from "@/components/ui";
import { dateOf, formatDate } from "@/lib/datetime";

const TABS = [
  { key: "forms", label: "Submission Forms" },
  { key: "participants", label: "Participants" },
  { key: "evaluations", label: "Evaluations" },
  { key: "agenda", label: "Agenda" },
] as const;

/** R-DSH-5: tabbed analytics panels under the headline counters. */
export function DashboardPanels({
  slug,
  eventId,
  tab,
  eventStart,
  eventEnd,
}: {
  slug: string;
  eventId: string;
  tab: string;
  eventStart: string | null;
  eventEnd: string | null;
}) {
  const current = TABS.some((t) => t.key === tab) ? tab : "forms";
  const base = `/admin/e/${slug}`;

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold text-slate-900">Programme analytics</h2>
      <Card>
        <div className="px-4 pt-3">
          <SubNav
            current={`${base}?panel=${current}`}
            items={TABS.map((t) => ({ href: `${base}?panel=${t.key}`, label: t.label }))}
          />
        </div>
        <div className="px-4 pb-4">
          {current === "forms" ? <FormsPanel eventId={eventId} slug={slug} /> : null}
          {current === "participants" ? <ParticipantsPanel eventId={eventId} /> : null}
          {current === "evaluations" ? <EvaluationsPanel eventId={eventId} slug={slug} /> : null}
          {current === "agenda" ? (
            <AgendaPanel eventId={eventId} slug={slug} eventStart={eventStart} eventEnd={eventEnd} />
          ) : null}
        </div>
      </Card>
    </section>
  );
}

function FormsPanel({ eventId, slug }: { eventId: string; slug: string }) {
  const forms = all<{
    id: string;
    name: string;
    status: string;
    closes_at: string | null;
    total: number;
    drafts: number;
  }>(
    `SELECT f.id, f.name, f.status, f.closes_at,
            (SELECT COUNT(*) FROM submissions s WHERE s.form_id = f.id) AS total,
            (SELECT COUNT(*) FROM submissions s WHERE s.form_id = f.id AND s.status = 'draft') AS drafts
       FROM submission_forms f WHERE f.event_id = ? ORDER BY f.created_at`,
    eventId,
  );
  const pacing = all<{ day: string; n: number }>(
    `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS n FROM submissions
      WHERE event_id = ? GROUP BY day ORDER BY day DESC LIMIT 21`,
    eventId,
  ).reverse();
  const max = Math.max(1, ...pacing.map((p) => p.n));
  const total = pacing.reduce((sum, point) => sum + point.n, 0);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Submission pacing · {total} in the last {pacing.length} active days
        </p>
        <div className="mt-2 flex h-32 items-end gap-1">
          {pacing.map((point) => (
            <div key={point.day} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-brand-500"
                style={{ height: `${(point.n / max) * 100}%`, minHeight: 3 }}
                title={`${point.n} on ${point.day}`}
              />
              <span className="text-[9px] text-slate-400">{point.day.slice(8)}</span>
            </div>
          ))}
          {!pacing.length ? <p className="text-sm text-slate-500">No submissions yet.</p> : null}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Forms</p>
        <ul className="mt-2 space-y-2">
          {forms.map((form) => (
            <li key={form.id} className="flex items-center justify-between gap-2 text-sm">
              <Link
                href={`/admin/e/${slug}/forms/${form.id}`}
                className="text-slate-700 hover:text-brand-700"
              >
                {form.name}
              </Link>
              <span className="flex items-center gap-2 text-xs text-slate-500">
                {form.total} submitted · {form.drafts} draft
                <Chip tone={form.status === "open" ? "green" : "slate"}>{form.status}</Chip>
              </span>
            </li>
          ))}
          {!forms.length ? <li className="text-sm text-slate-500">No forms yet.</li> : null}
        </ul>
      </div>
    </div>
  );
}

function ParticipantsPanel({ eventId }: { eventId: string }) {
  const roles = all<{ role: string; n: number }>(
    `SELECT sp.role, COUNT(DISTINCT sp.contact_id) AS n
       FROM submission_participants sp JOIN submissions s ON s.id = sp.submission_id
      WHERE s.event_id = ? GROUP BY sp.role ORDER BY n DESC`,
    eventId,
  );
  const statuses = all<{ status: string; n: number }>(
    "SELECT status, COUNT(*) AS n FROM submissions WHERE event_id = ? GROUP BY status",
    eventId,
  );
  const speakerStatuses = all<{ speaker_status: string; n: number }>(
    "SELECT speaker_status, COUNT(*) AS n FROM event_contacts WHERE event_id = ? GROUP BY speaker_status",
    eventId,
  );
  const totalStatuses = statuses.reduce((sum, row) => sum + row.n, 0) || 1;
  const colors: Record<string, string> = {
    accepted: "#059669",
    pending: "#7c3aed",
    accept_queue: "#0ea5e9",
    decline_queue: "#f59e0b",
    declined: "#dc2626",
    withdrawn: "#94a3b8",
    draft: "#cbd5e1",
  };

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Participants by role
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {roles.map((row) => (
            <li key={row.role} className="flex justify-between capitalize">
              <span className="text-slate-700">{row.role}</span>
              <span className="font-medium text-slate-900">{row.n}</span>
            </li>
          ))}
          {!roles.length ? <li className="text-slate-500">Nobody attached yet.</li> : null}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Speaker workflow status
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {speakerStatuses.map((row) => (
            <li key={row.speaker_status} className="flex justify-between capitalize">
              <span className="text-slate-700">{row.speaker_status}</span>
              <span className="font-medium text-slate-900">{row.n}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Submissions by status
        </p>
        <div className="mt-2 flex h-4 w-full overflow-hidden rounded-full">
          {statuses.map((row) => (
            <div
              key={row.status}
              title={`${row.status}: ${row.n}`}
              style={{
                width: `${(row.n / totalStatuses) * 100}%`,
                backgroundColor: colors[row.status] ?? "#94a3b8",
              }}
            />
          ))}
        </div>
        <ul className="mt-2 space-y-1 text-xs">
          {statuses.map((row) => (
            <li key={row.status} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: colors[row.status] ?? "#94a3b8" }}
              />
              <span className="capitalize text-slate-700">{row.status.replace("_", " ")}</span>
              <span className="ml-auto text-slate-500">{row.n}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EvaluationsPanel({ eventId, slug }: { eventId: string; slug: string }) {
  const plans = listPlans(eventId);
  const progress = plans.flatMap((plan) => reviewerProgress(plan.id));
  const scored = results(eventId).filter((row) => row.avg_score !== null);
  const average =
    scored.length > 0
      ? scored.reduce((sum, row) => sum + (row.avg_score ?? 0), 0) / scored.length
      : null;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reviewer progress
        </p>
        <ul className="mt-2 space-y-2">
          {progress.map((row) => (
            <li key={`${row.round_id}-${row.user_id}`}>
              <div className="flex justify-between text-xs text-slate-600">
                <span>
                  {row.first_name} {row.last_name}
                  <span className="text-slate-400"> · {row.round_name}</span>
                </span>
                <span>
                  {row.complete}/{row.assigned}
                </span>
              </div>
              <Progress value={row.complete} max={Math.max(row.assigned, 1)} />
            </li>
          ))}
          {!progress.length ? (
            <li className="text-sm text-slate-500">No reviewers assigned yet.</li>
          ) : null}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Scores {average !== null ? `· mean ${average.toFixed(2)}` : ""}
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {scored.slice(0, 8).map((row) => (
            <li key={row.submission_id} className="flex items-center justify-between gap-2">
              <Link
                href={`/admin/e/${slug}/submissions/${row.submission_id}`}
                className="truncate text-slate-700 hover:text-brand-700"
              >
                {row.title}
              </Link>
              <span className="shrink-0 font-medium text-slate-900">
                {row.avg_score?.toFixed(2)}
              </span>
            </li>
          ))}
          {!scored.length ? (
            <li className="text-slate-500">No reviews submitted yet.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

function AgendaPanel({
  eventId,
  slug,
  eventStart,
  eventEnd,
}: {
  eventId: string;
  slug: string;
  eventStart: string | null;
  eventEnd: string | null;
}) {
  const rooms = listLookup("rooms", eventId);
  const scheduled = all<{ day: string; n: number }>(
    `SELECT substr(starts_at, 1, 10) AS day, COUNT(*) AS n FROM submissions
      WHERE event_id = ? AND status = 'accepted' AND starts_at IS NOT NULL
      GROUP BY day ORDER BY day`,
    eventId,
  );
  const unscheduled =
    get<{ n: number }>(
      `SELECT COUNT(*) AS n FROM submissions
        WHERE event_id = ? AND status = 'accepted' AND starts_at IS NULL`,
      eventId,
    )?.n ?? 0;

  const days = new Set(scheduled.map((row) => row.day));
  const from = dateOf(eventStart);
  const to = dateOf(eventEnd) ?? from;
  if (from) {
    const cursor = new Date(`${from}T00:00:00Z`);
    const last = new Date(`${to}T00:00:00Z`);
    while (cursor <= last && days.size < 30) {
      days.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  const dayList = [...days].sort();
  // A rough capacity model: rooms × 8 usable hour-slots a day.
  const capacityPerDay = Math.max(1, rooms.length * 8);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Slots filled by day
        </p>
        <ul className="mt-2 space-y-2">
          {dayList.map((day) => {
            const filled = scheduled.find((row) => row.day === day)?.n ?? 0;
            return (
              <li key={day}>
                <div className="flex justify-between text-xs text-slate-600">
                  <Link
                    href={`/admin/e/${slug}/agenda?day=${day}`}
                    className="hover:text-brand-700"
                  >
                    {formatDate(day, { weekday: true })}
                  </Link>
                  <span>
                    {filled} placed · {Math.max(0, capacityPerDay - filled)} slots free
                  </span>
                </div>
                <Progress value={filled} max={capacityPerDay} />
              </li>
            );
          })}
          {!dayList.length ? <li className="text-sm text-slate-500">No event dates set.</li> : null}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rooms</p>
        <ul className="mt-2 space-y-1 text-sm">
          {rooms.map((room) => {
            const n =
              get<{ n: number }>(
                `SELECT COUNT(*) AS n FROM submissions
                  WHERE event_id = ? AND location_id = ? AND starts_at IS NOT NULL`,
                eventId,
                room.id,
              )?.n ?? 0;
            return (
              <li key={room.id} className="flex justify-between">
                <span className="text-slate-700">{room.name}</span>
                <span className="text-slate-500">{n} sessions</span>
              </li>
            );
          })}
        </ul>
        <p
          className={cx(
            "mt-3 rounded-md px-3 py-2 text-sm",
            unscheduled ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800",
          )}
        >
          {unscheduled
            ? `${unscheduled} accepted session${unscheduled === 1 ? "" : "s"} still need a slot.`
            : "Every accepted session has a slot."}
        </p>
      </div>
    </div>
  );
}
