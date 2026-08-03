import { PLATFORM_RATE, TIER_FEE } from "@/lib/money";

/**
 * Launch campaigns — one on each side of the marketplace.
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

export const WELCOME_RATE = 0.4;
export const WELCOME_CAP = 250;
/** Shown on the banners so the offer feels claimable. Nothing has to be typed. */
export const WELCOME_CODE = "FIRST40";

/** Rupees off a first consultation — 40%, never more than ₹250. */
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

/* ---- Advocate: founding year ---- */

export const FOUNDING_SEATS = 12;
export const FOUNDING_MONTHS = 12;
/** The volume the "worth ₹X" headline is quoted against. */
export const FOUNDING_BASIS = { consultsPerMonth: 20, fee: TIER_FEE.HIGH };

/**
 * Commission an advocate keeps across the founding year. Derived from
 * PLATFORM_RATE so the ad can never disagree with the fee card.
 */
export function commissionSaved(
  consultsPerMonth = FOUNDING_BASIS.consultsPerMonth,
  fee = FOUNDING_BASIS.fee,
) {
  return Math.round(consultsPerMonth * FOUNDING_MONTHS * fee * PLATFORM_RATE);
}

/** Percent of every fee LawNest normally takes — for the "20% → 0%" line. */
export const PLATFORM_PERCENT = Math.round(PLATFORM_RATE * 100);

/* ---- Campaign clock ---- */

/**
 * A fixed instant, not now + N days. A computed deadline mismatches between
 * server render and client hydration, and it would reset on every refresh
 * during the pitch.
 */
export const CAMPAIGN_ENDS = "2026-09-30T18:30:00.000Z";

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
