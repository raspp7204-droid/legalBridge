"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/**
 * Either participant can close the consultation. The thread then goes
 * read-only for both sides — the other window picks it up on its next 2s
 * poll, because `endedAt` rides along on the GET response.
 *
 * The system line is a Message with senderRole ADMIN, so it propagates
 * through the exact same poll with no extra plumbing.
 */
export async function endConsultation(bookingId: string) {
  const [booking, viewer] = await Promise.all([
    db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        clientId: true,
        endedAt: true,
        lawyer: { select: { userId: true } },
      },
    }),
    requireUser(),
  ]);

  if (!booking) throw new Error("Booking not found");
  if (!viewer) throw new Error("Sign in required");

  const isClient = viewer.id === booking.clientId;
  const isLawyer = viewer.id === booking.lawyer.userId;
  if (!isClient && !isLawyer) throw new Error("Not your consultation");

  // Idempotent — both sides may click, and the loser is a no-op.
  if (booking.endedAt) return;

  const endedBy = isLawyer ? "LAWYER" : "CLIENT";

  await db.$transaction([
    db.booking.update({
      where: { id: bookingId },
      data: { endedAt: new Date(), endedBy },
    }),
    db.message.create({
      data: {
        bookingId,
        senderRole: "ADMIN",
        body: `Consultation ended by the ${
          isLawyer ? "advocate" : "client"
        }. This thread is now read-only.`,
      },
    }),
  ]);

  revalidatePath(`/consult/${bookingId}`);
}
