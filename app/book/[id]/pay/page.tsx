import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";
import { splitFee } from "@/lib/money";
import { maxRedeemable, pointsFor } from "@/lib/rewards";
import { isFirstConsultation, welcomeDiscount } from "@/lib/offers";
import { formatSlotFull, relativeSlotLabel } from "@/lib/lawyers";
import { nextInstantStart } from "@/lib/slots";
import { PaymentSheet } from "@/components/payment-sheet";
import { confirmPayment } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pay — LawNest" };

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ slot?: string; instant?: string }>;
}) {
  const [{ id: lawyerId }, { slot: slotId, instant }] = await Promise.all([
    params,
    searchParams,
  ]);
  const wantsInstant = instant === "1";

  const [lawyer, client] = await Promise.all([
    db.lawyerProfile.findUnique({
      where: { id: lawyerId },
      include: { user: { select: { name: true, avatar: true } } },
    }),
    requireClient(),
  ]);

  if (!lawyer || !client) notFound();

  const slot = slotId
    ? await db.slot.findUnique({ where: { id: slotId } })
    : null;

  /* Instant consultations have no Slot row — they start at the next 5-minute
     boundary. That bucket is what makes a refresh idempotent: an unrounded
     "now" would differ on every render and the reuse lookup below, which
     matches slotAt exactly, would mint a fresh booking each time. */
  const slotAt =
    slot?.startsAt ??
    (wantsInstant
      ? nextInstantStart()
      : new Date(Date.now() + 2 * 60 * 60 * 1000));

  // Reuse an existing unpaid booking so a refresh doesn't duplicate (§5).
  const existing = await db.booking.findFirst({
    where: { clientId: client.id, lawyerId: lawyer.id, slotAt, paid: false },
    orderBy: { createdAt: "desc" },
  });

  const split = splitFee(lawyer.fee);
  const booking =
    existing ??
    (await db.booking.create({
      data: {
        clientId: client.id,
        lawyerId: lawyer.id,
        slotAt,
        amount: split.amount,
        lawyerCut: split.lawyerCut,
        platformCut: split.platformCut,
        paid: false,
      },
    }));

  // Already paid (e.g. back button) — go straight to the receipt.
  if (booking.paid) redirect(`/book/${booking.id}/confirmed`);

  const vpa = process.env.NEXT_PUBLIC_UPI_VPA ?? "founder@okhdfcbank";
  const payeeName = process.env.NEXT_PUBLIC_UPI_NAME ?? "LawNest";

  /* Launch offer — a percentage off a client's very first consultation, set by
     WELCOME_RATE in lib/offers.ts. Eligibility is re-checked in confirmPayment;
     this figure is only what the sheet shows. */
  const paidBookings = await db.booking.count({
    where: { clientId: client.id, paid: true },
  });
  const welcome = isFirstConsultation(paidBookings)
    ? welcomeDiscount(split.amount)
    : 0;

  // Rewards. The sheet re-derives the payable amount (and therefore the UPI
  // intent) from the toggle, but the server re-computes it again on confirm.
  // Points redeem against what the welcome offer leaves, so the two can stack
  // without the total ever going negative.
  const redeemable = maxRedeemable(client.points, split.amount - welcome);

  return (
    <main className="container container-narrow section-tight">
      <p className="mono-label text-muted">
        Step 2 of 3 · payment
        {wantsInstant && !slot ? " · instant consultation" : ""}
      </p>
      <h1 className="mt-3 text-[2rem] sm:text-[2.5rem]">
        Pay by <span className="tone-accent">UPI</span>
      </h1>

      <div className="mt-8">
        <PaymentSheet
          bookingId={booking.id}
          slotId={slot?.id ?? null}
          lawyerName={lawyer.user.name}
          lawyerAvatar={lawyer.user.avatar}
          slotLabel={
            wantsInstant && !slot
              ? `Starts ${relativeSlotLabel(slotAt)} · in a few minutes`
              : formatSlotFull(slotAt)
          }
          amount={split.amount}
          lawyerCut={split.lawyerCut}
          platformCut={split.platformCut}
          vpa={vpa}
          payeeName={payeeName}
          points={client.points}
          welcome={welcome}
          redeemable={redeemable}
          pointsEarned={pointsFor(split.amount)}
          confirmAction={confirmPayment}
        />
      </div>
    </main>
  );
}
