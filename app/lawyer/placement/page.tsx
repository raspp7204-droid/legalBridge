import Link from "next/link";
import { ArrowRight, Check, Info } from "lucide-react";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/auth";
import {
  PlacementOffer,
  PlacementRateCard,
} from "@/components/placement-offer";
import {
  PlacementPayButton,
  PlacementCancelButton,
} from "@/components/placement-button";
import { formatRupees } from "@/lib/money";
import {
  PLACEMENT_PRICE,
  PLACEMENT_TRIAL_MONTHS,
  PLACEMENT_YEARS,
  isActivePromo,
  isPlacement,
  placementBillsFrom,
  placementChargeDate,
} from "@/lib/promotions";
import { activatePlacement, cancelPlacement } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Placement — LawNest" };

const longDate = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);

export default async function PlacementPage() {
  const profile = await requireLawyerProfile();

  const [categories, sold] = await Promise.all([
    db.category.findMany({
      where: { lawyers: { some: { id: profile.id } } },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.lawyerProfile.count({
      where: {
        promoted: true,
        promotedTier: "PLACEMENT",
        OR: [{ promotedUntil: null }, { promotedUntil: { gt: new Date() } }],
      },
    }),
  ]);

  const live = isActivePromo(profile) && isPlacement(profile);
  const verified = profile.status === "VERIFIED";

  return (
    <main className="container container-wide section-tight">
      <p className="mono-label text-muted">Advocate · promotion</p>
      <h1 className="mt-3 text-[2rem] sm:text-[3rem]">
        Get found <span className="tone-accent">first</span>
      </h1>
      <p className="mt-3 max-w-2xl text-slate">
        Clients arrive at LawNest by matter — property, divorce, cheque bounce.
        Placement decides who they read first inside the matter you practise.
      </p>

      {live ? (
        /* ---- Already bought: the receipt, not the pitch ---- */
        <div className="mt-9 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <section className="card p-5 sm:p-6">
              <span className="mono-label inline-flex items-center gap-1.5 rounded-full border border-verified/40 px-2.5 py-1 text-verified">
                <Check className="size-3" strokeWidth={3} />
                Placement live
              </span>

              <h2 className="mt-5 text-[1.75rem]">
                You are first in{" "}
                {categories.length === 1
                  ? categories[0].name.toLowerCase()
                  : `${categories.length} practice areas`}
              </h2>

              <p className="mt-4 max-w-xl leading-relaxed text-slate">
                Your listing now sits at the top whenever a client filters to a
                matter you practise, until{" "}
                {profile.promotedUntil
                  ? longDate(profile.promotedUntil)
                  : "you end it"}
                . Nothing else about your listing changed — same tier, same fee,
                same {formatRupees(profile.fee)} consultation.
              </p>

              {categories.length > 0 && (
                <ul className="mt-6 divide-y divide-rule border-y border-rule">
                  {categories.map((c) => (
                    <li
                      key={c.slug}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <span className="text-sm text-ink">{c.name}</span>
                      <Link
                        href={`/lawyers?category=${c.slug}`}
                        className="mono-label flex items-center gap-1 text-accent hover:underline"
                      >
                        See your position
                        <ArrowRight className="size-3.5" strokeWidth={2.5} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <form action={cancelPlacement} className="mt-6">
                <PlacementCancelButton />
                <p className="mono-label mt-3 text-muted">
                  Ending it drops you back to organic ranking immediately. The
                  founding price is not held once the slot is released.
                </p>
              </form>
            </section>
          </div>

          <div className="space-y-6">
            <PlacementRateCard />
            <p className="mono-label text-muted">
              {profile.promotedUntil
                ? `${formatRupees(PLACEMENT_PRICE)} charged on ${longDate(placementChargeDate(profile.promotedUntil))}`
                : `${formatRupees(PLACEMENT_PRICE)}, paid once`}{" "}
              · nothing recurring · no auto-renewal
            </p>
          </div>
        </div>
      ) : (
        /* ---- The offer ---- */
        <div className="mt-9 space-y-10">
          {!verified && (
            <div className="card border-l-2 border-l-accent p-5">
              <div className="flex flex-wrap items-start gap-3">
                <Info className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                <div className="max-w-2xl">
                  <p className="mono-label text-accent">
                    Verification first
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    You are not in the listing yet, so there is no position to
                    buy. Complete your profile and we will check your Bar
                    Council enrolment — placement stays available at the
                    founding price while you wait.
                  </p>
                  <Link
                    href="/lawyer/profile"
                    className="mono-label mt-3 inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    Complete my profile
                    <ArrowRight className="size-3.5" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <PlacementOffer
            taken={sold}
            action={
              verified ? (
                <form action={activatePlacement}>
                  <PlacementPayButton
                    label={`Start placement — free for ${PLACEMENT_TRIAL_MONTHS} months`}
                  />
                </form>
              ) : (
                <span className="btn-secondary pointer-events-none inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium opacity-60">
                  Available once verified
                </span>
              )
            }
          />

          {/* The order summary — the same discipline as the client checkout:
              the total, and what it does not include, before anyone pays. */}
          <section className="card p-5 sm:p-6">
            <h2 className="text-xl">What you are paying for</h2>
            <dl className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {[
                ["Placement", `${PLACEMENT_YEARS} years, paid once`],
                ["Charged today", formatRupees(0)],
                [
                  "First charge",
                  `${formatRupees(PLACEMENT_PRICE)} on ${longDate(placementBillsFrom())}`,
                ],
                ["Commission", "Unchanged — you keep 80% of every fee"],
                ["Your tier and fee", "Unchanged — set at verification"],
                ["Renewal", "None. It ends when the term ends."],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 border-b border-rule pb-3"
                >
                  <dt className="text-sm text-slate">{k}</dt>
                  <dd className="font-mono-num shrink-0 text-sm text-ink">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mono-label mt-5 text-muted">
              Free for {PLACEMENT_TRIAL_MONTHS} months · cancel any time before{" "}
              {longDate(placementBillsFrom())} and you are charged nothing
            </p>
          </section>

          <section>
            <h2 className="text-xl">What placement does not do</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-slate">
              It never puts you in front of a client whose filters you do not
              match, it never hides that you paid, and it never changes a
              rating or a review. Clients keep every sort control they had —
              price, experience, rating — and those sorts answer to them, not
              to us.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
