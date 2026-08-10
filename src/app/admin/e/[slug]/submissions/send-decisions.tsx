"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { applyMergeFields } from "@/lib/email/merge";
import { sendDecisionsAction } from "./actions";

type DecisionTemplate = {
  subject: string;
  bodyHtml: string;
};

type SendMode = "accepted" | "declined" | "selected";

const MERGE_FIELDS = [
  "{speaker_name}",
  "{talk_title}",
  "{event_name}",
  "{track}",
] as const;

const SAMPLE_FIELDS = {
  speaker_name: "Priya Raman",
  talk_title: "Scaling Event-Driven Systems Without the Drama",
  event_name: "Sample Conference",
  track: "Architecture",
  portal_link: "/portal",
};

type SelectionContextValue = {
  selected: Set<string>;
  toggle: (id: string) => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("SubmissionSelectionProvider required");
  return ctx;
}

export function SubmissionSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ selected, toggle }), [selected, toggle]);

  return (
    <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
  );
}

export function SubmissionCheckbox({ id }: { id: string }) {
  const { selected, toggle } = useSelection();
  return (
    <input
      type="checkbox"
      checked={selected.has(id)}
      onChange={() => toggle(id)}
      aria-label={`Select submission ${id}`}
    />
  );
}

export function BulkSelectionHiddenInputs() {
  const { selected } = useSelection();
  return (
    <>
      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}
    </>
  );
}

export function SendDecisionsCompose({
  slug,
  eventName,
  acceptedTemplate,
  declinedTemplate,
}: {
  slug: string;
  eventName: string;
  acceptedTemplate: DecisionTemplate;
  declinedTemplate: DecisionTemplate;
}) {
  const { selected } = useSelection();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SendMode>("accepted");
  const [subject, setSubject] = useState(acceptedTemplate.subject);
  const [bodyHtml, setBodyHtml] = useState(acceptedTemplate.bodyHtml);
  const [note, setNote] = useState("");
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const sampleFields = useMemo(
    () => ({
      ...SAMPLE_FIELDS,
      event_name: eventName,
    }),
    [eventName],
  );

  const previewSubject = applyMergeFields(subject || "Subject preview", sampleFields);
  const previewBody = applyMergeFields(bodyHtml || "<p>Message preview</p>", sampleFields);
  const previewWithNote = note
    ? `${previewBody}<hr/><p>${note.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
    : previewBody;

  function onModeChange(next: SendMode) {
    setMode(next);
    const tpl = next === "declined" ? declinedTemplate : acceptedTemplate;
    setSubject(tpl.subject);
    setBodyHtml(tpl.bodyHtml);
  }

  function handleSend() {
    const formData = new FormData();
    formData.set("slug", slug);
    formData.set("mode", mode);
    formData.set("subject", subject);
    formData.set("bodyHtml", bodyHtml);
    if (note) formData.set("note", note);
    if (mode === "selected") {
      for (const id of selected) formData.append("ids", id);
    }

    startTransition(async () => {
      const result = await sendDecisionsAction(formData);
      setSentCount(result.sent);
      window.alert(`Sent ${result.sent} decision email${result.sent === 1 ? "" : "s"}.`);
    });
  }

  const selectedCount = selected.size;
  const canSend =
    mode !== "selected" || selectedCount > 0;

  return (
    <div className="relative">
      <Button type="button" variant="secondary" onClick={() => setOpen((v) => !v)}>
        {open ? "Close" : "Send Decisions"}
      </Button>

      {sentCount !== null ? (
        <p className="mt-2 text-sm text-green-700">
          Last send: {sentCount} email{sentCount === 1 ? "" : "s"} dispatched.
        </p>
      ) : null}

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[min(100vw-2rem,32rem)] rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-900">Send decision emails</h3>
          <p className="mt-1 text-xs text-slate-500">
            Compose from your decision templates, preview merge fields, then confirm send.
          </p>

          <div className="mt-3 space-y-3">
            <div>
              <Label htmlFor="decisionMode">Recipients</Label>
              <Select
                id="decisionMode"
                value={mode}
                onChange={(e) => onModeChange(e.target.value as SendMode)}
              >
                <option value="accepted">All accepted submissions</option>
                <option value="declined">All declined submissions</option>
                <option value="selected">
                  Selected submissions ({selectedCount})
                </option>
              </Select>
            </div>

            <div>
              <Label htmlFor="decisionSubject">Subject</Label>
              <Input
                id="decisionSubject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject with {merge_fields}"
                required
              />
            </div>

            <div>
              <Label htmlFor="decisionBody">Message body (HTML)</Label>
              <Textarea
                id="decisionBody"
                rows={5}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                placeholder="<p>Hi {speaker_name}, …</p>"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Merge fields: {MERGE_FIELDS.join(", ")}
              </p>
            </div>

            <div>
              <Label htmlFor="decisionNote">Additional note (appended to body)</Label>
              <Textarea
                id="decisionNote"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional reviewer feedback or request for changes…"
              />
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="mb-1 font-medium text-slate-700">Preview (Priya Raman)</p>
              <p className="text-slate-600">
                <span className="font-medium">Subject:</span> {previewSubject}
              </p>
              <div
                className="prose prose-sm mt-2 max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: previewWithNote }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={pending || !canSend}
                onClick={handleSend}
              >
                {pending ? "Sending…" : "Confirm send"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
