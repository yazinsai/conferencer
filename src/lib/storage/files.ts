import fs from "node:fs";
import path from "node:path";
import { id } from "@/lib/id";

const ALLOWED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
]);

const MAX_BYTES = 20 * 1024 * 1024;

export function uploadDir() {
  const dir = process.env.UPLOAD_DIR ?? "./uploads";
  const abs = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
  fs.mkdirSync(abs, { recursive: true });
  return abs;
}

export function assertAllowedUpload(contentType: string, size: number) {
  if (size > MAX_BYTES) {
    throw new Error("File exceeds 20 MB limit");
  }
  if (!ALLOWED.has(contentType)) {
    throw new Error(`File type not allowed: ${contentType}`);
  }
}

export async function saveUpload(opts: {
  eventId: string;
  filename: string;
  contentType: string;
  data: Buffer;
}) {
  assertAllowedUpload(opts.contentType, opts.data.length);
  const key = `${opts.eventId}/${id("file")}-${opts.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const full = path.join(uploadDir(), key);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, opts.data);
  return {
    storageKey: key,
    size: opts.data.length,
    contentType: opts.contentType,
    filename: opts.filename,
  };
}

export function resolveUploadPath(storageKey: string) {
  return path.join(uploadDir(), storageKey);
}

export function readUpload(storageKey: string) {
  return fs.readFileSync(resolveUploadPath(storageKey));
}
