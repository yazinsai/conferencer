import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">401</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Please sign in</h1>
      <p className="mt-2 text-sm text-slate-600">
        This page needs an account. Public schedules, speakers and the call for speakers are
        readable without signing in.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
        <Link
          href="/demo"
          className="rounded-md border border-brand-600 bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700"
        >
          Enter the live product
        </Link>
        <Link
          href="/sign-in"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium hover:bg-slate-50"
        >
          Sign in with a password
        </Link>
        <Link
          href="/sign-up"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium hover:bg-slate-50"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
