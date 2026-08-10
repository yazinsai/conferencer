import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function CrmHeader({
  userName,
  eventSlug,
}: {
  userName: string;
  eventSlug: string;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="text-sm text-slate-600">Organization CRM</div>
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/e/${eventSlug}/speakers`}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Event speakers
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
