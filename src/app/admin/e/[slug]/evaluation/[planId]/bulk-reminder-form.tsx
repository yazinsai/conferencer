"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { sendBulkReminderAction } from "../actions";

type ReminderState = {
  sent?: number;
  error?: string;
};

async function reminderAction(_prev: ReminderState, formData: FormData): Promise<ReminderState> {
  try {
    const result = await sendBulkReminderAction(formData);
    return { sent: result.sent };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Send failed" };
  }
}

type ReviewerOption = {
  userId: string;
  name: string;
  email: string;
  pending: number;
};

export function BulkReminderForm({
  slug,
  planId,
  roundId,
  reviewers,
}: {
  slug: string;
  planId: string;
  roundId: string;
  reviewers: ReviewerOption[];
}) {
  const [state, formAction, pending] = useActionState(reminderAction, {});
  const withPending = reviewers.filter((r) => r.pending > 0);

  if (withPending.length === 0) {
    return <p className="text-sm text-slate-500">No reviewers with outstanding assignments.</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="roundId" value={roundId} />
      <p className="text-sm text-slate-600">
        Select reviewers to receive an evaluation reminder email.
      </p>
      <ul className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-3 text-sm">
        {withPending.map((r) => (
          <li key={r.userId}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="reviewerUserIds"
                value={r.userId}
                defaultChecked
                className="rounded"
              />
              <span>
                {r.name} · {r.email}{" "}
                <span className="text-slate-500">({r.pending} pending)</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.sent != null ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Sent {state.sent} reminder email(s).
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reminders"}
      </Button>
    </form>
  );
}
