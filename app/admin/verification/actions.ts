"use server";

import { revalidatePath } from "next/cache";
import type { Tier } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { TIER_FEE } from "@/lib/money";

/** Approve → VERIFIED at the chosen tier, with the fee that tier implies. */
export async function approveLawyer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const tier = String(formData.get("tier") ?? "MIDDLE") as Tier;
  if (!id) throw new Error("Missing lawyer id");

  await db.lawyerProfile.update({
    where: { id },
    data: { status: "VERIFIED", tier, fee: TIER_FEE[tier] },
  });

  // A newly verified advocate needs slots or their profile looks dead.
  const existing = await db.slot.count({ where: { lawyerId: id } });
  if (existing === 0) {
    const now = new Date();
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const data = [];
    for (let day = 1; day <= 3 && data.length < 8; day++) {
      for (const [h, m] of [
        [10, 0],
        [11, 30],
        [14, 0],
        [16, 30],
      ]) {
        if (data.length >= 8) break;
        data.push({
          lawyerId: id,
          startsAt: new Date(
            Date.UTC(
              istNow.getUTCFullYear(),
              istNow.getUTCMonth(),
              istNow.getUTCDate() + day,
              h,
              m,
            ) -
              5.5 * 60 * 60 * 1000,
          ),
          booked: false,
        });
      }
    }
    await db.slot.createMany({ data });
  }

  revalidatePath("/admin/verification");
  revalidatePath("/admin");
  revalidatePath("/lawyers");
  revalidatePath("/categories");
}

export async function rejectLawyer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing lawyer id");

  await db.lawyerProfile.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  revalidatePath("/admin/verification");
  revalidatePath("/admin");
  revalidatePath("/lawyers");
}
