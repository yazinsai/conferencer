import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { eventBySlugOr404 } from "@/lib/guards";
import { getLookup, listLookup } from "@/lib/repo/events";
import { currentUser, fullName } from "@/lib/auth";
import { readJson } from "@/lib/db";
import { formClosedReason, formIsOpen, getForm, listQuestions, listRoleConfigs, sectionOfKind } from "@/lib/repo/forms";
import { optionsForQuestion } from "@/server/public-form-actions";
import { portalContact } from "@/lib/repo/contacts";
import {
  countSubmissionsBySubmitter,
  getSubmission,
  latestDraftForSubmitter,
  listParticipants,
} from "@/lib/repo/submissions";
import { SubmitWizard, type WizardQuestion } from "@/components/public/submit-wizard";
import { Card, LinkButton, Notice } from "@/components/ui";
import { formatDateTime, formatEventDates } from "@/lib/datetime";
import { PublicPage } from "@/components/public/pieces";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/e/[slug]/submit/[formId]">) {
  const { slug, formId } = await params;
  const event = eventBySlugOr404(slug);
  const form = getForm(formId);
  return { title: form ? `${form.title} · ${event.name}` : `Call for speakers · ${event.name}` };
}

export default async function PublicFormPage({
  params,
  searchParams,
}: PageProps<"/e/[slug]/submit/[formId]">) {
  const { slug, formId } = await params;
  const sp = await searchParams;
  const event = eventBySlugOr404(slug);
  const form = getForm(formId);
  if (!form || form.event_id !== event.id) notFound();

  const user = await currentUser();
  const contact = user ? portalContact(event, user) : undefined;
  const open = formIsOpen(form);
  const closedReason = formClosedReason(form);

  const editId = typeof sp.submission === "string" ? sp.submission : null;
  const forceNew = sp.new === "1" || sp.new === "true";

  // Resume the latest draft when returning to the bare form URL (R-PUB-6).
  // `?new=1` opts out so "Submit another" can start blank when multiple drafts
  // are allowed; single-draft forms still resume the existing draft.
  if (!editId && contact && open && (!forceNew || !form.allow_multiple_drafts)) {
    const draft = latestDraftForSubmitter(event.id, contact.id, form.id);
    if (draft) {
      redirect(`/e/${event.slug}/submit/${form.id}?submission=${draft.id}`);
    }
  }

  const existing = editId ? getSubmission(editId) : undefined;
  const canEditExisting =
    existing &&
    existing.event_id === event.id &&
    contact &&
    (existing.submitter_contact_id === contact.id ||
      listParticipants(existing.id).some((p) => p.contact_id === contact.id));

  const submissionQuestions = listQuestions(form.id, "submission");
  const participantQuestions = listQuestions(form.id, "participant");

  const toWizard = async (
    questions: Awaited<ReturnType<typeof listQuestions>>,
  ): Promise<WizardQuestion[]> =>
    Promise.all(
      questions.map(async (question) => ({
        id: question.id,
        key: question.key,
        label: question.label,
        type: question.type,
        required: Boolean(question.is_required),
        locked: Boolean(question.is_locked),
        helpText: question.help_text ?? question.field_help ?? null,
        maxLength: question.max_length,
        options: await optionsForQuestion(event.id, question),
        condition: question.condition,
      })),
    );

  const wizardSubmission = await toWizard(submissionQuestions);
  const wizardParticipant = await toWizard(participantQuestions);

  const combined = readJson<{ question_keys?: string[]; max?: number; label?: string } | null>(
    form.combined_limit,
    null,
  );

  // Pre-fill when editing or resuming a draft (R-PUB-6 / R-PUB-8).
  const initialAnswers: Record<string, string | string[]> = {};
  let initialParticipants: Array<{ role: string; values: Record<string, string> }> = [];
  if (canEditExisting && existing) {
    const stored = readJson<Record<string, unknown>>(existing.answers, {});
    for (const question of submissionQuestions) {
      switch (question.key) {
        case "title":
          initialAnswers[question.id] = existing.title;
          break;
        case "description":
          initialAnswers[question.id] = existing.description ?? "";
          break;
        case "track":
          initialAnswers[question.id] = trackLabel(existing.track_id);
          break;
        case "format":
          initialAnswers[question.id] = formatLabel(existing.format_id);
          break;
        case "level":
          initialAnswers[question.id] = existing.level ?? "";
          break;
        case "tags":
          initialAnswers[question.id] = readJson<string[]>(existing.tags, []);
          break;
        default:
          if (stored[question.key] !== undefined) {
            initialAnswers[question.id] = stored[question.key] as string;
          }
      }
    }
    initialParticipants = listParticipants(existing.id)
      .filter((p) => p.role !== "submitter")
      .map((p) => ({
        role: p.role,
        values: {
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          job_title: p.job_title ?? "",
          company: p.company ?? "",
          biography: p.biography ?? "",
          linkedin_url: p.linkedin_url ?? "",
          twitter_url: p.twitter_url ?? "",
          website_url: p.website_url ?? "",
          pronouns: p.pronouns ?? "",
        },
      }));
  }

  const submittedCount =
    contact && form.submission_limit
      ? countSubmissionsBySubmitter(event.id, contact.id, form.id)
      : 0;
  const limitReached = Boolean(
    form.submission_limit && !canEditExisting && submittedCount >= form.submission_limit,
  );

  const submissionSection = sectionOfKind(form.id, "submission");
  const participantSection = sectionOfKind(form.id, "participant");

  const trackColors = Object.fromEntries(
    listLookup("tracks", event.id).map((track) => [track.name, track.color]),
  );

  return (
    <PublicPage width={open ? "wide" : "prose"}>
      <div className="mb-6 max-w-3xl">
        <p className="wordmark text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          {event.name} · {formatEventDates(event.starts_at, event.ends_at)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {form.page_heading ?? form.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral">
          {form.closes_at ? (
            <span>
              <strong className="text-ink">Submissions close:</strong>{" "}
              {formatDateTime(form.closes_at, { weekday: true })}
            </span>
          ) : null}
          {form.submission_limit ? (
            <span>
              <strong className="text-ink">Limit:</strong> {form.submission_limit} submissions
              per person
            </span>
          ) : null}
          {event.location ? <span>{event.location}</span> : null}
        </div>
      </div>

      {!open ? (
        <Card className="p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-700">
            Submissions closed
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ink">
            {closedReason ?? "This call for speakers is closed."}
          </h2>
          <p className="mt-2 text-sm text-neutral">
            {form.closes_at
              ? `The deadline was ${formatDateTime(form.closes_at, { weekday: true })}.`
              : ""}{" "}
            Existing submissions can still be viewed in the speaker portal, but they can no longer
            be edited or submitted.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <LinkButton href={`/e/${event.slug}/sessions`} variant="primary">
              See the programme
            </LinkButton>
            <LinkButton href="/portal">Speaker portal</LinkButton>
          </div>
        </Card>
      ) : (
        <>
          {canEditExisting ? (
            <Notice tone="info" className="mb-4 max-w-3xl">
              You are editing <strong>{existing?.title}</strong>.{" "}
              <Link href="/portal/submissions" className="underline">
                Back to my submissions
              </Link>
            </Notice>
          ) : null}
          <SubmitWizard
            slug={event.slug}
            formId={form.id}
            eventName={event.name}
            accent={event.accent_color}
            showWelcome={Boolean(form.show_welcome) && Boolean(form.welcome_message)}
            welcomeMessage={form.welcome_message}
            pageHeading={form.page_heading}
            sectionSubmission={{
              heading: submissionSection.heading,
              description: submissionSection.description,
            }}
            sectionParticipant={{
              heading: participantSection.heading,
              description: participantSection.description,
            }}
            collectParticipants={Boolean(form.collect_participants)}
            submissionQuestions={wizardSubmission}
            participantQuestions={wizardParticipant}
            roleConfigs={listRoleConfigs(form.id)
              .filter((rc) => rc.enabled)
              .map((rc) => ({ role: rc.role, min: rc.min_count, max: rc.max_count }))}
            allowDrafts={Boolean(form.allow_drafts)}
            successMessage={form.success_message}
            autoRedirect={Boolean(form.auto_redirect_to_portal)}
            redirectSeconds={form.redirect_seconds}
            combinedLimit={
              combined?.max && combined.question_keys?.length
                ? {
                    keys: combined.question_keys,
                    max: combined.max,
                    label: combined.label ?? "Combined character limit",
                  }
                : null
            }
            trackColors={trackColors}
            signedIn={user ? { email: user.email, name: fullName(user) } : null}
            initial={{
              submissionId: canEditExisting ? (existing?.id ?? null) : null,
              isDraft: Boolean(
                canEditExisting && existing && (existing.status === "draft" || existing.is_draft),
              ),
              answers: initialAnswers,
              participants: initialParticipants,
            }}
            limitReached={limitReached}
            submissionLimit={form.submission_limit}
          />
        </>
      )}
    </PublicPage>
  );
}

function trackLabel(trackId: string | null): string {
  return trackId ? (getLookup("tracks", trackId)?.name ?? "") : "";
}

function formatLabel(formatId: string | null): string {
  return formatId ? (getLookup("formats", formatId)?.name ?? "") : "";
}
