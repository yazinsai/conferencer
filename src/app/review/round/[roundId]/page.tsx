import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { requireReviewer } from "@/lib/guards";
import { get, readJson } from "@/lib/db";
import { listLookup } from "@/lib/repo/events";
import {
  getPlan,
  getRound,
  reviewerQueue,
  roundIsOpen,
} from "@/lib/repo/evaluations";
import { FilterSelect, SearchBox } from "@/components/client/basics";
import { Card, Chip, EmptyState, LinkButton, Notice, Progress } from "@/components/ui";
import { formatDate } from "@/lib/datetime";
import { stripHtml } from "@/lib/fields";

export const dynamic = "force-dynamic";

export default async function RoundQueue({
  params,
  searchParams,
}: PageProps<"/review/round/[roundId]">) {
  const { roundId } = await params;
  const sp = await searchParams;
  const { user, event } = await requireReviewer();
  const round = getRound(roundId);
  if (!round) notFound();
  const plan = getPlan(round.plan_id);
  if (!plan || plan.event_id !== event.id) notFound();

  // Reviewers may only open rounds they belong to or have assignments in.
  const membership = get<{ n: number }>(
    `SELECT (SELECT COUNT(*) FROM round_reviewers WHERE round_id = ? AND user_id = ?) +
            (SELECT COUNT(*) FROM evaluation_assignments WHERE round_id = ? AND reviewer_user_id = ?) AS n`,
    roundId,
    user.id,
    roundId,
    user.id,
  );
  if (!membership?.n) forbidden();

  const str = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : "");
  const state = str("state");
  const items = reviewerQueue(round.id, user.id, {
    q: str("q"),
    trackId: str("track"),
    formatId: str("format"),
    level: str("level"),
    language: str("language"),
    state,
  });
  const allItems = reviewerQueue(round.id, user.id);
  const pending = allItems.filter((i) => !["complete", "abstained"].includes(i.status)).length;
  const reviewed = allItems.length - pending;
  const filterFields = readJson<string[]>(round.filter_fields, []);
  const cardFields = readJson<string[]>(round.card_fields, []);
  const open = roundIsOpen(round, plan);

  const tracks = listLookup("tracks", event.id);
  const formats = listLookup("formats", event.id);
  const levels = listLookup("levels", event.id);
  const showFilter = (key: string) => !filterFields.length || filterFields.includes(key);

  return (
    <div>
      <Link href="/review" className="text-sm font-medium text-brand-700 hover:underline">
        ← All review rounds
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {plan.name} · {round.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {round.opens_at ? formatDate(round.opens_at) : "—"} –{" "}
            {round.closes_at ? formatDate(round.closes_at) : "—"}
            {round.anonymize ? " · author identity hidden" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">
            {reviewed} of {allItems.length} reviewed
          </p>
          <div className="mt-1 w-40">
            <Progress value={reviewed} max={Math.max(allItems.length, 1)} />
          </div>
        </div>
      </div>

      {sp.saved ? <Notice tone="success" className="mt-4">Review saved.</Notice> : null}
      {sp.abstained ? (
        <Notice tone="warning" className="mt-4">
          Conflict of interest recorded — the organizers can see it.
        </Notice>
      ) : null}
      {!open ? (
        <Notice tone="warning" className="mt-4">
          This round is closed. Existing reviews are read-only.
        </Notice>
      ) : null}
      {round.instructions ? (
        <div
          className="prose-cf mt-4 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700"
          dangerouslySetInnerHTML={{ __html: round.instructions }}
        />
      ) : null}

      <div className="mt-5 flex flex-col gap-5 lg:flex-row">
        <aside className="w-full shrink-0 space-y-4 lg:w-60">
          <Card className="p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quick jump
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {[
                { key: "", label: "All", count: allItems.length },
                { key: "pending", label: "Pending review", count: pending },
                { key: "reviewed", label: "Reviewed", count: reviewed },
              ].map((entry) => (
                <li key={entry.key}>
                  <Link
                    href={`/review/round/${round.id}${entry.key ? `?state=${entry.key}` : ""}`}
                    className={
                      state === entry.key
                        ? "flex justify-between rounded bg-brand-50 px-2 py-1 font-medium text-brand-800"
                        : "flex justify-between rounded px-2 py-1 text-slate-600 hover:bg-slate-100"
                    }
                  >
                    <span>{entry.label}</span>
                    <span>{entry.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filters</p>
            <SearchBox param="q" label="Search submissions" placeholder="Search…" />
            {showFilter("track") ? (
              <FilterSelect
                param="track"
                label="Track"
                allLabel="All"
                options={tracks.map((t) => ({ value: t.id, label: t.name }))}
              />
            ) : null}
            {showFilter("format") ? (
              <FilterSelect
                param="format"
                label="Format"
                allLabel="All"
                options={formats.map((f) => ({ value: f.id, label: f.name }))}
              />
            ) : null}
            {showFilter("level") ? (
              <FilterSelect
                param="level"
                label="Level"
                allLabel="All"
                options={levels.map((l) => ({ value: l.name, label: l.name }))}
              />
            ) : null}
            {showFilter("language") ? (
              <FilterSelect
                param="language"
                label="Language"
                allLabel="All"
                options={[{ value: "English", label: "English" }]}
              />
            ) : null}
          </Card>
        </aside>

        <div className="min-w-0 flex-1">
          {items.length ? (
            <ul className="space-y-3">
              {items.map((item) => {
                const answers = readJson<Record<string, unknown>>(item.answers, {});
                const done = ["complete", "abstained"].includes(item.status);
                return (
                  <li key={item.id}>
                    <Card className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 basis-56">
                          <Link
                            href={`/review/a/${item.id}`}
                            className="text-base font-semibold text-slate-900 hover:text-brand-700"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                            {stripHtml(item.description ?? "").slice(0, 220)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.track_name ? (
                              <Chip color={item.track_color}>{item.track_name}</Chip>
                            ) : null}
                            {item.format_name ? <Chip tone="slate">{item.format_name}</Chip> : null}
                            {item.level ? <Chip tone="blue">{item.level}</Chip> : null}
                            {cardFields.map((key) =>
                              answers[key] ? (
                                <Chip key={key} tone="slate">
                                  {String(answers[key]).slice(0, 40)}
                                </Chip>
                              ) : null,
                            )}
                          </div>
                        </div>
                        <div className="ml-auto flex shrink-0 flex-col items-end gap-2">
                          <Chip tone={item.status === "abstained" ? "amber" : done ? "green" : "slate"}>
                            {item.status === "abstained"
                              ? "Conflict declared"
                              : done
                                ? "Reviewed"
                                : "Pending Review"}
                          </Chip>
                          <LinkButton
                            href={`/review/a/${item.id}`}
                            size="sm"
                            variant={done ? "secondary" : "primary"}
                          >
                            {done ? "View review" : "Review"}
                          </LinkButton>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="Nothing in this view"
              description="Either everything is reviewed, or the filters are too narrow."
              action={<LinkButton href={`/review/round/${round.id}`}>Clear filters</LinkButton>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
