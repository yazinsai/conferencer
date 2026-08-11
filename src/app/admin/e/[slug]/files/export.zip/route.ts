import { requireOrganizer } from "@/lib/guards";
import { listUploads, readUpload, getUpload } from "@/lib/repo/uploads";
import { makeZip, safeFolder, type ZipEntry } from "@/lib/zip";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { event } = await requireOrganizer(slug);
  const url = new URL(request.url);
  const ids = url.searchParams.getAll("ids").flatMap((value) => value.split(",")).filter(Boolean);
  const group = url.searchParams.get("group") ?? "session";

  const rows = ids.length
    ? ids.map((id) => getUpload(id)).filter((u) => u && u.event_id === event.id)
    : listUploads(event.id, { latestOnly: true });

  const entries: ZipEntry[] = [];
  for (const upload of rows) {
    if (!upload) continue;
    const data = readUpload(upload);
    if (!data) continue;
    const meta = listUploads(event.id).find((row) => row.id === upload.id);
    const folder =
      group === "speaker"
        ? safeFolder(meta?.contact_name ?? "unknown-speaker")
        : group === "flat"
          ? ""
          : safeFolder(meta?.submission_title ?? "unassigned-session");
    entries.push({
      name: folder ? `${folder}/${upload.filename}` : upload.filename,
      data,
    });
  }

  if (!entries.length) {
    entries.push({
      name: "README.txt",
      data: Buffer.from(
        "No files matched this export. Upload deliverables from the speaker portal first.\n",
        "utf8",
      ),
    });
  }

  const zip = makeZip(entries);
  return new Response(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(zip.length),
      "Content-Disposition": `attachment; filename="${event.slug}-deliverables.zip"`,
    },
  });
}
