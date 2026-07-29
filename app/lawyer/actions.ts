"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/auth";
import { ensureUpcomingSlots } from "@/lib/slots";

/**
 * The availability toggle is real: it writes `online`, which drives the live
 * count on the landing page, the "Online" dot on cards and the ?online=1
 * filter. Turning it on also publishes the next three days of slots so a
 * client can actually reach the booking flow.
 */
export async function setAvailability(online: boolean) {
  const profile = await requireLawyerProfile();

  await db.lawyerProfile.update({
    where: { id: profile.id },
    data: { online },
  });

  if (online) await ensureUpcomingSlots(profile.id);

  revalidatePath("/lawyer");
  revalidatePath("/lawyers");
  revalidatePath("/");
  revalidatePath(`/lawyers/${profile.id}`);

  return { online, verified: profile.status === "VERIFIED" };
}
