import type { PublicFormat, PublicTrack } from "@/lib/public/program";
import { Badge } from "@/components/ui/badge";

export function SessionTags({
  track,
  format,
}: {
  track: PublicTrack | null;
  format: PublicFormat | null;
}) {
  if (!track && !format) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {format ? (
        <Badge
          className="border-0 text-white"
          style={{ backgroundColor: format.color }}
        >
          {format.name}
        </Badge>
      ) : null}
      {track ? (
        <Badge
          className="border-0 text-white"
          style={{ backgroundColor: track.color }}
        >
          {track.name}
        </Badge>
      ) : null}
    </div>
  );
}
