/** Fee split per CLAUDE.md §6. Computed once at booking creation and stored. */

export const PLATFORM_RATE = 0.2;

export function splitFee(amount: number) {
  // floor, not round: PLAN.md §3 and CLAUDE.md §4 both show ₹799 → 640/159
  // and ₹549 → 440/109. Rounding would give 639/160 and 439/110.
  const platformCut = Math.floor(amount * PLATFORM_RATE);
  const lawyerCut = amount - platformCut;
  return { amount, lawyerCut, platformCut };
}

/** ₹1,234 — no decimals, Indian digit grouping. */
export function formatRupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/** Tier → fee is fixed (CLAUDE.md §7). */
export const TIER_FEE = {
  LOWER: 399,
  MIDDLE: 549,
  HIGH: 799,
} as const;

export const TIER_LABEL = {
  LOWER: "Lower",
  MIDDLE: "Middle",
  HIGH: "High",
} as const;
