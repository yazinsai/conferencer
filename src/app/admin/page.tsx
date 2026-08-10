import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { listOrganizerEventsForUser } from "@/lib/events/create-event";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default async function AdminIndexPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?next=/admin");

  const db = getDb();
  const events = listOrganizerEventsForUser(db, user.id);

  if (events.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-8">
        <h1 className="text-2xl font-semibold">No events yet</h1>
        <p className="text-slate-600">
          Create your first event to start managing submissions, speakers, and the agenda.
        </p>
        <ButtonLink href="/admin/events/new">Create event</ButtonLink>
      </div>
    );
  }

  if (events.length === 1) {
    redirect(`/admin/e/${events[0].slug}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Your events</h1>
          <p className="text-slate-600">Select an event to open its admin workspace.</p>
        </div>
        <ButtonLink href="/admin/events/new">Create event</ButtonLink>
      </div>

      <Card>
        <CardHeader title="Events" subtitle={`${events.length} organizer workspaces`} />
        <CardBody className="p-0">
          <ul className="divide-y divide-slate-100">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/admin/e/${event.slug}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"
                >
                  <div>
                    <div className="font-medium text-slate-900">{event.name}</div>
                    <div className="text-sm text-slate-500">/admin/e/{event.slug}</div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {event.startsAt.slice(0, 10)} — {event.endsAt.slice(0, 10)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
