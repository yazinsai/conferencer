import { setPasswordAction } from "../../actions";
import { Button, Card, Field, FormError, Input, Notice } from "@/components/ui";
import { findInvite } from "@/lib/auth";
import { getEvent } from "@/lib/repo/events";

export const metadata = { title: "Set your password" };
export const dynamic = "force-dynamic";

export default async function SetPasswordPage({
  params,
  searchParams,
}: PageProps<"/set-password/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : null;
  const invite = findInvite(token);

  if (!invite) {
    return (
      <Card className="p-6">
        <h1 className="text-lg font-semibold text-slate-900">Invitation not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          This link is not valid. Ask the organizer for a new invitation, or{" "}
          <a href="/sign-in" className="font-medium text-brand-700 hover:underline">
            sign in
          </a>{" "}
          if you already have an account.
        </p>
      </Card>
    );
  }

  const event = invite.event_id ? getEvent(invite.event_id) : undefined;

  return (
    <Card className="p-6">
      <h1 className="text-lg font-semibold text-slate-900">Set your password</h1>
      <p className="mt-1 text-sm text-slate-600">
        You have been invited{event ? ` to ${event.name}` : ""} as a{" "}
        <strong>{invite.role}</strong>.
      </p>
      <Notice tone="info" className="mt-3">
        Signing in as <span className="font-mono">{invite.email}</span>
      </Notice>
      <form action={setPasswordAction} className="mt-5 space-y-4">
        <input type="hidden" name="token" value={token} />
        {error ? <FormError>{error}</FormError> : null}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" name="first_name">
            <Input id="first_name" name="first_name" autoComplete="given-name" />
          </Field>
          <Field label="Last name" name="last_name">
            <Input id="last_name" name="last_name" autoComplete="family-name" />
          </Field>
        </div>
        <Field label="Choose a password" name="password" required hint="At least 8 characters.">
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            required
            autoFocus
          />
        </Field>
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Set password and continue
        </Button>
      </form>
    </Card>
  );
}
