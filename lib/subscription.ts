import { PLATFORM_RATE, TIER_FEE } from "@/lib/money";

/**
 * The advocate subscription.
 *
 * Commission is 20% from the first consultation onwards and never changes —
 * this is deliberately NOT the old founding-year scheme, which waived
 * commission for twelve months. What a new advocate gets instead is a year
 * with no subscription fee at all. From year two they pay ₹999 a year on top
 * of the same 20%.
 *
 * The distinction matters when someone asks on stage: the introductory offer
 * is a waived *subscription*, not a waived *commission*. Getting that backwards
 * makes the unit economics look far better than they are.
 *
 * Nothing is stored for this. An advocate's year runs from the day their
 * account was created, so `User.createdAt` is the whole state machine — there
 * is no renewal date to keep in step with anything.
 */

/** Charged once a year, from year two onwards. */
export const SUBSCRIPTION_FEE = 999;

/** How long the introductory offer lasts. */
export const FREE_MONTHS = 12;

/** ₹83 — the annual fee expressed monthly, for comparison lines. */
export const SUBSCRIPTION_MONTHLY = Math.round(SUBSCRIPTION_FEE / FREE_MONTHS);

/** Percent of every consultation LawNest takes — unchanged by any of this. */
export const COMMISSION_PERCENT = Math.round(PLATFORM_RATE * 100);

/** The day the free year ends and the first ₹999 falls due. */
export function renewsOn(joinedAt: Date) {
  const due = new Date(joinedAt);
  due.setFullYear(due.getFullYear() + 1);
  return due;
}

export function isFreeYear(joinedAt: Date, now: Date = new Date()) {
  return now < renewsOn(joinedAt);
}

/** Whole days left in the free year; 0 once it has lapsed. */
export function daysLeftFree(joinedAt: Date, now: Date = new Date()) {
  const ms = renewsOn(joinedAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/**
 * How many consultations at a given tier cover a year's subscription. The
 * honest comparison for an advocate: not "₹999" in the abstract, but "one
 * senior consultation and change".
 */
export function consultsToCoverFee(fee: number = TIER_FEE.HIGH) {
  const keeps = fee - Math.floor(fee * PLATFORM_RATE);
  return Math.ceil(SUBSCRIPTION_FEE / keeps);
}

/** "12 March 2027" — how every surface prints the renewal date. */
export function formatRenewal(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);
}
