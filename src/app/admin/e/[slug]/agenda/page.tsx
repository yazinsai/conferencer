import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { requireEventRole } from "@/lib/auth/guards";
import {
  getAgendaConflicts,
  loadAgendaSubmissions,
  loadScheduledSubmissions,
  loadUnscheduledSubmissions,
} from "@/lib/calendar/agenda-data";
import {
  eventDayKeys,
  formatDayLabel,
  formatTimeRange,
} from "@/lib/calendar/agenda-dates";
import { getDb, schema } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AgendaScheduleHost } from "./agenda-schedule-host";
import { publishAgendaAction } from "./actions";

const VIEWS = ["list", "day", "rooms", "conflicts"] as const;
type View = (typeof VIEWS)[number];

function scheduleHref(
  slug: string,
  submissionId: string,
  view: string,
  day?: string,
  extra?: Record<string, string>,
) {
  const params = new URLSearchParams({ view, schedule: submissionId, ...extra });
  if (day) params.set("day", day);
  return `/admin/e/${slug}/agenda?${params.toString()}`;
}

function viewHref(slug: string, view: string, day?: string) {
  const params = new URLSearchParams({ view });
  if (day) params.set("day", day);
  return `/admin/e/${slug}/agenda?${params.toString()}`;
}

function flashMessage(sp: Record<string, string | undefined>) {
  if (sp.published === "1") {
    return {
      kind: "success" as const,
      text: `Agenda published. ${sp.scheduled ?? "0"} sessions are scheduled and visible when published.`,
    };
  }
  if (sp.warn === "speaker_conflict") {
    return {
      kind: "warning" as const,
      text: "Session saved, but a speaker conflict was detected. Review the Conflicts tab.",
    };
  }
  if (sp.scheduled && !sp.warn) {
    return { kind: "success" as const, text: "Session scheduled successfully." };
  }
  if (sp.unscheduled) {
    return { kind: "success" as const, text: "Session removed from the schedule." };
  }
  if (sp.error === "room_conflict") {
    return {
      kind: "error" as const,
      text: "Cannot save: this room is already booked for an overlapping time slot.",
    };
  }
  if (sp.error === "invalid_times") {
    return { kind: "error" as const, text: "End time must be after start time." };
  }
  if (sp.error === "missing_fields") {
    return { kind: "error" as const, text: "Date, times, and room are all required." };
  }
  return null;
}

