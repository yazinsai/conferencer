import Link from "next/link";

import { requireAnyOrganizer } from "@/lib/guards";
import { fullName } from "@/lib/auth";
import { CrmNav } from "@/components/crm/nav";

export const dynamic = "force-dynamic";

export default async function CrmLayout({ children }: LayoutProps<"/crm">) {
  const { user, event } = await requireAnyOrganizer();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Speaker CRM
              </p>
              <Link href="/crm" className="text-lg font-semibold text-slate-900">
                Organisation contacts
              </Link>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-600">{fullName(user)}</span>
              <Link
                href="/admin"
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Back to {event.name}
              </Link>
            </div>
          </div>
          <CrmNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
