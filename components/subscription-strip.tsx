"use client";

import { useState } from "react";
import Link from "next/link";
import { X, BadgePercent } from "lucide-react";
import { formatRupees } from "@/lib/money";
import { SUBSCRIPTION_FEE } from "@/lib/subscription";

/**
 * The advocate's announcement strip: their free year, and when it ends.
 *
 * Only rendered while the free year is actually running, so it never becomes
 * a bar advertising something that has already lapsed. Not sticky — the header
 * owns `sticky top-0`, and a second sticky bar would move every other sticky
 * offset on the site.
 */
export const SUBSCRIPTION_COOKIE = "lb_sub";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function SubscriptionStrip({
  daysLeft,
  renewal,
}: {
  daysLeft: number;
  /** Pre-formatted on the server so both sides of hydration agree. */
  renewal: string;
}) {
  const [gone, setGone] = useState(false);
  if (gone) return null;

  function dismiss() {
    document.cookie = `${SUBSCRIPTION_COOKIE}=1; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
    setGone(true);
  }

  return (
    <div className="offer-band bg-accent">
      <div className="container flex min-h-10 items-center gap-3 py-2">
        <BadgePercent className="size-4 shrink-0" strokeWidth={2.5} />

        <p className="mono-label truncate">
          No subscription fee for your first year
          <span className="text-white/70 max-sm:hidden">
            {" "}
            · free until {renewal}, then {formatRupees(SUBSCRIPTION_FEE)} a year
          </span>
        </p>

        <span className="mono-label ml-auto shrink-0 text-white/70 max-md:hidden">
          {daysLeft} days left
        </span>

        <Link
          href="/for-advocates"
          className="mono-label shrink-0 underline underline-offset-4 max-md:ml-auto"
        >
          What&apos;s included
        </Link>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss offer"
          className="-mr-1 shrink-0 rounded-full p-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
