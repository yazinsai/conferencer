import Link from "next/link";
import { redirect } from "next/navigation";

import { defaultEvent, listEvents } from "@/lib/repo/events";
import { Card, LinkButton } from "@/components/ui";
import { formatEventDates } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const event = defaultEvent();
  if (event) redirect(`/e/${event.slug}`);

  const events = listEvents();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Conferencer</h1>
      <p className="mt-2 text-slate-600">
        Open-source conference program management: call for speakers, review workflows, a
        self-service speaker portal, agenda building and public schedule widgets.
      </p>

      {events.length ? (
        <ul className="mt-8 space-y-3">
          {events.map((e) => (
            <li key={e.id}>
              <Card className="p-4">
                <Link href={`/e/${e.slug}`} className="font-semibold text-slate-900 hover:text-brand-700">
                  {e.name}
                </Link>
                <p className="text-sm text-slate-500">
                  {formatEventDates(e.starts_at, e.ends_at)}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="mt-8 p-6">
          <h2 className="text-lg font-semibold text-slate-900">No events yet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Run <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">npm run seed</code>{" "}
            to load the demo event, or create an account and set one up.
          </p>
          <div className="mt-4 flex gap-2">
            <LinkButton href="/sign-up" variant="primary">
              Create an account
            </LinkButton>
            <LinkButton href="/sign-in">Sign in</LinkButton>
          </div>
        </Card>
      )}
    </div>
  );
}
