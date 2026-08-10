import { all, get, run } from "../db";
import { id } from "../ids";
import { nowIso } from "../datetime";
import type { Event } from "./events";

export type Contact = {
  id: string;
  org_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  alt_email: string | null;
  headshot_url: string | null;
  biography: string | null;
  job_title: string | null;
  company: string | null;
  pronouns: string | null;
  salutation: string | null;
  honorific: string | null;
  gender: string | null;
  phone: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  dietary: string | null;
  tshirt_size: string | null;
  travel_notes: string | null;
  notes: string | null;
  tags: string;
  custom: string;
  created_at: string;
  updated_at: string;
};

export type EventContact = {
  id: string;
  event_id: string;
  contact_id: string;
  status: string;
  speaker_status: string;
  invited_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RosterRow = Contact & {
  speaker_status: string;
  event_contact_status: string;
  event_contact_id: string;
};

export const SPEAKER_STATUSES = [
  "prospect",
  "invited",
  "confirmed",
  "declined",
  "cancelled",
] as const;

export function contactName(c: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string {
  const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
  return name || c.email || "Unnamed";
}

export function splitName(input: string): { first: string; last: string } {
  const parts = input.trim().split(/\s+/);
  if (parts.length <= 1) return { first: parts[0] ?? "", last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

export function getContact(contactId: string): Contact | undefined {
  return get<Contact>("SELECT * FROM contacts WHERE id = ?", contactId);
}

export function findContactByEmail(orgId: string, email: string): Contact | undefined {
  if (!email) return undefined;
  return get<Contact>(
    `SELECT * FROM contacts WHERE org_id = ?
       AND (email = ? COLLATE NOCASE OR alt_email = ? COLLATE NOCASE)`,
    orgId,
    email.trim(),
    email.trim(),
  );
}

export function findContactByUser(orgId: string, userId: string): Contact | undefined {
  return get<Contact>(
    "SELECT * FROM contacts WHERE org_id = ? AND user_id = ? ORDER BY created_at LIMIT 1",
    orgId,
    userId,
  );
}

const WRITABLE = [
  "first_name",
  "last_name",
  "email",
  "alt_email",
  "headshot_url",
  "biography",
  "job_title",
  "company",
  "pronouns",
  "salutation",
  "honorific",
  "gender",
  "phone",
  "linkedin_url",
  "twitter_url",
  "facebook_url",
  "website_url",
  "dietary",
  "tshirt_size",
  "travel_notes",
  "notes",
  "tags",
  "custom",
  "user_id",
] as const;

export function createContact(orgId: string, patch: Partial<Contact>): Contact {
  const contactId = patch.id ?? id();
  run(
    `INSERT INTO contacts (id, org_id, first_name, last_name, email, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?)`,
    contactId,
    orgId,
    patch.first_name ?? "",
    patch.last_name ?? "",
    (patch.email ?? "").trim(),
    nowIso(),
    nowIso(),
  );
  const { id: _drop, org_id: _drop2, created_at: _drop3, ...rest } = patch;
  void _drop;
  void _drop2;
  void _drop3;
  updateContact(contactId, rest);
  return getContact(contactId)!;
}

export function updateContact(contactId: string, patch: Partial<Contact>) {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of WRITABLE) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      const value = patch[key];
      params.push(value === undefined ? null : value);
    }
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  params.push(nowIso(), contactId);
  run(`UPDATE contacts SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

/** Find-or-create by email inside the org (returning speakers keep one record). */
export function upsertContact(
  orgId: string,
  patch: Partial<Contact> & { email: string },
): { contact: Contact; created: boolean } {
  const existing = findContactByEmail(orgId, patch.email);
  if (existing) {
    const merged: Partial<Contact> = {};
    for (const key of WRITABLE) {
      const incoming = patch[key];
      if (incoming === undefined || incoming === null || incoming === "") continue;
      if (key === "email") continue;
      merged[key] = incoming as never;
    }
    if (Object.keys(merged).length) updateContact(existing.id, merged);
    return { contact: getContact(existing.id)!, created: false };
  }
  return { contact: createContact(orgId, patch), created: true };
}

/* -------------------------------------------------------- event contacts -- */

export function getEventContact(eventId: string, contactId: string): EventContact | undefined {
  return get<EventContact>(
    "SELECT * FROM event_contacts WHERE event_id = ? AND contact_id = ?",
    eventId,
    contactId,
  );
}

export function ensureEventContact(
  eventId: string,
  contactId: string,
  patch: { status?: string; speaker_status?: string } = {},
): EventContact {
  const existing = getEventContact(eventId, contactId);
  if (existing) {
    if (patch.status || patch.speaker_status) {
      run(
        `UPDATE event_contacts SET status = COALESCE(?, status),
           speaker_status = COALESCE(?, speaker_status), updated_at = ?
         WHERE id = ?`,
        patch.status ?? null,
        patch.speaker_status ?? null,
        nowIso(),
        existing.id,
      );
    }
    return getEventContact(eventId, contactId)!;
  }
  run(
    `INSERT INTO event_contacts (id, event_id, contact_id, status, speaker_status, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?)`,
    id(),
    eventId,
    contactId,
    patch.status ?? "active",
    patch.speaker_status ?? "prospect",
    nowIso(),
    nowIso(),
  );
  return getEventContact(eventId, contactId)!;
}

export function setSpeakerStatus(eventId: string, contactId: string, status: string) {
  run(
    "UPDATE event_contacts SET speaker_status = ?, updated_at = ? WHERE event_id = ? AND contact_id = ?",
    status,
    nowIso(),
    eventId,
    contactId,
  );
}

export function listRoster(
  eventId: string,
  opts: { q?: string; status?: string; trackId?: string; limit?: number; offset?: number } = {},
): RosterRow[] {
  const where: string[] = ["ec.event_id = ?"];
  const params: unknown[] = [eventId];
  if (opts.q) {
    where.push(
      "(c.first_name || ' ' || c.last_name LIKE ? OR c.email LIKE ? OR c.company LIKE ? OR c.job_title LIKE ?)",
    );
    const like = `%${opts.q}%`;
    params.push(like, like, like, like);
  }
  if (opts.status) {
    where.push("ec.speaker_status = ?");
    params.push(opts.status);
  }
  if (opts.trackId) {
    where.push(
      `EXISTS (SELECT 1 FROM submission_participants sp
                 JOIN submissions s ON s.id = sp.submission_id
                WHERE sp.contact_id = c.id AND s.track_id = ?)`,
    );
    params.push(opts.trackId);
  }
  const limit = opts.limit ?? 500;
  const offset = opts.offset ?? 0;
  return all<RosterRow>(
    `SELECT c.*, ec.speaker_status, ec.status AS event_contact_status, ec.id AS event_contact_id
       FROM event_contacts ec
       JOIN contacts c ON c.id = ec.contact_id
      WHERE ${where.join(" AND ")}
      ORDER BY c.last_name COLLATE NOCASE, c.first_name COLLATE NOCASE
      LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );
}

export function countRoster(eventId: string): number {
  return (
    get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM event_contacts WHERE event_id = ?",
      eventId,
    )?.n ?? 0
  );
}

/**
 * Connects a freshly signed-in/registered user to their contact record so the
 * portal shows their submissions immediately (SPK-07: clones link by email).
 */
export function linkContactToUser(
  event: Event,
  user: { id: string; email: string; first_name?: string; last_name?: string },
): Contact {
  let contact = findContactByEmail(event.org_id, user.email);
  if (!contact) {
    contact = createContact(event.org_id, {
      email: user.email,
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      user_id: user.id,
    });
  } else if (!contact.user_id) {
    updateContact(contact.id, { user_id: user.id });
    contact = getContact(contact.id)!;
  }
  ensureEventContact(event.id, contact.id, { status: "active" });
  return contact;
}

/** The contact a signed-in portal user is acting as. */
export function portalContact(event: Event, user: { id: string; email: string }): Contact | undefined {
  return (
    findContactByUser(event.org_id, user.id) ?? findContactByEmail(event.org_id, user.email)
  );
}

export function listContactsForOrg(
  orgId: string,
  opts: { q?: string; company?: string; jobTitle?: string; tag?: string; limit?: number } = {},
): Contact[] {
  const where: string[] = ["org_id = ?"];
  const params: unknown[] = [orgId];
  if (opts.q) {
    where.push("(first_name || ' ' || last_name LIKE ? OR email LIKE ? OR company LIKE ?)");
    const like = `%${opts.q}%`;
    params.push(like, like, like);
  }
  if (opts.company) {
    where.push("company = ?");
    params.push(opts.company);
  }
  if (opts.jobTitle) {
    where.push("job_title LIKE ?");
    params.push(`%${opts.jobTitle}%`);
  }
  if (opts.tag) {
    where.push("tags LIKE ?");
    params.push(`%"${opts.tag}"%`);
  }
  return all<Contact>(
    `SELECT * FROM contacts WHERE ${where.join(" AND ")}
      ORDER BY last_name COLLATE NOCASE, first_name COLLATE NOCASE LIMIT ?`,
    ...params,
    opts.limit ?? 500,
  );
}
