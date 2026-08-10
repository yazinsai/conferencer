import { requireEventRole } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { saveEventSettingsAction } from "./actions";
import { SettingsNav } from "./settings-nav";

const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Bahrain",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-slate-600">Configure event details, tracks, formats, and rooms.</p>
      </div>

      <SettingsNav slug={slug} active="" />

      <Card>
        <CardHeader title="Event details" subtitle="Name, dates, location, and branding" />
        <CardBody>
          <form action={saveEventSettingsAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="slug" value={slug} />
            <label className="text-sm md:col-span-2">
              Event name
              <Input name="name" defaultValue={event.name} required className="mt-1" />
            </label>
            <label className="text-sm">
              URL slug
              <Input name="eventSlug" defaultValue={event.slug} required className="mt-1" />
              <span className="mt-1 block text-xs text-slate-500">
                Public URLs use /e/{event.slug}/…
              </span>
            </label>
            <label className="text-sm">
              Type
              <Select name="type" defaultValue={event.type} className="mt-1">
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="workshop">Workshop</option>
                <option value="summit">Summit</option>
              </Select>
            </label>
            <label className="text-sm md:col-span-2">
              Website URL
              <Input name="websiteUrl" type="url" defaultValue={event.websiteUrl ?? ""} className="mt-1" />
            </label>
            <label className="text-sm md:col-span-2">
              Location
              <Input name="location" defaultValue={event.location ?? ""} className="mt-1" />
            </label>
            <label className="text-sm">
              Timezone
              <Select name="timezone" defaultValue={event.timezone} className="mt-1">
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </Select>
            </label>
            <div />
            <label className="text-sm">
              Starts at
              <Input
                name="startsAt"
                type="datetime-local"
                defaultValue={toDatetimeLocal(event.startsAt)}
                className="mt-1"
              />
            </label>
            <label className="text-sm">
              Ends at
              <Input
                name="endsAt"
                type="datetime-local"
                defaultValue={toDatetimeLocal(event.endsAt)}
                className="mt-1"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Theme / description
              <Textarea name="theme" rows={4} defaultValue={event.theme ?? ""} className="mt-1" />
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Save event settings</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
