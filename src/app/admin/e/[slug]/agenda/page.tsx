import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { getLookup, listLookup } from "@/lib/repo/events";
import {
  eventDays,
  findConflicts,
  lastPublication,
  pendingChanges,
  scheduledSessions,
  unscheduledSessions,
} from "@/lib/repo/agenda";
import {
  autoScheduleAction,
  publishAgendaAction,
  scheduleAction,
  sendCalendarInvitesAction,
} from "@/server/agenda-actions";
import { AgendaBoard, type PlacedItem, type TrayItem } from "@/components/admin/agenda-board";
import { AgendaGrid, type GridBlock } from "@/components/public/agenda-grid";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  FormError,
  LinkButton,
  Notice,
  PageHeader,
  SubNav,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { dateOf, formatDate, formatRange, formatStamp } from "@/lib/datetime";

export const dynamic = "force-dynamic";

const VIEWS = ["list", "day", "week", "month", "rooms", "conflicts"] as const;

function slotsFor(): string[] {
  const out: string[] = [];
  for (let hour = 8; hour <= 18; hour += 1) {
    out.push(`${String(hour).padStart(2, "0")}:00`);
    out.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return out;
}

export default async function AgendaPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/agenda">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);

  const view = (typeof sp.view === "string" && VIEWS.includes(sp.view as never)
    ? sp.view
    : "rooms") as (typeof VIEWS)[number];
  const days = eventDays(event.id, event.starts_at, event.ends_at);
  const day = typeof sp.day === "string" && days.includes(sp.day) ? sp.day : (days[0] ?? "");
  const base = `/admin/e/${slug}/agenda`;

  const rooms = listLookup("rooms", event.id);
  const scheduled = scheduledSessions(event.id);
  const tray = unscheduledSessions(event.id);
  const conflicts = findConflicts(scheduled);
  const conflicted = new Set(conflicts.flatMap((c) => c.submissionIds));
  const pending = pendingChanges(event.id);
  const published = lastPublication(event.id);
  const error = typeof sp.error === "string" ? sp.error : null;

  const daySessions = scheduled.filter((s) => dateOf(s.starts_at) === day);
  const placed: PlacedItem[] = daySessions.map((s) => ({
    id: s.id,
    title: s.title,
    track: s.track_name,
    trackColor: s.track_color,
    format: s.format_name,
    speakers: s.speakers,
    durationMinutes: s.format_id ? (getLookup("formats", s.format_id)?.duration_minutes ?? 30) : 30,
    startsAt: s.starts_at!,
    endsAt: s.ends_at,
    roomId: s.location_id,
    conflict: conflicted.has(s.id),
  }));
  const trayItems: TrayItem[] = tray.map((s) => ({
    id: s.id,
    title: s.title,
    track: s.track_name,
    trackColor: s.track_color,
    format: s.format_name,
    speakers: s.speakers,
    durationMinutes: s.format_id ? (getLookup("formats", s.format_id)?.duration_minutes ?? 30) : 30,
  }));

  const blocks: GridBlock[] = daySessions.map((s) => ({
    id: s.id,
    title: s.title,
    roomId: s.location_id,
    startsAt: s.starts_at,
    endsAt: s.ends_at,
    trackName: s.track_name,
    trackColor: s.track_color,
    speakers: s.speakers,
    conflict: conflicted.has(s.id),
    href: `/admin/e/${slug}/submissions/${s.id}`,
  }));

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Place accepted sessions into day, time and room. Room clashes are blocked; speaker clashes are flagged."
        actions={
          <>
            <form action={autoScheduleAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="days" value={days.join(",")} />
              <Button type="submit" size="sm">
                Auto-schedule unplaced
              </Button>
            </form>
            <form action={sendCalendarInvitesAction}>
              <input type="hidden" name="slug" value={slug} />
              <Button type="submit" size="sm">
                Send calendar invites
              </Button>
            </form>
            <form action={publishAgendaAction}>
              <input type="hidden" name="slug" value={slug} />
              <Button type="submit" size="sm" variant="primary">
                Publish agenda
              </Button>
            </form>
          </>
        }
      />

      {error ? (
        <div className="mb-4">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      {sp.published !== undefined ? (
        <Notice tone="success" className="mb-4">
          Agenda published — {String(sp.published)} change(s) are now live on the public schedule.
        </Notice>
      ) : null}
      {sp.autoplaced !== undefined ? (
        <Notice tone="success" className="mb-4">
          Auto-schedule placed {String(sp.autoplaced)} session(s) into free, conflict-free slots.
          Review them below and publish when you are happy.
        </Notice>
      ) : null}
      {sp.invites !== undefined ? (
        <Notice tone="success" className="mb-4">
          Sent {String(sp.invites)} calendar invite(s) with .ics attachments. See the outbox.
        </Notice>
      ) : null}
      {conflicts.length ? (
        <Notice tone="warning" className="mb-4">
          <p className="font-medium">
            {conflicts.length} scheduling conflict{conflicts.length === 1 ? "" : "s"} detected
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {conflicts.slice(0, 4).map((conflict, index) => (
              <li key={index}>{conflict.detail}</li>
            ))}
          </ul>
          <Link href={`${base}?view=conflicts`} className="mt-1 inline-block text-sm underline">
            Open the conflicts view
          </Link>
        </Notice>
      ) : null}
      {pending.length ? (
        <Notice tone="info" className="mb-4">
          {pending.length} scheduling change{pending.length === 1 ? "" : "s"} not yet published.
          Organizers see them now; attendees see them after you publish.
        </Notice>
      ) : null}

      <SubNav
        current={`${base}?view=${view}&day=${day}`}
        items={VIEWS.map((v) => ({
          href: `${base}?view=${v}&day=${day}`,
          label: v.charAt(0).toUpperCase() + v.slice(1),
          count: v === "conflicts" ? conflicts.length : undefined,
        }))}
      />

      {days.length ? (
        <div className="mb-4 flex flex-wrap gap-1">
          {days.map((d, index) => (
            <Link
              key={d}
              href={`${base}?view=${view}&day=${d}`}
              className={
                d === day
                  ? "rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                  : "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              }
            >
              {`Day ${index + 1}`}
              <span className={d === day ? "ml-1.5 text-xs text-slate-300" : "ml-1.5 text-xs text-slate-500"}>
                {formatDate(d)}
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      {view === "rooms" ? (
        <AgendaBoard
          slug={slug}
          day={day}
          rooms={rooms.map((room) => ({ id: room.id, name: room.name }))}
          slots={slotsFor()}
          tray={trayItems}
          placed={placed}
          scheduleAction={scheduleAction}
        />
      ) : null}

      {view === "day" ? (
        <div className="space-y-4">
          <AgendaGrid rooms={rooms} blocks={blocks} emptyLabel="Nothing scheduled on this day." />
          <UnscheduledList slug={slug} tray={trayItems} />
        </div>
      ) : null}

      {view === "list" ? (
        <Card>
          <CardHeader
            title="All scheduled sessions"
            description={`${scheduled.length} scheduled · ${tray.length} still unplaced`}
          />
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Room</Th>
                <Th>Session</Th>
                <Th>Track</Th>
                <Th>Speakers</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {scheduled.map((session) => (
                <tr key={session.id}>
                  <Td className="whitespace-nowrap text-xs">
                    {formatRange(session.starts_at, session.ends_at)}
                  </Td>
                  <Td className="text-sm">{session.room_name ?? "—"}</Td>
                  <Td>
                    <Link
                      href={`/admin/e/${slug}/submissions/${session.id}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {session.title}
                    </Link>
                  </Td>
                  <Td>
                    {session.track_name ? (
                      <Chip color={session.track_color}>{session.track_name}</Chip>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td className="text-sm">{session.speakers ?? "—"}</Td>
                  <Td>
                    {conflicted.has(session.id) ? (
                      <Chip tone="red">Conflict</Chip>
                    ) : session.pub_published_at ? (
                      <Chip tone="green">Published</Chip>
                    ) : (
                      <Chip tone="amber">Unpublished</Chip>
                    )}
                  </Td>
                </tr>
              ))}
              {!scheduled.length ? (
                <tr>
                  <Td colSpan={6} className="py-8 text-center text-slate-500">
                    Nothing scheduled yet — drag sessions onto the Rooms view.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
          <div className="border-t border-slate-200 p-4">
            <UnscheduledList slug={slug} tray={trayItems} />
          </div>
        </Card>
      ) : null}

      {view === "week" || view === "month" ? (
        <Card>
          <CardHeader
            title={view === "week" ? "Week view" : "Month view"}
            description="Every day of the event side by side."
          />
          <div className="grid gap-4 p-4 md:grid-cols-3">
            {days.map((d) => (
              <div key={d}>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">
                  {formatDate(d, { weekday: true })}
                </h3>
                <ul className="space-y-2">
                  {scheduled
                    .filter((s) => dateOf(s.starts_at) === d)
                    .map((s) => (
                      <li
                        key={s.id}
                        className="rounded-md border border-slate-200 p-2 text-sm"
                        style={{ borderLeft: `4px solid ${s.track_color ?? "#94a3b8"}` }}
                      >
                        <p className="font-medium text-slate-800">{s.title}</p>
                        <p className="text-xs text-slate-500">
                          {formatRange(s.starts_at, s.ends_at)}
                          {s.room_name ? ` · ${s.room_name}` : ""}
                        </p>
                      </li>
                    ))}
                  {!scheduled.some((s) => dateOf(s.starts_at) === d) ? (
                    <li className="text-xs text-slate-400">Nothing scheduled.</li>
                  ) : null}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {view === "conflicts" ? (
        <Card>
          <CardHeader
            title="Conflicts"
            description="Speaker double-bookings are advisory; room clashes are blocked at placement time."
          />
          {conflicts.length ? (
            <ul className="divide-y divide-slate-100">
              {conflicts.map((conflict, index) => (
                <li key={index} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <Chip tone={conflict.kind === "room" ? "red" : "amber"}>
                      {conflict.kind === "room" ? "Room clash" : "Speaker double-booking"}
                    </Chip>
                    <p className="mt-1 text-sm text-slate-800">{conflict.detail}</p>
                  </div>
                  <div className="flex gap-2">
                    {conflict.submissionIds.map((submissionId) => (
                      <LinkButton
                        key={submissionId}
                        href={`/admin/e/${slug}/submissions/${submissionId}`}
                        size="sm"
                      >
                        Open session
                      </LinkButton>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-emerald-700">
              No conflicts. Every speaker and every room is free at the times you have chosen.
            </p>
          )}
        </Card>
      ) : null}

      <Card className="mt-5">
        <CardHeader
          title="Publishing"
          description={
            published
              ? `Last published ${formatStamp(published.created_at)}`
              : "The agenda has never been published."
          }
        />
        <div className="p-4">
          {pending.length ? (
            <>
              <p className="text-sm font-medium text-slate-800">
                {pending.length} change{pending.length === 1 ? "" : "s"} since the last publish
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {pending.slice(0, 10).map((change) => (
                  <li key={change.submissionId}>
                    <strong className="text-slate-800">{change.title}</strong>: {change.before} →{" "}
                    {change.after}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              The published agenda matches your working schedule.
            </p>
          )}
          {published ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium text-brand-700">
                What changed in the last publish
              </summary>
              <ul className="mt-1 space-y-1 text-sm text-slate-600">
                {readJson<Array<{ title: string; before: string; after: string }>>(
                  published.summary,
                  [],
                ).map((change, index) => (
                  <li key={index}>
                    <strong className="text-slate-800">{change.title}</strong>: {change.before} →{" "}
                    {change.after}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          <div className="mt-3 flex gap-2">
            <form action={publishAgendaAction}>
              <input type="hidden" name="slug" value={slug} />
              <Button type="submit" variant="primary">
                Publish agenda
              </Button>
            </form>
            <LinkButton href={`/e/${event.slug}/agenda`}>View public agenda</LinkButton>
          </div>
        </div>
      </Card>
    </div>
  );
}

function UnscheduledList({ slug, tray }: { slug: string; tray: TrayItem[] }) {
  if (!tray.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">
        Unscheduled ({tray.length})
      </h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {tray.map((item) => (
          <li key={item.id}>
            <Link
              href={`/admin/e/${slug}/submissions/${item.id}`}
              className="inline-block rounded-md border border-slate-200 px-2.5 py-1.5 text-xs hover:border-brand-300"
              style={{ borderLeft: `4px solid ${item.trackColor ?? "#94a3b8"}` }}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
