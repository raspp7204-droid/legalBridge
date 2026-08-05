

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
