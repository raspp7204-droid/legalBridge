"use client";

import { useEffect, useState } from "react";
import {
  CAMPAIGN_ENDS,
  CAMPAIGN_END_LABEL,
  formatTimeLeft,
  timeLeft,
} from "@/lib/offers";

/**
 * Campaign clock.
 *
 * The first paint deliberately renders no clock — only the static end date —
 * because a Date.now() evaluated during server render never matches the one
 * the browser computes a moment later, and the resulting hydration error would
 * be sitting in the console on a projector. The ticking value appears after
 * mount, when only the client is rendering.
 */
export function Countdown({
  endsAt = CAMPAIGN_ENDS,
  className = "",
  prefix = "Ends in",
}: {
  endsAt?: string;
  className?: string;
  prefix?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return <span className={className}>Ends {CAMPAIGN_END_LABEL}</span>;
  }

  const left = timeLeft(now, endsAt);
  // Clamped, never negative: a campaign that runs over reads as urgent
  // rather than broken.
  if (left.over) return <span className={className}>Final hours</span>;

  return (
    <span className={className}>
      {prefix} <span className="font-mono-num">{formatTimeLeft(left)}</span>
    </span>
  );
}
