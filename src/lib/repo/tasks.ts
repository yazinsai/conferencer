import { all, get, run } from "../db";
import { id } from "../ids";
import { nowIso, localToday, dateOf } from "../datetime";

export type Task = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  description_field_id: string | null;
  type: "action" | "file_request" | "form";
  target: "contact" | "submission";
  link_url: string | null;
  link_field_id: string | null;
  form_id: string | null;
  form_schema: string;
  accepted_types: string;
  max_size_mb: number;
  is_default: number;
  sort_order: number;
  created_at: string;
};

export type TaskAssignment = {
  id: string;
  task_id: string;
  event_id: string;
  contact_id: string;
  submission_id: string | null;
  due_at: string | null;
  extended_due_at: string | null;
  is_required: number;
  lock_on_complete: number;
  status: string;
  response: string | null;
  completed_at: string | null;
  reminded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AssignmentRow = TaskAssignment & {
  task_name: string;
  task_type: Task["type"];
  task_description: string | null;
  task_link: string | null;
  accepted_types: string;
  max_size_mb: number;
  form_schema: string;
  contact_first: string;
  contact_last: string;
  contact_email: string;
  submission_title: string | null;
  upload_count: number;
};

export const TASK_STATUSES = ["not_started", "in_progress", "complete", "approved", "rejected"];

export const TASK_STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
  approved: "Approved",
  rejected: "Rejected",
};

export function isComplete(status: string): boolean {
  return status === "complete" || status === "approved";
}

export function effectiveDue(a: { due_at: string | null; extended_due_at: string | null }) {
  return a.extended_due_at ?? a.due_at;
}

export function isOverdue(a: {
  due_at: string | null;
  extended_due_at: string | null;
  status: string;
}): boolean {
  if (isComplete(a.status)) return false;
  const due = dateOf(effectiveDue(a));
  return Boolean(due && due < localToday());
}

/* ----------------------------------------------------------------- tasks -- */

export function listTasks(eventId: string): Task[] {
  return all<Task>(
    "SELECT * FROM tasks WHERE event_id = ? ORDER BY sort_order, created_at",
    eventId,
  );
}

export function getTask(taskId: string): Task | undefined {
  return get<Task>("SELECT * FROM tasks WHERE id = ?", taskId);
}

export function findTaskByName(eventId: string, name: string): Task | undefined {
  return get<Task>(
    "SELECT * FROM tasks WHERE event_id = ? AND name = ? COLLATE NOCASE",
    eventId,
    name,
  );
}

