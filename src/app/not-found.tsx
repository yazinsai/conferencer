import Link from "next/link";

import { defaultEvent } from "@/lib/repo/events";

export default function NotFound() {
  const event = defaultEvent();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        That page does not exist, or it belongs to a record you cannot see.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
        <Link
          href="/demo"
          className="rounded-md border border-brand-600 bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700"
        >
          Enter the live product
        </Link>
        <Link
          href="/"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium hover:bg-slate-50"
        >
          Conferencer home
        </Link>
        {event ? (
          <Link
            href={`/e/${event.slug}`}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium hover:bg-slate-50"
          >
            Public event site
          </Link>
        ) : null}
      </div>
    </div>
  );
}
