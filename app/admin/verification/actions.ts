"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Tier } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { TIER_FEE } from "@/lib/money";
import { ensureUpcomingSlots } from "@/lib/slots";
import { withFlash } from "@/lib/flash";

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

  // A newly verified advocate needs bookable time or their profile is a
  // dead end for clients.
  await ensureUpcomingSlots(id);

  revalidatePath("/admin/verification");
  revalidatePath("/admin");
  revalidatePath("/lawyers");
  revalidatePath("/categories");
  revalidatePath("/lawyer");
  redirect(withFlash("/admin/verification", "advocate-approved"));
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
  redirect(withFlash("/admin/verification", "advocate-rejected"));
}
