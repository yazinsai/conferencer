"use client";

import { useTransition } from "react";
import { updateSubmissionStatusAction } from "./actions";
import { statusBadgeClass, statusLabel } from "@/lib/domain/status";
import { Badge } from "@/components/ui/badge";

const STATUSES = [
  "draft",
  "pending",
  "accept_queue",
  "decline_queue",
  "accepted",
  "declined",
  "withdrawn",
] as const;

export function InlineStatus({
  slug,
  submissionId,
  status,
}: {
  slug: string;
  submissionId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-1">
      <Badge className={statusBadgeClass(status)}>{statusLabel(status)}</Badge>
      <form
        action={(fd) => {
          startTransition(async () => {
            await updateSubmissionStatusAction(fd);
          });
        }}
        className="flex items-center gap-1"
      >
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="submissionId" value={submissionId} />
        <select
          name="status"
          defaultValue={status}
          disabled={pending}
          className="rounded border border-slate-200 px-1 py-0.5 text-xs"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          aria-label="Change status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}
