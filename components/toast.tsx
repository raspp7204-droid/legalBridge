"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import { FLASH, isFlashKey } from "@/lib/flash";

/**
 * The confirmation every action gets after it redirects.
 *
 * Mounted once in the root layout rather than per page, so a new action only
 * has to redirect with `?flash=<key>` to be reported — there is no second place
 * to remember to wire up, which is how silent actions creep back in.
 *
 * The key is stripped from the URL with replaceState as soon as it is read.
 * Without that, refreshing re-announces a save that happened ten minutes ago,
 * and the back button becomes a way to fake confirmations.
 */

const TONE = {
  success: {
    icon: Check,
    border: "border-verified/40",
    text: "text-verified",
  },
  info: { icon: Info, border: "border-rule", text: "text-ink" },
  error: {
    icon: TriangleAlert,
    border: "border-danger/40",
    text: "text-danger",
  },
} as const;

const VISIBLE_MS = 5000;

function ToastInner() {
  const params = useSearchParams();
  const key = params.get("flash");
  const [shown, setShown] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!isFlashKey(key)) return;
    setShown(key);
    setLeaving(false);

    // Drop the param immediately so a refresh cannot replay it.
    const url = new URL(window.location.href);
    url.searchParams.delete("flash");
    window.history.replaceState(null, "", url.toString());

    const out = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const gone = setTimeout(() => setShown(null), VISIBLE_MS + 250);
    return () => {
      clearTimeout(out);
      clearTimeout(gone);
    };
  }, [key]);

  if (!shown || !isFlashKey(shown)) return null;

  const { tone, text } = FLASH[shown];
  const style = TONE[tone];
  const Icon = style.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      /* Below the header, not over it — at the top of the viewport this sat on
         the sign-in and account controls, which is a poor trade for a message
         that disappears in five seconds. --strip-h is 0 unless an announcement
         strip is showing, so the offset follows the header's real height. */
      style={{ top: "calc(var(--header-h) + var(--strip-h) + 0.75rem)" }}
      className={`fixed inset-x-3 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-xl border bg-surface p-4 shadow-[0_12px_40px_rgb(23_35_58/0.16)] transition-all duration-200 sm:inset-x-auto sm:right-6 sm:mx-0 ${
        style.border
      } ${leaving ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${style.text}`} strokeWidth={2.5} />
      <p className="flex-1 text-sm leading-relaxed text-ink">{text}</p>
      <button
        type="button"
        onClick={() => setLeaving(true)}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <X className="size-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

/** useSearchParams needs a boundary; the toast has nothing to show while it
    suspends, so the fallback is deliberately nothing. */
export function Toast() {
  return <ToastInner />;
}
