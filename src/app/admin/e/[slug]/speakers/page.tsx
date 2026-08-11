import Link from "next/link";

import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { contactName, listRoster } from "@/lib/repo/contacts";
import { SPEAKER_STATUSES, speakerStatusTone } from "@/lib/status";
import { submissionsForContact } from "@/lib/repo/submissions";
import { taskProgress } from "@/lib/repo/tasks";
import { invitePortalAction, setSpeakerStatusAction } from "@/server/speaker-actions";
import { FilterSelect, SearchBox, CopyButton } from "@/components/client/basics";
import {
  Avatar,
  Button,
  Chip,
  LinkButton,
  Notice,
  PageHeader,
  Progress,
  Select,
  Table,
  Td,
  Th,
} from "@/components/ui";

export const dynamic = "force-dynamic";

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
              <code className="rounded bg-white px-2 py-0.5 font-mono text-xs">
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

      <form action={invitePortalAction}>
        <input type="hidden" name="slug" value={slug} />

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
          <span className="text-sm text-slate-500" role="status">
            Showing <strong className="text-slate-800">{roster.length}</strong> of {total} speakers
          </span>
          <Button type="submit" size="sm" variant="secondary">
            Send portal invite to selected
          </Button>
        </div>

        <Table>
          <thead>
            <tr>
              <Th className="w-8" />
              <Th>Speaker</Th>
              <Th>Job title</Th>
              <Th>Company</Th>
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Sessions</Th>
              <Th>Tasks</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ row, sessions, progress }) => (
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
                  <div className="flex items-center gap-2">
                    <Avatar src={row.headshot_url} name={contactName(row)} size={32} />
                    <Link
                      href={`/admin/e/${slug}/speakers/${row.id}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {contactName(row)}
                    </Link>
                  </div>
                </Td>
                <Td className="text-sm">{row.job_title ?? "—"}</Td>
                <Td className="text-sm">{row.company ?? "—"}</Td>
                <Td className="text-xs">{row.email}</Td>
                <Td>
                  <Chip tone={speakerStatusTone(row.speaker_status)}>{row.speaker_status}</Chip>
                </Td>
                <Td className="text-sm">{sessions.length}</Td>
                <Td className="w-36">
                  <Progress value={progress.done} max={Math.max(progress.total, 1)} />
                  <span className="text-xs text-slate-500">
                    {progress.done}/{progress.total}
                    {progress.overdue ? ` · ${progress.overdue} overdue` : ""}
                  </span>
                </Td>
                <Td>
                  <Link
                    href={`/admin/e/${slug}/speakers/${row.id}`}
                    className="text-xs font-medium text-brand-700 hover:underline"
                  >
                    Open
                  </Link>
                </Td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <Td colSpan={9} className="py-8 text-center text-slate-500">
                  No speakers match those filters.
                </Td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </form>

      <div className="mt-4">
        <form action={setSpeakerStatusAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="slug" value={slug} />
          <div>
            <label htmlFor="bulk-contact" className="block text-xs font-medium text-slate-600">
              Quick status change
            </label>
            <Select id="bulk-contact" name="contact_id" className="w-64">
              {listRoster(event.id).map((row) => (
                <option key={row.id} value={row.id}>
                  {contactName(row)}
                </option>
              ))}
            </Select>
          </div>
          <Select name="speaker_status" className="w-40" aria-label="New status">
            {SPEAKER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Button type="submit">Set status</Button>
        </form>
      </div>
    </div>
  );
}
