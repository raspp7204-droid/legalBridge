import Link from "next/link";
import { ArrowRight, TrendingUp, Search, BadgeCheck, Lock } from "lucide-react";
import { formatRupees } from "@/lib/money";
import {
  PLACEMENT_PRICE,
  PLACEMENT_MONTHLY,
  PLACEMENT_MONTHS,
  PLACEMENT_TRIAL_MONTHS,
  PLACEMENT_YEARS,
  PROMO_INVENTORY,
  placementBillsFrom,
  placementDiscountPercent,
  placementEndsAt,
  placementListPrice,
  placementSaving,
} from "@/lib/promotions";

/**
 * The founding placement offer — the advocate-side revenue line.
 *
 * The client side of LawNest sells transparency, so the advocate side has to
 * be sold the same way: what it costs, what it would cost otherwise, what it
 * buys, and what it explicitly does not buy. The rate card here is the same
 * mono-set shape as the FeeBreakdown card a client reads before paying.
 */

const term = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);

/** The rate card — the one bold thing in any block that carries it. */
export function PlacementRateCard() {
  return (
    <div className="card overflow-hidden">
      <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="mono-label text-muted">Founding placement</span>
          <span className="font-mono-num text-2xl text-accent">
            {formatRupees(PLACEMENT_PRICE)}
          </span>
        </div>

        <div className="my-4 h-px bg-rule" />

        <dl className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-slate">Term</dt>
            <dd className="font-mono-num text-sm">
              {PLACEMENT_YEARS} years · {PLACEMENT_MONTHS} months
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-slate">Works out to</dt>
            <dd className="font-mono-num text-sm">
              {formatRupees(PLACEMENT_MONTHLY)} / month
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-slate">Monthly card would be</dt>
            <dd className="font-mono-num text-sm text-muted line-through">
              {formatRupees(placementListPrice())}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="mono-label text-muted">You save</dt>
            <dd className="font-mono-num text-sm text-verified">
              {formatRupees(placementSaving())}
            </dd>
          </div>
        </dl>

        <div className="my-4 h-px bg-rule" />

        <p className="mono-label text-muted">
          First {PLACEMENT_TRIAL_MONTHS} months free · paid once · nothing to
          renew
        </p>
      </div>
    </div>
  );
}

const INCLUDED = [
  {
    icon: TrendingUp,
    title: "Top of your practice area",
    body: "When a client filters to a matter you practise, your listing is the first one they read.",
  },
  {
    icon: Search,
    title: "Every city you appear in",
    body: "Placement follows the practice area, not one city — you rank first wherever your filters match.",
  },
  {
    icon: BadgeCheck,
    title: "Labelled, not disguised",
    body: "A promoted listing always carries a PROMOTED tag. Clients trust the ranking because we never hide who paid.",
  },
  {
    icon: Lock,
    title: "Your fee never changes",
    body: "Placement buys position, nothing else. Your tier, your fee and your 80% share are exactly what they were.",
  },
];

/**
 * The full pitch. `href` differs by audience — a signed-out advocate has to
 * make an account before there is a listing to promote.
 */
export function PlacementOffer({
  href = "/lawyer/placement",
  cta = "Take the founding placement",
  taken = 0,
  action,
}: {
  href?: string;
  cta?: string;
  /** Placements already sold, for the scarcity line. */
  taken?: number;
  /** Replaces the CTA link — the placement page puts its checkout here. */
  action?: React.ReactNode;
}) {
  const left = Math.max(0, PROMO_INVENTORY - taken);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-8">
        <div className="max-w-2xl">
          <p className="mono-label text-accent">
            Founding placement · {left} of {PROMO_INVENTORY}{" "}
            {left === 1 ? "slot" : "slots"} left
          </p>

          <h2 className="mt-5 max-w-[20ch] text-balance">
            {formatRupees(PLACEMENT_PRICE)}. Three years at the top of your{" "}
            <span className="tone-accent">practice area</span>.
          </h2>

          <p className="mt-5 max-w-xl leading-relaxed text-slate">
            One payment, not a subscription. Your name sits first in the matters
            you practise until {term(placementEndsAt())} — that is{" "}
            {formatRupees(PLACEMENT_MONTHLY)} a month, against{" "}
            {formatRupees(placementListPrice())} for the same three years on the
            monthly rate card. The first {PLACEMENT_TRIAL_MONTHS} months are
            free, so nothing is charged before{" "}
            {term(placementBillsFrom())}.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {action ?? (
              <Link
                href={href}
                className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium"
              >
                {cta}
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>
            )}
            <span className="mono-label text-muted">
              {placementDiscountPercent()}% under the monthly card
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <PlacementRateCard />
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {INCLUDED.map((f) => (
          <div key={f.title} className="card p-5">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-bg text-accent">
              <f.icon className="size-4" strokeWidth={2.5} />
            </span>
            <h3 className="mt-4 text-lg">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard-sized. Either the offer or the live campaign, never both — an
 * advocate who has already paid should not keep being sold to.
 */
export function PlacementStatusCard({
  active,
  until,
  rank,
}: {
  active: boolean;
  until: Date | null;
  rank: number | null;
}) {
  if (active) {
    return (
      <section className="card overflow-hidden">
        <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="mono-label text-muted">Placement</p>
            <span className="mono-label rounded-full border border-verified/40 px-2 py-1 text-verified">
              Live
            </span>
          </div>

          <p className="font-display mt-3 text-xl">
            First in your practice area
          </p>

          <dl className="mt-5 space-y-2.5 border-t border-rule pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="mono-label text-muted">Position</dt>
              <dd className="font-mono-num text-sm">#{rank ?? 1}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="mono-label text-muted">Runs until</dt>
              <dd className="font-mono-num text-sm">
                {until ? term(until) : "No end date"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="mono-label text-muted">Paid</dt>
              <dd className="font-mono-num text-sm text-accent">
                {formatRupees(PLACEMENT_PRICE)} once
              </dd>
            </div>
          </dl>

          <Link
            href="/lawyer/placement"
            className="mono-label mt-4 flex items-center gap-1 text-accent hover:underline"
          >
            Manage placement
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
      <div className="p-5">
        <p className="mono-label text-accent">Founding placement</p>
        <p className="font-display mt-3 text-xl">
          {formatRupees(PLACEMENT_PRICE)} for {PLACEMENT_YEARS} years at the top
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          Rank first when a client filters to a matter you practise.{" "}
          {formatRupees(PLACEMENT_MONTHLY)} a month against{" "}
          {formatRupees(placementListPrice())} on the monthly card — and the
          first {PLACEMENT_TRIAL_MONTHS} months are free.
        </p>
        <Link
          href="/lawyer/placement"
          className="btn-primary mono-label mt-5 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5"
        >
          See the offer
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}
