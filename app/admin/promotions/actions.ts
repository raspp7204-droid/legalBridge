"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PromoTier } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { withFlash } from "@/lib/flash";

const TIERS: PromoTier[] = ["NONE", "BASIC", "FEATURED", "SPOTLIGHT"];

/** Every write here changes ranking on the client site immediately. */
function revalidateListings() {
  revalidatePath("/admin/promotions");
  revalidatePath("/lawyers");
  revalidatePath("/");
}

/** Save (or clear) an advocate's paid placement. */
export async function savePromotion(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing advocate id");

  const rawTier = String(formData.get("tier") ?? "NONE") as PromoTier;
  const tier = TIERS.includes(rawTier) ? rawTier : "NONE";

  const rankRaw = Number(formData.get("rank"));
  const rank = Number.isFinite(rankRaw) && rankRaw > 0 ? Math.trunc(rankRaw) : null;

  const untilRaw = String(formData.get("until") ?? "").trim();
  const until = untilRaw ? new Date(`${untilRaw}T23:59:59`) : null;

  const promoted = tier !== "NONE";

  await db.lawyerProfile.update({
    where: { id },
    data: {
      promoted,
      promotedTier: tier,
      promotedRank: promoted ? (rank ?? 99) : null,
      promotedUntil: promoted ? until : null,
    },
  });

  revalidateListings();
  redirect(withFlash("/admin/promotions", "promo-saved"));
}

/** One-click on/off, keeping the tier the advocate is signed up for. */
export async function togglePromotion(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing advocate id");

  const profile = await db.lawyerProfile.findUnique({ where: { id } });
  if (!profile) throw new Error("Advocate not found");

  const turningOn = !profile.promoted;

  await db.lawyerProfile.update({
    where: { id },
    data: {
      promoted: turningOn,
      // Turning a campaign on with no tier set defaults to Featured.
      promotedTier: turningOn
        ? profile.promotedTier === "NONE"
          ? "FEATURED"
          : profile.promotedTier
        : profile.promotedTier,
      promotedRank: turningOn ? (profile.promotedRank ?? 99) : null,
      promotedUntil: turningOn
        ? (profile.promotedUntil && profile.promotedUntil > new Date()
            ? profile.promotedUntil
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        : null,
    },
  });

  revalidateListings();
  redirect(withFlash("/admin/promotions", turningOn ? "promo-on" : "promo-off"));
}
