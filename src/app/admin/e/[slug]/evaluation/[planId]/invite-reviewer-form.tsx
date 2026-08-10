"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { inviteReviewerAction } from "../actions";
import { CopyUrlButton } from "../../forms/[formId]/edit/copy-url-button";

type InviteState = {
  setPasswordUrl?: string;
  error?: string;
};

async function inviteAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  try {
    const result = await inviteReviewerAction(formData);
    return { setPasswordUrl: result.setPasswordUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invite failed" };
  }
}

export function InviteReviewerForm({ slug, planId }: { slug: string; planId: string }) {
  const [state, formAction, pending] = useActionState(inviteAction, {});

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-medium text-slate-700">Invite by email</h3>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="planId" value={planId} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input name="email" type="email" required placeholder="reviewer@example.com" />
          </div>
          <div>
            <Label>First name</Label>
            <Input name="firstName" placeholder="Sam" />
          </div>
          <div>
            <Label>Last name</Label>
            <Input name="lastName" placeholder="Reviewer" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sendEmail" className="rounded" />
          Send evaluation invite email
        </label>
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Inviting…" : "Create invite"}
        </Button>
      </form>
      {state.setPasswordUrl ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-slate-600">Share this set-password link:</p>
          <CopyUrlButton url={state.setPasswordUrl} />
        </div>
      ) : null}
    </div>
  );
}
