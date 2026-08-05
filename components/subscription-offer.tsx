import Link from "next/link";
import { ArrowRight, BadgePercent, Scale } from "lucide-react";
import { formatRupees, splitFee, TIER_FEE } from "@/lib/money";
import {
  COMMISSION_PERCENT,
  FREE_MONTHS,
  SUBSCRIPTION_FEE,
  SUBSCRIPTION_MONTHLY,
  consultsToCoverFee,
  daysLeftFree,
  formatRenewal,
  isFreeYear,
  renewsOn,
} from "@/lib/subscription";

/**
 * The recruitment offer: a first year with no subscription fee.
 *
 * Every surface here states the commission as well as the waiver. An advocate
 * who joins believing the first year is free of *everything* will feel misled
 * the first time they read their payout, and that is a far more expensive
 * problem than a slightly weaker headline.
 */

/** The year-one / year-two card. The one bold thing in any block carrying it. */
export function SubscriptionRateCard() {
  return (
    <div className="card overflow-hidden">
      <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="mono-label text-muted">Year one</span>
          <span className="font-mono-num text-2xl text-accent">
            {formatRupees(0)}
          </span>
        </div>

        <div className="my-4 h-px bg-rule" />

        <dl className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-slate">Subscription, year one</dt>
            <dd className="font-mono-num text-sm text-verified">Waived</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-slate">Subscription, year two on</dt>
            <dd className="font-mono-num text-sm">
              {formatRupees(SUBSCRIPTION_FEE)} / year
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-slate">Commission, always</dt>
            <dd className="font-mono-num text-sm">{COMMISSION_PERCENT}%</dd>
          </div>
        </dl>

        <div className="my-4 h-px bg-rule" />

        <p className="mono-label text-muted">
          {formatRupees(SUBSCRIPTION_MONTHLY)} a month after year one · no card
          to join
        </p>
      </div>
    </div>
  );
}

/** Full-width recruitment band — landing page and /for-advocates. */
export function SubscriptionBand({
  variant = "band",
}: {
  variant?: "band" | "hero";
}) {
  return (
    <section className="border-y border-rule bg-paper-deep">
      <div
        className={`container ${variant === "hero" ? "section" : "section-tight"}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-8">
          <div className="max-w-2xl">
            <p className="mono-label text-accent">
              Introductory offer · first {FREE_MONTHS} months
            </p>

            {variant === "hero" ? (
              <h1 className="mt-5 max-w-[16ch] text-balance">
                No subscription fee for your first year.
              </h1>
            ) : (
              <h2 className="mt-5 flex items-start gap-3">
                <Scale className="mt-1.5 size-7 shrink-0" strokeWidth={2} />
                Are you an advocate? Your first year has no subscription fee.
              </h2>
            )}

            <p className="mt-5 max-w-xl leading-relaxed text-slate">
              Join LawNest and pay nothing to be listed for a whole year — just
              the {COMMISSION_PERCENT}% commission on consultations you actually
              take. From year two it is{" "}
              <strong className="font-mono-num text-ink">
                {formatRupees(SUBSCRIPTION_FEE)}
              </strong>{" "}
              a year, about {formatRupees(SUBSCRIPTION_MONTHLY)} a month — which{" "}
              {consultsToCoverFee()} consultations cover for the whole year.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/lawyer/sign-up"
                className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium"
              >
                Join as an advocate
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="/for-advocates"
                className="btn-secondary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium"
              >
                How it works
              </Link>
            </div>

            <p className="mono-label mt-6 text-muted">
              No card to join · Bar Council enrolment verified in 48 hours ·
              cancel any time
            </p>
          </div>

          {/* What you keep per consultation — unchanged in either year, which
              is the honest thing to show next to a waived fee. */}
          <dl className="grid w-full max-w-sm gap-px overflow-hidden rounded-2xl border border-rule bg-rule">
            <div className="flex items-baseline justify-between gap-4 bg-surface px-4 py-3">
              <dt className="mono-label text-muted">Per consultation</dt>
              <dd className="mono-label text-muted">You keep</dd>
            </div>
            {[TIER_FEE.LOWER, TIER_FEE.MIDDLE, TIER_FEE.HIGH].map((fee) => {
              const split = splitFee(fee);
              return (
                <div
                  key={fee}
                  className="flex items-baseline justify-between gap-4 bg-surface px-4 py-3"
                >
                  <dt className="font-mono-num text-sm text-slate">
                    {formatRupees(fee)}
                  </dt>
                  <dd className="font-mono-num text-lg text-accent">
                    {formatRupees(split.lawyerCut)}
                  </dd>
                </div>
              );
            })}
            <div className="bg-surface px-4 py-3">
              <p className="mono-label text-muted">
                Same in year one and every year after
              </p>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/** Compact card for the advocate auth screens. */
export function SubscriptionBanner() {
  return (
    <div className="card mb-8 overflow-hidden">
      <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 p-4 sm:p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent">
          <BadgePercent className="size-4" strokeWidth={2.5} />
        </span>

        <div className="min-w-[16rem] flex-1">
          <p className="mono-label text-accent">
            Introductory offer · first {FREE_MONTHS} months
          </p>
          <p className="font-display mt-1.5 text-[1.0625rem] leading-snug">
            No subscription fee for your first year
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate">
            Just the {COMMISSION_PERCENT}% commission on consultations you take.
            From year two, {formatRupees(SUBSCRIPTION_FEE)} a year.
          </p>
        </div>

        <p className="mono-label shrink-0 text-muted">Nothing to pay to join</p>
      </div>
    </div>
  );
}

/** The advocate's own status, on their dashboard. */
export function SubscriptionStatusCard({ joinedAt }: { joinedAt: Date }) {
  const free = isFreeYear(joinedAt);
  const due = renewsOn(joinedAt);
  const daysLeft = daysLeftFree(joinedAt);

  return (
    <section className="card overflow-hidden">
      <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="mono-label text-muted">Subscription</p>
          {free ? (
            <span className="mono-label rounded-full border border-verified/40 px-2 py-1 text-verified">
              Free year
            </span>
          ) : (
            <span className="mono-label rounded-full border border-rule px-2 py-1 text-muted">
              Active
            </span>
          )}
        </div>

        <p className="font-mono-num mt-1 text-3xl text-accent">
          {free ? formatRupees(0) : formatRupees(SUBSCRIPTION_FEE)}
        </p>
        <p className="mono-label mt-1 text-muted">
          {free ? "for your first year" : "per year"}
        </p>

        <dl className="mt-5 space-y-2.5 border-t border-rule pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="mono-label text-muted">
              {free ? "Free until" : "Renews"}
            </dt>
            <dd className="font-mono-num text-sm">{formatRenewal(due)}</dd>
          </div>
          {free && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="mono-label text-muted">Days left</dt>
              <dd className="font-mono-num text-sm">{daysLeft}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-3">
            <dt className="mono-label text-muted">Commission</dt>
            <dd className="font-mono-num text-sm">{COMMISSION_PERCENT}%</dd>
          </div>
        </dl>

        <p className="mt-4 rounded-lg border border-rule bg-surface-2 p-3 text-sm leading-relaxed text-slate">
          {free ? (
            <>
              Your first year is on us — no subscription fee until{" "}
              {formatRenewal(due)}. The {COMMISSION_PERCENT}% commission applies
              from your first consultation, as it does for everyone.
            </>
          ) : (
            <>
              {formatRupees(SUBSCRIPTION_FEE)} a year keeps your listing live —
              about {consultsToCoverFee()} consultations covers it.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
