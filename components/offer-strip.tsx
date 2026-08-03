"use client";

import { useState } from "react";
import Link from "next/link";
import { X, BadgePercent } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { formatRupees } from "@/lib/money";
import {
  PROMO_COOKIE,
  PROMO_COOKIE_MAX_AGE,
  WELCOME_RATE,
} from "@/lib/offers";

/**
 * The announcement strip, above the header on every public page.
 *
 * Deliberately NOT sticky: the header already owns `sticky top-0`, and a
 * second sticky bar would eat 40px of every scroll and force every other
 * sticky offset on the site (filter rail, booking rail, chat sidebar) to be
 * recalculated against it. This scrolls away with the page and the header
 * takes over — same visibility on arrival, none of the risk.
 *
 * Whether it renders at all is decided on the server from the cookie, so a
 * dismissed strip never flashes before hydration.
 */
export function OfferStrip({
  variant,
  pointsWorth,
}: {
  variant: "first" | "return";
  /** Rupees the returning client's balance is worth — only for "return". */
  pointsWorth?: number;
}) {
  const [gone, setGone] = useState(false);
  if (gone) return null;

  function dismiss() {
    document.cookie = `${PROMO_COOKIE}=1; path=/; max-age=${PROMO_COOKIE_MAX_AGE}; SameSite=Lax`;
    setGone(true);
  }

  return (
    <div className="offer-band bg-accent">
      <div className="container flex min-h-10 items-center gap-3 py-2">
        <BadgePercent className="size-4 shrink-0" strokeWidth={2.5} />

        {variant === "first" ? (
          <p className="mono-label truncate">
            {Math.round(WELCOME_RATE * 100)}% off your first consultation
            <span className="text-white/70 max-sm:hidden">
              {" "}
              · applied automatically at checkout
            </span>
          </p>
        ) : (
          <p className="mono-label truncate">
            Your points are worth {formatRupees(pointsWorth ?? 0)} off
            <span className="text-white/70 max-sm:hidden">
              {" "}
              · redeem on your next consultation
            </span>
          </p>
        )}

        <Countdown className="mono-label ml-auto shrink-0 text-white/70 max-md:hidden" />

        <Link
          href="/lawyers"
          className="mono-label shrink-0 underline underline-offset-4 max-md:ml-auto"
        >
          {variant === "first" ? "Claim it" : "Use them"}
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
