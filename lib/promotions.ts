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
};

export const TIER_LABEL: Record<PromoTier, string> = {
  NONE: "Not promoted",
  BASIC: "Basic",
  FEATURED: "Featured",
  SPOTLIGHT: "Spotlight",
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

export function monthlyRevenue(
  profiles: { promotedTier: PromoTier; promoted: boolean; promotedUntil: Date | null }[],
) {
  return profiles
    .filter(isActivePromo)
    .reduce((sum, p) => sum + TIER_PRICE[p.promotedTier], 0);
}
