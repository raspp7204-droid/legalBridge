"use client";

import { useState } from "react";

/** Visual only (PLAN.md §5) — does not write to the database. */
export function AvailabilityToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className="flex items-center gap-3 rounded-full border border-rule bg-surface px-4 py-2.5 transition-colors hover:bg-surface-2"
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
      <span className="mono-label">
        {on ? (
          <span className="text-verified">Available now</span>
        ) : (
          <span className="text-muted">Offline</span>
        )}
      </span>
    </button>
  );
}