export function createTask(eventId: string, input: Partial<Task> & { name: string }): Task {
  const taskId = input.id ?? id();
  run(
    `INSERT INTO tasks (id, event_id, name, description, type, target, link_url, form_id,
        form_schema, accepted_types, max_size_mb, is_default, sort_order, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    taskId,
    eventId,
    input.name,
    input.description ?? null,
    input.type ?? "action",
    input.target ?? "contact",
    input.link_url ?? null,
    input.form_id ?? null,
    input.form_schema ?? "[]",
    input.accepted_types ?? "",
    input.max_size_mb ?? 20,
    input.is_default ?? 0,
    input.sort_order ??
      (get<{ n: number }>(
        "SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM tasks WHERE event_id = ?",
        eventId,
      )?.n ??
        0),
    nowIso(),
  );
  return getTask(taskId)!;
}

const TASK_FIELDS = [
  "name",
  "description",
  "type",
  "target",
  "link_url",
  "form_id",
  "form_schema",
  "accepted_types",
  "max_size_mb",
  "is_default",
  "sort_order",
] as const;

export function updateTask(taskId: string, patch: Partial<Task>) {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of TASK_FIELDS) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  params.push(taskId);
  run(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteTask(taskId: string) {
  run("DELETE FROM tasks WHERE id = ?", taskId);
}

/* ----------------------------------------------------------- assignments -- */

const ASSIGNMENT_SELECT = `
  SELECT ta.*, t.name AS task_name, t.type AS task_type, t.description AS task_description,
         t.link_url AS task_link, t.accepted_types, t.max_size_mb, t.form_schema,
         c.first_name AS contact_first, c.last_name AS contact_last, c.email AS contact_email,
         (SELECT s.title FROM submissions s WHERE s.id = ta.submission_id) AS submission_title,
         (SELECT COUNT(*) FROM uploads u WHERE u.task_assignment_id = ta.id) AS upload_count
    FROM task_assignments ta
    JOIN tasks t ON t.id = ta.task_id
    JOIN contacts c ON c.id = ta.contact_id
`;

export function assignTask(input: {
  taskId: string;
  eventId: string;
  contactId: string;
  submissionId?: string | null;
  dueAt?: string | null;
  isRequired?: boolean;
  status?: string;
  completedAt?: string | null;
}): TaskAssignment {
  const existing = get<TaskAssignment>(
    `SELECT * FROM task_assignments WHERE task_id = ? AND contact_id = ?
       AND COALESCE(submission_id,'') = COALESCE(?,'')`,
    input.taskId,
    input.contactId,
    input.submissionId ?? null,
  );
  if (existing) return existing;
  const rowId = id();
  run(
    `INSERT INTO task_assignments (id, task_id, event_id, contact_id, submission_id, due_at,
        is_required, status, completed_at, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    rowId,
    input.taskId,
    input.eventId,
    input.contactId,
    input.submissionId ?? null,
    input.dueAt ?? null,
    input.isRequired === false ? 0 : 1,
    input.status ?? "not_started",
    input.completedAt ?? null,
    nowIso(),
    nowIso(),
  );
  return get<TaskAssignment>("SELECT * FROM task_assignments WHERE id = ?", rowId)!;
}

export function getAssignment(assignmentId: string): AssignmentRow | undefined {
  return get<AssignmentRow>(`${ASSIGNMENT_SELECT} WHERE ta.id = ?`, assignmentId);
}

export function listAssignments(
  eventId: string,
  opts: {
    contactId?: string;
    taskId?: string;
    status?: string;
    overdue?: boolean;
    trackId?: string;
    limit?: number;
  } = {},
): AssignmentRow[] {
  const where = ["ta.event_id = ?"];
  const params: unknown[] = [eventId];
  if (opts.contactId) {
    where.push("ta.contact_id = ?");
    params.push(opts.contactId);
  }
  if (opts.taskId) {
    where.push("ta.task_id = ?");
    params.push(opts.taskId);
  }
  if (opts.status === "outstanding") {
    where.push("ta.status NOT IN ('complete','approved')");
  } else if (opts.status === "complete") {
    where.push("ta.status IN ('complete','approved')");
  } else if (opts.status) {
    where.push("ta.status = ?");
    params.push(opts.status);
  }
  if (opts.overdue) {
    where.push(
      "ta.status NOT IN ('complete','approved') AND COALESCE(ta.extended_due_at, ta.due_at) < ?",
    );
    params.push(localToday());
  }
  if (opts.trackId) {
    where.push(
      `EXISTS (SELECT 1 FROM submission_participants sp JOIN submissions s ON s.id = sp.submission_id
                WHERE sp.contact_id = ta.contact_id AND s.track_id = ?)`,
    );
    params.push(opts.trackId);
  }
  return all<AssignmentRow>(
    `${ASSIGNMENT_SELECT} WHERE ${where.join(" AND ")}
      ORDER BY c.last_name COLLATE NOCASE, t.sort_order, t.name LIMIT ?`,
    ...params,
    opts.limit ?? 1000,
  );
}

export function setAssignmentStatus(
  assignmentId: string,
  status: string,
  extra: { response?: string | null } = {},
) {
  run(
    `UPDATE task_assignments
        SET status = ?,
            completed_at = CASE WHEN ? IN ('complete','approved') THEN COALESCE(completed_at, ?) ELSE NULL END,
            response = COALESCE(?, response),
            updated_at = ?
      WHERE id = ?`,
    status,
    status,
    nowIso(),
    extra.response ?? null,
    nowIso(),
    assignmentId,
  );
}

export function updateAssignment(assignmentId: string, patch: Partial<TaskAssignment>) {
  const keys = [
    "due_at",
    "extended_due_at",
    "is_required",
    "lock_on_complete",
    "status",
    "response",
    "reminded_at",
  ] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of keys) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key] ?? null);
    }
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  params.push(nowIso(), assignmentId);
  run(`UPDATE task_assignments SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteAssignment(assignmentId: string) {
  run("DELETE FROM task_assignments WHERE id = ?", assignmentId);
}

export function taskProgress(eventId: string, contactId: string) {
  const row = get<{ total: number; done: number; overdue: number }>(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status IN ('complete','approved') THEN 1 ELSE 0 END) AS done,
            SUM(CASE WHEN status NOT IN ('complete','approved')
                      AND COALESCE(extended_due_at, due_at) < ? THEN 1 ELSE 0 END) AS overdue
       FROM task_assignments WHERE event_id = ? AND contact_id = ?`,
    localToday(),
    eventId,
    contactId,
  );
  return { total: row?.total ?? 0, done: row?.done ?? 0, overdue: row?.overdue ?? 0 };
}

/** The nine default onboarding tasks the buyer named (§8.3). */
export const DEFAULT_TASKS: Array<{
  name: string;
  description: string;
  type: Task["type"];
  target: Task["target"];
  accepted_types?: string;
  form_schema?: unknown;
}> = [
  {
    name: "Confirm participation",
    description: "Confirm that you can speak at the event on the scheduled date.",
    type: "action",
    target: "submission",
  },
  {
    name: "Upload headshot",
    description: "A square, print-quality photo of at least 800×800 pixels.",
    type: "file_request",
    target: "contact",
    accepted_types: ".jpg,.jpeg,.png",
  },
  {
    name: "Complete bio and profile",
    description: "Fill in your biography, job title, company and social links in your profile.",
    type: "action",
    target: "contact",
  },
  {
    name: "Upload final slides",
    description: "Final slide deck as a PDF, 16:9 aspect ratio.",
    type: "file_request",
    target: "submission",
    accepted_types: ".pdf,.key,.pptx",
  },
  {
    name: "Sign speaker release form",
    description: "Read and sign the recording and media release form.",
    type: "action",
    target: "contact",
  },
  {
    name: "Hotel and travel reservations",
    description: "Tell us your travel dates and hotel requirements.",
    type: "form",
    target: "contact",
    form_schema: [
      { key: "arrival", label: "Arrival date", type: "date", required: true },
      { key: "departure", label: "Departure date", type: "date", required: true },
      { key: "hotel_needed", label: "Do you need a hotel room?", type: "dropdown", options: ["Yes", "No"], required: true },
      { key: "accessibility", label: "Accessibility or dietary requirements", type: "textarea" },
    ],
  },
  {
    name: "Flight reimbursement form",
    description: "Submit your flight details so we can reimburse your travel.",
    type: "form",
    target: "contact",
    form_schema: [
      { key: "airline", label: "Airline", type: "text", required: true },
      { key: "amount", label: "Amount (USD)", type: "number", required: true },
      { key: "receipt_notes", label: "Notes for the finance team", type: "textarea" },
    ],
  },
  {
    name: "Announce your participation",
    description: "Share the announcement post with your network.",
    type: "action",
    target: "contact",
  },
  {
    name: "Invite colleagues with your speaker discount",
    description: "Use your speaker discount code to invite colleagues.",
    type: "action",
    target: "contact",
  },
];
