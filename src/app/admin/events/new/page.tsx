import Link from "next/link";
import { requireAnyAuth } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { createEventAction } from "./actions";

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

function defaultDatetimeLocal(offsetDays: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function CreateEventPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAnyAuth("/admin/events/new");
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <div>
        <Link href="/admin" className="text-sm text-blue-700 hover:underline">
          ← Back to admin
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Create event</h1>
        <p className="text-slate-600">Set up a new conference or meetup workspace.</p>
      </div>

      {sp.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {sp.error}
        </div>
      ) : null}

      <Card>
        <CardHeader title="Event details" subtitle="You can change these later in Settings" />
        <CardBody>
          <form action={createEventAction} className="grid gap-4 md:grid-cols-2">
            <label className="text-sm md:col-span-2">
              Event name
              <Input name="name" required placeholder="DevFlow Conf 2028" className="mt-1" />
            </label>
            <label className="text-sm">
              URL slug
              <Input
                name="slug"
                placeholder="devflow-conf-2028"
                className="mt-1"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Leave blank to generate from the event name
              </span>
            </label>
            <label className="text-sm">
              Type
              <Select name="type" defaultValue="conference" className="mt-1">
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="workshop">Workshop</option>
                <option value="summit">Summit</option>
              </Select>
            </label>
            <label className="text-sm md:col-span-2">
              Website URL
              <Input name="websiteUrl" type="url" placeholder="https://example.com" className="mt-1" />
            </label>
            <label className="text-sm md:col-span-2">
              Location
              <Input name="location" placeholder="San Francisco, CA" className="mt-1" />
            </label>
            <label className="text-sm">
              Timezone
              <Select name="timezone" defaultValue="America/Los_Angeles" className="mt-1">
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
                defaultValue={defaultDatetimeLocal(90, 9)}
                required
                className="mt-1"
              />
            </label>
            <label className="text-sm">
              Ends at
              <Input
                name="endsAt"
                type="datetime-local"
                defaultValue={defaultDatetimeLocal(92, 18)}
                required
                className="mt-1"
              />
            </label>
            <label className="text-sm md:col-span-2">
              Theme / description
              <Textarea name="theme" rows={4} placeholder="Brief event description" className="mt-1" />
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Create event</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
