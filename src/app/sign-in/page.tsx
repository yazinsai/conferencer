import Link from "next/link";
import { signInAction } from "@/lib/auth/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="flex min-h-full items-center justify-center bg-muted/40 px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader title="Sign in" subtitle="Email + password for every role." />
        <CardBody>
          {sp.error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{sp.error}</AlertDescription>
            </Alert>
          ) : null}
          <form action={signInAction} className="space-y-4">
            <input type="hidden" name="next" value={sp.next ?? ""} />
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
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            No account?{" "}
            <Link
              href={`/sign-up${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
