import { currentUser, hasRole } from "@/lib/auth";
import { getUpload, readUpload } from "@/lib/repo/uploads";
import { portalContact } from "@/lib/repo/contacts";
import { getEvent } from "@/lib/repo/events";

export const dynamic = "force-dynamic";

/**
 * File download endpoint. Headshots are public (they render on the speaker
 * gallery); everything else requires an organizer of the event or the speaker
 * the file belongs to (R-NFR-4 / CNT-03).
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const upload = getUpload(id);
  if (!upload) return new Response("Not found", { status: 404 });

  if (!upload.is_public) {
    const user = await currentUser();
    if (!user) return new Response("Sign in required", { status: 401 });
    const event = getEvent(upload.event_id);
    const isOrganizer = event ? hasRole(user.id, event.id, "organizer") : false;
    let isOwner = false;
    if (!isOrganizer && event) {
      const contact = portalContact(event, user);
      isOwner = Boolean(contact && contact.id === upload.contact_id);
    }
    if (!isOrganizer && !isOwner && !user.is_superadmin) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const buffer = readUpload(upload);
  if (!buffer) return new Response("File missing", { status: 404 });

  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": upload.content_type || "application/octet-stream",
      "Content-Length": String(buffer.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${upload.filename.replace(/"/g, "")}"`,
      "Cache-Control": upload.is_public ? "public, max-age=3600" : "private, no-store",
    },
  });
}
