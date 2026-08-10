"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { abstainAssignmentAction } from "@/app/admin/e/[slug]/evaluation/actions";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

export function AbstainDialog({
  planId,
  roundId,
  assignmentId,
  requireReason,
}: {
  planId: string;
  roundId: string;
  assignmentId: string;
  requireReason: boolean;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (requireReason && !reason.trim()) {
      setError("A reason is required when abstaining.");
      return;
    }
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.set("planId", planId);
    formData.set("roundId", roundId);
    formData.set("assignmentId", assignmentId);
    formData.set("abstainReason", reason.trim());
    try {
      await abstainAssignmentAction(formData);
      dialogRef.current?.close();
      router.push(`/review/plans/${planId}/rounds/${roundId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to abstain");
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => dialogRef.current?.showModal()}
      >
        Abstain / Conflict of interest
      </Button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-black/40"
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-lg font-semibold">Abstain from review</h2>
          <p className="mt-1 text-sm text-slate-600">
            Mark this submission as abstained if you have a conflict of interest or cannot
            review it. It will be removed from your pending queue.
          </p>
          <div className="mt-4">
            <Label htmlFor="abstainReason">
              Reason
              {requireReason ? <span className="text-rose-600"> *</span> : " (optional)"}
            </Label>
            <Textarea
              id="abstainReason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the conflict of interest or why you cannot review…"
              required={requireReason}
            />
          </div>
          {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => dialogRef.current?.close()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={saving}>
              {saving ? "Saving…" : "Confirm abstain"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
