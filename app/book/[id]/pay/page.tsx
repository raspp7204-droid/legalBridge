import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getClientUser } from "@/lib/session";
import { splitFee } from "@/lib/money";
import { formatSlotFull } from "@/lib/lawyers";
import { PaymentSheet } from "@/components/payment-sheet";
import { confirmPayment } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pay — LawNest" };

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ slot?: string }>;
}) {
  const [{ id: lawyerId }, { slot: slotId }] = await Promise.all([
    params,
    searchParams,
  ]);

  const [lawyer, client] = await Promise.all([
    db.lawyerProfile.findUnique({
      where: { id: lawyerId },
      include: { user: { select: { name: true, avatar: true } } },
    }),
    getClientUser(),
  ]);

  if (!lawyer || !client) notFound();

  const slot = slotId
    ? await db.slot.findUnique({ where: { id: slotId } })
    : null;
  const slotAt = slot?.startsAt ?? new Date(Date.now() + 2 * 60 * 60 * 1000);

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
  const upiLink =
    `upi://pay?pa=${encodeURIComponent(vpa)}` +
    `&pn=${encodeURIComponent(payeeName)}` +
    `&am=${split.amount}&cu=INR` +
    `&tn=${encodeURIComponent(`LawNest-${booking.id}`)}`;

  return (
    <main className="container container-narrow section-tight">
      <p className="mono-label text-muted">Step 2 of 3 · payment</p>
      <h1 className="mt-3 text-[2rem] sm:text-[2.5rem]">
        Pay by <span className="tone-accent">UPI</span>
      </h1>

      <div className="mt-8">
        <PaymentSheet
          bookingId={booking.id}
          slotId={slot?.id ?? null}
          lawyerName={lawyer.user.name}
          lawyerAvatar={lawyer.user.avatar}
          slotLabel={formatSlotFull(slotAt)}
          amount={split.amount}
          lawyerCut={split.lawyerCut}
          platformCut={split.platformCut}
          upiLink={upiLink}
          vpa={vpa}
          confirmAction={confirmPayment}
        />
      </div>
    </main>
  );
}
