"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/auth";
import { PLACEMENT_RANK, placementEndsAt } from "@/lib/promotions";

/** Placement changes ranking on the public listing, so both are revalidated. */
function revalidatePlacement() {
  revalidatePath("/lawyer/placement");
  revalidatePath("/lawyer");
  revalidatePath("/lawyers");
  revalidatePath("/admin/promotions");
}

/**
 * Buy the founding placement.
 *
 * No gateway — the same fake checkout the client side runs (CLAUDE.md §3).
 * Guarded on VERIFIED because an unverified advocate does not appear in the
 * listing at all, so there would be nothing to rank.
 */
export async function activatePlacement() {
  const profile = await requireLawyerProfile();
  if (profile.status !== "VERIFIED") return;

  await db.lawyerProfile.update({
    where: { id: profile.id },
    data: {
      promoted: true,
      promotedTier: "PLACEMENT",
      promotedRank: PLACEMENT_RANK,
      promotedUntil: placementEndsAt(),
    },
  });

  revalidatePlacement();
}

/** Stop the campaign. The listing falls straight back to organic order. */
export async function cancelPlacement() {
  const profile = await requireLawyerProfile();

  await db.lawyerProfile.update({
    where: { id: profile.id },
    data: {
      promoted: false,
      promotedTier: "NONE",
      promotedRank: null,
      promotedUntil: null,
    },
  });

  revalidatePlacement();
}
