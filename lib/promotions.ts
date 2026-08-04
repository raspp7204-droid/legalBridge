import type { Prisma, PromoTier } from "@prisma/client";

/**
 * Paid placement — the revenue system (LAUNCH.md Task 5). Advocates pay to
 * rank above organic results and are always labelled PROMOTED. Placement
 * reorders results that already match the user's filters; it never injects
 * an advocate who does not match.
 */

/* ---- Founding placement: one payment, three years ---- */

/**
 * The launch offer. An advocate pays once and sits at the top of their own
 * practice area until the term runs out — no renewal, no monthly line item.
 *
 * It is priced far under the monthly card on purpose. This is a land-grab
 * price for the first cohort, the same trade the founding-year commission
 * waiver makes on the other side of the ledger: the placement inventory is
 * worthless until advocates are in it, so the first three years are sold at
 * roughly what one consultation earns.
 */
export const PLACEMENT_PRICE = 2999;
export const PLACEMENT_YEARS = 3;
export const PLACEMENT_MONTHS = PLACEMENT_YEARS * 12;
/** Free for the first quarter, then the term starts. */
export const PLACEMENT_TRIAL_MONTHS = 3;
/** Placement always buys rank 1 — there is nothing above it to sell. */
export const PLACEMENT_RANK = 1;

/** ₹83 — what the one-time fee works out to per month. */
export const PLACEMENT_MONTHLY = Math.round(PLACEMENT_PRICE / PLACEMENT_MONTHS);

/** Its own cookie, so dismissing the advocate strip never hides a client's. */
export const PLACEMENT_COOKIE = "lb_placement";
export const PLACEMENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const TIER_PRICE: Record<PromoTier, number> = {
  NONE: 0,
  BASIC: 999,
  FEATURED: 2499,
  SPOTLIGHT: 4999,
  // Amortised, not billed. Keeping it in the same record means the MRR figure
  // in /admin/promotions counts placements honestly instead of booking the
  // whole ₹2,999 as recurring revenue.
  PLACEMENT: PLACEMENT_MONTHLY,
};

export const TIER_LABEL: Record<PromoTier, string> = {
  NONE: "Not promoted",
  BASIC: "Basic",
  FEATURED: "Featured",
  SPOTLIGHT: "Spotlight",
  PLACEMENT: "Founding placement",
};

/** What three years on the monthly card would have cost — ₹35,964. */
export function placementListPrice() {
  return TIER_PRICE.BASIC * PLACEMENT_MONTHS;
}

export function placementSaving() {
  return placementListPrice() - PLACEMENT_PRICE;
}

/** 92 — the discount against the monthly card, for the offer badge. */
export function placementDiscountPercent() {
  return Math.round((1 - PLACEMENT_PRICE / placementListPrice()) * 100);
}

/** When the free quarter runs out and the paid term begins. */
export function placementBillsFrom(from: Date = new Date()) {
  const start = new Date(from);
  start.setMonth(start.getMonth() + PLACEMENT_TRIAL_MONTHS);
  return start;
}

/**
 * Term end for a placement activated now: the free quarter, then the three
 * years that were paid for. An advocate who signs up today is promoted for
 * three years and three months.
 */
export function placementEndsAt(from: Date = new Date()) {
  const end = placementBillsFrom(from);
  end.setFullYear(end.getFullYear() + PLACEMENT_YEARS);
  return end;
}

/**
 * The billing date recovered from a term end — the only date we store is
 * promotedUntil, and a live campaign still has to be able to say when it
 * charges.
 */
export function placementChargeDate(until: Date) {
  const charge = new Date(until);
  charge.setFullYear(charge.getFullYear() - PLACEMENT_YEARS);
  return charge;
}

export function isPlacement(p: { promotedTier: PromoTier }) {
  return p.promotedTier === "PLACEMENT";
}

/** One-time placement fees booked across the roster. */
export function placementRevenue(
  profiles: { promotedTier: PromoTier; promoted: boolean; promotedUntil: Date | null }[],
) {
  return profiles.filter(isActivePromo).filter(isPlacement).length * PLACEMENT_PRICE;
}

/** Slots we sell against — used for the "filled vs available" summary. */
export const PROMO_INVENTORY = 12;

/** Promoted only while the campaign is live; expired ones fall back to organic. */
export function activePromoWhere(
  now: Date = new Date(),
): Prisma.LawyerProfileWhereInput {
  return {
    promoted: true,
    OR: [{ promotedUntil: null }, { promotedUntil: { gt: now } }],
  };
}

export function isActivePromo(p: {
  promoted: boolean;
  promotedUntil: Date | null;
}) {
  return p.promoted && (!p.promotedUntil || p.promotedUntil > new Date());
}

/** promotedRank asc (nulls last), rating desc as the tiebreak. */
export const PROMO_ORDER: Prisma.LawyerProfileOrderByWithRelationInput[] = [
  { promotedRank: { sort: "asc", nulls: "last" } },
  { rating: "desc" },
  { reviewCount: "desc" },
];

/**
 * Lift live placements to the front of a result set.
 *
 * The listing's default order is organic and stays that way — this is only
 * applied when the client has filtered to a practice area, which is exactly
 * what the advocate bought: the top of their own field, not the top of every
 * search. Expiry can't be expressed in a Prisma orderBy (promotedUntil is
 * compared against now, not a column), so the reorder happens here, after the
 * query. Returns the original array untouched when nobody is promoted.
 */
export function liftPromoted<
  T extends {
    promoted: boolean;
    promotedUntil: Date | null;
    promotedRank: number | null;
  },
>(rows: T[]): T[] {
  const promoted = rows.filter(isActivePromo);
  if (promoted.length === 0) return rows;

  return [
    ...promoted.sort((a, b) => (a.promotedRank ?? 99) - (b.promotedRank ?? 99)),
    ...rows.filter((r) => !isActivePromo(r)),
  ];
}

export function monthlyRevenue(
  profiles: { promotedTier: PromoTier; promoted: boolean; promotedUntil: Date | null }[],
) {
  return profiles
    .filter(isActivePromo)
    .reduce((sum, p) => sum + TIER_PRICE[p.promotedTier], 0);
}
