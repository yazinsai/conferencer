import Link from "next/link";

import { requireReviewer, roleSet } from "@/lib/guards";
import { fullName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReviewLayout({ children }: LayoutProps<"/review">) {
  const { user, event } = await requireReviewer();
  const roles = roleSet(user.id, event.id);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Review area
            </p>
            <Link href="/review" className="text-lg font-semibold text-slate-900">
              {event.name}
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{fullName(user)}</span>
            {roles.has("organizer") ? (
              <Link
                href="/admin"
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Back to Admin Mode
              </Link>
            ) : null}
            <form action="/sign-out" method="post">
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
