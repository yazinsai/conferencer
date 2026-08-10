"use server";

import { and, count, eq, inArray, notInArray } from "drizzle-orm";
import { requireEventRole } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import {
  listSubmissions,
  submissionStatusCounts,
} from "@/lib/db/queries";

export type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

const COMPLETE_STATUSES = ["complete", "approved"];

export async function agentChatAction(
  slug: string,
  message: string,
): Promise<AgentMessage> {
  const { event } = await requireEventRole(slug, ["organizer"]);
  const q = message.trim().toLowerCase();

  if (!q) {
    return {
      role: "assistant",
      content:
        "Ask about pending submissions, task completion, session counts, or contacts. Try “help” for examples.",
    };
  }

  if (/\b(help|what can you|commands|examples)\b/.test(q)) {
    return {
      role: "assistant",
      content: [
        "I understand simple phrases (no LLM):",
        "• “list pending submissions” — recent pending CFP items",
        "• “how many accepted submissions” — status breakdown",
        "• “outstanding tasks” — incomplete speaker task assignments",
        "• “list sessions” — accepted session submissions",
        "• “how many contacts” — event contact count",
      ].join("\n"),
    };
  }

  if (
    /\bpending\b.*\bsubmission/.test(q) ||
    /\bsubmission/.test(q) && /\bpending\b/.test(q) ||
    /\blist pending\b/.test(q)
  ) {
    const rows = listSubmissions({
      eventId: event.id,
      status: "pending",
      limit: 10,
    });
    if (rows.length === 0) {
      return { role: "assistant", content: "No pending submissions." };
    }
    const lines = rows.map(
      (r) => `• ${r.title} (${r.id}) — ${r.kind}, updated ${r.updatedAt.slice(0, 10)}`,
    );
    return {
      role: "assistant",
      content: `Found ${rows.length} pending submission(s) (showing up to 10):\n${lines.join("\n")}`,
    };
  }

  if (
    /\boutstanding\b.*\btask/.test(q) ||
    /\btask/.test(q) && /\b(outstanding|incomplete|remaining|pending)\b/.test(q) ||
    /\bcount\b.*\btask/.test(q)
  ) {
    const db = getDb();
    const outstanding = db
      .select({ c: count() })
      .from(schema.taskAssignments)
      .where(
        and(
          eq(schema.taskAssignments.eventId, event.id),
          notInArray(schema.taskAssignments.status, COMPLETE_STATUSES),
        ),
      )
      .get();
    const total = db
      .select({ c: count() })
      .from(schema.taskAssignments)
      .where(eq(schema.taskAssignments.eventId, event.id))
      .get();
    const outstandingN = Number(outstanding?.c ?? 0);
    const totalN = Number(total?.c ?? 0);
    const completeN = totalN - outstandingN;

    const byTask = db
      .select({
        taskName: schema.tasks.name,
        status: schema.taskAssignments.status,
      })
      .from(schema.taskAssignments)
      .innerJoin(schema.tasks, eq(schema.taskAssignments.taskId, schema.tasks.id))
      .where(
        and(
          eq(schema.taskAssignments.eventId, event.id),
          notInArray(schema.taskAssignments.status, COMPLETE_STATUSES),
        ),
      )
      .limit(8)
      .all();

    const detail =
      byTask.length > 0
        ? `\nExamples:\n${byTask.map((r) => `• ${r.taskName} — ${r.status}`).join("\n")}`
        : "";

    return {
      role: "assistant",
      content: `Task assignments: ${outstandingN} outstanding, ${completeN} complete (${totalN} total).${detail}`,
    };
  }

  if (
    /\b(submission|cfp)\b.*\b(count|status|breakdown)\b/.test(q) ||
    /\bhow many\b.*\bsubmission/.test(q) ||
    /\baccepted\b.*\bsubmission/.test(q) ||
    /\bsubmission\b.*\baccepted\b/.test(q)
  ) {
    const counts = submissionStatusCounts(event.id);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const lines = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([status, n]) => `• ${status}: ${n}`);
    return {
      role: "assistant",
      content: `Submissions (${total} total):\n${lines.join("\n") || "• none"}`,
    };
  }

  if (/\bsession/.test(q) && /\b(list|show|how many|count)\b/.test(q)) {
    const rows = listSubmissions({
      eventId: event.id,
      status: "accepted",
      kind: "session",
      limit: 10,
    });
    if (rows.length === 0) {
      return { role: "assistant", content: "No accepted session submissions yet." };
    }
    const lines = rows.map((r) => `• ${r.title}`);
    return {
      role: "assistant",
      content: `Accepted sessions (up to 10):\n${lines.join("\n")}`,
    };
  }

  if (/\b(contact|speaker)/.test(q) && /\b(how many|count|list)\b/.test(q)) {
    const db = getDb();
    const eventContacts = db
      .select({ contactId: schema.eventContacts.contactId })
      .from(schema.eventContacts)
      .where(eq(schema.eventContacts.eventId, event.id))
      .all();
    const ids = eventContacts.map((r) => r.contactId);
    if (ids.length === 0) {
      return { role: "assistant", content: "No contacts linked to this event." };
    }
    const contacts = db
      .select({
        firstName: schema.contacts.firstName,
        lastName: schema.contacts.lastName,
        email: schema.contacts.email,
      })
      .from(schema.contacts)
      .where(inArray(schema.contacts.id, ids))
      .limit(8)
      .all();
    const lines = contacts.map(
      (c) => `• ${c.firstName} ${c.lastName} <${c.email}>`,
    );
    return {
      role: "assistant",
      content: `${ids.length} event contact(s). Sample:\n${lines.join("\n")}`,
    };
  }

  return {
    role: "assistant",
    content:
      "I didn't recognize that. Try “list pending submissions”, “outstanding tasks”, “submission counts”, “list sessions”, or “how many contacts”. Say “help” for more.",
  };
}
