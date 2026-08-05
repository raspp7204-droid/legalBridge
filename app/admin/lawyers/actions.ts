"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Status, Tier } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { TIER_FEE } from "@/lib/money";
import { ensureUpcomingSlots } from "@/lib/slots";
import { isAllowedAvatar } from "@/lib/avatars";

/** Every surface an advocate's details appear on. */
function revalidateAdvocate(id: string) {
  revalidatePath(`/admin/lawyers/${id}`);
  revalidatePath("/admin/lawyers");
  revalidatePath("/admin");
  revalidatePath(`/lawyers/${id}`);
  revalidatePath("/lawyers");
  revalidatePath("/categories");
  revalidatePath("/");
}

/** Change the photo. Rejected unless the host is one next/image can serve. */
export async function updateAvatar(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const avatar = String(formData.get("avatar") ?? "").trim();
  if (!id || !avatar) return;

  if (!isAllowedAvatar(avatar)) {
    redirect(`/admin/lawyers/${id}?photo=rejected`);
  }

  const profile = await db.lawyerProfile.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!profile) return;

  await db.user.update({
    where: { id: profile.userId },
    data: { avatar },
  });

  revalidateAdvocate(id);
  redirect(`/admin/lawyers/${id}?photo=saved`);
}

/**
 * Edit the practice details. Tier and fee move together — the fee is not a
 * free field anywhere in this product, because the whole price ladder falls
 * apart the moment two advocates in one tier charge different amounts.
 */
export async function updateLawyer(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await db.lawyerProfile.findUnique({
    where: { id },
    select: { userId: true, status: true },
  });
  if (!existing) return;

  const name = String(formData.get("name") ?? "").trim();
  const tier = String(formData.get("tier") ?? "MIDDLE") as Tier;
  const status = String(formData.get("status") ?? "PENDING") as Status;
  const years = Number(formData.get("years"));

  if (name) {
    await db.user.update({
      where: { id: existing.userId },
      data: { name: /^adv\.?\s/i.test(name) ? name : `Adv. ${name}` },
    });
  }

  await db.lawyerProfile.update({
    where: { id },
    data: {
      city: String(formData.get("city") ?? "").trim(),
      court: String(formData.get("court") ?? "").trim(),
      bciNumber: String(formData.get("bciNumber") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim(),
      years: Number.isFinite(years) && years >= 0 ? Math.trunc(years) : 0,
      tier,
      fee: TIER_FEE[tier],
      status,
      online: formData.get("online") === "on",
    },
  });

  // Newly verified here means the same thing it means in the verification
  // queue: they are about to be listed, so they need bookable time.
  if (status === "VERIFIED" && existing.status !== "VERIFIED") {
    await ensureUpcomingSlots(id);
  }

  revalidateAdvocate(id);
  redirect(`/admin/lawyers/${id}?saved=1`);
}

/**
 * Remove an advocate and everything hanging off them.
 *
 * Prisma does not cascade here, so the order is the whole job: messages sit on
 * bookings, bookings and slots sit on the profile, the reward ledger sits on
 * the user. Deleting the profile first would fail on the foreign keys; deleting
 * it in the wrong order halfway would leave rows pointing at nothing, and the
 * client's chat page would 500 mid-demo. One transaction, so it either all
 * happens or none of it does.
 */
export async function deleteLawyer(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const profile = await db.lawyerProfile.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!profile) return;

  await db.$transaction(async (tx) => {
    // Every booking touching this person — as the advocate, and (defensively)
    // as a client, since the User row goes too.
    const bookings = await tx.booking.findMany({
      where: { OR: [{ lawyerId: id }, { clientId: profile.userId }] },
      select: { id: true },
    });
    const bookingIds = bookings.map((b) => b.id);

    if (bookingIds.length) {
      await tx.message.deleteMany({ where: { bookingId: { in: bookingIds } } });
      await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
    }

    await tx.slot.deleteMany({ where: { lawyerId: id } });
    await tx.rewardLedger.deleteMany({ where: { userId: profile.userId } });

    // The implicit category join rows go with the profile automatically.
    await tx.lawyerProfile.delete({ where: { id } });
    await tx.user.delete({ where: { id: profile.userId } });
  });

  revalidateAdvocate(id);
  revalidatePath("/admin/bookings");
  redirect("/admin/lawyers?deleted=1");
}
