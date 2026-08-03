/**
 * LawNest Rewards — the loyalty loop.
 *
 * Earn 5% back on every paid consultation, 1 point = ₹1, redeemable in
 * hundreds. Redeeming discounts what the *client pays*; the booking's
 * amount / lawyerCut / platformCut are untouched, so the Fee Breakdown card
 * stays honest and the advocate always receives their full share. The
 * platform absorbs the discount.
 */

export const EARN_RATE = 0.05;

/** 1 point = ₹1. */
export const POINT_VALUE = 1;

/** Points are redeemed in whole hundreds — easier to read on a receipt. */
export const REDEEM_STEP = 100;
export const REDEEM_MIN = 100;

/** Never let rewards cover more than half a consultation. */
export const MAX_DISCOUNT_RATE = 0.5;

/** ₹799 → 40 points. */
export function pointsFor(amount: number) {
  return Math.round(amount * EARN_RATE);
}

/**
 * Largest whole-hundred point spend that this balance allows and that keeps
 * the client paying at least half the fee. Returns 0 when nothing qualifies.
 */
export function maxRedeemable(balance: number, amount: number) {
  const capByBalance = Math.floor(Math.max(0, balance) / REDEEM_STEP) * REDEEM_STEP;
  const capByFee =
    Math.floor((amount * MAX_DISCOUNT_RATE) / POINT_VALUE / REDEEM_STEP) *
    REDEEM_STEP;
  const usable = Math.min(capByBalance, capByFee);
  return usable >= REDEEM_MIN ? usable : 0;
}

/** Points are worth ₹1 each — kept as a function so the rate lives in one place. */
export function pointsToRupees(points: number) {
  return points * POINT_VALUE;
}

/** 1,240 — Indian digit grouping, no decimals. */
export function formatPoints(points: number) {
  return points.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export const REWARDS_TAGLINE =
  "Earn 5% back on every consultation · 100 points = ₹100 off";

export const REWARDS_STEPS = [
  {
    title: "Book a consultation",
    body: "Every paid consultation credits 5% of the fee back as LawNest points, the moment payment lands.",
  },
  {
    title: "Points stack up",
    body: "Points never expire while your account is open. A ₹799 senior-counsel consultation adds 40.",
  },
  {
    title: "Pay less next time",
    body: "From 100 points onward you can spend them at checkout. 100 points takes ₹100 off — your advocate still gets their full share.",
  },
];
