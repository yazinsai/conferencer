"use client";

import { useEffect, useState } from "react";

/** Progressive enhancement: mirrors how many speaker rows are checked. */
export function SpeakersSelectionStatus({ formId }: { formId: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;
    const update = () => {
      setCount(form.querySelectorAll<HTMLInputElement>('input[name="contact_ids"]:checked').length);
    };
    update();
    form.addEventListener("change", update);
    return () => form.removeEventListener("change", update);
  }, [formId]);

  return (
    <span className="text-sm text-muted-foreground" role="status">
      {count > 0 ? (
        <>
          <span className="wordmark tnum font-medium text-ink">{count}</span> selected
        </>
      ) : (
        "Select speakers to invite or update"
      )}
    </span>
  );
}
