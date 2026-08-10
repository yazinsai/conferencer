import Link from "next/link";

import { eventBySlugOr404 } from "@/lib/guards";
import { publicSpeakers } from "@/lib/repo/submissions";
import { SearchBox } from "@/components/client/basics";
import { Avatar, EmptyState, LinkButton } from "@/components/ui";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]/speakers">) {
  const { slug } = await params;
  const event = eventBySlugOr404(slug);
  return { title: `Speakers · ${event.name}` };
}

export default async function SpeakersPage({
  params,
  searchParams,
}: PageProps<"/e/[slug]/speakers">) {
  const { slug } = await params;
  const sp = await searchParams;
  const event = eventBySlugOr404(slug);
  const q = typeof sp.q === "string" ? sp.q : "";
  const total = publicSpeakers(event.id).length;
  const speakers = publicSpeakers(event.id, q);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Speakers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Everyone speaking at {event.name}, listed alphabetically by surname.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox
          param="q"
          label="Search speakers"
          placeholder="Search by name or company…"
          className="w-full sm:w-80"
        />
        {q ? <LinkButton href={`/e/${event.slug}/speakers`} size="sm">Clear</LinkButton> : null}
        <p className="text-sm text-slate-500" role="status">
          Showing <strong className="text-slate-800">{speakers.length}</strong> of {total} speakers
        </p>
      </div>

      {speakers.length ? (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {speakers.map((speaker) => (
            <li key={speaker.id}>
              <Link
                href={`/e/${event.slug}/speakers/${speaker.id}`}
                className="flex items-start gap-4 p-4 hover:bg-slate-50"
              >
                <Avatar
                  src={speaker.headshot_url}
                  name={`${speaker.first_name} ${speaker.last_name}`}
                  size={56}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {speaker.first_name} {speaker.last_name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {[speaker.job_title, speaker.company].filter(Boolean).join(", ") ||
                      "Speaker"}
                  </p>
                  {speaker.biography ? (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {stripHtml(speaker.biography).slice(0, 180)}
                      {stripHtml(speaker.biography).length > 180 ? "…" : ""}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs font-medium text-brand-700">
                    {speaker.session_count} {speaker.session_count === 1 ? "session" : "sessions"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No speakers match that search"
          description="Try another name, or clear the search to see the full directory."
          action={<LinkButton href={`/e/${event.slug}/speakers`}>Clear search</LinkButton>}
        />
      )}
    </div>
  );
}
