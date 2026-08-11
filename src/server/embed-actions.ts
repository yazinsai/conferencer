"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { readJson } from "@/lib/db";
import {
  createEmbed,
  deleteEmbed,
  getEmbed,
  rotateToken,
  updateEmbed,
  type Embed,
} from "@/lib/repo/embeds";

async function ctx(formData: FormData) {
  const slug = String(formData.get("slug"));
  const auth = await requireOrganizer(slug);
  return { slug, ...auth };
}

export async function createEmbedAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  createEmbed(event.id, {
    name: String(formData.get("name") ?? "Embed"),
    type: String(formData.get("type") ?? "sessions") as Embed["type"],
    format: String(formData.get("format") ?? "styled_html") as Embed["format"],
    config: { accent: event.accent_color },
  });
  revalidatePath(`/admin/e/${slug}/embeds`);
  redirect(`/admin/e/${slug}/embeds?created=1`);
}

export async function updateEmbedAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const embed = getEmbed(String(formData.get("embed_id")));
  if (!embed || embed.event_id !== event.id) return;
  const existing = readJson<Record<string, unknown>>(embed.config, {});
  updateEmbed(embed.id, {
    name: String(formData.get("name") ?? embed.name),
    type: String(formData.get("type") ?? embed.type),
    format: String(formData.get("format") ?? embed.format),
    config: {
      ...existing,
      accent: String(formData.get("accent") ?? "") || undefined,
      track: String(formData.get("track") ?? "") || undefined,
      format: String(formData.get("session_format") ?? "") || undefined,
    },
  });
  revalidatePath(`/admin/e/${slug}/embeds`);
}

export async function deleteEmbedAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const embed = getEmbed(String(formData.get("embed_id")));
  if (embed && embed.event_id === event.id) deleteEmbed(embed.id);
  revalidatePath(`/admin/e/${slug}/embeds`);
}

export async function rotateEmbedTokenAction(formData: FormData) {
  const { slug, event } = await ctx(formData);
  const embed = getEmbed(String(formData.get("embed_id")));
  if (embed && embed.event_id === event.id) rotateToken(embed.id);
  revalidatePath(`/admin/e/${slug}/embeds`);
}
