import Link from "next/link";
import { ArrowRight, BadgePercent } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { formatRupees, TIER_FEE } from "@/lib/money";
import {
  WELCOME_CODE,
  WELCOME_RATE,
  welcomeDiscount,
  welcomePayable,
} from "@/lib/offers";

/**
 * The client-side campaign, in three sizes.
 *
 * Quiet by design — a white card with the accent cap, the same shape as
 * components/rewards-band.tsx. The one loud surface on the site is the
 * advocate band; if this shouted too, neither would.
 *
 * Every price comes out of welcomeDiscount() against a real fee, so the
 * strike-through can never disagree with what checkout charges.
 */

const PCT = Math.round(WELCOME_RATE * 100);

/** Full band — the landing page. */
export function WelcomeOfferBand() {
  return (
    <section className="container section-tight">
      <div className="card overflow-hidden">
        <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
        <div className="p-6 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="mono-label flex flex-wrap items-center gap-x-3 gap-y-1 text-accent">
                <span>Launch offer · {WELCOME_CODE}</span>
                <Countdown className="text-muted" />
              </p>

              <h2 className="mt-4 flex items-center gap-3">
                <BadgePercent className="size-6 shrink-0 text-accent" strokeWidth={2} />
                Your first advocate, {PCT}% off
              </h2>

              <p className="mt-4 leading-relaxed text-slate">
                First consultation on LawNest is {PCT}% off, up to{" "}
                {formatRupees(welcomeDiscount(TIER_FEE.HIGH))}. It comes off
                automatically at checkout — no code to type, nothing to claim,
                and your advocate still receives their full share.
              </p>
            </div>

            <Link
              href="/lawyers"
              className="btn-primary mono-label inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3"
            >
              Claim it
              <ArrowRight className="size-3.5" strokeWidth={2.5} />
            </Link>
          </div>

          {/* The ladder, restated at offer prices */}
          <dl className="mt-8 grid gap-3 border-t border-rule pt-7 sm:grid-cols-3">
            {[TIER_FEE.LOWER, TIER_FEE.MIDDLE, TIER_FEE.HIGH].map((fee) => (
              <div key={fee} className="flex items-baseline gap-2.5">
                <dt className="font-mono-num text-muted line-through">
                  {formatRupees(fee)}
                </dt>
                <dd className="font-mono-num text-xl text-accent">
                  {formatRupees(welcomePayable(fee))}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mono-label mt-6 text-muted">
            One per client · 30 minutes · advocate paid in full
          </p>
        </div>
      </div>
    </section>
  );
}

/** One line — the listing header and the empty /me. */
export function WelcomeOfferStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`card flex flex-wrap items-center gap-x-4 gap-y-2 border-l-2 border-l-accent p-4 ${className}`}
    >
      <BadgePercent className="size-4 shrink-0 text-accent" strokeWidth={2.5} />
      <p className="text-sm text-ink">
        <strong className="font-medium">
          First consultation {PCT}% off
        </strong>{" "}
        <span className="text-slate">
          — pick any advocate below, it comes off at checkout
        </span>
      </p>
      <Countdown className="mono-label ml-auto shrink-0 text-muted max-sm:hidden" />
    </div>
  );
}

/**
 * The advocate's own fee, struck through — the profile rail.
 * FeeBreakdown below it keeps showing the true ₹549 split; this card explains
 * the difference rather than hiding it, which is the more persuasive of the two.
 */
export function WelcomeOfferRail({ fee }: { fee: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
      <div className="p-5">
        <p className="mono-label flex items-center gap-1.5 text-accent">
          <BadgePercent className="size-3.5" strokeWidth={2.5} />
          First consultation · {PCT}% off
        </p>

        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-mono-num text-3xl text-accent">
            {formatRupees(welcomePayable(fee))}
          </span>
          <span className="font-mono-num text-lg text-muted line-through">
            {formatRupees(fee)}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate">
          You save {formatRupees(welcomeDiscount(fee))} on your first
          consultation. Applied at checkout — this advocate is still paid in
          full.
        </p>

        <Countdown className="mono-label mt-3 block text-muted" />
      </div>
    </div>
  );
}
