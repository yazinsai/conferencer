import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { contactName, listRoster } from "@/lib/repo/contacts";
import { SPEAKER_STATUSES, speakerStatusTone } from "@/lib/status";
import { submissionsForContact } from "@/lib/repo/submissions";
import { taskProgress } from "@/lib/repo/tasks";
import { invitePortalAction, setSpeakerStatusAction } from "@/server/speaker-actions";
import { FilterSelect, SearchBox, CopyButton } from "@/components/client/basics";
import { SpeakersSelectionStatus } from "@/components/admin/speakers-bulk-status";
import {
  Avatar,
  Button,
  Chip,
  LinkButton,
  Notice,
  PageHeader,
  Select,
  Table,
  Td,
  Th,
  cx,
} from "@/components/ui";

export const dynamic = "force-dynamic";

const BULK_FORM_ID = "speakers-bulk-form";

function TaskMeter({
  done,
  total,
  overdue,
}: {
  done: number;
  total: number;
  overdue: number;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const complete = total > 0 && done === total;
  const hasOverdue = overdue > 0;
  const barClass = complete
    ? "bg-positive"
    : hasOverdue
      ? "bg-warn"
      : total === 0
        ? "bg-rule-2"
        : "bg-neutral";
  const labelClass = complete
    ? "text-positive"
    : hasOverdue
      ? "text-warn"
      : "text-muted-foreground";

  return (
    <div className="min-w-[8.5rem]">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-paper-3"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={Math.max(total, 1)}
        aria-label={
          total === 0
            ? "No tasks"
            : `${done} of ${total} tasks${hasOverdue ? `, ${overdue} overdue` : ""}`
        }
      >
        <div className={cx("h-full", barClass)} style={{ width: `${total === 0 ? 0 : pct}%` }} />
      </div>
      <span className={cx("mt-1 block text-xs wordmark tnum", labelClass)}>
        {total === 0
          ? "No tasks"
          : `${done} of ${total}${hasOverdue ? ` · ${overdue} overdue` : ""}`}
      </span>
    </div>
  );
}

export default async function SpeakersPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/speakers">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);

  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : "");
  const q = str("q");
  const status = str("status");
  const trackId = str("track");
  const completion = str("completion");

  const tracks = listLookup("tracks", event.id);
  let roster = listRoster(event.id, { q, status, trackId });
  const total = listRoster(event.id).length;

  const enriched = roster.map((row) => ({
    row,
    sessions: submissionsForContact(event.id, row.id),
    progress: taskProgress(event.id, row.id),
  }));
  const filtered = completion
    ? enriched.filter((entry) =>
        completion === "complete"
          ? entry.progress.total > 0 && entry.progress.done === entry.progress.total
          : entry.progress.done < entry.progress.total,
      )
    : enriched;
  roster = filtered.map((entry) => entry.row);

  return (
    <div>
      <PageHeader
        title="Speakers"
        description="Everyone on the programme, their sessions, and how far through onboarding they are."
        actions={
          <>
            <LinkButton href={`/admin/e/${slug}/speakers/import`} size="sm">
              Import CSV
            </LinkButton>
            <LinkButton href={`/admin/e/${slug}/emails/compose`} size="sm">
              Bulk email
            </LinkButton>
            <LinkButton href={`/admin/e/${slug}/speakers/new`} size="sm" variant="primary">
              Add speaker
            </LinkButton>
          </>
        }
      />

      {sp.invited ? (
        <Notice tone="success" className="mb-4">
          Sent {String(sp.invited)} portal invitation(s) — each one is in the outbox.
          {sp.invite ? (
            <span className="ml-2 inline-flex items-center gap-2">
              <code className="rounded bg-paper px-2 py-0.5 font-mono text-xs">
                /set-password/{String(sp.invite)}
              </code>
              <CopyButton value={`/set-password/${String(sp.invite)}`} label="Copy invite link" />
            </span>
          ) : null}
        </Notice>
      ) : null}
      {sp.created || sp.updated ? (
        <Notice tone="success" className="mb-4">
          Import complete: {String(sp.created ?? 0)} created, {String(sp.updated ?? 0)} updated,{" "}
          {String(sp.skipped ?? 0)} skipped.
        </Notice>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox
          param="q"
          label="Search speakers"
          placeholder="Search name, email or company…"
          className="w-full sm:w-72"
        />
        <FilterSelect
          param="status"
          label="Status"
          allLabel="Any status"
          options={SPEAKER_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <FilterSelect
          param="track"
          label="Track"
          allLabel="Any track"
          options={tracks.map((t) => ({ value: t.id, label: t.name }))}
        />
        <FilterSelect
          param="completion"
          label="Tasks"
          allLabel="Any"
          options={[
            { value: "complete", label: "All complete" },
            { value: "outstanding", label: "Outstanding" },
          ]}
        />
        {q || status || trackId || completion ? (
          <LinkButton href={`/admin/e/${slug}/speakers`} size="sm">
            Clear
          </LinkButton>
        ) : null}
        <span className="text-sm text-muted-foreground" role="status">
          Showing <strong className="wordmark tnum text-ink">{roster.length}</strong> of{" "}
          <span className="wordmark tnum">{total}</span> speakers
        </span>
      </div>

      <form id={BULK_FORM_ID} className="space-y-3">
        <input type="hidden" name="slug" value={slug} />

        <div className="flex flex-wrap items-center gap-3 rounded-card border border-rule bg-paper-2 px-3 py-2">
          <SpeakersSelectionStatus formId={BULK_FORM_ID} />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              formAction={invitePortalAction}
            >
              Send portal invite
            </Button>
            <label htmlFor="bulk-speaker-status" className="sr-only">
              New status
            </label>
            <Select
              id="bulk-speaker-status"
              name="speaker_status"
              className="w-36"
              defaultValue="confirmed"
              aria-label="New status"
            >
              {SPEAKER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button type="submit" size="sm" formAction={setSpeakerStatusAction}>
              Set status
            </Button>
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th className="w-8" />
              <Th className="min-w-[14rem]">Speaker</Th>
              <Th>Status</Th>
              <Th className="min-w-[10rem]">Tasks</Th>
              <Th className="w-20">Sessions</Th>
              <Th className="min-w-[12rem]">Email</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ row, sessions, progress }) => {
              const titleLine = [row.job_title, row.company].filter(Boolean).join(" · ");
              return (
                <tr key={row.id}>
                  <Td>
                    <input
                      type="checkbox"
                      name="contact_ids"
                      value={row.id}
                      aria-label={`Select ${contactName(row)}`}
                    />
                  </Td>
                  <Td>
                    <div className="flex min-w-0 items-start gap-2.5">
                      <Avatar src={row.headshot_url} name={contactName(row)} size={32} />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/e/${slug}/speakers/${row.id}`}
                          className="font-medium text-ink hover:text-signal"
                        >
                          {contactName(row)}
                        </Link>
                        {titleLine ? (
                          <p className="mt-0.5 text-sm text-neutral">{titleLine}</p>
                        ) : (
                          <p className="mt-0.5 text-sm text-muted-foreground">—</p>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Chip tone={speakerStatusTone(row.speaker_status)}>{row.speaker_status}</Chip>
                  </Td>
                  <Td>
                    <TaskMeter
                      done={progress.done}
                      total={progress.total}
                      overdue={progress.overdue}
                    />
                  </Td>
                  <Td className="wordmark tnum text-sm text-muted-foreground">
                    {sessions.length}
                  </Td>
                  <Td className="text-sm text-muted-foreground">{row.email}</Td>
                </tr>
              );
            })}
            {!filtered.length ? (
              <tr>
                <Td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No speakers match those filters.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </form>
    </div>
  );
}
