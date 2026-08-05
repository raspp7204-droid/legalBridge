"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * The submit button for every server-action form.
 *
 * useFormStatus reports the pending state of the form this button sits inside,
 * which is why this exists as a component at all: a page rendered on the server
 * cannot know a submission is in flight, so any plain <button type="submit">
 * is a click with no feedback and nothing stopping a second one.
 *
 * Disabled while pending, so a double click cannot fire the action twice —
 * approving an advocate or deleting one are both things that should happen
 * exactly as often as they were asked for.
 */

const VARIANT = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  quiet:
    "border border-rule text-muted transition-colors hover:border-accent/40 hover:text-accent",
  danger:
    "border border-danger text-danger transition-colors hover:bg-danger hover:text-white",
} as const;

const SIZE = {
  sm: "mono-label px-3 py-1.5",
  md: "mono-label px-4 py-2.5",
  lg: "px-5 py-3 text-sm font-medium",
} as const;

export function ActionButton({
  label,
  pendingLabel,
  icon,
  variant = "primary",
  size = "md",
  className = "",
  full = false,
  formAction,
  name,
  value,
  disabled = false,
}: {
  label: string;
  /** What it says while the action runs — "Approving…", "Deleting…". */
  pendingLabel: string;
  /** A rendered element, not a component: a Server Component cannot pass a
      function across the boundary, and an icon component is a function. */
  icon?: React.ReactNode;
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
  className?: string;
  full?: boolean;
  /** For forms that submit to more than one action. */
  formAction?: (formData: FormData) => void | Promise<void>;
  name?: string;
  value?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      formAction={formAction}
      name={name}
      value={value}
      disabled={pending || disabled}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        VARIANT[variant]
      } ${SIZE[size]} ${full ? "w-full" : ""} ${className}`}
    >
      {pending ? (
        <>
          <Loader2 className="size-3.5 shrink-0 animate-spin" strokeWidth={2.5} />
          {pendingLabel}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}

/**
 * Everything else in a form goes quiet while it submits.
 *
 * A form that greys out only its own button still lets someone change the tier
 * they are approving at, mid-approval. This disables the whole fieldset for as
 * long as the action runs.
 */
export function PendingFieldset({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <fieldset
      disabled={pending}
      aria-busy={pending}
      className={`${pending ? "opacity-60 transition-opacity" : ""} ${className}`}
    >
      {children}
    </fieldset>
  );
}
