import type { Prisma, PromoTier } from "@prisma/client";

/**
 * Paid placement — the revenue system (LAUNCH.md Task 5). Advocates pay to
 * rank above organic results and are always labelled PROMOTED. Placement
 * reorders results that already match the user's filters; it never injects
 * an advocate who does not match.
 */

export const TIER_PRICE: Record<PromoTier, number> = {
  NONE: 0,
  BASIC: 999,
  FEATURED: 2499,
  SPOTLIGHT: 4999,
  // The three-year founding placement was withdrawn. The enum value stays in
  // the schema — removing a Postgres enum value means recreating the type on a
  // live database, and nothing is gained by that risk — so it needs a price,
  // and zero is the honest one: it is not sold and cannot be bought.
  PLACEMENT: 0,
};

export const TIER_LABEL: Record<PromoTier, string> = {
  NONE: "Not promoted",
  BASIC: "Basic",
  FEATURED: "Featured",
  SPOTLIGHT: "Spotlight",
  PLACEMENT: "Withdrawn",
};

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
