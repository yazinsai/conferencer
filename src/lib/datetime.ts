/**
 * Two kinds of timestamp live in this app:
 *
 *  1. Audit timestamps (created_at, updated_at, sent_at) — UTC ISO strings.
 *  2. Event-timeline timestamps (session start/end, form close date, task due date)
 *     — *naive local wall clock* in the event's timezone, "YYYY-MM-DDTHH:MM".
 *
 * Keeping (2) naive removes an entire category of server/client timezone drift:
 * a 10:00 talk is 10:00 for everyone, and the timezone only materialises when we
 * emit an .ics file.
 */

export function nowIso(): string {
  return new Date().toISOString();
}

/** "2027-05-12T10:00" (naive local). */
export function localNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function localToday(): string {
  return localNow().slice(0, 10);
}

/** Accepts "2027-05-12T10:00", "2027-05-12 10:00", "2027-05-12T10:00:00Z". */
export function normalizeLocal(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  if (h === undefined) return `${y}-${mo}-${d}`;
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

export function dateOf(value: string | null | undefined): string | null {
  const v = normalizeLocal(value);
  return v ? v.slice(0, 10) : null;
}

export function timeOf(value: string | null | undefined): string | null {
  const v = normalizeLocal(value);
  return v && v.length > 10 ? v.slice(11, 16) : null;
}

/** Minutes since midnight for a naive datetime or "HH:MM". */
export function minutesOfDay(value: string | null | undefined): number | null {
  const t = value && value.length > 10 ? timeOf(value) : (value ?? null);
  if (!t) return null;
  const m = t.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Compare two naive datetimes lexicographically (safe because zero-padded). */
export function isBefore(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a < b;
}

export function isPast(value?: string | null): boolean {
  const v = normalizeLocal(value);
  if (!v) return false;
  return v < localNow();
}

export function isFuture(value?: string | null): boolean {
  const v = normalizeLocal(value);
  if (!v) return false;
  return v > localNow();
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parts(value: string) {
  const v = normalizeLocal(value);
  if (!v) return null;
  const [datePart, timePart] = v.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  return { y, mo, d, weekday, timePart: timePart ?? null };
}

export function formatDate(value?: string | null, opts: { weekday?: boolean } = {}): string {
  if (!value) return "";
  const p = parts(value);
  if (!p) return String(value);
  const base = `${MONTHS[p.mo - 1]} ${p.d}, ${p.y}`;
  return opts.weekday ? `${DAYS[p.weekday]}, ${base}` : base;
}

export function formatShortDate(value?: string | null): string {
  if (!value) return "";
  const p = parts(value);
  if (!p) return String(value);
  return `${MONTHS[p.mo - 1].slice(0, 3)} ${p.d}`;
}

export function formatTime(value?: string | null): string {
  const t = timeOf(value);
  if (!t) return "";
  const [hStr, m] = t.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}

export function formatDateTime(value?: string | null, opts: { weekday?: boolean } = {}): string {
  if (!value) return "";
  const date = formatDate(value, opts);
  const time = formatTime(value);
  return time ? `${date} · ${time}` : date;
}

export function formatRange(start?: string | null, end?: string | null): string {
  if (!start) return "";
  const date = formatDate(start, { weekday: true });
  const s = formatTime(start);
  const e = formatTime(end);
  if (!s) return date;
  return e ? `${date} · ${s} – ${e}` : `${date} · ${s}`;
}

export function formatEventDates(start?: string | null, end?: string | null): string {
  if (!start) return "";
  const a = parts(start);
  const b = end ? parts(end) : null;
  if (!a) return "";
  if (!b) return formatDate(start);
  if (a.y === b.y && a.mo === b.mo) return `${MONTHS[a.mo - 1]} ${a.d}–${b.d}, ${a.y}`;
  if (a.y === b.y) return `${MONTHS[a.mo - 1]} ${a.d} – ${MONTHS[b.mo - 1]} ${b.d}, ${a.y}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** Inclusive list of "YYYY-MM-DD" between two dates (max 60 to stay sane). */
export function daysBetween(start?: string | null, end?: string | null): string[] {
  const s = dateOf(start);
  const e = dateOf(end) ?? s;
  if (!s || !e) return [];
  const out: string[] = [];
  const cursor = new Date(`${s}T00:00:00Z`);
  const last = new Date(`${e}T00:00:00Z`);
  while (cursor <= last && out.length < 60) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export function daysUntil(value?: string | null): number | null {
  const d = dateOf(value);
  if (!d) return null;
  const target = new Date(`${d}T00:00:00Z`).getTime();
  const today = new Date(`${localToday()}T00:00:00Z`).getTime();
  return Math.round((target - today) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${dateOf(date)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function addMinutes(value: string, minutes: number): string {
  const v = normalizeLocal(value);
  if (!v) return value;
  const [datePart, timePart = "00:00"] = v.split("T");
  const base = new Date(`${datePart}T${timePart}:00Z`);
  base.setUTCMinutes(base.getUTCMinutes() + minutes);
  return base.toISOString().slice(0, 16);
}

/** Minutes between two naive datetimes. */
export function durationMinutes(start?: string | null, end?: string | null): number | null {
  const s = normalizeLocal(start);
  const e = normalizeLocal(end);
  if (!s || !e || s.length < 16 || e.length < 16) return null;
  return (
    (new Date(`${e}:00Z`).getTime() - new Date(`${s}:00Z`).getTime()) / 60_000
  );
}

export function overlaps(
  aStart?: string | null,
  aEnd?: string | null,
  bStart?: string | null,
  bEnd?: string | null,
): boolean {
  const as = normalizeLocal(aStart);
  const bs = normalizeLocal(bStart);
  if (!as || !bs) return false;
  const ae = normalizeLocal(aEnd) ?? addMinutes(as, 30);
  const be = normalizeLocal(bEnd) ?? addMinutes(bs, 30);
  return as < be && bs < ae;
}

/** "2026-08-10T09:31:00.000Z" -> "Aug 10, 2026 · 9:31 AM" (UTC-rendered). */
export function formatStamp(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const naive = d.toISOString().slice(0, 16);
  return `${formatShortDate(naive)}, ${d.getUTCFullYear()} · ${formatTime(naive)}`;
}

export function relativeStamp(iso?: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return String(iso);
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatStamp(iso);
}
