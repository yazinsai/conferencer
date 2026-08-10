import Link from "next/link";
import { redirect } from "next/navigation";

import { signUpAction } from "../actions";
import { Button, Card, Field, FormError, Input } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { landingFor } from "@/lib/guards";

export const metadata = { title: "Sign up" };
export const dynamic = "force-dynamic";

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const user = await currentUser();
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  if (user) redirect(next || landingFor(user));

  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : "");

  return (
    <Card className="p-6">
      <h1 className="text-lg font-semibold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600">
        No email confirmation required — you can submit a talk straight away.
      </p>
      <form action={signUpAction} className="mt-5 space-y-4">
        <input type="hidden" name="next" value={next} />
        {str("error") ? <FormError>{str("error")}</FormError> : null}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" name="first_name" required>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={str("first_name")}
              autoComplete="given-name"
              required
            />
          </Field>
          <Field label="Last name" name="last_name" required>
            <Input
              id="last_name"
              name="last_name"
              defaultValue={str("last_name")}
              autoComplete="family-name"
              required
            />
          </Field>
        </div>
        <Field label="Email" name="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={str("email")}
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Password" name="password" required hint="At least 8 characters.">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        <Button type="submit" variant="primary" size="lg" className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
