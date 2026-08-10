import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function AdminHeader({
  slug,
  userName,
}: {
  slug: string;
  userName: string;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex flex-1 items-center gap-3">
        <label className="sr-only" htmlFor="global-search">
          Search
        </label>
        <input
          id="global-search"
          name="q"
          placeholder="Search submissions, speakers…"
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/portal"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View Portal
        </Link>
        <Link
          href={`/e/${slug}/sessions`}
          className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Public site
        </Link>
        <div className="text-sm text-slate-600">{userName}</div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
