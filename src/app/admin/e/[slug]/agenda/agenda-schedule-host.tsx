"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ScheduleModal, type ScheduleModalSubmission } from "./schedule-modal";

type Room = { id: string; name: string };

export function AgendaScheduleHost({
  slug,
  view,
  day,
  rooms,
  defaultDate,
  submissions,
}: {
  slug: string;
  view: string;
  day: string;
  rooms: Room[];
  defaultDate: string;
  submissions: ScheduleModalSubmission[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("schedule");
  const submission =
    scheduleId ? submissions.find((s) => s.id === scheduleId) ?? null : null;

  function closeSchedule() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("schedule");
    router.push(`/admin/e/${slug}/agenda?${params.toString()}`);
  }

  return (
    <ScheduleModal
      slug={slug}
      view={view}
      day={day}
      openSubmissionId={scheduleId}
      submission={submission}
      rooms={rooms}
      defaultDate={defaultDate}
      onClose={closeSchedule}
    />
  );
}
