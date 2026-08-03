import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageSquare, Gift } from "lucide-react";
import { db } from "@/lib/db";
import { formatRupees } from "@/lib/money";
import { formatPoints } from "@/lib/rewards";
import { formatSlotFull } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "Booking confirmed — LawNest" };

export default async function ConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      lawyer: { include: { user: { select: { name: true, avatar: true } } } },
    },
  });

  if (!booking) notFound();

  return (
    /* Centred on purpose — capped at 720px and set on a band so the receipt
       reads as a filed document (CHAT-AND-POLISH.md Task 3). */
    <main>
      <div className="container container-narrow section-tight">
        <div className="document">
      <div className="card overflow-hidden">
        <div className="h-[3px] w-full bg-verified" aria-hidden="true" />
        <div className="p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-full border border-verified/40 bg-verified/10">
            <CheckCircle2 className="size-6 text-verified" strokeWidth={2} />
          </span>

          <h1 className="mt-5 text-[2rem] sm:text-[2.5rem]">
            Consultation <span className="tone-accent">booked</span>
          </h1>
          <p className="mt-3 text-muted">
            Your advocate has been notified. You can start chatting right away.
          </p>

          <div className="mt-7 flex items-center gap-3 rounded-xl border border-rule bg-surface-2 p-4">
            <Image
              src={booking.lawyer.user.avatar}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate">{booking.lawyer.user.name}</p>
              <p className="mono-label text-muted">
                {booking.lawyer.court} · {booking.lawyer.city}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 border-t border-rule pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="mono-label text-muted">Booking ref</dt>
              <dd className="font-mono-num text-sm uppercase">
                {booking.id.slice(-10)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="mono-label text-muted">Slot</dt>
              <dd className="font-mono-num text-sm">
                {formatSlotFull(booking.slotAt)}
              </dd>
            </div>
            {booking.discount > 0 && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="mono-label text-muted">Reward discount</dt>
                <dd className="font-mono-num text-sm text-verified">
                  − {formatRupees(booking.discount)} ·{" "}
                  {formatPoints(booking.pointsSpent)} pts
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4">
              <dt className="mono-label text-muted">Paid</dt>
              <dd className="font-mono-num text-sm text-accent">
                {formatRupees(booking.amount - booking.discount)}
              </dd>
            </div>
          </dl>

          {booking.pointsEarned > 0 && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-verified/30 bg-verified/10 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-verified/15 text-verified">
                <Gift className="size-4" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="font-mono-num text-sm text-verified">
                  + {formatPoints(booking.pointsEarned)} LawNest points
                </p>
                <p className="mono-label mt-0.5 text-muted">
                  Credited now ·{" "}
                  <Link href="/rewards" className="text-accent hover:underline">
                    view rewards
                  </Link>
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/consult/${booking.id}`}
              className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
            >
              <MessageSquare className="size-4" strokeWidth={2.5} />
              Open chat
            </Link>
            <Link
              href="/me"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-rule px-5 py-3 text-sm transition-colors hover:border-accent/40 hover:bg-surface-2"
            >
              My consultations
            </Link>
          </div>
        </div>
      </div>

      <p className="mono-label mt-6 text-center text-muted">
        A receipt is available under{" "}
        <Link href="/me" className="text-accent hover:underline">
          my consultations
        </Link>
      </p>
        </div>
      </div>
    </main>
  );
}
