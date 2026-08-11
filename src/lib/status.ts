/**
 * Pure status vocabulary — no database import, so client components can use it.
 * (Anything importing src/lib/db pulls in better-sqlite3 and cannot ship to the browser.)
 */

export const SUBMISSION_STATUSES = [
  "draft",
  "pending",
  "accept_queue",
  "decline_queue",
  "accepted",
  "declined",
  "withdrawn",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  accept_queue: "Accept Queue",
  decline_queue: "Decline Queue",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

/** R-DATA-1: queue statuses are internal — speakers only ever see "Pending". */
export function speakerFacingStatus(status: string): string {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    case "withdrawn":
      return "Withdrawn";
    case "draft":
      return "Draft";
    default:
      return "Pending";
  }
}

export type Tone = "slate" | "green" | "amber" | "red" | "blue" | "violet";

export function statusTone(status: string): Tone {
  switch (status) {
    case "accepted":
      return "green";
    case "declined":
      return "red";
    case "accept_queue":
      return "blue";
    case "decline_queue":
      return "amber";
    case "withdrawn":
    case "draft":
      return "slate";
    default:
      return "violet";
  }
}

export const APPROVAL_STATUSES = ["draft", "in_review", "approved"] as const;

export const APPROVAL_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
  approved: "Approved",
  rejected: "Rejected",
};

export const SPEAKER_STATUSES = [
  "prospect",
  "invited",
  "confirmed",
  "declined",
  "cancelled",
] as const;

export function speakerStatusTone(status: string): Tone {
  switch (status) {
    case "confirmed":
      return "green";
    case "invited":
      return "blue";
    case "declined":
    case "cancelled":
      return "red";
    default:
      return "slate";
  }
}
