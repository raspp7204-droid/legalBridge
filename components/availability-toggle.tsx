"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setAvailability } from "@/app/lawyer/actions";

/**
 * Real toggle — writes `online` for the signed-in advocate and publishes
 * upcoming slots when switched on.
 */
export function AvailabilityToggle({
  initial,
  verified,
}: {
  initial: boolean;
  verified: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function flip() {
    const next = !on;
    setOn(next); // optimistic
    setFailed(false);
    startTransition(async () => {
      try {
        await setAvailability(next);
      } catch {
        setOn(!next);
        setFailed(true);
      }
    });
  }

  return (
    <div className="text-right">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={flip}
        disabled={pending}
        className="flex items-center gap-3 rounded-full border border-rule bg-surface px-4 py-2.5 transition-colors hover:bg-surface-2 disabled:opacity-70"
      >
        <span
          className={`relative h-5 w-9 rounded-full transition-colors ${
            on ? "bg-verified" : "bg-rule"
          }`}
        >
          <span
            className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${
              on ? "left-[1.125rem]" : "left-0.5"
            }`}
          />
        </span>
        <span className="mono-label flex items-center gap-1.5">
          {pending && (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
          )}
          {on ? (
            <span className="text-verified">Available now</span>
          ) : (
            <span className="text-muted">Offline</span>
          )}
        </span>
      </button>

      {failed && (
        <p className="mono-label mt-2 text-danger">Could not save — try again</p>
      )}
      {!failed && on && !verified && (
        <p className="mono-label mt-2 max-w-[15rem] text-muted">
          Clients see you once verification completes
        </p>
      )}
    </div>
  );
}
