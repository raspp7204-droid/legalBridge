import Link from "next/link";
import { Gift, ArrowRight } from "lucide-react";
import { formatRupees, TIER_FEE } from "@/lib/money";
import { formatPoints, pointsFor, REDEEM_STEP, pointsToRupees } from "@/lib/rewards";

/**
 * The loyalty loop, advertised. Rewards shipped with the booking flow but a
 * first-time visitor had no way to know they existed — you only met them
 * after paying.
 *
 * Every figure is computed from lib/rewards.ts, never typed in, so the 5%
 * rate lives in exactly one place.
 */
const LADDER = [TIER_FEE.LOWER, TIER_FEE.MIDDLE, TIER_FEE.HIGH];

export function RewardsBand() {
  return (
    <section className="container section-tight">
      <div>
        <div className="card overflow-hidden">
          <div className="h-[3px] w-full bg-accent" aria-hidden="true" />

          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <p className="mono-label text-muted">LawNest Rewards</p>

                <h2 className="mt-4 flex items-center gap-3">
                  <Gift className="size-6 shrink-0 text-accent" strokeWidth={2} />
                  Every consultation pays you back
                </h2>

                <p className="mt-4 leading-relaxed text-slate">
                  Five percent of every fee comes back as points the moment your
                  payment lands. {formatPoints(REDEEM_STEP)} points takes{" "}
                  {formatRupees(pointsToRupees(REDEEM_STEP))} off your next
                  advocate — and your advocate still receives their full share.
                </p>
              </div>

              <Link
                href="/rewards"
                className="btn-secondary mono-label inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3"
              >
                How rewards work
                <ArrowRight className="size-3.5" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Earn ladder — mirrors the hero's price ladder, one row down */}
            <dl className="mt-8 grid gap-3 border-t border-rule pt-7 sm:grid-cols-3">
              {LADDER.map((fee) => (
                <div key={fee} className="flex items-baseline gap-3">
                  <dt className="font-mono-num text-lg text-ink">
                    {formatRupees(fee)}
                  </dt>
                  <ArrowRight
                    className="size-3.5 shrink-0 text-muted"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <dd className="font-mono-num text-lg text-accent">
                    {formatPoints(pointsFor(fee))}
                    <span className="mono-label ml-1.5 text-muted">points</span>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mono-label mt-6 text-muted">
              Points never expire while your account is open · no cash value
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
