import { requireOrganizer } from "@/lib/guards";
import { saveEventAction } from "@/server/settings-actions";
import {
  Button,
  Card,
  Field,
  Input,
  Notice,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";

export const dynamic = "force-dynamic";

const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
];

export default async function EventSettingsPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/settings/event">) {
  const { slug } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Event details"
        description="The public URL key, dates and branding for this event."
        breadcrumb={<a href={`/admin/e/${slug}/settings`}>Settings</a>}
      />
      {sp.saved ? <Notice tone="success" className="mb-4">Event details saved.</Notice> : null}
      <Card className="overflow-hidden p-0">
        <form action={saveEventAction}>
          <input type="hidden" name="slug" value={slug} />

          <fieldset className="space-y-4 px-5 py-5">
            <legend className="float-left mb-3 w-full text-sm font-semibold text-ink">
              Public identity
            </legend>
            <Field label="Event name" name="name" required>
              <Input id="name" name="name" defaultValue={event.name} required />
            </Field>
            <Field
              label="URL slug"
              name="event_slug"
              hint="The editable segment of the public path. Only the slug is saved."
              required
            >
              <div className="flex min-w-0 overflow-hidden rounded-input border border-input bg-background focus-within:border-ink-2 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring">
                <span
                  aria-hidden
                  className="flex shrink-0 items-center border-r border-rule bg-paper-2 px-3 text-sm text-muted-foreground"
                >
                  /e/
                </span>
                <Input
                  id="event_slug"
                  name="event_slug"
                  defaultValue={event.slug}
                  required
                  className="border-0 shadow-none focus-visible:border-transparent focus-visible:outline-none"
                />
              </div>
            </Field>
            <Field label="Tagline" name="tagline">
              <Input id="tagline" name="tagline" defaultValue={event.tagline ?? ""} />
            </Field>
            <Field label="Description / theme" name="theme">
              <Textarea id="theme" name="theme" rows={4} defaultValue={event.theme ?? ""} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event type" name="type">
                <Input id="type" name="type" defaultValue={event.type} />
              </Field>
              <Field label="Website" name="website_url">
                <Input id="website_url" name="website_url" defaultValue={event.website_url ?? ""} />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-rule bg-paper-2 px-5 py-5">
            <legend className="float-left mb-3 w-full text-sm font-semibold text-ink">
              Location and timing
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location" name="location">
                <Input id="location" name="location" defaultValue={event.location ?? ""} />
              </Field>
              <Field label="Timezone" name="timezone">
                <Select id="timezone" name="timezone" defaultValue={event.timezone}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Starts at" name="starts_at">
                <Input
                  id="starts_at"
                  name="starts_at"
                  type="datetime-local"
                  defaultValue={event.starts_at ?? ""}
                />
              </Field>
              <Field label="Ends at" name="ends_at">
                <Input
                  id="ends_at"
                  name="ends_at"
                  type="datetime-local"
                  defaultValue={event.ends_at ?? ""}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-rule px-5 py-5">
            <legend className="float-left mb-3 w-full text-sm font-semibold text-ink">
              Branding
            </legend>
            <Field label="Accent colour" name="accent_color">
              <Input
                id="accent_color"
                name="accent_color"
                type="color"
                defaultValue={event.accent_color}
                className="h-10 w-24 p-1"
              />
            </Field>
          </fieldset>

          <div className="border-t border-rule bg-paper-2 px-5 py-4">
            <Button type="submit" variant="primary" size="lg">
              Save event details
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
