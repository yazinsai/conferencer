import { ExternalLink } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminHeader({
  slug,
  userName,
}: {
  slug: string;
  userName: string;
}) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b bg-background px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <label className="sr-only" htmlFor="global-search">
          Search
        </label>
        <Input
          id="global-search"
          name="q"
          placeholder="Search submissions, speakers…"
          className="max-w-md"
        />
      </div>
      <div className="flex items-center gap-2">
        <ButtonLink href="/portal" variant="outline" size="sm">
          View Portal
        </ButtonLink>
        <ButtonLink href={`/e/${slug}/sessions`} variant="ghost" size="sm">
          <ExternalLink className="size-3.5" />
          Public site
        </ButtonLink>
        <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:inline">
          {userName}
        </span>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
