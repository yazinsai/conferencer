import type { ReactNode } from "react";
import type { FormQuestionRow } from "@/lib/db/queries";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export function FormTaskFields({
  assignmentId,
  questions,
}: {
  assignmentId: string;
  questions: FormQuestionRow[];
}) {
  return (
    <>
      {questions.map((q) => {
        const inputId = `q-${assignmentId}-${q.id}`;
        const name = `q_${q.id}`;

        let control: ReactNode;
        switch (q.field.type) {
          case "textarea":
            control = (
              <Textarea
                id={inputId}
                name={name}
                rows={4}
                maxLength={q.field.maxLength ?? undefined}
                required={q.isRequired}
              />
            );
            break;
          case "dropdown":
          case "select":
            control = (
              <Select id={inputId} name={name} required={q.isRequired}>
                <option value="">Select…</option>
                {q.field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            );
            break;
          case "email":
            control = (
              <Input
                id={inputId}
                name={name}
                type="email"
                required={q.isRequired}
                autoComplete="email"
              />
            );
            break;
          default:
            control = (
              <Input
                id={inputId}
                name={name}
                type="text"
                maxLength={q.field.maxLength ?? undefined}
                required={q.isRequired}
              />
            );
        }

        return (
          <div key={q.id}>
            <Label htmlFor={inputId}>
              {q.label}
              {q.isRequired ? <span className="text-rose-600"> *</span> : null}
            </Label>
            {q.helpText ? (
              <p className="mb-1 text-xs text-slate-500">{q.helpText}</p>
            ) : null}
            {control}
          </div>
        );
      })}
    </>
  );
}

export function FormTaskAnswers({
  questions,
  answers,
}: {
  questions: FormQuestionRow[];
  answers: Record<string, string>;
}) {
  const questionMap = Object.fromEntries(questions.map((q) => [q.id, q]));

  return (
    <div className="mt-3 space-y-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
      <div className="text-xs font-medium uppercase text-slate-500">
        Your responses
      </div>
      {Object.entries(answers).map(([questionId, value]) => {
        if (questionId === "answer") {
          return (
            <div key={questionId}>
              <div className="text-xs text-slate-500">Response</div>
              <p className="mt-0.5 whitespace-pre-wrap">{value}</p>
            </div>
          );
        }
        const q = questionMap[questionId];
        return (
          <div key={questionId}>
            <div className="text-xs text-slate-500">{q?.label ?? questionId}</div>
            <p className="mt-0.5 whitespace-pre-wrap">{value || "—"}</p>
          </div>
        );
      })}
    </div>
  );
}
