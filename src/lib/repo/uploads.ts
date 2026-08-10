import fs from "node:fs";
import path from "node:path";

import { all, get, run, UPLOAD_DIR } from "../db";
import { id } from "../ids";
import { nowIso } from "../datetime";

export type Upload = {
  id: string;
  event_id: string;
  task_assignment_id: string | null;
  submission_id: string | null;
  contact_id: string | null;
  kind: string;
  filename: string;
  content_type: string;
  size: number;
  storage_key: string;
  version: number;
  is_public: number;
  uploaded_by_user_id: string | null;
  created_at: string;
};

export type UploadRow = Upload & {
  contact_name: string | null;
  submission_title: string | null;
  task_name: string | null;
  comment_count: number;
  version_count: number;
};

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  ".pdf", ".key", ".ppt", ".pptx", ".doc", ".docx", ".odp", ".txt", ".md", ".csv",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".zip", ".mp4", ".mov",
];

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

export function uploadProblem(file: { name: string; size: number }, accepted?: string): string | null {
  if (!file.name) return "Choose a file to upload.";
  if (file.size <= 0) return "That file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "Files must be 20 MB or smaller.";
  const ext = extensionOf(file.name);
  const list = (accepted ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (list.length && !list.includes(ext)) {
    return `That file type is not accepted. Allowed: ${list.join(", ")}`;
  }
  if (!list.length && !ALLOWED_EXTENSIONS.includes(ext)) {
    return `That file type is not accepted. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }
  return null;
}

export async function storeUpload(input: {
  eventId: string;
  file: File;
  kind?: string;
  taskAssignmentId?: string | null;
  submissionId?: string | null;
  contactId?: string | null;
  userId?: string | null;
  isPublic?: boolean;
}): Promise<Upload> {
  const buffer = Buffer.from(await input.file.arrayBuffer());
  return storeBuffer({ ...input, filename: input.file.name, contentType: input.file.type, buffer });
}

export function storeBuffer(input: {
  eventId: string;
  filename: string;
  contentType?: string;
  buffer: Buffer;
  kind?: string;
  taskAssignmentId?: string | null;
  submissionId?: string | null;
  contactId?: string | null;
  userId?: string | null;
  isPublic?: boolean;
}): Upload {
  const uploadId = id();
  const ext = extensionOf(input.filename);
  const storageKey = `${uploadId}${ext}`;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, storageKey), input.buffer);

  // Re-uploading against the same request creates a new version (R-TSK-4).
  const previous = input.taskAssignmentId
    ? get<{ n: number }>(
        "SELECT COALESCE(MAX(version),0) AS n FROM uploads WHERE task_assignment_id = ?",
        input.taskAssignmentId,
      )?.n ?? 0
    : 0;

  run(
    `INSERT INTO uploads (id, event_id, task_assignment_id, submission_id, contact_id, kind,
        filename, content_type, size, storage_key, version, is_public, uploaded_by_user_id, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    uploadId,
    input.eventId,
    input.taskAssignmentId ?? null,
    input.submissionId ?? null,
    input.contactId ?? null,
    input.kind ?? "deliverable",
    input.filename,
    input.contentType || guessType(ext),
    input.buffer.length,
    storageKey,
    previous + 1,
    input.isPublic ? 1 : 0,
    input.userId ?? null,
    nowIso(),
  );
  return get<Upload>("SELECT * FROM uploads WHERE id = ?", uploadId)!;
}

function guessType(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".csv": "text/csv",
    ".txt": "text/plain",
    ".zip": "application/zip",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return map[ext] ?? "application/octet-stream";
}

export function getUpload(uploadId: string): Upload | undefined {
  return get<Upload>("SELECT * FROM uploads WHERE id = ?", uploadId);
}

export function readUpload(upload: Upload): Buffer | null {
  const file = path.join(UPLOAD_DIR, upload.storage_key);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file);
}

export function uploadUrl(uploadId: string): string {
  return `/f/${uploadId}`;
}

const UPLOAD_SELECT = `
  SELECT u.*,
         (SELECT c.first_name || ' ' || c.last_name FROM contacts c WHERE c.id = u.contact_id) AS contact_name,
         (SELECT s.title FROM submissions s WHERE s.id = u.submission_id) AS submission_title,
         (SELECT t.name FROM task_assignments ta JOIN tasks t ON t.id = ta.task_id WHERE ta.id = u.task_assignment_id) AS task_name,
         (SELECT COUNT(*) FROM file_comments fc WHERE fc.upload_id = u.id) AS comment_count,
         (SELECT COUNT(*) FROM uploads u2 WHERE u2.task_assignment_id IS NOT NULL
            AND u2.task_assignment_id = u.task_assignment_id) AS version_count
    FROM uploads u
`;

export function listUploads(
  eventId: string,
  opts: { q?: string; contactId?: string; submissionId?: string; assignmentId?: string; kind?: string; latestOnly?: boolean } = {},
): UploadRow[] {
  const where = ["u.event_id = ?"];
  const params: unknown[] = [eventId];
  if (opts.q) {
    where.push("(u.filename LIKE ?)");
    params.push(`%${opts.q}%`);
  }
  if (opts.contactId) {
    where.push("u.contact_id = ?");
    params.push(opts.contactId);
  }
  if (opts.submissionId) {
    where.push("u.submission_id = ?");
    params.push(opts.submissionId);
  }
  if (opts.assignmentId) {
    where.push("u.task_assignment_id = ?");
    params.push(opts.assignmentId);
  }
  if (opts.kind) {
    where.push("u.kind = ?");
    params.push(opts.kind);
  }
  if (opts.latestOnly) {
    where.push(
      `(u.task_assignment_id IS NULL OR u.version = (
          SELECT MAX(v.version) FROM uploads v WHERE v.task_assignment_id = u.task_assignment_id))`,
    );
  }
  return all<UploadRow>(
    `${UPLOAD_SELECT} WHERE ${where.join(" AND ")} ORDER BY u.created_at DESC`,
    ...params,
  );
}

export function getUploadRow(uploadId: string): UploadRow | undefined {
  return get<UploadRow>(`${UPLOAD_SELECT} WHERE u.id = ?`, uploadId);
}

export function versionsOf(assignmentId: string): Upload[] {
  return all<Upload>(
    "SELECT * FROM uploads WHERE task_assignment_id = ? ORDER BY version DESC",
    assignmentId,
  );
}

export function latestUpload(assignmentId: string): Upload | undefined {
  return get<Upload>(
    "SELECT * FROM uploads WHERE task_assignment_id = ? ORDER BY version DESC LIMIT 1",
    assignmentId,
  );
}

export function deleteUpload(uploadId: string) {
  const upload = getUpload(uploadId);
  if (!upload) return;
  const file = path.join(UPLOAD_DIR, upload.storage_key);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  run("DELETE FROM uploads WHERE id = ?", uploadId);
}

/* -------------------------------------------------------------- comments -- */

export type FileComment = {
  id: string;
  upload_id: string;
  author_user_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
};

export function addComment(input: {
  uploadId: string;
  authorUserId?: string | null;
  authorName: string;
  body: string;
}): FileComment {
  const commentId = id();
  run(
    `INSERT INTO file_comments (id, upload_id, author_user_id, author_name, body, created_at)
     VALUES (?,?,?,?,?,?)`,
    commentId,
    input.uploadId,
    input.authorUserId ?? null,
    input.authorName,
    input.body,
    nowIso(),
  );
  return get<FileComment>("SELECT * FROM file_comments WHERE id = ?", commentId)!;
}

/** Comments across every version of the same deliverable slot. */
export function listComments(uploadId: string): FileComment[] {
  const upload = getUpload(uploadId);
  if (!upload) return [];
  if (upload.task_assignment_id) {
    return all<FileComment>(
      `SELECT fc.* FROM file_comments fc
         JOIN uploads u ON u.id = fc.upload_id
        WHERE u.task_assignment_id = ?
        ORDER BY fc.created_at`,
      upload.task_assignment_id,
    );
  }
  return all<FileComment>(
    "SELECT * FROM file_comments WHERE upload_id = ? ORDER BY created_at",
    uploadId,
  );
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
