import { eventBySlugOr404 } from "@/lib/guards";
import { publicSessions, speakersForSubmissions } from "@/lib/repo/submissions";
import { MySchedule, type StarSession } from "@/components/client/schedule";
import { formatRange } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]/my-schedule">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  return { title: `My schedule · ${event.name}` };
}

export default async function MySchedulePage({ params }: PageProps<"/e/[slug]/my-schedule">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  const sessions = publicSessions(event.id);
  const speakerMap = speakersForSubmissions(sessions.map((s) => s.id));

  const payload: StarSession[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    start: s.pub_starts_at,
    end: s.pub_ends_at,
    room: s.room_name,
    track: s.track_name,
    trackColor: s.track_color,
    speakers: (speakerMap.get(s.id) ?? []).map((p) => `${p.first_name} ${p.last_name}`).join(", "),
    href: `/e/${event.slug}/sessions/${s.id}`,
    when: s.pub_starts_at ? formatRange(s.pub_starts_at, s.pub_ends_at) : "Time to be announced",
  }));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">My schedule</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your personal picks for {event.name}. Saved in this browser — no account needed.
        </p>
      </div>
      <MySchedule slug={event.slug} sessions={payload} eventName={event.name} />
    </div>
  );
}
