import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        That page does not exist, or it belongs to a record you cannot see.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Back to the event
      </Link>
    </div>
  );
}
