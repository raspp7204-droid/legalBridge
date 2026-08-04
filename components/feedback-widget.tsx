"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  X,
  Lightbulb,
  TriangleAlert,
  Heart,
  Send,
  Check,
  Loader2,
} from "lucide-react";
import { submitFeedback, type FeedbackState } from "@/app/feedback/actions";

/**
 * The suggestion box as a floating launcher, stacked above the assistant.
 *
 * Bottom-right, not bottom-left: Next's dev-tools badge lives in the
 * bottom-left corner, so a launcher there is half-covered any time the site
 * is run with `pnpm dev` — which is exactly when it would be demoed.
 *
 * `stacked` is false on advocate pages, where the assistant is not rendered
 * and this button should sit in the corner itself rather than float above an
 * empty space. Navy rather than oxblood so the two buttons are told apart at
 * a glance; oxblood is already spoken for.
 */

const KINDS = [
  { value: "SUGGESTION", label: "Idea", icon: Lightbulb },
  { value: "ISSUE", label: "Problem", icon: TriangleAlert },
  { value: "PRAISE", label: "Praise", icon: Heart },
] as const;

function SendButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
          Sending…
        </>
      ) : (
        <>
          <Send className="size-4" strokeWidth={2.5} />
          Send it
        </>
      )}
    </button>
  );
}

export function FeedbackWidget({
  signedIn = false,
  stacked = true,
}: {
  signedIn?: boolean;
  /** True when the assistant launcher is below this one. */
  stacked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>("SUGGESTION");
  const [state, action] = useActionState<FeedbackState, FormData>(
    submitFeedback,
    { ok: false },
  );

  // Esc closes the panel, same as the assistant.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="lb-feedback-panel"
        aria-label={open ? "Close suggestion box" : "Open the suggestion box"}
        className={`fixed right-4 z-50 flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-white shadow-[0_6px_20px_rgb(23_35_58/0.28)] transition-transform hover:-translate-y-0.5 max-sm:size-12 max-sm:justify-center max-sm:p-0 sm:right-6 ${
          stacked ? "bottom-20 sm:bottom-24" : "bottom-4 sm:bottom-6"
        }`}
      >
        {open ? (
          <X className="size-5" strokeWidth={2} />
        ) : (
          <span className="relative flex items-center justify-center">
            <Lightbulb className="size-5" strokeWidth={2} />
            {/* The one spot of oxblood on a navy button — it is what makes
                the launcher read as "new", and it stops when opened. */}
            <span className="animate-pulse-dot absolute -top-1.5 -right-1.5 size-2 rounded-full bg-accent" />
          </span>
        )}
        <span className="mono-label hidden sm:inline">
          {open ? "Close" : "Suggest"}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          id="lb-feedback-panel"
          role="dialog"
          aria-label="Suggestion box"
          className={`fixed inset-x-3 z-40 flex max-h-[min(72dvh,640px)] flex-col overflow-hidden rounded-2xl border border-rule bg-surface shadow-[0_12px_40px_rgb(23_35_58/0.16)] sm:inset-x-auto sm:right-6 sm:w-[380px] ${
            stacked ? "bottom-36 sm:bottom-40" : "bottom-20 sm:bottom-24"
          }`}
        >
          <div className="h-[3px] w-full bg-accent" aria-hidden="true" />

          <header className="flex items-start gap-3 border-b border-rule bg-surface-2 px-4 py-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm border border-accent/35 bg-accent-bg text-accent">
              <Lightbulb className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[0.95rem] leading-tight">
                Suggestion box
              </p>
              <p className="mono-label text-muted">
                Goes straight to the team
              </p>
            </div>
          </header>

          {state.ok ? (
            <div className="px-4 py-8 text-center">
              <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-accent-bg text-verified">
                <Check className="size-5" strokeWidth={3} />
              </span>
              <p className="font-display mt-4 text-lg">Got it — thank you.</p>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                We read every one. The things that come up again and again are
                the things that get built next.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-secondary mono-label mt-5 rounded-full px-4 py-2"
              >
                Close
              </button>
            </div>
          ) : (
            <form action={action} className="overflow-y-auto p-4">
              <input type="hidden" name="kind" value={kind} />

              <div className="flex gap-2">
                {KINDS.map((k) => (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => setKind(k.value)}
                    aria-pressed={kind === k.value}
                    className={`mono-label flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 transition-colors ${
                      kind === k.value
                        ? "border-accent bg-accent-bg text-accent"
                        : "border-rule bg-surface-2 text-muted hover:text-ink"
                    }`}
                  >
                    <k.icon className="size-3.5" strokeWidth={2.5} />
                    {k.label}
                  </button>
                ))}
              </div>

              <label htmlFor="lb-feedback-body" className="sr-only">
                Your message
              </label>
              <textarea
                id="lb-feedback-body"
                name="body"
                rows={4}
                required
                maxLength={2000}
                placeholder="What should we build, fix, or stop doing?"
                className="mt-3 w-full resize-y rounded-lg border border-rule bg-surface-2 px-3 py-2.5 text-[0.95rem] leading-relaxed"
              />

              {!signedIn && (
                <input
                  name="email"
                  type="email"
                  maxLength={120}
                  placeholder="Email (only if you want a reply)"
                  className="mt-3 w-full rounded-lg border border-rule bg-surface-2 px-3 py-2.5 text-[0.95rem]"
                />
              )}

              {state.error && (
                <p role="alert" className="mt-3 text-sm text-danger">
                  {state.error}
                </p>
              )}

              <div className="mt-4">
                <SendButton />
              </div>

              <p className="mono-label mt-3 text-center text-muted">
                No case details here · not a consultation
              </p>
            </form>
          )}
        </div>
      )}
    </>
  );
}
