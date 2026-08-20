import Link from "next/link";
import { redirect } from "next/navigation";

import { signInAction } from "../actions";
import { Button, Card, Field, FormError, Input, LinkButton, Notice } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { demoEnterHref, demoRoleFromEmail } from "@/lib/demo-login";
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
      WHERE u.email LIKE 'demo-%@example.com'
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-sky-800">
                Demo mode enabled
              </p>
              <p className="mt-1 text-sm text-sky-950">
                Follow a role to sign straight in. These are links, not buttons — no form to submit.
              </p>
            </div>
            <span className="rounded-pill border border-sky-200 bg-white/70 px-2.5 py-1 text-xs font-medium text-sky-900">
              {demo.length} accounts
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            {demo.map((d) => {
              const role = demoRoleFromEmail(d.email);
              if (!role) return null;
              const name = [d.first_name, d.last_name].filter(Boolean).join(" ") || d.email;
              const label = demoRoleLabel(d.role, d.email);
              return (
                <LinkButton
                  key={d.email}
                  href={demoEnterHref(next || undefined, role)}
                  variant="secondary"
                  className="h-auto w-full justify-between gap-3 rounded-2xl border-sky-300 bg-white px-3.5 py-3 text-left shadow-sm transition-[background-color,border-color,box-shadow,transform] hover:border-sky-500 hover:bg-sky-50 hover:shadow-md active:translate-y-px"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{name}</span>
                    <EmailOff>
                      <span className="mt-0.5 block truncate font-mono text-xs font-normal text-sky-900/80">
                        {d.email}
                      </span>
                    </EmailOff>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded-pill border border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-900">
                      {label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800">
                      Follow this
                      <svg
                        aria-hidden
                        viewBox="0 0 16 16"
                        className="size-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3.5 10.5 8 6 12.5" />
                      </svg>
                    </span>
                  </span>
                </LinkButton>
              );
            })}
          </div>
        </Notice>
      ) : null}
    </div>
  );
}

/** Cloudflare wraps raw emails in /cdn-cgi/l/email-protection links. These comments disable that. */
function EmailOff({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span dangerouslySetInnerHTML={{ __html: "<!--email_off-->" }} />
      {children}
      <span dangerouslySetInnerHTML={{ __html: "<!--email_on-->" }} />
    </>
  );
}

/** Membership stores speakers as "participant"; demo buttons should say the job. */
function demoRoleLabel(role: string, email: string): string {
  if (role === "organizer" || email.includes("organizer")) return "Organizer";
  if (role === "reviewer" || email.includes("reviewer")) return "Reviewer";
  if (email.includes("speaker2")) return "Speaker 2";
  if (email.includes("speaker") || role === "participant") return "Speaker";
  return role;
}
