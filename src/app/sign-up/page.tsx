import Link from "next/link";
import { signUpAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Sign up"
          subtitle="No email confirmation required — you're in immediately."
        />
        <CardBody>
          {sp.error ? (
            <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {sp.error}
            </p>
          ) : null}
          <form action={signUpAction} className="space-y-4">
            <input type="hidden" name="next" value={sp.next ?? ""} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{" "}
            <Link href={`/sign-in${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`} className="font-medium text-blue-600">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
