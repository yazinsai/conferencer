"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOutAction } from "@/lib/auth/actions";
import { evaluateCondition, parseCondition } from "@/lib/domain/conditions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/input";
import {
  saveDraftAction,
  submitCfpAction,
  wizardSignInAction,
  wizardSignUpAction,
} from "./submit-actions";

export type FormQuestion = {
  id: string;
  sectionId: string;
  label: string;
  helpText: string | null;
  isRequired: boolean;
  isLocked: boolean;
  sortOrder: number;
  condition: string | null;
  field: {
    id: string;
    key: string;
    type: string;
    options: string[];
    maxLength: number | null;
  };
};

export type FormSection = {
  id: string;
  kind: string;
  title: string | null;
  heading: string | null;
  description: string | null;
};

export type WizardUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type Props = {
  eventSlug: string;
  eventName: string;
  accentColor: string;
  form: {
    id: string;
    title: string;
    pageHeading: string | null;
    welcomeMessage: string | null;
    showWelcome: boolean;
    closesAt: string | null;
    submissionLimit: number | null;
    allowDrafts: boolean;
    successMessage: string | null;
    autoRedirectToPortal: boolean;
    redirectSeconds: number;
  };
  sections: FormSection[];
  questions: FormQuestion[];
  roleConfig: {
    minCount: number;
    maxCount: number;
  };
  initialUser: WizardUser | null;
  userSubmissionCount: number;
  initialDraft?: {
    id: string;
    answers: Record<string, unknown>;
    speakers: Array<Record<string, unknown>>;
    isDraft: boolean;
  } | null;
  readOnly?: boolean;
};

// Submission before Account so track/format/conditionals work logged-out (R-EVAL-2).
const STEPS = ["welcome", "submission", "account", "participant", "review"] as const;
type Step = typeof STEPS[number];

const STEP_LABELS: Record<Step, string> = {
  welcome: "Welcome",
  submission: "Submission",
  account: "Account",
  participant: "Participant",
  review: "Review",
};

function formatCloseDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function parseOptions(raw: string[] | string): string[] {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function visibleQuestions(
  questions: FormQuestion[],
  answers: Record<string, unknown>,
): FormQuestion[] {
  return questions.filter((q) =>
    evaluateCondition(parseCondition(q.condition), answers),
  );
}

function fieldErrors(
  questions: FormQuestion[],
  answers: Record<string, unknown>,
): Record<string, string> {
  const visible = visibleQuestions(questions, answers);
  const errors: Record<string, string> = {};
  for (const q of visible) {
    if (!q.isRequired) continue;
    const v = answers[q.id];
    if (v == null || String(v).trim() === "") {
      errors[q.id] = "This field is required.";
    }
  }
  return errors;
}

export function PublicSubmitWizard({
  eventSlug,
  eventName,
  accentColor,
  form,
  sections,
  questions,
  roleConfig,
  initialUser,
  userSubmissionCount,
  initialDraft = null,
  readOnly = false,
}: Props) {
  const submissionSection = sections.find((s) => s.kind === "submission");
  const participantSection = sections.find((s) => s.kind === "participant");

  const submissionQuestions = useMemo(
    () =>
      questions
        .filter((q) => q.sectionId === submissionSection?.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [questions, submissionSection?.id],
  );

  const participantQuestions = useMemo(
    () =>
      questions
        .filter((q) => q.sectionId === participantSection?.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [questions, participantSection?.id],
  );

  const [step, setStep] = useState<Step>(initialDraft ? "submission" : "welcome");
  const [user, setUser] = useState<WizardUser | null>(initialUser);
  const [submissionId, setSubmissionId] = useState<string | null>(initialDraft?.id ?? null);
  const [isDraft, setIsDraft] = useState(Boolean(initialDraft?.isDraft));
  const [draftBanner, setDraftBanner] = useState<string | null>(
    initialDraft?.isDraft ? "Resumed draft — your previous answers are loaded." : null,
  );
  const [submissionAnswers, setSubmissionAnswers] = useState<Record<string, unknown>>(
    () => initialDraft?.answers ?? {},
  );
  const [speakers, setSpeakers] = useState<Array<Record<string, unknown>>>(
    () =>
      initialDraft?.speakers?.length
        ? initialDraft.speakers
        : [{}],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountMode, setAccountMode] = useState<"signup" | "signin">("signup");
  const [accountForm, setAccountForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [draftLoading, setDraftLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    message: string;
    autoRedirect: boolean;
    redirectSeconds: number;
  } | null>(null);

  const atSubmissionLimit =
    form.submissionLimit != null && userSubmissionCount >= form.submissionLimit;

  const stepIndex = STEPS.indexOf(step);

  const updateSubmissionAnswer = useCallback((questionId: string, value: unknown) => {
    setSubmissionAnswers((prev) => {
      const next = { ...prev, [questionId]: value };
      const visibleIds = new Set(
        visibleQuestions(submissionQuestions, next).map((q) => q.id),
      );
      for (const key of Object.keys(next)) {
        if (!visibleIds.has(key)) delete next[key];
      }
      return next;
    });
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }, [submissionQuestions]);

  const updateSpeakerAnswer = useCallback(
    (speakerIndex: number, questionId: string, value: unknown) => {
      setSpeakers((prev) => {
        const next = [...prev];
        const speaker = { ...next[speakerIndex], [questionId]: value };
        const visibleIds = new Set(
          visibleQuestions(participantQuestions, speaker).map((q) => q.id),
        );
        for (const key of Object.keys(speaker)) {
          if (!visibleIds.has(key)) delete speaker[key];
        }
        next[speakerIndex] = speaker;
        return next;
      });
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`speaker-${speakerIndex}-${questionId}`];
        return copy;
      });
    },
    [participantQuestions],
  );

  useEffect(() => {
    if (!success?.autoRedirect) return;
    const t = setTimeout(() => {
      window.location.href = "/portal";
    }, success.redirectSeconds * 1000);
    return () => clearTimeout(t);
  }, [success]);

  useEffect(() => {
    if (user && step === "account") {
      setAccountForm((prev) => ({
        ...prev,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }));
    }
  }, [user, step]);

  function goNext() {
    if (step === "welcome") {
      setStep("submission");
      return;
    }

    if (step === "submission") {
      const errs = fieldErrors(submissionQuestions, submissionAnswers);
      if (Object.keys(errs).length) {
        setErrors(errs);
        return;
      }
      setStep("account");
      return;
    }

    if (step === "account") {
      if (!user) {
        setAccountError("Sign in or create an account to continue.");
        return;
      }
      if (atSubmissionLimit) {
        setAccountError(
          `You have reached the submission limit (${form.submissionLimit}) for this form.`,
        );
        return;
      }
      setStep("participant");
      return;
    }

    if (step === "participant") {
      const allErrs: Record<string, string> = {};
      speakers.forEach((sp, i) => {
        const errs = fieldErrors(participantQuestions, sp);
        for (const [k, v] of Object.entries(errs)) {
          allErrs[`speaker-${i}-${k}`] = v;
        }
      });
      if (Object.keys(allErrs).length) {
        setErrors(allErrs);
        return;
      }
      setStep("review");
      return;
    }
  }

  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAccountError(null);
    setAccountLoading(true);
    try {
      const result =
        accountMode === "signup"
          ? await wizardSignUpAction({
              email: accountForm.email,
              password: accountForm.password,
              firstName: accountForm.firstName,
              lastName: accountForm.lastName,
            })
          : await wizardSignInAction({
              email: accountForm.email,
              password: accountForm.password,
            });
      if (!result.ok) {
        setAccountError(result.error);
        return;
      }
      setUser(result.user);
      setAccountError(null);
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleSaveDraft() {
    if (readOnly) return;
    if (!user) {
      setDraftBanner("Sign in on the Account step to save a draft.");
      setStep("account");
      return;
    }
    setDraftLoading(true);
    setDraftBanner(null);
    try {
      const result = await saveDraftAction({
        eventSlug,
        formId: form.id,
        submissionId,
        submissionAnswers,
        speakers,
      });
      if (!result.ok) {
        setDraftBanner(result.error);
        return;
      }
      setSubmissionId(result.submissionId);
      setIsDraft(true);
      setDraftBanner("Draft saved. You can leave and resume later from the portal.");
    } finally {
      setDraftLoading(false);
    }
  }

  async function handleFinalSubmit() {
    if (readOnly) {
      setSubmitError("This form is closed. Submissions are read-only.");
      return;
    }
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      const result = await submitCfpAction({
        eventSlug,
        formId: form.id,
        submissionId,
        submissionAnswers,
        speakers,
      });
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      setIsDraft(false);
      setSuccess({
        message: result.successMessage,
        autoRedirect: result.autoRedirectToPortal,
        redirectSeconds: result.redirectSeconds,
      });
    } finally {
      setSubmitLoading(false);
    }
  }

  function renderQuestion(
    q: FormQuestion,
    answers: Record<string, unknown>,
    onChange: (id: string, value: unknown) => void,
    errorKey?: string,
  ) {
    const value = answers[q.id] ?? "";
    const err = errors[errorKey ?? q.id];
    const options = parseOptions(q.field.options);
    const inputId = `q-${q.id}`;

    let control: React.ReactNode;

    switch (q.field.type) {
      case "textarea":
        control = (
          <Textarea
            id={inputId}
            value={String(value)}
            maxLength={q.field.maxLength ?? undefined}
            rows={4}
            onChange={(e) => onChange(q.id, e.target.value)}
          />
        );
        break;
      case "dropdown":
      case "select":
        control = (
          <Select
            id={inputId}
            value={String(value)}
            onChange={(e) => onChange(q.id, e.target.value)}
          >
            <option value="">Select…</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        );
        break;
      case "email":
        control = (
          <Input
            id={inputId}
            type="email"
            value={String(value)}
            onChange={(e) => onChange(q.id, e.target.value)}
            autoComplete="email"
          />
        );
        break;
      default:
        control = (
          <Input
            id={inputId}
            type="text"
            value={String(value)}
            maxLength={q.field.maxLength ?? undefined}
            onChange={(e) => onChange(q.id, e.target.value)}
          />
        );
    }

    return (
      <div key={q.id} className="mb-4">
        <Label htmlFor={inputId}>
          {q.label}
          {q.isRequired ? <span className="text-rose-600"> *</span> : null}
        </Label>
        {q.helpText ? (
          <p className="mb-1 text-xs text-slate-500">{q.helpText}</p>
        ) : null}
        {control}
        <FieldError>{err}</FieldError>
      </div>
    );
  }

  if (success) {
    return (
      <Card>
        <CardHeader title="Submission received" subtitle={eventName} />
        <CardBody>
          <div
            className="prose-compact text-slate-700"
            dangerouslySetInnerHTML={{ __html: success.message }}
          />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonLink href="/portal" variant="primary">
              Continue to portal
            </ButtonLink>
            {success.autoRedirect ? (
              <p className="text-sm text-slate-500">
                Redirecting to the portal in {success.redirectSeconds} seconds…
              </p>
            ) : null}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {form.pageHeading ?? form.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{form.title}</p>
        {form.closesAt ? (
          <p className="mt-2 text-sm text-slate-500">
            Closes: {formatCloseDate(form.closesAt)}
          </p>
        ) : null}
        {form.submissionLimit != null ? (
          <p className="text-sm text-slate-500">
            Submission limit: {form.submissionLimit} per person
            {user ? ` (${userSubmissionCount} used)` : ""}
          </p>
        ) : null}
        {isDraft || draftBanner ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {draftBanner ?? "Draft"}
          </p>
        ) : null}
        {readOnly ? (
          <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            This form is closed. Your submission is read-only.
          </p>
        ) : null}
      </div>

      <nav aria-label="Progress">
        <ol className="flex flex-wrap gap-2">
          {STEPS.map((s, i) => {
            const active = step === s;
            const done = i < stepIndex;
            return (
              <li
                key={s}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  active
                    ? "text-white"
                    : done
                      ? "bg-slate-200 text-slate-700"
                      : "bg-slate-100 text-slate-500"
                }`}
                style={active ? { backgroundColor: accentColor } : undefined}
              >
                {STEP_LABELS[s]}
              </li>
            );
          })}
        </ol>
      </nav>

      <Card>
        {step === "welcome" ? (
          <>
            <CardHeader title="Welcome" subtitle={`${eventName} call for speakers`} />
            <CardBody>
              {form.showWelcome && form.welcomeMessage ? (
                <div
                  className="prose-compact text-slate-700"
                  dangerouslySetInnerHTML={{ __html: form.welcomeMessage }}
                />
              ) : (
                <p className="text-slate-600">
                  Submit your proposal for {eventName}. You will need an account to complete
                  your submission.
                </p>
              )}
            </CardBody>
          </>
        ) : null}

        {step === "account" ? (
          <>
            <CardHeader
              title="Account"
              subtitle={user ? "You are signed in" : "Create an account or sign in"}
            />
            <CardBody>
              {user ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-700">
                    Signed in as <strong>{user.email}</strong> ({user.firstName}{" "}
                    {user.lastName})
                  </p>
                  {atSubmissionLimit ? (
                    <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      You have reached the submission limit for this form.
                    </p>
                  ) : null}
                  <p className="text-xs text-slate-500">
                    Not you?{" "}
                    <form action={signOutAction} className="inline">
                      <button type="submit" className="text-blue-600 hover:underline">
                        Sign out
                      </button>
                    </form>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={accountMode === "signup" ? "primary" : "secondary"}
                      onClick={() => setAccountMode("signup")}
                    >
                      Sign up
                    </Button>
                    <Button
                      type="button"
                      variant={accountMode === "signin" ? "primary" : "secondary"}
                      onClick={() => setAccountMode("signin")}
                    >
                      Sign in
                    </Button>
                  </div>
                  {accountMode === "signup" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          value={accountForm.firstName}
                          onChange={(e) =>
                            setAccountForm((p) => ({ ...p, firstName: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          value={accountForm.lastName}
                          onChange={(e) =>
                            setAccountForm((p) => ({ ...p, lastName: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={accountForm.email}
                      onChange={(e) =>
                        setAccountForm((p) => ({ ...p, email: e.target.value }))
                      }
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={accountForm.password}
                      onChange={(e) =>
                        setAccountForm((p) => ({ ...p, password: e.target.value }))
                      }
                      required
                      minLength={8}
                      autoComplete={
                        accountMode === "signup" ? "new-password" : "current-password"
                      }
                    />
                  </div>
                  {accountError ? (
                    <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {accountError}
                    </p>
                  ) : null}
                  <Button type="submit" disabled={accountLoading}>
                    {accountLoading
                      ? "Please wait…"
                      : accountMode === "signup"
                        ? "Create account"
                        : "Sign in"}
                  </Button>
                </form>
              )}
            </CardBody>
          </>
        ) : null}

        {step === "submission" ? (
          <>
            <CardHeader
              title={submissionSection?.heading ?? "Submission"}
              subtitle={submissionSection?.title ?? undefined}
            />
            <CardBody>
              {submissionSection?.description ? (
                <div
                  className="prose-compact mb-4 text-sm text-slate-600"
                  dangerouslySetInnerHTML={{ __html: submissionSection.description }}
                />
              ) : null}
              {visibleQuestions(submissionQuestions, submissionAnswers).map((q) =>
                renderQuestion(q, submissionAnswers, updateSubmissionAnswer),
              )}
            </CardBody>
          </>
        ) : null}

        {step === "participant" ? (
          <>
            <CardHeader
              title={participantSection?.heading ?? "Participants"}
              subtitle={participantSection?.title ?? undefined}
            />
            <CardBody>
              {participantSection?.description ? (
                <div
                  className="prose-compact mb-4 text-sm text-slate-600"
                  dangerouslySetInnerHTML={{ __html: participantSection.description }}
                />
              ) : null}
              {speakers.map((speaker, speakerIndex) => (
                <div
                  key={speakerIndex}
                  className="mb-6 rounded-lg border border-slate-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Speaker {speakerIndex + 1}
                    </h3>
                    {speakers.length > roleConfig.minCount ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-rose-600"
                        onClick={() =>
                          setSpeakers((prev) => prev.filter((_, i) => i !== speakerIndex))
                        }
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  {visibleQuestions(participantQuestions, speaker).map((q) =>
                    renderQuestion(
                      q,
                      speaker,
                      (id, val) => updateSpeakerAnswer(speakerIndex, id, val),
                      `speaker-${speakerIndex}-${q.id}`,
                    ),
                  )}
                </div>
              ))}
              {speakers.length < roleConfig.maxCount ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSpeakers((prev) => [...prev, {}])}
                >
                  Add speaker
                </Button>
              ) : null}
            </CardBody>
          </>
        ) : null}

        {step === "review" ? (
          <>
            <CardHeader title="Review" subtitle="Confirm your answers before submitting" />
            <CardBody className="space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-slate-800">Submission</h3>
                <dl className="mt-2 space-y-2">
                  {visibleQuestions(submissionQuestions, submissionAnswers).map((q) => (
                    <div key={q.id}>
                      <dt className="text-xs text-slate-500">{q.label}</dt>
                      <dd className="text-sm text-slate-900">
                        {String(submissionAnswers[q.id] ?? "—")}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-slate-800">Speakers</h3>
                {speakers.map((speaker, i) => (
                  <div key={i} className="mt-2 rounded border border-slate-100 p-3">
                    <p className="text-xs font-medium text-slate-500">Speaker {i + 1}</p>
                    <dl className="mt-1 space-y-1">
                      {visibleQuestions(participantQuestions, speaker).map((q) => (
                        <div key={q.id}>
                          <dt className="text-xs text-slate-500">{q.label}</dt>
                          <dd className="text-sm text-slate-900">
                            {String(speaker[q.id] ?? "—")}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </section>
              {submitError ? (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {submitError}
                </p>
              ) : null}
            </CardBody>
          </>
        ) : null}

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={goBack}
            disabled={stepIndex === 0}
          >
            Back
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {form.allowDrafts && !readOnly && (step === "submission" || step === "participant" || step === "review") ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={draftLoading}
              >
                {draftLoading ? "Saving…" : "Save as draft"}
              </Button>
            ) : null}
          {step === "review" ? (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={submitLoading || readOnly}
              style={{ backgroundColor: accentColor }}
              className="hover:opacity-90"
            >
              {submitLoading ? "Submitting…" : "Submit proposal"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={goNext}
              disabled={step === "account" && atSubmissionLimit}
              style={{ backgroundColor: accentColor }}
              className="hover:opacity-90"
            >
              Continue
            </Button>
          )}
          </div>
        </div>
      </Card>
    </div>
  );
}
