import { formatRupees, splitFee } from "@/lib/money";

/**
 * The signature transparency card (PLAN.md §3) — the split is shown
 * before booking, not after. Oxblood rule across the top, mono-set.
 */
export function FeeBreakdown({ fee }: { fee: number }) {
  const { amount, lawyerCut, platformCut } = splitFee(fee);

  return (
    <div className="card overflow-hidden">
      <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <span className="mono-label text-muted">Consultation</span>
          <span className="font-mono-num text-2xl text-accent">
            {formatRupees(amount)}
          </span>
        </div>

        <div className="my-4 h-px bg-rule" />

        <dl className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <dt className="text-sm text-slate">Advocate receives</dt>
            <dd className="font-mono-num text-sm">{formatRupees(lawyerCut)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-sm text-slate">Platform fee</dt>
            <dd className="font-mono-num text-sm text-muted">
              {formatRupees(platformCut)}
            </dd>
          </div>
        </dl>

        <div className="my-4 h-px bg-rule" />

        <p className="mono-label text-muted">30 min · chat + video · UPI</p>
      </div>
    </div>
  );
}
