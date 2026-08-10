import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import { listLookup } from "@/lib/repo/events";
import { EMBED_FORMATS, EMBED_TYPES, listEmbeds } from "@/lib/repo/embeds";
import {
  createEmbedAction,
  deleteEmbedAction,
  rotateEmbedTokenAction,
  updateEmbedAction,
} from "@/server/embed-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Select,
} from "@/components/ui";
import { ConfirmSubmit, CopyButton } from "@/components/client/basics";

export const dynamic = "force-dynamic";

export default async function EmbedsPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/embeds">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const embeds = listEmbeds(event.id);
  const tracks = listLookup("tracks", event.id);
  const formats = listLookup("formats", event.id);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Site &amp; embeds"
        description="Publish live event content to your own website. Every widget has a shareable URL and a copy-paste snippet."
        actions={<LinkButton href={`/e/${event.slug}`}>Open the public site</LinkButton>}
      />

      {sp.created ? <Notice tone="success" className="mb-4">Embed created.</Notice> : null}

      <Card className="mb-5">
        <CardHeader title="Public pages" description="These are live right now — no embedding needed." />
        <ul className="grid gap-2 p-4 sm:grid-cols-2">
          {[
            { href: `/e/${event.slug}/sessions`, label: "List of Sessions" },
            { href: `/e/${event.slug}/speakers`, label: "List of Speakers" },
            { href: `/e/${event.slug}/agenda`, label: "Agenda" },
            { href: `/e/${event.slug}/itinerary`, label: "Schedule Itinerary" },
            { href: `/e/${event.slug}/gallery`, label: "Speaker Gallery" },
            { href: `/e/${event.slug}/my-schedule`, label: "Personal schedule" },
          ].map((entry) => (
            <li key={entry.href} className="flex items-center justify-between gap-2 text-sm">
              <a href={entry.href} className="font-medium text-brand-700 hover:underline">
                {entry.label}
              </a>
              <CopyButton value={entry.href} label="Copy URL" />
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-4">
        {embeds.map((embed) => {
          const config = readJson<{ track?: string; format?: string; accent?: string }>(
            embed.config,
            {},
          );
          const base = `/e/${event.slug}/embed/${embed.token}`;
          const snippet = `<script src="${base}?format=styled_html" async></script>`;
          return (
            <Card key={embed.id}>
              <CardHeader
                title={embed.name}
                description={
                  <>
                    <Chip tone="slate">{embed.type}</Chip>{" "}
                    <Chip tone="blue">{embed.format}</Chip>
                  </>
                }
                actions={
                  <>
                    <form action={rotateEmbedTokenAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="embed_id" value={embed.id} />
                      <Button type="submit" size="sm">
                        Refresh cache / rotate URL
                      </Button>
                    </form>
                    <form action={deleteEmbedAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="embed_id" value={embed.id} />
                      <ConfirmSubmit message={`Delete the embed "${embed.name}"?`} variant="ghost">
                        Delete
                      </ConfirmSubmit>
                    </form>
                  </>
                }
              />
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Script tag (works on any site, no framework needed)
                  </p>
                  <div className="mt-1 flex items-start gap-2">
                    <code className="block flex-1 overflow-x-auto rounded bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100">
                      {snippet}
                    </code>
                    <CopyButton value={snippet} label="Copy snippet" />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Styled HTML", href: `${base}?format=styled_html` },
                    { label: "Plain HTML", href: `${base}?format=html` },
                    { label: "JSON", href: `${base}.json` },
                    { label: "XML", href: `${base}?format=xml` },
                    { label: "iCal", href: `${base}.ics` },
                  ].map((entry) => (
                    <div key={entry.label} className="flex items-center justify-between gap-2 text-sm">
                      <a href={entry.href} className="font-medium text-brand-700 hover:underline">
                        {entry.label}
                      </a>
                      <CopyButton value={entry.href} label="Copy URL" />
                    </div>
                  ))}
                </div>

                <form action={updateEmbedAction} className="grid gap-3 border-t border-slate-200 pt-3 sm:grid-cols-4">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="embed_id" value={embed.id} />
                  <Field label="Name" name={`name-${embed.id}`}>
                    <Input id={`name-${embed.id}`} name="name" defaultValue={embed.name} />
                  </Field>
                  <Field label="Widget" name={`type-${embed.id}`}>
                    <Select id={`type-${embed.id}`} name="type" defaultValue={embed.type}>
                      {EMBED_TYPES.map((entry) => (
                        <option key={entry.value} value={entry.value}>
                          {entry.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Default format" name={`format-${embed.id}`}>
                    <Select id={`format-${embed.id}`} name="format" defaultValue={embed.format}>
                      {EMBED_FORMATS.map((entry) => (
                        <option key={entry.value} value={entry.value}>
                          {entry.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Accent colour" name={`accent-${embed.id}`}>
                    <Input
                      id={`accent-${embed.id}`}
                      name="accent"
                      type="color"
                      defaultValue={config.accent ?? event.accent_color}
                      className="h-10 w-20 p-1"
                    />
                  </Field>
                  <Field label="Only this track" name={`track-${embed.id}`}>
                    <Select id={`track-${embed.id}`} name="track" defaultValue={config.track ?? ""}>
                      <option value="">All tracks</option>
                      {tracks.map((track) => (
                        <option key={track.id} value={track.id}>
                          {track.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Only this format" name={`sf-${embed.id}`}>
                    <Select id={`sf-${embed.id}`} name="session_format" defaultValue={config.format ?? ""}>
                      <option value="">All formats</option>
                      {formats.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <div className="flex items-end sm:col-span-2">
                    <Button type="submit" variant="primary">
                      Save embed
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-5">
        <CardHeader title="New embed" />
        <form action={createEmbedAction} className="grid gap-3 p-4 sm:grid-cols-4">
          <input type="hidden" name="slug" value={slug} />
          <Field label="Name" name="name" required>
            <Input id="new-name" name="name" placeholder="Website session list" required />
          </Field>
          <Field label="Widget" name="type">
            <Select id="new-type" name="type" defaultValue="sessions">
              {EMBED_TYPES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Format" name="format">
            <Select id="new-format" name="format" defaultValue="styled_html">
              {EMBED_FORMATS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" variant="primary">
              Create embed
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
