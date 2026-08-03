"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { maxRedeemable, pointsFor, pointsToRupees } from "@/lib/rewards";
import { isFirstConsultation, welcomeDiscount } from "@/lib/offers";

/**
 * Marks the booking paid, books the slot, and settles LawNest Rewards.
 *
 * NOTE FOR THE FOUNDER: the QR on this page is a real, payable UPI intent —
 * it opens GPay/PhonePe/Paytm with the correct payee and amount. What it does
 * not do is auto-verify that the money arrived; this confirm step is the
 * mocked part. For real payments post-demo, swap this for Razorpay UPI
 * Collect plus a webhook that flips `paid` when the callback lands.
 */
export async function confirmPayment(
  bookingId: string,
  slotId: string | null,
  redeem = false,
) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { lawyer: { include: { user: { select: { name: true } } } } },
  });
  if (!booking) throw new Error("Booking not found");

  // The unpaid → paid transition is the idempotency key: a refresh or a
  // double submit can never credit points twice.
  if (!booking.paid) {
    const client = await db.user.findUnique({
      where: { id: booking.clientId },
      select: { points: true },
    });

    /* Launch offer, re-derived here rather than trusted from the page: the
       only thing that earns it is having never paid for a consultation
       before. Counting excludes this booking, which is still unpaid. */
    const priorPaid = await db.booking.count({
      where: { clientId: booking.clientId, paid: true, id: { not: bookingId } },
    });
    const welcome = isFirstConsultation(priorPaid)
      ? welcomeDiscount(booking.amount)
      : 0;

    // Recomputed server-side — the client's toggle is a request, not a figure.
    const spent = redeem
      ? maxRedeemable(client?.points ?? 0, booking.amount - welcome)
      : 0;
    /* Booking.discount stays what it has always been: total rupees off. The
       welcome half is recoverable anywhere as discount - pointsToRupees(
       pointsSpent), so no column had to be added. */
    const discount = welcome + pointsToRupees(spent);
    const earned = pointsFor(booking.amount);
    const reason = `Consultation with ${booking.lawyer.user.name}`;

    await db.$transaction([
      db.booking.update({
        where: { id: bookingId },
        data: { paid: true, discount, pointsSpent: spent, pointsEarned: earned },
      }),
      db.user.update({
        where: { id: booking.clientId },
        data: { points: { increment: earned - spent } },
      }),
      db.rewardLedger.create({
        data: {
          userId: booking.clientId,
          kind: "EARN",
          points: earned,
          reason,
          bookingId,
        },
      }),
      ...(spent > 0
        ? [
            db.rewardLedger.create({
              data: {
                userId: booking.clientId,
                kind: "REDEEM" as const,
                points: -spent,
                reason: `Redeemed against ${reason.toLowerCase()}`,
                bookingId,
              },
            }),
          ]
        : []),
    ]);
  }

  if (slotId) {
    await db.slot.updateMany({
      where: { id: slotId, booked: false },
      data: { booked: true },
    });
  }

  redirect(`/book/${bookingId}/confirmed`);
}
