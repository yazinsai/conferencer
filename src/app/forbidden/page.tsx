import { ButtonLink } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">403 — Forbidden</h1>
      <p className="text-slate-600">You do not have access to that resource.</p>
      <div className="flex gap-2">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/sign-in" variant="secondary">
          Sign in
        </ButtonLink>
      </div>
    </div>
  );
}
