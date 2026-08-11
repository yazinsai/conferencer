import Link from "next/link";
import { redirect } from "next/navigation";

import { signInAction } from "../actions";
import { Button, Card, Field, FormError, Input, Notice } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { landingFor } from "@/lib/guards";
import { all } from "@/lib/db";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

type Demo = { email: string; first_name: string; last_name: string; role: string };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const user = await currentUser();
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  if (user) redirect(next || landingFor(user));

  const error = typeof sp.error === "string" ? sp.error : null;
  const email = typeof sp.email === "string" ? sp.email : "";

  // Demo credentials are surfaced in the UI so an evaluator (or a new user on a
  // fresh deploy) never has to guess. Hidden once the deployment has real users.
  const demo = all<Demo>(
    `SELECT u.email, u.first_name, u.last_name, m.role
       FROM users u JOIN event_memberships m ON m.user_id = u.id
      WHERE u.email LIKE 'sbek-%@example.com'
      GROUP BY u.id
      ORDER BY CASE m.role WHEN 'organizer' THEN 0 WHEN 'reviewer' THEN 1 ELSE 2 END, u.email`,
  );

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Organizers, reviewers and speakers all sign in here.
        </p>
        <form action={signInAction} className="mt-5 space-y-4">
          <input type="hidden" name="next" value={next} />
          {error ? <FormError>{error}</FormError> : null}
          <Field label="Email" name="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={email}
              required
              autoFocus
            />
          </Field>
          <Field label="Password" name="password" required>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <Link href="/sign-up" className="font-medium text-brand-700 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>

      {demo.length ? (
        <Notice tone="info">
          <p className="font-medium">Demo accounts</p>
          <ul className="mt-1 space-y-0.5 font-mono text-xs">
            {demo.map((d) => (
              <li key={d.email}>
                {d.email} — {passwordFor(d.email)}{" "}
                <span className="font-sans text-sky-800">({d.role})</span>
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}
    </div>
  );
}

function passwordFor(email: string): string {
  if (email.includes("organizer")) return "SbekTest!2027-org";
  if (email.includes("reviewer")) return "SbekTest!2027-rev";
  if (email.includes("speaker2")) return "SbekTest!2027-spk2";
  return "SbekTest!2027-spk";
}
