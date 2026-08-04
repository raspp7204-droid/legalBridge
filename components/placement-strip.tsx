"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Megaphone } from "lucide-react";
import { formatRupees } from "@/lib/money";
import {
  PLACEMENT_COOKIE,
  PLACEMENT_COOKIE_MAX_AGE,
  PLACEMENT_PRICE,
  PLACEMENT_TRIAL_MONTHS,
  PLACEMENT_YEARS,
} from "@/lib/promotions";

/**
 * The advocate's announcement strip — the placement offer, in the same slot
 * and the same oxblood field the client offer uses.
 *
 * The two never appear together: OfferStrip is gated to clients, this one to
 * advocates, so the row above the header always carries exactly one message
 * and it is always the one aimed at whoever is reading.
 *
 * Not sticky, for the same reason OfferStrip is not — the header owns
 * `sticky top-0` and a second sticky bar would move every other sticky
 * offset on the site.
 */
export function PlacementStrip() {
  const [gone, setGone] = useState(false);
  if (gone) return null;

  function dismiss() {
    document.cookie = `${PLACEMENT_COOKIE}=1; path=/; max-age=${PLACEMENT_COOKIE_MAX_AGE}; SameSite=Lax`;
    setGone(true);
  }

  return (
    <div className="offer-band bg-accent">
      <div className="container flex min-h-10 items-center gap-3 py-2">
        <Megaphone className="size-4 shrink-0" strokeWidth={2.5} />

        <p className="mono-label truncate">
          {formatRupees(PLACEMENT_PRICE)} · {PLACEMENT_YEARS} years at the top
          of your practice area
          <span className="text-white/70 max-sm:hidden">
            {" "}
            · first {PLACEMENT_TRIAL_MONTHS} months free, nothing charged today
          </span>
        </p>

        <Link
          href="/lawyer/placement"
          className="mono-label ml-auto shrink-0 underline underline-offset-4"
        >
          See the offer
        </Link>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss placement offer"
          className="-mr-1 shrink-0 rounded-full p-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
