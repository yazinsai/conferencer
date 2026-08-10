import { setPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Set password"
          subtitle="Use this invite link to activate your reviewer account."
        />
        <CardBody>
          {sp.error ? (
            <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {sp.error}
            </p>
          ) : null}
          <form action={setPasswordAction} className="space-y-4">
            <input type="hidden" name="token" value={sp.token ?? ""} />
            <div>
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            <Button type="submit" className="w-full">
              Save password & continue
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
