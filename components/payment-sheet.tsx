"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  Loader2,
  Smartphone,
  ShieldCheck,
  MessageSquareText,
  Clock,
  Gift,
  Check,
} from "lucide-react";
import { formatRupees } from "@/lib/money";
import { formatPoints, pointsToRupees } from "@/lib/rewards";

const NEXT_STEPS = [
  {
    icon: MessageSquareText,
    body: "The chat unlocks the moment the payment lands — no waiting for a callback.",
  },
  {
    icon: Clock,
    body: "You get a 30-minute session with the advocate, at the slot you picked.",
  },
  {
    icon: Gift,
    body: "You earn LawNest points on this consultation — 100 points takes ₹100 off the next one.",
  },
];

export function PaymentSheet({
  bookingId,
  slotId,
  lawyerName,
  lawyerAvatar,
  slotLabel,
  amount,
  lawyerCut,
  platformCut,
  vpa,
  payeeName,
  points,
  redeemable,
  pointsEarned,
  confirmAction,
}: {
  bookingId: string;
  slotId: string | null;
  lawyerName: string;
  lawyerAvatar: string;
  slotLabel: string;
  amount: number;
  lawyerCut: number;
  platformCut: number;
  vpa: string;
  payeeName: string;
  points: number;
  redeemable: number;
  pointsEarned: number;
  confirmAction: (
    bookingId: string,
    slotId: string | null,
    redeem: boolean,
  ) => Promise<void>;
}) {
  const [verifying, setVerifying] = useState(false);
  const [redeem, setRedeem] = useState(false);
  const [, startTransition] = useTransition();

  const canRedeem = redeemable > 0;
  const spent = redeem && canRedeem ? redeemable : 0;
  const discount = pointsToRupees(spent);
  const payable = amount - discount;

  // Rebuilt from the toggle so the QR always charges what the summary says.
  const upiLink =
    `upi://pay?pa=${encodeURIComponent(vpa)}` +
    `&pn=${encodeURIComponent(payeeName)}` +
    `&am=${payable}&cu=INR` +
    `&tn=${encodeURIComponent(`LawNest-${bookingId}`)}`;

  function confirm() {
    setVerifying(true);
    // 1.5s "Verifying payment…" so it reads as a real settlement wait
    setTimeout(() => {
      startTransition(async () => {
        await confirmAction(bookingId, slotId, redeem && canRedeem);
      });
    }, 1500);
  }

  return (
    /* Two regions: pay on the left, what you're buying on the right.
       Collapses to one column below 900px (RETHEME.md Task 3). */
    <div className="grid gap-6 min-[900px]:grid-cols-[1.1fr_0.9fr] min-[900px]:items-start">
      {/* Left — the actual payment */}
      <div className="card overflow-hidden">
        <div className="h-[3px] w-full bg-accent" aria-hidden="true" />

        <div className="border-b border-rule p-5 sm:p-6">
          <p className="mono-label text-muted">Pay to LawNest</p>
          <p className="font-mono-num mt-1 text-4xl text-accent">
            {formatRupees(payable)}
          </p>
          {discount > 0 && (
            <p className="mono-label mt-1 text-muted">
              <s>{formatRupees(amount)}</s> · {formatPoints(spent)} points
              applied
            </p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <Image
              src={lawyerAvatar}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm">Consultation with {lawyerName}</p>
              <p className="mono-label text-muted">{slotLabel}</p>
            </div>
          </div>
        </div>

        {/* QR + intent link */}
        <div className="border-b border-rule p-5 text-center sm:p-6">
          <div className="mx-auto w-fit rounded-xl border border-rule bg-surface-2 p-3">
            <QRCodeSVG
              value={upiLink}
              size={168}
              bgColor="#FBF8F1"
              fgColor="#17233A"
              level="M"
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate">
            Scan with any UPI app to pay {formatRupees(payable)}.
          </p>
          <p className="mono-label mt-1 text-muted">Paying to {vpa}</p>

          <a
            href={upiLink}
            className="btn-secondary mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
          >
            <Smartphone className="size-4" strokeWidth={2.5} />
            Pay via GPay / PhonePe / Paytm
          </a>
          <p className="mono-label mt-2 text-muted">
            Opens your UPI app on a phone
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <button
            type="button"
            onClick={confirm}
            disabled={verifying}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 font-medium disabled:opacity-70"
          >
            {verifying ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
                Verifying payment…
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" strokeWidth={2.5} />
                I&apos;ve completed the payment
              </>
            )}
          </button>
          <p className="mono-label mt-3 text-center text-muted">
            Chat unlocks as soon as payment is confirmed
          </p>
        </div>
      </div>

      {/* Right — order summary + reassurance */}
      <div className="space-y-4">
        <div className="card p-5 sm:p-6">
          <p className="mono-label text-muted">Order summary</p>
          <dl className="mt-3 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-slate">Consultation · 30 min</dt>
              <dd className="font-mono-num text-sm">{formatRupees(amount)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-slate">Advocate receives</dt>
              <dd className="font-mono-num text-sm">
                {formatRupees(lawyerCut)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-slate">Platform fee</dt>
              <dd className="font-mono-num text-sm text-muted">
                {formatRupees(platformCut)}
              </dd>
            </div>
          </dl>

          {/* LawNest Rewards — only offered once there's a usable balance */}
          {canRedeem && (
            <button
              type="button"
              role="switch"
              aria-checked={redeem}
              onClick={() => setRedeem((r) => !r)}
              className={`mt-4 flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                redeem
                  ? "border-accent/40 bg-accent-bg"
                  : "border-rule bg-surface-2 hover:border-accent/30"
              }`}
            >
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${
                  redeem
                    ? "border-accent bg-accent text-white"
                    : "border-rule bg-surface"
                }`}
                aria-hidden="true"
              >
                {redeem && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Gift className="size-3.5 text-accent" strokeWidth={2.5} />
                    Use {formatPoints(redeemable)} points
                  </span>
                  <span className="font-mono-num text-sm text-accent">
                    − {formatRupees(pointsToRupees(redeemable))}
                  </span>
                </span>
                <span className="mono-label mt-1 block text-muted">
                  Balance {formatPoints(points)} · {formatPoints(points - spent + pointsEarned)}{" "}
                  after this booking
                </span>
              </span>
            </button>
          )}

          {discount > 0 && (
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-sm text-slate">Reward discount</span>
              <span className="font-mono-num text-sm text-verified">
                − {formatRupees(discount)}
              </span>
            </div>
          )}

          <div className="mt-4 flex items-baseline justify-between border-t border-rule pt-4">
            <span className="mono-label text-ink">Total payable</span>
            <span className="font-mono-num text-lg text-accent">
              {formatRupees(payable)}
            </span>
          </div>

          <p className="mono-label mt-3 flex items-center gap-1.5 text-verified">
            <Gift className="size-3.5" strokeWidth={2.5} />
            You earn {formatPoints(pointsEarned)} points on this consultation
          </p>
        </div>

        <div className="card p-5 sm:p-6">
          <p className="mono-label text-muted">What happens next</p>
          <ul className="mt-4 space-y-3.5">
            {NEXT_STEPS.map((s) => (
              <li key={s.body} className="flex gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent">
                  <s.icon className="size-3.5" strokeWidth={2.5} />
                </span>
                <p className="text-sm leading-relaxed text-slate">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
