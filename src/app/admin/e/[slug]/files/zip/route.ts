import JSZip from "jszip";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth/session";
import { getEventBySlug, getUserRolesForEvent } from "@/lib/auth/guards";
import { getDb, schema } from "@/lib/db";
import { readUpload } from "@/lib/storage/files";

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const event = await getEventBySlug(slug);
  if (!event) return new Response("Not found", { status: 404 });

  const roles = await getUserRolesForEvent(user.id, event.id);
  if (!roles.includes("organizer")) return new Response("Forbidden", { status: 403 });

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const idsParam = url.searchParams.get("ids");
  const db = getDb();

  let uploads: Array<typeof schema.uploads.$inferSelect>;

  if (idsParam) {
    const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (!ids.length) return new Response("No files selected", { status: 400 });
    uploads = db
      .select()
      .from(schema.uploads)
      .where(and(eq(schema.uploads.eventId, event.id), inArray(schema.uploads.id, ids)))
      .all();
  } else if (mode === "latest") {
    const all = db
      .select()
      .from(schema.uploads)
      .where(eq(schema.uploads.eventId, event.id))
      .orderBy(desc(schema.uploads.createdAt))
      .all();
    const seen = new Set<string>();
    uploads = [];
    for (const upload of all) {
      const key = upload.contactId ?? upload.id;
      if (seen.has(key)) continue;
      seen.add(key);
      uploads.push(upload);
    }
  } else {
    return new Response("Specify ids or mode=latest", { status: 400 });
  }

  if (!uploads.length) return new Response("No files found", { status: 404 });

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const upload of uploads) {
    let name = safeFilename(upload.filename);
    if (upload.version > 1) {
      const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
      const base = ext ? name.slice(0, -ext.length) : name;
      name = `${base}-v${upload.version}${ext}`;
    }
    let unique = name;
    let n = 2;
    while (usedNames.has(unique)) {
      const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
      const base = ext ? name.slice(0, -ext.length) : name;
      unique = `${base}-${n}${ext}`;
      n += 1;
    }
    usedNames.add(unique);

    try {
      const data = readUpload(upload.storageKey);
      zip.file(unique, data);
    } catch {
      // skip missing files on disk
    }
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeFilename(event.slug)}-files.zip"`,
    },
  });
}
