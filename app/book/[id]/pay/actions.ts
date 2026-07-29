"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";

/**
 * Marks the booking paid and books the slot.
 *
 * NOTE FOR THE FOUNDER: the QR on this page is a real, payable UPI intent —
 * it opens GPay/PhonePe/Paytm with the correct payee and amount. What it does
 * not do is auto-verify that the money arrived; this confirm step is the
 * mocked part. For real payments post-demo, swap this for Razorpay UPI
 * Collect plus a webhook that flips `paid` when the callback lands.
 */
export async function confirmPayment(bookingId: string, slotId: string | null) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  if (!booking.paid) {
    await db.booking.update({
      where: { id: bookingId },
      data: { paid: true },
    });
  }

  if (slotId) {
    await db.slot.updateMany({
      where: { id: slotId, booked: false },
      data: { booked: true },
    });
  }

  redirect(`/book/${bookingId}/confirmed`);
}
