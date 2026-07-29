"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Smartphone, ShieldCheck } from "lucide-react";
import { formatRupees } from "@/lib/money";

export function PaymentSheet({
  bookingId,
  slotId,
  lawyerName,
  lawyerAvatar,
  slotLabel,
  amount,
  lawyerCut,
  platformCut,
  upiLink,
  vpa,
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
  upiLink: string;
  vpa: string;
  confirmAction: (bookingId: string, slotId: string | null) => Promise<void>;
}) {
  const [verifying, setVerifying] = useState(false);
  const [, startTransition] = useTransition();

  function confirm() {
    setVerifying(true);
    // 1.5s "Verifying payment…" so it reads as a real settlement wait
    setTimeout(() => {
      startTransition(async () => {
        await confirmAction(bookingId, slotId);
      });
    }, 1500);
  }

  return (
    <div className="card overflow-hidden">
      <div className="h-[3px] w-full bg-brass" aria-hidden="true" />

      <div className="border-b border-rule p-5 sm:p-6">
        <p className="mono-label text-muted">Pay to LegalBridge</p>
        <p className="font-mono-num mt-1 text-4xl text-brass">
          {formatRupees(amount)}
        </p>
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
      <div className="grid gap-6 border-b border-rule p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="mx-auto w-fit rounded-xl bg-[#F4F1EA] p-3">
          <QRCodeSVG
            value={upiLink}
            size={168}
            bgColor="#F4F1EA"
            fgColor="#14100A"
            level="M"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm leading-relaxed text-text/85">
            Scan with any UPI app to pay {formatRupees(amount)}.
          </p>
          <p className="mono-label mt-2 text-muted">Paying to {vpa}</p>

          <a
            href={upiLink}
            className="cta-brass mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium sm:w-fit"
          >
            <Smartphone className="size-4" strokeWidth={2.5} />
            Pay via GPay / PhonePe / Paytm
          </a>
          <p className="mono-label mt-2 text-muted">
            Opens your UPI app on a phone
          </p>
        </div>
      </div>

      {/* Order summary — mirrors the fee card */}
      <div className="border-b border-rule p-5 sm:p-6">
        <p className="mono-label text-muted">Order summary</p>
        <dl className="mt-3 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <dt className="text-sm text-text/85">Consultation · 30 min</dt>
            <dd className="font-mono-num text-sm">{formatRupees(amount)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-sm text-text/85">Advocate receives</dt>
            <dd className="font-mono-num text-sm">{formatRupees(lawyerCut)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-sm text-text/85">Platform fee</dt>
            <dd className="font-mono-num text-sm text-muted">
              {formatRupees(platformCut)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="p-5 sm:p-6">
        <button
          type="button"
          onClick={confirm}
          disabled={verifying}
          className="cta-brass flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 font-medium disabled:opacity-70"
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
  );
}
