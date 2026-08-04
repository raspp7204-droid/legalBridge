"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lightbulb, TriangleAlert, Heart, Send, Check, Loader2 } from "lucide-react";
import { submitFeedback, type FeedbackState } from "@/app/feedback/actions";

const KINDS = [
  {
    value: "SUGGESTION",
    label: "An idea",
    icon: Lightbulb,
    hint: "Something LawNest should build or do differently",
  },
  {
    value: "ISSUE",
    label: "A problem",
    icon: TriangleAlert,
    hint: "Something broke, confused you, or wasted your time",
  },
  {
    value: "PRAISE",
    label: "Something good",
    icon: Heart,
    hint: "Something that worked — tell us so we do not break it",
  },
] as const;

function SubmitButton() {
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

/**
 * The suggestion box.
 *
 * Signed-in visitors do not retype their name and email — the action reads
 * those off the session either way, so the fields only appear when there is
 * nothing to read.
 */
export function FeedbackForm({
  signedInAs,
  page,
}: {
  signedInAs: string | null;
  page?: string;
}) {
  const [state, action] = useActionState<FeedbackState, FormData>(
    submitFeedback,
    { ok: false },
  );

  if (state.ok) {
    return (
      <div className="card overflow-hidden">
        <div className="h-[3px] w-full bg-verified" aria-hidden="true" />
        <div className="p-6 sm:p-9">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent-bg text-verified">
            <Check className="size-5" strokeWidth={3} />
          </span>
          <h2 className="mt-5 text-[1.75rem]">Got it — thank you.</h2>
          <p className="mt-3 max-w-xl leading-relaxed text-slate">
            It goes straight to the people building LawNest. We read every one,
            and the ones that come up again and again are the ones that get
            built next.
          </p>
          <a
            href="/feedback"
            className="btn-secondary mono-label mt-6 inline-flex rounded-full px-4 py-2.5"
          >
            Send another
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="page" value={page ?? ""} />

      <fieldset className="card p-5">
        <legend className="mono-label text-muted">What is this?</legend>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {KINDS.map((k, i) => (
            <label
              key={k.value}
              className="flex cursor-pointer flex-col gap-1.5 rounded-lg border border-rule bg-surface-2 p-3.5 transition-colors has-checked:border-accent has-checked:bg-accent-bg"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="kind"
                  value={k.value}
                  defaultChecked={i === 0}
                  className="accent-[var(--accent)]"
                />
                <k.icon className="size-4 text-accent" strokeWidth={2.5} />
                <span className="text-sm text-ink">{k.label}</span>
              </span>
              <span className="text-xs leading-relaxed text-slate">
                {k.hint}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="card p-5">
        <label htmlFor="body" className="mono-label text-muted">
          Your message
        </label>
        <textarea
          id="body"
          name="body"
          rows={6}
          required
          maxLength={2000}
          placeholder="Be specific — “the slot picker did not show any times for Tuesday” is worth more to us than “the booking is confusing”."
          className="mt-3 w-full resize-y rounded-lg border border-rule bg-surface-2 px-3 py-2.5 text-[0.95rem] leading-relaxed"
        />

        {signedInAs ? (
          <p className="mono-label mt-3 text-muted">
            Sending as {signedInAs}
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mono-label text-muted">Your name (optional)</span>
              <input
                name="name"
                maxLength={80}
                className="mt-2 w-full rounded-lg border border-rule bg-surface-2 px-3 py-2.5 text-[0.95rem]"
              />
            </label>
            <label className="block">
              <span className="mono-label text-muted">
                Email (only if you want a reply)
              </span>
              <input
                name="email"
                type="email"
                maxLength={120}
                className="mt-2 w-full rounded-lg border border-rule bg-surface-2 px-3 py-2.5 text-[0.95rem]"
              />
            </label>
          </div>
        )}
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton />
        <p className="mono-label text-muted">
          No account needed · nothing is published
        </p>
      </div>
    </form>
  );
}
