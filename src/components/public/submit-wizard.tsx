"use client";

import { useMemo, useState, useTransition } from "react";

import { AttendeePreview } from "@/components/public/attendee-preview";
import { buttonClass, cx, Icon, inputClass } from "@/components/ui";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { visibleQuestionIds, parseCondition, conditionMet } from "@/lib/conditions";
import { stripHtml } from "@/lib/fields";
import {
  accountAction,
  saveDraftAction,
  submitProposalAction,
  type WizardParticipant,
} from "@/server/public-form-actions";

export type WizardQuestion = {
  id: string;
  key: string;
  label: string;
  type: string;
  required: boolean;
  locked: boolean;
  helpText: string | null;
  maxLength: number | null;
  options: Array<{ value: string; label: string }>;
  condition: string | null;
};

export type WizardProps = {
  slug: string;
  formId: string;
  eventName: string;
  accent: string;
  showWelcome: boolean;
  welcomeMessage: string | null;
  pageHeading: string | null;
  sectionSubmission: { heading: string | null; description: string | null };
  sectionParticipant: { heading: string | null; description: string | null };
  collectParticipants: boolean;
  submissionQuestions: WizardQuestion[];
  participantQuestions: WizardQuestion[];
  roleConfigs: Array<{ role: string; min: number; max: number }>;
  allowDrafts: boolean;
  successMessage: string | null;
  autoRedirect: boolean;
  redirectSeconds: number;
  combinedLimit: { keys: string[]; max: number; label: string } | null;
  trackColors?: Record<string, string>;
  signedIn: null | { email: string; name: string };
  initial: {
    submissionId: string | null;
    isDraft: boolean;
    answers: Record<string, string | string[]>;
    participants: WizardParticipant[];
  };
  limitReached: boolean;
  submissionLimit: number | null;
};

const ATTENDEE_KEYS = new Set(["title", "description", "key_takeaway"]);
const ABOUT_KEYS = new Set([
  "track",
  "format",
  "level",
  "audience_level",
  "workshop_prerequisites",
  "tags",
  "language",
]);
const REVIEWER_KEYS = new Set(["notes_for_reviewers"]);

const FIELD_TIPS: Record<
  string,
  { title: string; principles: string[]; example?: string }
> = {
  title: {
    title: "What works",
    principles: [
      "Be specific about the problem or outcome.",
      "Avoid generic titles like “Scaling with AI.”",
    ],
    example: "How we cut inference costs 60% without changing models",
  },
  description: {
    title: "What works",
    principles: [
      "Write this for attendees deciding whether to attend—not reviewers.",
      "Explain the problem, what you’ll cover, and what they’ll leave knowing.",
    ],
  },
  key_takeaway: {
    title: "What works",
    principles: [
      "One concrete outcome an attendee can act on after the session.",
      "Prefer a verb + result over a topic label.",
    ],
    example: "Ship a cost dashboard that flags the top three inference spenders",
  },
};

const STEP_LABELS = ["Welcome", "Account", "Submission", "Participants", "Review"];

