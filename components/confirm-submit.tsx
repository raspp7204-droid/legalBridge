"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, TriangleAlert } from "lucide-react";

/**
 * A destructive submit, behind a confirmation.
 *
 * The trigger does not submit anything — it opens a native <dialog>, and the
 * real submit button lives inside it. Because the dialog is rendered inside the
 * same <form>, its button submits that form normally, which keeps the whole
 * thing working with server actions and lets useFormStatus report progress on
 * the confirm button rather than on a trigger the user has stopped looking at.
 *
 * <dialog showModal()> is doing real work here: focus is trapped, Escape
 * closes, the rest of the page is inert, and the backdrop is styled in
 * globals.css. None of that is worth reimplementing.
 */

function ConfirmButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="mono-label inline-flex items-center justify-center gap-2 rounded-full border border-danger bg-danger px-4 py-2.5 text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

export function ConfirmSubmit({
  trigger,
  title,
  body,
  confirmLabel,
  pendingLabel,
  icon,
}: {
  trigger: string;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  /** A rendered element — see the note in action-button.tsx. */
  icon?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          ref.current?.showModal();
          setOpen(true);
        }}
        className="mono-label inline-flex items-center gap-2 rounded-full border border-danger px-4 py-2.5 text-danger transition-colors hover:bg-danger hover:text-white"
      >
        {icon}
        {trigger}
      </button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        className="lb-dialog w-[min(92vw,28rem)] rounded-2xl border border-rule bg-surface p-0 text-ink shadow-[0_20px_60px_rgb(23_35_58/0.24)] backdrop:bg-ink/40"
      >
        {/* Rendered only while open so the form inside cannot be submitted by
            a stray Enter key while the dialog is closed. */}
        {open && (
          <div className="p-6">
            <span className="flex size-10 items-center justify-center rounded-full bg-accent-bg text-danger">
              <TriangleAlert className="size-5" strokeWidth={2.5} />
            </span>
            <h2 className="mt-4 text-xl">{title}</h2>
            <div className="mt-3 text-sm leading-relaxed text-slate">{body}</div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => ref.current?.close()}
                className="btn-secondary mono-label rounded-full px-4 py-2.5"
              >
                Cancel
              </button>
              <ConfirmButton
                label={confirmLabel}
                pendingLabel={pendingLabel}
              />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
