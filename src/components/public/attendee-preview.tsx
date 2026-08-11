"use client";

import { Avatar, Chip, cx } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { ShowMore } from "@/components/client/basics";
import { stripHtml } from "@/lib/fields";

export type AttendeePreviewData = {
  title: string;
  abstract: string;
  takeaway: string;
  track: string;
  trackColor?: string | null;
  format: string;
  level: string;
  speakers: Array<{
    firstName: string;
    lastName: string;
    jobTitle?: string;
    company?: string;
  }>;
};

export function AttendeePreview({
  data,
  className,
}: {
  data: AttendeePreviewData;
  className?: string;
}) {
  const title = data.title.trim() || "Your session title";
  const abstract = stripHtml(data.abstract).trim();
  const takeaway = data.takeaway.trim();
  const hasSpeakers = data.speakers.some((s) => s.firstName || s.lastName);

  return (
    <div className={cx("space-y-5", className)}>
      <div>
        <p className="wordmark text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          Programme listing
        </p>
        <article className="mt-2 rounded-card border border-rule bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="display text-base leading-snug text-ink">{title}</h3>
          <PreviewMeta />
          {abstract ? (
            <ShowMore
              text={abstract}
              limit={200}
              className="mt-2.5 text-sm leading-relaxed text-neutral"
            />
          ) : (
            <p className="mt-2.5 text-sm italic text-muted-foreground">
              Abstract appears here as attendees browse the programme.
            </p>
          )}
          <PreviewSpeakers speakers={data.speakers} hasSpeakers={hasSpeakers} />
          <PreviewTags data={data} />
        </article>
      </div>

      <div>
        <p className="wordmark text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          Session page
        </p>
        <article className="mt-2 rounded-card border border-rule bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-xl font-semibold tracking-tight text-ink">{title}</h3>
          <PreviewMeta />
          <PreviewTags data={data} />
          {abstract ? (
            <div className="prose-cf mt-4 text-sm text-neutral">
              {abstract
                .split("\n")
                .filter(Boolean)
                .map((para, index) => (
                  <p key={index}>{para}</p>
                ))}
            </div>
          ) : (
            <p className="mt-4 text-sm italic text-muted-foreground">
              Full abstract on the session page.
            </p>
          )}
          {takeaway ? (
            <p className="mt-4 border-l-2 border-ink/15 pl-3 text-sm text-neutral">
              <span className="font-medium text-ink">You&apos;ll leave knowing: </span>
              {takeaway}
            </p>
          ) : null}
          {hasSpeakers ? (
            <div className="mt-5 border-t border-rule pt-4">
              <h4 className="text-sm font-semibold text-ink">
                {data.speakers.filter((s) => s.firstName || s.lastName).length === 1
                  ? "Speaker"
                  : "Speakers"}
              </h4>
              <ul className="mt-3 space-y-3">
                {data.speakers
                  .filter((s) => s.firstName || s.lastName)
                  .map((s, index) => {
                    const name = `${s.firstName} ${s.lastName}`.trim();
                    return (
                      <li key={index} className="flex gap-3">
                        <Avatar name={name} size={40} />
                        <div>
                          <p className="font-medium text-ink">{name}</p>
                          {s.jobTitle || s.company ? (
                            <p className="text-sm text-muted-foreground">
                              {[s.jobTitle, s.company].filter(Boolean).join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ) : null}
        </article>
      </div>
    </div>
  );
}

function PreviewMeta() {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="wordmark tnum inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon name="clock" size={14} />
        Time to be announced
      </span>
    </p>
  );
}

function PreviewTags({ data }: { data: AttendeePreviewData }) {
  if (!data.track && !data.format && !data.level) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {data.track ? (
        <Chip color={data.trackColor} title="Track">
          {data.track}
        </Chip>
      ) : null}
      {data.format ? <Chip tone="slate">{data.format}</Chip> : null}
      {data.level ? <Chip tone="blue">{data.level}</Chip> : null}
    </div>
  );
}

function PreviewSpeakers({
  speakers,
  hasSpeakers,
}: {
  speakers: AttendeePreviewData["speakers"];
  hasSpeakers: boolean;
}) {
  if (!hasSpeakers) return null;
  return (
    <ul className="mt-3 space-y-1.5">
      {speakers
        .filter((s) => s.firstName || s.lastName)
        .map((s, index) => {
          const name = `${s.firstName} ${s.lastName}`.trim();
          return (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Avatar name={name} size={26} />
              <span className="min-w-0 text-neutral">
                <span className="font-medium text-ink">{name}</span>
                {s.jobTitle || s.company ? (
                  <span className="text-muted-foreground">
                    {" — "}
                    {[s.jobTitle, s.company].filter(Boolean).join(", ")}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
    </ul>
  );
}