export function SubmitWizard(props: WizardProps) {
  const steps = useMemo(() => {
    const list: number[] = [];
    if (props.showWelcome) list.push(0);
    list.push(1, 2);
    if (props.collectParticipants) list.push(3);
    list.push(4);
    return list;
  }, [props.showWelcome, props.collectParticipants]);

  const [stepIndex, setStepIndex] = useState(() => {
    // Resume drafts on the submission step (skip welcome / signed-in account).
    if (props.initial.submissionId && props.signedIn) {
      const submissionStep = steps.indexOf(2);
      return submissionStep >= 0 ? submissionStep : 0;
    }
    return 0;
  });
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(props.initial.answers);
  const [participants, setParticipants] = useState<WizardParticipant[]>(
    props.initial.participants.length
      ? props.initial.participants
      : [{ role: "speaker", values: seedParticipant(props) }],
  );
  const [submissionId, setSubmissionId] = useState<string | null>(props.initial.submissionId);
  const [signedIn, setSignedIn] = useState(props.signedIn);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [done, setDone] = useState<null | { redirectTo: string }>(null);
  const [draftSaved, setDraftSaved] = useState(props.initial.isDraft);
  const [accountMode, setAccountMode] = useState<"signup" | "signin">("signup");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const step = steps[stepIndex];
  const visible = visibleQuestionIds(
    props.submissionQuestions.map((q) => ({ id: q.id, condition: q.condition })),
    answers,
  );

  const answerByKey = useMemo(() => {
    const map: Record<string, string> = {};
    for (const question of props.submissionQuestions) {
      const raw = answers[question.id];
      map[question.key] = Array.isArray(raw) ? raw.join(", ") : String(raw ?? "");
    }
    return map;
  }, [answers, props.submissionQuestions]);

  const previewData = useMemo(() => {
    const track = answerByKey.track?.trim() ?? "";
    return {
      title: answerByKey.title ?? "",
      abstract: answerByKey.description ?? "",
      takeaway: answerByKey.key_takeaway ?? "",
      track,
      trackColor: track ? (props.trackColors?.[track] ?? null) : null,
      format: answerByKey.format?.trim() ?? "",
      level: (answerByKey.audience_level || answerByKey.level || "").trim(),
      speakers: participants.map((p) => ({
        firstName: p.values.first_name ?? "",
        lastName: p.values.last_name ?? "",
        jobTitle: p.values.job_title,
        company: p.values.company,
      })),
    };
  }, [answerByKey, participants, props.trackColors]);

  const submissionGroups = useMemo(() => {
    const visibleQuestions = props.submissionQuestions.filter((q) => visible.has(q.id));
    const groups: Array<{ id: string; title: string; hint?: string; questions: WizardQuestion[] }> =
      [
        {
          id: "attendees",
          title: "What attendees will see",
          hint: "This copy shows up on the public programme and session page.",
          questions: visibleQuestions.filter((q) => ATTENDEE_KEYS.has(q.key)),
        },
        {
          id: "about",
          title: "About the session",
          questions: visibleQuestions.filter((q) => ABOUT_KEYS.has(q.key)),
        },
        {
          id: "reviewers",
          title: "For reviewers only",
          hint: "Private — the programme committee sees this; attendees do not.",
          questions: visibleQuestions.filter((q) => REVIEWER_KEYS.has(q.key)),
        },
      ];
    const known = new Set([...ATTENDEE_KEYS, ...ABOUT_KEYS, ...REVIEWER_KEYS]);
    const other = visibleQuestions.filter((q) => !known.has(q.key));
    if (other.length) {
      groups.splice(2, 0, { id: "other", title: "Additional details", questions: other });
    }
    return groups.filter((g) => g.questions.length > 0);
  }, [props.submissionQuestions, visible]);

  const combinedUsed = props.combinedLimit
    ? props.combinedLimit.keys.reduce((sum, key) => {
        const question = props.submissionQuestions.find((q) => q.key === key);
        if (!question) return sum;
        const raw = answers[question.id];
        return sum + stripHtml(Array.isArray(raw) ? raw.join(" ") : String(raw ?? "")).length;
      }, 0)
    : 0;

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function validateSubmissionStep(): boolean {
    const next: Record<string, string> = {};
    for (const question of props.submissionQuestions) {
      if (!visible.has(question.id)) continue;
      if (!question.required) continue;
      const value = answers[question.id];
      const empty =
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "");
      if (empty) next[question.id] = `${question.label} is required.`;
      else if (question.maxLength && stripHtml(String(value)).length > question.maxLength) {
        next[question.id] = `${question.label} must be ${question.maxLength} characters or fewer.`;
      }
    }
    if (props.combinedLimit && combinedUsed > props.combinedLimit.max) {
      setBanner({
        tone: "error",
        text: `${props.combinedLimit.label}: ${combinedUsed} of ${props.combinedLimit.max} characters used.`,
      });
      setErrors(next);
      return false;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      setBanner({ tone: "error", text: "Please complete the required fields below." });
      return false;
    }
    setBanner(null);
    return true;
  }

  function validateParticipantsStep(): boolean {
    for (const [index, participant] of participants.entries()) {
      for (const question of props.participantQuestions) {
        const condition = parseCondition(question.condition);
        if (condition && !conditionMet(condition, participant.values)) continue;
        if (!question.required) continue;
        const value = participant.values[question.key];
        if (!value || !String(value).trim()) {
          setBanner({
            tone: "error",
            text: `Speaker ${index + 1}: ${question.label} is required.`,
          });
          return false;
        }
      }
    }
    for (const rc of props.roleConfigs) {
      const count = participants.filter(
        (p) => (p.role || "speaker") === rc.role && (p.values.email ?? "").trim(),
      ).length;
      if (count < rc.min) {
        setBanner({ tone: "error", text: `Add at least ${rc.min} ${rc.role}(s).` });
        return false;
      }
      if (rc.max && count > rc.max) {
        setBanner({ tone: "error", text: `At most ${rc.max} ${rc.role}(s) allowed.` });
        return false;
      }
    }
    setBanner(null);
    return true;
  }

  function goNext() {
    if (step === 1 && !signedIn) {
      setBanner({ tone: "error", text: "Create an account or sign in to continue." });
      return;
    }
    if (step === 2 && !validateSubmissionStep()) return;
    if (step === 3 && !validateParticipantsStep()) return;
    setBanner(null);
    setStepIndex((i) => Math.min(steps.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setBanner(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function handleAccount(formData: FormData) {
    const mode = String(formData.get("mode") ?? "signup") as "signin" | "signup";
    startTransition(async () => {
      const result = await accountAction({
        mode,
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        firstName: String(formData.get("first_name") ?? ""),
        lastName: String(formData.get("last_name") ?? ""),
        slug: props.slug,
      });
      if (!result.ok) {
        setBanner({ tone: "error", text: result.error ?? "Could not sign you in." });
        return;
      }
      const email = String(formData.get("email") ?? "");
      const name = `${formData.get("first_name") ?? ""} ${formData.get("last_name") ?? ""}`.trim();
      setSignedIn({ email, name: name || email });
      setParticipants((prev) => {
        const next = [...prev];
        if (next[0]) {
          next[0] = {
            ...next[0],
            values: {
              ...next[0].values,
              email: next[0].values.email || email,
              first_name: next[0].values.first_name || String(formData.get("first_name") ?? ""),
              last_name: next[0].values.last_name || String(formData.get("last_name") ?? ""),
            },
          };
        }
        return next;
      });
      setBanner({ tone: "success", text: "You are signed in. Continue with your submission." });
      setStepIndex((i) => Math.min(steps.length - 1, i + 1));
    });
  }

  function saveDraft() {
    startTransition(async () => {
      const result = await saveDraftAction({
        slug: props.slug,
        formId: props.formId,
        submissionId,
        answers,
        participants,
      });
      if (!result.ok) {
        setBanner({ tone: "error", text: result.error ?? "Could not save the draft." });
        return;
      }
      if (result.submissionId) {
        setSubmissionId(result.submissionId);
        // Persist id in the URL so a refresh resumes this draft (R-PUB-6).
        const url = new URL(window.location.href);
        url.searchParams.delete("new");
        url.searchParams.set("submission", result.submissionId);
        window.history.replaceState(null, "", `${url.pathname}${url.search}`);
      }
      setDraftSaved(true);
      setBanner({ tone: "success", text: "Draft saved. You can close this page and come back." });
    });
  }

  function submit() {
    startTransition(async () => {
      const result = await submitProposalAction({
        slug: props.slug,
        formId: props.formId,
        submissionId,
        answers,
        participants,
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setBanner({ tone: "error", text: result.error ?? "Could not submit." });
        return;
      }
      setDone({ redirectTo: result.redirectTo ?? "/portal" });
      if (props.autoRedirect) {
        setTimeout(
          () => {
            window.location.href = result.redirectTo ?? "/portal";
          },
          Math.max(2, props.redirectSeconds) * 1000,
        );
      }
    });
  }

  const needsAccountAction = step === 1 && !signedIn;
  const showBack = stepIndex > 0;
  const showNext = stepIndex < steps.length - 1 && !needsAccountAction;
  const showSubmit = stepIndex === steps.length - 1;
  const showDraft = props.allowDrafts && signedIn && step >= 2;
  const showFooter = showBack || showNext || showSubmit || showDraft;

  if (done) {
    return (
      <section aria-live="polite" className="rounded-lg border border-rule bg-paper p-8">
        <p className="wordmark text-[0.6875rem] uppercase tracking-[0.14em] text-positive">
          Submission received
        </p>
        <div
          className="prose-cf mt-3 text-ink"
          dangerouslySetInnerHTML={{
            __html:
              props.successMessage ??
              "<p><strong>Thank you — your submission has been received.</strong></p>",
          }}
        />
        <p className="mt-4 text-sm text-neutral">
          A confirmation email has been sent to{" "}
          <strong>{signedIn?.email ?? "your address"}</strong>.
          {props.autoRedirect
            ? ` You will be taken to your speaker portal in ${Math.max(2, props.redirectSeconds)} seconds.`
            : ""}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={done.redirectTo} className={buttonClass("primary", "lg")}>
            Continue to portal
          </a>
          <a
            href={`/e/${props.slug}/submit/${props.formId}?new=1`}
            className={buttonClass("secondary", "lg")}
          >
            Submit another proposal
          </a>
        </div>
      </section>
    );
  }

  const submissionStep = step === 2;

  return (
    <div>
      <ol
        className={cx("mb-6 flex flex-wrap gap-2", !submissionStep && "max-w-3xl")}
        aria-label="Progress"
      >
        {steps.map((s, index) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cx(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                index === stepIndex
                  ? "text-white"
                  : index < stepIndex
                    ? "bg-positive-soft text-positive"
                    : "bg-rule text-muted-foreground",
              )}
              style={index === stepIndex ? { backgroundColor: props.accent } : undefined}
            >
              {index < stepIndex ? "✓" : index + 1}
            </span>
            <span
              className={cx(
                "text-sm",
                index === stepIndex ? "font-semibold text-ink" : "text-muted-foreground",
              )}
            >
              {STEP_LABELS[s]}
            </span>
            {index < steps.length - 1 ? <span className="text-rule-2">›</span> : null}
          </li>
        ))}
      </ol>

      {banner ? (
        <div
          role="alert"
          className={cx(
            "mb-4 rounded-md border px-3 py-2 text-sm",
            !submissionStep && "max-w-3xl",
            banner.tone === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-positive/25 bg-positive-soft text-positive",
          )}
        >
          {banner.text}
        </div>
      ) : null}

      {draftSaved ? (
        <div
          className={cx(
            "mb-4 rounded-md border border-warn/25 bg-warn-soft px-3 py-2 text-sm text-warn",
            !submissionStep && "max-w-3xl",
          )}
        >
          <strong>Draft saved.</strong> This proposal is saved as a draft and is not submitted yet.
        </div>
      ) : null}

      <div
        className={cx(
          "rounded-card border border-rule bg-paper p-6",
          !submissionStep && "max-w-3xl",
        )}
      >
        {step === 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-ink">
              {props.pageHeading ?? `Submit to ${props.eventName}`}
            </h2>
            <div
              className="prose-cf mt-3 text-sm text-neutral"
              dangerouslySetInnerHTML={{ __html: props.welcomeMessage ?? "" }}
            />
          </section>
        ) : null}

        {step === 1 ? (
          <section>
            <h2 className="text-lg font-semibold text-ink">Your account</h2>
            {signedIn ? (
              <div className="mt-3 rounded-md border border-positive/25 bg-positive-soft px-3 py-2 text-sm text-positive">
                Signed in as <strong>{signedIn.email}</strong>. Continue to your submission.
              </div>
            ) : (
              <>
                <p className="mt-1 text-sm text-neutral">
                  You need an account so you can edit your submission and track its status. No email
                  confirmation is required.
                </p>

                {accountMode === "signup" ? (
                  <form action={handleAccount} className="mt-6 max-w-md">
                    <input type="hidden" name="mode" value="signup" />
                    <h3 className="text-sm font-semibold text-ink">New here?</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Create an account to continue with your proposal.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <label className="block text-xs font-medium text-neutral">
                        First name
                        <input name="first_name" className={inputClass} required autoComplete="given-name" />
                      </label>
                      <label className="block text-xs font-medium text-neutral">
                        Last name
                        <input name="last_name" className={inputClass} required autoComplete="family-name" />
                      </label>
                    </div>
                    <label className="mt-3 block text-xs font-medium text-neutral">
                      Email
                      <input
                        name="email"
                        type="email"
                        className={inputClass}
                        required
                        autoComplete="email"
                      />
                    </label>
                    <label className="mt-3 block text-xs font-medium text-neutral">
                      Password
                      <input
                        name="password"
                        type="password"
                        minLength={8}
                        className={inputClass}
                        required
                        autoComplete="new-password"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={pending}
                      className={cx(buttonClass("primary", "md"), "mt-4 w-full")}
                    >
                      Create account and continue
                    </button>
                    <p className="mt-5 text-sm text-neutral">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="font-medium text-ink underline decoration-rule-2 underline-offset-2 hover:decoration-ink"
                        onClick={() => {
                          setAccountMode("signin");
                          setBanner(null);
                        }}
                      >
                        Sign in →
                      </button>
                    </p>
                  </form>
                ) : (
                  <form action={handleAccount} className="mt-6 max-w-md">
                    <input type="hidden" name="mode" value="signin" />
                    <h3 className="text-sm font-semibold text-ink">Welcome back</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sign in to continue with your proposal.
                    </p>
                    <label className="mt-4 block text-xs font-medium text-neutral">
                      Email
                      <input
                        name="email"
                        type="email"
                        className={inputClass}
                        required
                        autoComplete="email"
                      />
                    </label>
                    <label className="mt-3 block text-xs font-medium text-neutral">
                      Password
                      <input
                        name="password"
                        type="password"
                        className={inputClass}
                        required
                        autoComplete="current-password"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={pending}
                      className={cx(buttonClass("primary", "md"), "mt-4 w-full")}
                    >
                      Sign in and continue
                    </button>
                    <p className="mt-5 text-sm text-neutral">
                      New here?{" "}
                      <button
                        type="button"
                        className="font-medium text-ink underline decoration-rule-2 underline-offset-2 hover:decoration-ink"
                        onClick={() => {
                          setAccountMode("signup");
                          setBanner(null);
                        }}
                      >
                        Create an account →
                      </button>
                    </p>
                  </form>
                )}
              </>
            )}
          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-ink">
                  {props.sectionSubmission.heading ?? "Your submission"}
                </h2>
                {props.sectionSubmission.description ? (
                  <div
                    className="prose-cf mt-2 text-sm text-neutral"
                    dangerouslySetInnerHTML={{ __html: props.sectionSubmission.description }}
                  />
                ) : null}
              </div>
              <button
                type="button"
                className={cx(buttonClass("secondary", "sm"), "lg:hidden")}
                onClick={() => setMobilePreviewOpen(true)}
              >
                Preview
              </button>
            </div>
            {props.limitReached ? (
              <div className="mt-3 rounded-md border border-warn/25 bg-warn-soft px-3 py-2 text-sm text-warn">
                You have reached the limit of {props.submissionLimit} submissions for this call.
              </div>
            ) : null}

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-start">
              <div className="space-y-8">
                {submissionGroups.map((group) => (
                  <fieldset key={group.id} className="min-w-0">
                    <legend className="w-full">
                      <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
                      {group.hint ? (
                        <p className="mt-1 text-xs text-muted-foreground">{group.hint}</p>
                      ) : null}
                    </legend>
                    <div className="mt-4 space-y-5">
                      {group.questions.map((question) => (
                        <QuestionInput
                          key={question.id}
                          question={question}
                          value={answers[question.id]}
                          error={errors[question.id]}
                          tip={FIELD_TIPS[question.key]}
                          onChange={(value) => setAnswer(question.id, value)}
                        />
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>

              <aside className="hidden lg:block">
                <div className="sticky top-6 rounded-card border border-rule bg-paper-2/60 p-4">
                  <div className="mb-3 flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-ink">Attendee preview</h3>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                  <AttendeePreview data={previewData} />
                </div>
              </aside>
            </div>

            {mobilePreviewOpen ? (
              <div
                className="fixed inset-0 z-50 lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Attendee preview"
              >
                <button
                  type="button"
                  className="absolute inset-0 bg-ink/40"
                  aria-label="Close preview"
                  onClick={() => setMobilePreviewOpen(false)}
                />
                <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-card border border-rule bg-paper p-4 shadow-[var(--shadow-card)]">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-ink">Attendee preview</h3>
                    <button
                      type="button"
                      className={buttonClass("ghost", "sm")}
                      onClick={() => setMobilePreviewOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  <AttendeePreview data={previewData} />
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {step === 3 ? (
          <section>
            <h2 className="text-lg font-semibold text-ink">
              {props.sectionParticipant.heading ?? "Speakers"}
            </h2>
            {props.sectionParticipant.description ? (
              <div
                className="prose-cf mt-2 text-sm text-neutral"
                dangerouslySetInnerHTML={{ __html: props.sectionParticipant.description }}
              />
            ) : null}
            <div className="mt-4 space-y-6">
              {participants.map((participant, index) => (
                <fieldset
                  key={index}
                  className="rounded-md border border-rule p-4"
                >
                  <legend className="flex items-center gap-2 px-1 text-sm font-medium text-neutral">
                    Speaker {index + 1}
                    {index > 0 ? (
                      <button
                        type="button"
                        className="text-xs font-normal text-destructive hover:underline"
                        onClick={() =>
                          setParticipants((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        Remove
                      </button>
                    ) : null}
                  </legend>
                  {props.roleConfigs.length > 1 ? (
                    <label className="mb-3 block text-xs font-medium text-neutral">
                      Role
                      <select
                        className={inputClass}
                        value={participant.role}
                        onChange={(e) =>
                          setParticipants((prev) =>
                            prev.map((p, i) => (i === index ? { ...p, role: e.target.value } : p)),
                          )
                        }
                      >
                        {props.roleConfigs.map((rc) => (
                          <option key={rc.role} value={rc.role}>
                            {rc.role}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {props.participantQuestions
                      .filter((question) => {
                        const condition = parseCondition(question.condition);
                        return !condition || conditionMet(condition, participant.values);
                      })
                      .map((question) => (
                        <div
                          key={question.id}
                          className={
                            question.type === "textarea" || question.type === "wysiwyg"
                              ? "sm:col-span-2"
                              : undefined
                          }
                        >
                          <QuestionInput
                            question={question}
                            value={participant.values[question.key] ?? ""}
                            onChange={(value) =>
                              setParticipants((prev) =>
                                prev.map((p, i) =>
                                  i === index
                                    ? {
                                        ...p,
                                        values: {
                                          ...p.values,
                                          [question.key]: Array.isArray(value)
                                            ? value.join(", ")
                                            : value,
                                        },
                                      }
                                    : p,
                                ),
                              )
                            }
                          />
                        </div>
                      ))}
                  </div>
                </fieldset>
              ))}
            </div>
            {canAddParticipant(props, participants) ? (
              <button
                type="button"
                className={cx(buttonClass("secondary", "md"), "mt-4")}
                onClick={() =>
                  setParticipants((prev) => [...prev, { role: "speaker", values: {} }])
                }
              >
                + Add another speaker
              </button>
            ) : null}
          </section>
        ) : null}

        {step === 4 ? (
          <section>
            <h2 className="text-lg font-semibold text-ink">Review and submit</h2>
            <p className="mt-1 text-sm text-neutral">
              Check every answer before you submit. You can edit your submission from your portal
              while the call is open.
            </p>
            <dl className="mt-4 divide-y divide-rule rounded-md border border-rule">
              {props.submissionQuestions
                .filter((q) => visible.has(q.id))
                .map((question) => (
                  <div key={question.id} className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {question.label}
                    </dt>
                    <dd className="text-sm text-ink sm:col-span-2">
                      {formatValue(answers[question.id]) || (
                        <span className="text-muted-foreground">Not answered</span>
                      )}
                    </dd>
                  </div>
                ))}
            </dl>
            {props.collectParticipants ? (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-ink">Speakers</h3>
                <ul className="mt-2 space-y-2">
                  {participants.map((participant, index) => (
                    <li
                      key={index}
                      className="rounded-md border border-rule px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-ink">
                        {[participant.values.first_name, participant.values.last_name]
                          .filter(Boolean)
                          .join(" ") || "Unnamed"}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({participant.role})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[participant.values.job_title, participant.values.company]
                          .filter(Boolean)
                          .join(", ")}
                        {participant.values.email ? ` · ${participant.values.email}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {showFooter ? (
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-rule pt-4">
            {showBack ? (
              <button type="button" onClick={goBack} className={buttonClass("secondary", "md")}>
                Back
              </button>
            ) : null}
            {showNext ? (
              <button
                type="button"
                onClick={goNext}
                disabled={pending}
                className={buttonClass("primary", "md")}
              >
                Next
              </button>
            ) : null}
            {showSubmit ? (
              <button
                type="button"
                onClick={submit}
                disabled={pending || !signedIn}
                className={buttonClass("primary", "lg")}
              >
                {pending ? "Submitting…" : submissionId ? "Save and submit" : "Submit proposal"}
              </button>
            ) : null}
            {showDraft ? (
              <button
                type="button"
                onClick={saveDraft}
                disabled={pending}
                className={buttonClass("secondary", "md")}
              >
                Save as draft
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function canAddParticipant(props: WizardProps, participants: WizardParticipant[]) {
  const speaker = props.roleConfigs.find((rc) => rc.role === "speaker");
  if (!speaker) return true;
  const count = participants.filter((p) => (p.role || "speaker") === "speaker").length;
  return !speaker.max || count < speaker.max;
}

function seedParticipant(props: WizardProps): Record<string, string> {
  if (!props.signedIn) return {};
  const [first, ...rest] = (props.signedIn.name ?? "").split(" ");
  return {
    email: props.signedIn.email,
    first_name: first ?? "",
    last_name: rest.join(" "),
  };
}

function formatValue(value: string | string[] | undefined): string {
  if (value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return stripHtml(value);
}

function QuestionInput({
  question,
  value,
  error,
  tip,
  onChange,
}: {
  question: WizardQuestion;
  value: string | string[] | undefined;
  error?: string;
  tip?: { title: string; principles: string[]; example?: string };
  onChange: (value: string | string[]) => void;
}) {
  const id = `q-${question.id}`;
  const current = value ?? (question.type === "multiselect" ? [] : "");
  const length = typeof current === "string" ? stripHtml(current).length : 0;

  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-neutral">
          {question.label}
          {question.required ? <span className="ml-0.5 text-destructive">*</span> : null}
        </label>
        {tip ? <FieldTips tip={tip} /> : null}
      </div>
      {!tip && question.helpText ? (
        <p className="mb-1 text-xs text-muted-foreground">{question.helpText}</p>
      ) : null}

      {question.type === "textarea" || question.type === "wysiwyg" ? (
        <textarea
          id={id}
          rows={question.type === "wysiwyg" ? 8 : 5}
          className={cx(inputClass, error && "border-red-400")}
          value={String(current)}
          maxLength={question.maxLength ?? undefined}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : question.type === "dropdown" ? (
        <select
          id={id}
          className={cx(inputClass, error && "border-red-400")}
          value={String(current)}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {question.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : question.type === "multiselect" ? (
        <div className="flex flex-wrap gap-3 rounded-md border border-rule-2 p-2">
          {question.options.map((option) => {
            const selected = Array.isArray(current) && current.includes(option.value);
            return (
              <label key={option.value} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    const list = Array.isArray(current) ? [...current] : [];
                    onChange(
                      e.target.checked
                        ? [...list, option.value]
                        : list.filter((v) => v !== option.value),
                    );
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      ) : question.type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            id={id}
            type="checkbox"
            checked={current === "yes"}
            onChange={(e) => onChange(e.target.checked ? "yes" : "")}
          />
          Yes
        </label>
      ) : (
        <input
          id={id}
          type={inputTypeFor(question.type)}
          className={cx(inputClass, error && "border-red-400")}
          value={String(current)}
          maxLength={question.maxLength ?? undefined}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        {error ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : (
          <span />
        )}
        {question.maxLength ? (
          <span
            className={cx(
              "text-xs",
              length > question.maxLength ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {length} / {question.maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function inputTypeFor(type: string): string {
  switch (type) {
    case "email":
      return "email";
    case "number":
    case "currency":
      return "number";
    case "date":
      return "date";
    case "datetime":
      return "datetime-local";
    case "phone":
      return "tel";
    case "url":
      return "url";
    case "file":
      return "text";
    default:
      return "text";
  }
}

function FieldTips({
  tip,
}: {
  tip: { title: string; principles: string[]; example?: string };
}) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-rule hover:text-ink"
        aria-label="Tips"
      >
        <Icon name="info" size={14} />
        <span className="sr-only">Tips</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <PopoverHeader>
          <PopoverTitle className="text-sm">{tip.title}</PopoverTitle>
          <PopoverDescription className="sr-only">Writing tips for this field.</PopoverDescription>
        </PopoverHeader>
        <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
          {tip.principles.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {tip.example ? (
          <p className="rounded-md bg-paper-2 px-2.5 py-2 text-xs leading-relaxed text-neutral">
            <span className="font-medium text-ink">Better: </span>
            {tip.example}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
