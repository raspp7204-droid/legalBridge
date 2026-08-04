"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { RotateCcw, TriangleAlert } from "lucide-react";

/**
 * The way out of a dead ClerkJS session.
 *
 * When the dev browser token in localStorage points at a session Clerk has
 * already removed, ClerkJS gets stuck retrying against it, the browser reports
 * `TypeError: Failed to fetch`, and <SignIn> never mounts. The page is then a
 * blank rectangle where the form should be, with nothing to click.
 *
 * /reset has always fixed it — the problem was that nobody could know that
 * from the broken page. This watches for the widget failing to boot and offers
 * the reset in place.
 *
 * Delayed rather than immediate: ClerkJS on a cold load takes a moment, and an
 * error panel that flashes on every healthy visit would be worse than the bug.
 */
export function ClerkRecovery({ to = "/sign-in" }: { to?: string }) {
  const clerk = useClerk();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Loaded: nothing is wrong. Not waited long enough: still might load.
  if (clerk?.loaded || !waited) return null;

  return (
    <div className="card mt-6 border-l-2 border-l-accent p-5">
      <div className="flex flex-wrap items-start gap-3">
        <TriangleAlert
          className="mt-0.5 size-4 shrink-0 text-accent"
          strokeWidth={2.5}
        />
        <div className="max-w-lg">
          <p className="mono-label text-accent">Sign-in form did not load</p>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            This is almost always a stale session left in your browser, or a
            tracker blocker holding back{" "}
            <span className="font-mono-num">accounts.dev</span>. Clearing the
            stored session fixes it — you will not lose anything.
          </p>

          {/* Plain <a>: a soft navigation would keep the broken ClerkJS
              context alive, and the whole point is to reboot it from empty. */}
          <a
            href={`/reset?to=${encodeURIComponent(to)}`}
            className="btn-primary mono-label mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2.5"
          >
            <RotateCcw className="size-3.5" strokeWidth={2.5} />
            Reset sign-in state
          </a>

          <p className="mono-label mt-3 text-muted">
            Still stuck? Turn off the ad blocker for this site and reload.
          </p>
        </div>
      </div>
    </div>
  );
}
