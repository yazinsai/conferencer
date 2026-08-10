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

export function speakerFacingStatus(status: string): string {
  if (status === "accept_queue" || status === "decline_queue") return "Pending";
  if (status === "pending") return "Pending";
  if (status === "draft") return "Draft";
  if (status === "accepted") return "Accepted";
  if (status === "declined") return "Declined";
  if (status === "withdrawn") return "Withdrawn";
  return status;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Draft",
    pending: "Pending",
    accept_queue: "Accept Queue",
    decline_queue: "Decline Queue",
    accepted: "Accepted",
    declined: "Declined",
    withdrawn: "Withdrawn",
  };
  return map[status] ?? status;
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "accepted":
      return "bg-emerald-100 text-emerald-800";
    case "declined":
      return "bg-rose-100 text-rose-800";
    case "accept_queue":
      return "bg-teal-100 text-teal-800";
    case "decline_queue":
      return "bg-orange-100 text-orange-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "draft":
      return "bg-slate-100 text-slate-700";
    case "withdrawn":
      return "bg-zinc-200 text-zinc-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function isPubliclyVisible(sub: {
  status: string;
  approvalStatus: string;
}) {
  return sub.status === "accepted" && sub.approvalStatus === "approved";
}
