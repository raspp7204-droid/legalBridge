import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import { Countdown } from "@/components/countdown";
import { formatRupees, splitFee, TIER_FEE } from "@/lib/money";
import {
  commissionSaved,
  FOUNDING_BASIS,
  FOUNDING_MONTHS,
  PLATFORM_PERCENT,
} from "@/lib/offers";

/**
 * The recruitment ad — the ONE solid colour field on the site.
 *
 * app/globals.css:30-33 says sections must not sit on coloured slabs, and that
 * rule is right for every other surface: the contrast on this site comes from
 * white cards on warm paper. This band breaks it deliberately, once, because
 * an ad that looks like a section does not get read as an ad. Do not
 * "consistency-fix" it, and do not add a second one.
 *
 * blockLawyers() keeps signed-in advocates off the landing and the listing, so
 * the audience here is clients and signed-out visitors — the people who know
 * an advocate, not the ones already on the platform.
 */
export function AdvocateOfferBand({
  seats,
  variant = "band",
}: {
  seats: number;
  variant?: "band" | "hero";
}) {
  const saving = commissionSaved();

  return (
    <section className="offer-band bg-accent">
      <div className={`container ${variant === "hero" ? "section" : "section-tight"}`}>
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-8">
          <div className="max-w-2xl">
            <p className="mono-label flex flex-wrap items-center gap-x-2 gap-y-1 text-white/70">
              <span>
                Founding advocates · {seats}{" "}
                {seats === 1 ? "seat" : "seats"} left
              </span>
              <span aria-hidden="true">·</span>
              <Countdown className="text-white/70" />
            </p>

            {variant === "hero" ? (
              <h1 className="mt-5 max-w-[16ch] text-balance">
                Keep <span className="whitespace-nowrap">100%</span> for your
                first year.
              </h1>
            ) : (
              <h2 className="mt-5 flex items-start gap-3">
                <Scale className="mt-1.5 size-7 shrink-0" strokeWidth={2} />
                Are you an advocate? Keep 100% for a year.
              </h2>
            )}

            <p className="mt-5 max-w-xl leading-relaxed text-white/80">
              LawNest takes {PLATFORM_PERCENT}% of every consultation. Founding
              advocates pay nothing for {FOUNDING_MONTHS} months — on{" "}
              {FOUNDING_BASIS.consultsPerMonth} consultations a month at{" "}
              {formatRupees(FOUNDING_BASIS.fee)}, that is{" "}
              <strong className="font-mono-num text-white">
                {formatRupees(saving)}
              </strong>{" "}
              of commission you simply never pay.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/for-advocates"
                className="btn-on-accent inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium"
              >
                Claim your seat
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="/lawyer/sign-up"
                className="btn-ghost-accent inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium"
              >
                Join as an advocate
              </Link>
            </div>

            <p className="mono-label mt-6 text-white/60">
              Free · no card · Bar Council enrolment verified in 48 hours
            </p>
          </div>

          {/* The maths, per tier — the same transparency argument the client
              side makes, pointed at the other half of the marketplace. */}
          <dl className="grid w-full max-w-sm gap-px overflow-hidden rounded-2xl border border-white/25 bg-white/25">
            <div className="flex items-baseline justify-between gap-4 bg-accent px-4 py-3">
              <dt className="mono-label text-white/70">Per consultation</dt>
              <dd className="mono-label text-white/70">You keep</dd>
            </div>
            {[TIER_FEE.LOWER, TIER_FEE.MIDDLE, TIER_FEE.HIGH].map((fee) => {
              const split = splitFee(fee);
              return (
                <div
                  key={fee}
                  className="flex items-baseline justify-between gap-4 bg-accent px-4 py-3"
                >
                  <dt className="font-mono-num text-sm text-white/80">
                    {formatRupees(fee)}
                  </dt>
                  <dd className="flex items-baseline gap-2.5">
                    <span className="font-mono-num text-sm text-white/50 line-through">
                      {formatRupees(split.lawyerCut)}
                    </span>
                    <span className="font-mono-num text-lg">
                      {formatRupees(fee)}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
