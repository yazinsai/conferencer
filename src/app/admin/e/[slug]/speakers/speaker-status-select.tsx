"use client";

import { updateSpeakerStatusAction } from "./actions";

const STATUSES = [
  "prospect",
  "invited",
  "confirmed",
  "declined",
  "cancelled",
] as const;

export function SpeakerStatusSelect({
  slug,
  contactId,
  current,
}: {
  slug: string;
  contactId: string;
  current: string;
}) {
  return (
    <form action={updateSpeakerStatusAction}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="contactId" value={contactId} />
      <select
        name="speakerStatus"
        defaultValue={current}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded border border-slate-200 px-1.5 py-0.5 text-xs capitalize"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </form>
  );
}
