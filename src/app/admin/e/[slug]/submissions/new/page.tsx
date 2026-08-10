import { requireOrganizer } from "@/lib/guards";
import { listLookup } from "@/lib/repo/events";
import { createSubmissionAction } from "../actions";
import {
  Button,
  Card,
  Field,
  FormError,
  Input,
  LinkButton,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { SUBMISSION_STATUSES, STATUS_LABELS } from "@/lib/repo/submissions";
import { dateOf } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function NewSubmissionPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/submissions/new">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const kind = sp.kind === "session" ? "session" : "abstract";
  const error = typeof sp.error === "string" ? sp.error : null;

  const tracks = listLookup("tracks", event.id);
  const formats = listLookup("formats", event.id);
  const rooms = listLookup("rooms", event.id);
  const levels = listLookup("levels", event.id);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={kind === "session" ? "Add session" : "Add abstract"}
        description={
          kind === "session"
            ? "For programme items that never go through the call for speakers — sponsor slots, keynotes, invited talks."
            : "Record a proposal that arrived outside the form."
        }
        actions={<LinkButton href={`/admin/e/${slug}/submissions`}>Cancel</LinkButton>}
      />
      <Card className="p-5">
        <form action={createSubmissionAction} className="space-y-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="kind" value={kind} />
          {error ? <FormError>{error}</FormError> : null}

          <Field label="Title" name="title" required>
            <Input id="title" name="title" required autoFocus />
          </Field>
          <Field label="Abstract / description" name="description">
            <Textarea id="description" name="description" rows={6} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Track" name="track_id">
              <Select id="track_id" name="track_id">
                <option value="">—</option>
                {tracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Format" name="format_id">
              <Select id="format_id" name="format_id">
                <option value="">—</option>
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Level" name="level">
              <Select id="level" name="level">
                <option value="">—</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <fieldset className="rounded-md border border-slate-200 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">Speaker</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="speaker_name">
                <Input id="speaker_name" name="speaker_name" placeholder="Ada Lovelace" />
              </Field>
              <Field
                label="Email"
                name="speaker_email"
                hint="Used to link their speaker portal."
              >
                <Input id="speaker_email" name="speaker_email" type="email" />
              </Field>
              <Field label="Job title" name="speaker_title">
                <Input id="speaker_title" name="speaker_title" />
              </Field>
              <Field label="Company" name="speaker_company">
                <Input id="speaker_company" name="speaker_company" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="rounded-md border border-slate-200 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">
              Status and scheduling
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" name="status">
                <Select id="status" name="status" defaultValue={kind === "session" ? "accepted" : "pending"}>
                  {SUBMISSION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Room" name="location_id">
                <Select id="location_id" name="location_id">
                  <option value="">Unassigned</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Starts at" name="starts_at">
                <Input
                  id="starts_at"
                  name="starts_at"
                  type="datetime-local"
                  min={`${dateOf(event.starts_at)}T00:00`}
                />
              </Field>
              <Field label="Ends at" name="ends_at">
                <Input id="ends_at" name="ends_at" type="datetime-local" />
              </Field>
            </div>
          </fieldset>

          <Button type="submit" variant="primary" size="lg">
            Create {kind}
          </Button>
        </form>
      </Card>
    </div>
  );
}
