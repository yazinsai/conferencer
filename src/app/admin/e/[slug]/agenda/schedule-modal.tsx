"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { scheduleSessionAction, unscheduleSessionAction } from "./actions";

export type ScheduleModalSubmission = {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  locationId: string | null;
  participantNames: string[];
};

type Room = { id: string; name: string };

export function ScheduleModal({
  slug,
  view,
  day,
  openSubmissionId,
  submission,
  rooms,
  defaultDate,
  onClose,
}: {
  slug: string;
  view: string;
  day: string;
  openSubmissionId: string | null;
  submission: ScheduleModalSubmission | null;
  rooms: Room[];
  defaultDate: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openSubmissionId && submission) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [openSubmissionId, submission]);

  if (!submission) return null;

  const dateValue = submission.startsAt?.slice(0, 10) || defaultDate;
  const startValue = submission.startsAt?.match(/T(\d{2}:\d{2})/)?.[1] ?? "09:00";
  const endValue = submission.endsAt?.match(/T(\d{2}:\d{2})/)?.[1] ?? "09:30";
  const isScheduled = Boolean(submission.startsAt);

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-black/40"
      onClose={onClose}
    >
      <form action={scheduleSessionAction} className="p-6">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="submissionId" value={submission.id} />
        <input type="hidden" name="view" value={view} />
        {day ? <input type="hidden" name="day" value={day} /> : null}

        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {isScheduled ? "Reschedule session" : "Schedule session"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{submission.title}</p>
          {submission.participantNames.length ? (
            <p className="mt-1 text-xs text-slate-500">
              Speakers: {submission.participantNames.join(", ")}
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" required defaultValue={dateValue} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                required
                defaultValue={startValue}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                required
                defaultValue={endValue}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="locationId">Room</Label>
            <Select
              id="locationId"
              name="locationId"
              required
              defaultValue={submission.locationId ?? ""}
            >
              <option value="" disabled>
                Select a room…
              </option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button type="submit">Save schedule</Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
          {isScheduled ? (
            <form action={unscheduleSessionAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="submissionId" value={submission.id} />
              <input type="hidden" name="view" value={view} />
              {day ? <input type="hidden" name="day" value={day} /> : null}
              <Button type="submit" variant="danger">
                Clear schedule
              </Button>
            </form>
          ) : null}
        </div>
      </form>
    </dialog>
  );
}
