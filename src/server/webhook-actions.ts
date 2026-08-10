"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import {
  createWebhook,
  deleteWebhook,
  emitWebhook,
  listWebhooks,
  toggleWebhook,
} from "@/lib/webhooks";

async function ctx(formData: FormData) {
  const slug = String(formData.get("slug"));
  const auth = await requireOrganizer(slug);
  return { slug, ...auth };
}

export async function createWebhookAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;
  createWebhook(event.id, url, formData.getAll("events").map(String));
  revalidatePath(`/admin/e/${slug}/settings/webhooks`);
}

export async function deleteWebhookAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const hook = listWebhooks(event.id).find((row) => row.id === String(formData.get("webhook_id")));
  if (hook) deleteWebhook(hook.id);
  revalidatePath(`/admin/e/${slug}/settings/webhooks`);
}

export async function toggleWebhookAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const hook = listWebhooks(event.id).find((row) => row.id === String(formData.get("webhook_id")));
  if (hook) toggleWebhook(hook.id, String(formData.get("active")) === "1");
  revalidatePath(`/admin/e/${slug}/settings/webhooks`);
}

export async function testWebhookAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  await emitWebhook(event.id, "submission.created", {
    id: "test",
    title: "Test delivery from Conferencer",
    is_new: true,
    submitter: "test@example.com",
  });
  revalidatePath(`/admin/e/${slug}/settings/webhooks`);
  redirect(`/admin/e/${slug}/settings/webhooks?tested=1`);
}
