"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

/** Mobile only: the rail becomes a bottom sheet (PLAN.md §3). */
export function FilterSheet({
  children,
  activeCount,
}: {
  children: React.ReactNode;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-rule bg-surface px-4 py-2.5 text-sm text-text lg:hidden"
      >
        <SlidersHorizontal className="size-4" strokeWidth={2} />
        Filters
        {activeCount > 0 && (
          <span className="mono-label rounded-full bg-brass px-2 py-0.5 text-[#14100A]">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-rule bg-bg p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg">Filters</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="flex size-9 items-center justify-center rounded-full border border-rule"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
            {/* Tapping a filter navigates; close so results are visible */}
            <div onClick={() => setOpen(false)}>{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
