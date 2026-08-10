import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-red-600">403</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-2 text-sm text-slate-600">
        You are signed in, but this page belongs to a different role or a different
        person&apos;s records. Speakers use the portal, reviewers use the review area, and
        organizers use the admin area.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
        <Link
          href="/portal"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium hover:bg-slate-50"
        >
          Speaker portal
        </Link>
        <Link
          href="/review"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium hover:bg-slate-50"
        >
          Review area
        </Link>
        <Link
          href="/"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium hover:bg-slate-50"
        >
          Public site
        </Link>
      </div>
    </div>
  );
}
