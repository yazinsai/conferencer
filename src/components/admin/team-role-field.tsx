"use client";

import { useState } from "react";

import { Field, Select } from "@/components/ui";

const ROLE_HINTS: Record<string, string> = {
  organizer: "Organizers see every admin surface for this event.",
  reviewer: "Reviewers only see the submissions assigned to them.",
};

/** Native role select with a PE hint that updates when JavaScript is available. */
export function TeamRoleField({ defaultValue = "reviewer" }: { defaultValue?: string }) {
  const [role, setRole] = useState(defaultValue);

  return (
    <Field label="Role" name="role">
      <Select
        id="role"
        name="role"
        defaultValue={defaultValue}
        onChange={(event) => setRole(event.target.value)}
      >
        <option value="organizer">Organizer</option>
        <option value="reviewer">Reviewer</option>
      </Select>
      <p className="mt-1 text-xs text-muted-foreground">{ROLE_HINTS[role] ?? ROLE_HINTS.reviewer}</p>
    </Field>
  );
}
