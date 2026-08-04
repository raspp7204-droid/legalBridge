"use client";

import { useFormStatus } from "react-dom";
import { Loader2, ArrowRight } from "lucide-react";

/**
 * The pay button on /lawyer/placement. Same treatment as the client-side
 * checkout: the pending state is the whole point, because the write behind it
 * returns fast enough to look like nothing happened.
 */
export function PlacementPayButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
          Activating placement…
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}

/** Quiet counterpart — ending a campaign should not look like a primary act. */
export function PlacementCancelButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mono-label rounded-full border border-rule px-4 py-2.5 text-muted transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-60"
    >
      {pending ? "Ending…" : "End placement"}
    </button>
  );
}