export default async function AgendaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireEventRole(slug, ["organizer"]);
  const db = getDb();

  const view = (VIEWS.includes(sp.view as View) ? sp.view : "list") as View;
  const eventDays = eventDayKeys(event.startsAt, event.endsAt);
  const day = sp.day && eventDays.includes(sp.day) ? sp.day : eventDays[0];

  const rooms = db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.eventId, event.id))
    .orderBy(asc(schema.rooms.sortOrder))
    .all();

  const allAccepted = loadAgendaSubmissions(event.id);
  const unscheduled = loadUnscheduledSubmissions(event.id);
  const scheduled = loadScheduledSubmissions(event.id);
  const conflicts = getAgendaConflicts(event.id);
  const flash = flashMessage(sp);

  const submissionOptions = allAccepted.map((s) => ({
    id: s.id,
    title: s.title,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    locationId: s.locationId,
    participantNames: s.participantNames,
  }));

  const daySessions = scheduled
    .filter((s) => s.startsAt?.startsWith(day))
    .sort((a, b) => (a.startsAt! < b.startsAt! ? -1 : 1));

  const timeSlots = Array.from(
    new Set(
      scheduled
        .map((s) => s.startsAt?.match(/T(\d{2}:\d{2})/)?.[1])
        .filter(Boolean) as string[],
    ),
  ).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="text-slate-600">
            Schedule accepted sessions across rooms and days.
            {event.agendaPublishedAt ? (
              <span className="ml-2 text-emerald-700">
                Published {new Date(event.agendaPublishedAt).toLocaleString()}
              </span>
            ) : (
              <span className="ml-2 text-amber-700">Draft — not published</span>
            )}
          </p>
        </div>
        <form action={publishAgendaAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="view" value={view} />
          <Button type="submit">Publish agenda</Button>
        </form>
      </div>

      {flash ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            flash.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : flash.kind === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {flash.text}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {VIEWS.map((v) => (
          <Link
            key={v}
            href={viewHref(slug, v, v === "day" ? day : undefined)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
              view === v
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {v}
            {v === "conflicts" && conflicts.length ? (
              <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">
                {conflicts.length}
              </span>
            ) : null}
          </Link>
        ))}
        <span className="mx-2 text-slate-300">|</span>
        <span className="text-xs text-slate-400">Week</span>
        <span className="text-xs text-slate-400">Month</span>
      </div>

      <Card>
        <CardHeader
          title="Unscheduled"
          subtitle={`${unscheduled.length} accepted session${unscheduled.length === 1 ? "" : "s"} without a time slot`}
        />
        <CardBody>
          {unscheduled.length === 0 ? (
            <p className="text-sm text-slate-500">All accepted sessions are scheduled.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {unscheduled.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-slate-500">
                      {[s.trackName, s.formatName].filter(Boolean).join(" · ")}
                      {s.participantNames.length
                        ? ` · ${s.participantNames.join(", ")}`
                        : ""}
                    </div>
                  </div>
                  <Link
                    href={scheduleHref(slug, s.id, view, view === "day" ? day : undefined)}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Schedule…
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      {view === "list" ? (
        <Card>
          <CardHeader
            title="Scheduled sessions"
            subtitle={`${scheduled.length} on the agenda`}
          />
          <CardBody className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Session</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Time</th>
                  <th className="pb-2 pr-4 font-medium">Room</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {scheduled.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-slate-500">
                      No sessions scheduled yet.
                    </td>
                  </tr>
                ) : (
                  scheduled
                    .sort((a, b) =>
                      (a.startsAt ?? "") < (b.startsAt ?? "") ? -1 : 1,
                    )
                    .map((s) => (
                      <tr key={s.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4">
                          <div className="font-medium">{s.title}</div>
                          <div className="text-xs text-slate-500">
                            {s.participantNames.join(", ")}
                          </div>
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          {s.startsAt?.slice(0, 10)}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          {s.startsAt && s.endsAt
                            ? formatTimeRange(s.startsAt, s.endsAt)
                            : "—"}
                        </td>
                        <td className="py-3 pr-4">{s.roomName ?? "—"}</td>
                        <td className="py-3 text-right">
                          <Link
                            href={scheduleHref(slug, s.id, view)}
                            className="text-blue-700 hover:underline"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ) : null}

      {view === "day" ? (
        <Card>
          <CardHeader
            title={formatDayLabel(day)}
            subtitle="Sessions by room, in time order"
            actions={
              <div className="flex flex-wrap gap-1">
                {eventDays.map((d) => (
                  <Link
                    key={d}
                    href={viewHref(slug, "day", d)}
                    className={`rounded px-2 py-1 text-xs ${
                      d === day
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {d.slice(5)}
                  </Link>
                ))}
              </div>
            }
          />
          <CardBody className="space-y-6">
            {rooms.length === 0 ? (
              <p className="text-sm text-slate-500">
                Add rooms in Settings before scheduling.
              </p>
            ) : (
              rooms.map((room) => {
                const inRoom = daySessions
                  .filter((s) => s.locationId === room.id)
                  .sort((a, b) => (a.startsAt! < b.startsAt! ? -1 : 1));
                return (
                  <div key={room.id}>
                    <h3 className="mb-2 text-sm font-semibold text-slate-800">
                      {room.name}
                    </h3>
                    {inRoom.length === 0 ? (
                      <p className="text-xs text-slate-400">No sessions</p>
                    ) : (
                      <ul className="space-y-2">
                        {inRoom.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                          >
                            <div>
                              <div className="text-sm font-medium">{s.title}</div>
                              <div className="text-xs text-slate-500">
                                {s.startsAt && s.endsAt
                                  ? formatTimeRange(s.startsAt, s.endsAt)
                                  : ""}
                              </div>
                            </div>
                            <Link
                              href={scheduleHref(slug, s.id, view, day)}
                              className="text-xs text-blue-700 hover:underline"
                            >
                              Edit
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      ) : null}

      {view === "rooms" ? (
        <Card>
          <CardHeader title="Rooms grid" subtitle="Time rows × room columns" />
          <CardBody className="overflow-x-auto">
            {rooms.length === 0 ? (
              <p className="text-sm text-slate-500">No rooms configured.</p>
            ) : (
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-50 p-2 text-left">
                      Time
                    </th>
                    {rooms.map((room) => (
                      <th
                        key={room.id}
                        className="border border-slate-200 bg-slate-50 p-2 text-left min-w-[140px]"
                      >
                        {room.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(timeSlots.length ? timeSlots : ["—"]).map((slot) => (
                    <tr key={slot}>
                      <td className="border border-slate-200 p-2 font-medium text-slate-600 whitespace-nowrap">
                        {slot}
                      </td>
                      {rooms.map((room) => {
                        const match = scheduled.find(
                          (s) =>
                            s.locationId === room.id &&
                            s.startsAt?.includes(`T${slot}`),
                        );
                        return (
                          <td
                            key={room.id}
                            className="border border-slate-200 p-2 align-top"
                          >
                            {match ? (
                              <Link
                                href={scheduleHref(slug, match.id, view)}
                                className="block rounded bg-blue-50 px-2 py-1 text-blue-900 hover:bg-blue-100"
                              >
                                <div className="font-medium">{match.title}</div>
                                <div className="text-[10px] text-blue-700">
                                  {match.startsAt?.slice(0, 10)}
                                </div>
                              </Link>
                            ) : (
                              <span className="text-slate-300">·</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      ) : null}

      {view === "conflicts" ? (
        <Card>
          <CardHeader
            title="Scheduling conflicts"
            subtitle={`${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"} detected`}
          />
          <CardBody>
            {conflicts.length === 0 ? (
              <p className="text-sm text-slate-500">No room or speaker conflicts.</p>
            ) : (
              <ul className="space-y-3">
                {conflicts.map((c, i) => (
                  <li
                    key={`${c.sessionAId}-${c.sessionBId}-${i}`}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          c.type === "room"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        {c.type === "room" ? "Room" : "Speaker"}
                      </Badge>
                      <span className="text-sm text-slate-600">{c.detail}</span>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <Link
                        href={scheduleHref(slug, c.sessionAId, view)}
                        className="rounded border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        {c.sessionATitle}
                      </Link>
                      <Link
                        href={scheduleHref(slug, c.sessionBId, view)}
                        className="rounded border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        {c.sessionBTitle}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      ) : null}

      <Suspense fallback={null}>
        <AgendaScheduleHost
          slug={slug}
          view={view}
          day={day}
          rooms={rooms.map((r) => ({ id: r.id, name: r.name }))}
          defaultDate={day}
          submissions={submissionOptions}
        />
      </Suspense>
    </div>
  );
}
