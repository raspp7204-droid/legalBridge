import { db } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import { isFirstConsultation } from "@/lib/offers";

/**
 * Whether to show the first-consultation offer to whoever is reading.
 *
 * Kept out of lib/offers.ts on purpose: that module is imported by
 * payment-sheet.tsx, which is a client component, and pulling Prisma in
 * through it would drag the database client into the browser bundle.
 *
 * A banner that promises a discount to someone who has already used it is
 * worse than no banner, so every surface asks this rather than assuming.
 */
export async function welcomeEligible() {
  const user = await getDbUser();

  // Signed out — eligible by definition, and the strongest audience for it.
  if (!user) return true;
  if (user.role !== "CLIENT") return false;

  const paid = await db.booking.count({
    where: { clientId: user.id, paid: true },
  });
  return isFirstConsultation(paid);
}
