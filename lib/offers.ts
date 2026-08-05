

/**
 * The client-side launch campaign. The advocate side moved to
 * lib/subscription.ts when the founding-year commission waiver was replaced by
 * a waived first-year subscription — a different promise, so a different file.
 *
 * Same discipline as lib/rewards.ts: every figure a banner prints is computed
 * here, never typed into JSX, so a campaign changes in exactly one file.
 *
 * WHO PAYS FOR THE CLIENT OFFER: the platform, not the advocate. A discount
 * changes what the client hands over; the booking's amount / lawyerCut /
 * platformCut are untouched, so the advocate still receives their full 80%.
 * On a ₹549 consultation the platform's ₹109 cut goes to zero and it funds
 * ₹111 more out of pocket. That is acquisition cost and it is deliberate —
 * it is not a rounding bug in the split.
 */

/* ---- Client: first consultation ---- */

export const WELCOME_RATE = 0.1;
export const WELCOME_CAP = 250;
/** Shown on the banners so the offer feels claimable. Nothing has to be typed. */
export const WELCOME_CODE = "FIRST10";

/**
 * Rupees off a first consultation — 10%, never more than the cap.
 *
 * The cap sits far above anything the rate can now produce (10% of the ₹799
 * top fee is ₹80), so it no longer binds. It stays because the rate is the
 * thing that gets tuned, and a rate without a ceiling is how a discount
 * escapes.
 */
export function welcomeDiscount(amount: number) {
  return Math.min(Math.round(amount * WELCOME_RATE), WELCOME_CAP);
}

/** Eligibility is "has never paid for a consultation", nothing else. */
export function isFirstConsultation(paidBookings: number) {
  return paidBookings === 0;
}

/** What a first-timer actually pays. */
export function welcomePayable(amount: number) {
  return amount - welcomeDiscount(amount);
}

/* ---- Announcement strip ---- */

export const PROMO_COOKIE = "lb_offer";
export const PROMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/* ---- Campaign clock ---- */

/**
 * A fixed instant, not now + N days. A computed deadline mismatches between
 * server render and client hydration, and it would reset on every refresh
 * during the pitch.
 *
 * Kept about a week out so the countdown reads as urgent rather than as a
 * date in the middle distance — bump it the morning of the pitch. Nothing
 * breaks if it lapses: eligibility never consults the clock, and the
 * countdown clamps to "Final hours" instead of going negative.
 */
export const CAMPAIGN_ENDS = "2026-08-10T18:29:59.999Z";

/** "30 September" — the deadline as static text, identical on both sides of
    hydration. What a countdown renders before it has mounted. */
export const CAMPAIGN_END_LABEL = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  timeZone: "Asia/Kolkata",
}).format(new Date(CAMPAIGN_ENDS));

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  over: boolean;
};

export function timeLeft(now: number, endsAt = CAMPAIGN_ENDS): TimeLeft {
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    over: false,
  };
}

/** "3d 04h 12m" — the countdown as one compact mono string. */
export function formatTimeLeft(t: TimeLeft) {
  if (t.over) return "ended";
  const pad = (n: number) => String(n).padStart(2, "0");
  return t.days > 0
    ? `${t.days}d ${pad(t.hours)}h ${pad(t.minutes)}m`
    : `${pad(t.hours)}h ${pad(t.minutes)}m ${pad(t.seconds)}s`;
}
