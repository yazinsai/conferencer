"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createApiTokenAction } from "./actions";

export function CreateTokenForm({ slug }: { slug: string }) {
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      const result = await createApiTokenAction(formData);
      setRawToken(result.raw);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setPending(false);
    }
  }

  if (rawToken) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          Copy your API token now — it will not be shown again.
        </p>
        <code className="mt-2 block break-all rounded bg-white px-3 py-2 text-sm text-slate-800 ring-1 ring-amber-200">
          {rawToken}
        </code>
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() => {
            void navigator.clipboard.writeText(rawToken);
          }}
        >
          Copy to clipboard
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="mt-3 ml-2"
          onClick={() => setRawToken(null)}
        >
          Done
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="slug" value={slug} />
      <label className="text-sm">
        Token name
        <Input
          name="name"
          placeholder="e.g. Zapier integration"
          required
          className="mt-1 w-64"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create token"}
      </Button>
    </form>
  );
}
