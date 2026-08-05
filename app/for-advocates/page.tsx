import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Inbox,
  LineChart,
  Wallet,
  Video,
  CalendarClock,
} from "lucide-react";
import { db } from "@/lib/db";
import { Engraving } from "@/components/engraving";
import { SubscriptionBand } from "@/components/subscription-offer";
import { formatRupees, splitFee, TIER_FEE } from "@/lib/money";
import {
  COMMISSION_PERCENT,
  FREE_MONTHS,
  SUBSCRIPTION_FEE,
  SUBSCRIPTION_MONTHLY,
  consultsToCoverFee,
} from "@/lib/subscription";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Join as an advocate — LawNest",
  description:
    "No subscription fee for your first year on LawNest — just 20% commission on consultations you take.",
};

/**
 * The recruitment page the funnel never had.
 *
 * "For advocates" in the header used to point straight at a sign-in form, so
 * the entire pitch to an advocate happened after the auth wall. This is the
 * marketing that belongs in front of it.
 *
 * Public by default — middleware.ts protects /lawyer/*, not this.
 */

const WHAT_YOU_GET = [
  {
    icon: BadgeCheck,
    title: "A verified listing",
    body: "Your Bar Council enrolment is checked against the register before you go live. Clients filter for that badge.",
  },
  {
    icon: Inbox,
    title: "Consultations, not enquiries",
    body: "Every thread in your inbox is a client who has already paid. Nobody is shopping around in your chat.",
  },
  {
    icon: LineChart,
    title: "A dashboard that means something",
    body: "Earnings, slot utilisation, repeat clients, practice mix, and the search demand around your matters.",
  },
  {
    icon: Wallet,
    title: "Weekly payouts",
    body: "Your share is settled every week. The split is fixed and shown to the client before they pay.",
  },
  {
    icon: Video,
    title: "Chat and video, built in",
    body: "The consultation opens the moment payment lands — no scheduling calls, no separate meeting links.",
  },
  {
    icon: CalendarClock,
    title: "Your own availability",
    body: "Open the slots you actually want. Go offline in one tap and you stop appearing as available now.",
  },
];

const STEPS = [
  ["01", "Create your account", "Email and a one-time code. No documents at this stage."],
  ["02", "We verify your enrolment", "Your Bar Council number is matched against the register — usually within 48 hours."],
  ["03", "Your listing goes live", "You appear in search, clients book your slots, and you pay no subscription fee for a year."],
];

const FAQ = [
  [
    "What exactly is free in the first year?",
    `The subscription, and only the subscription. There is no fee to be listed for your first ${FREE_MONTHS} months. The ${COMMISSION_PERCENT}% commission applies from your very first consultation — it is not waived, and we would rather say so now than have you discover it on your first payout.`,
  ],
  [
    "What happens after the twelve months?",
    `A ${formatRupees(SUBSCRIPTION_FEE)} subscription falls due once a year, alongside the same ${COMMISSION_PERCENT}% commission. That is about ${formatRupees(SUBSCRIPTION_MONTHLY)} a month, and ${consultsToCoverFee()} consultations cover it for the whole year. Stop renewing and your listing simply comes down — there is no notice period and nothing to claw back.`,
  ],
  [
    "Who decides my fee?",
    "LawNest sets your tier during verification, based on years in practice and the courts you appear before. Every advocate in a tier charges the same fixed fee — that is the whole point of the price ladder, and it is why clients trust it.",
  ],
  [
    "Do I have to be exclusive to LawNest?",
    "No. Your chamber practice is your own. LawNest is a channel, not a retainer.",
  ],
  [
    "When do I get paid?",
    "Weekly. Your dashboard shows the balance and the date of the next payout run.",
  ],
  [
    "What if my enrolment cannot be verified?",
    "You will see exactly what we could not match and can correct it. Nothing is listed until it checks out — that is what the badge is worth.",
  ],
];

export default async function ForAdvocatesPage() {
  const [verifiedCount, courts, cities] = await Promise.all([
    db.lawyerProfile.count({ where: { status: "VERIFIED" } }),
    db.lawyerProfile.findMany({
      where: { status: "VERIFIED" },
      select: { court: true },
      distinct: ["court"],
    }),
    db.lawyerProfile.findMany({
      where: { status: "VERIFIED" },
      select: { city: true },
      distinct: ["city"],
    }),
  ]);

  return (
    <main>
      <SubscriptionBand variant="hero" />

      {/* The maths, in public — the client side gets a fee breakdown before
          booking, so the advocate side gets one before joining. */}
      <section className="container section-tight">
        <p className="mono-label text-muted">The maths, in public</p>
        <h2 className="mt-4 max-w-2xl">
          What LawNest takes, and what it takes{" "}
          <span className="tone-accent">from you</span>
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-slate">
          Two things, and only two. {COMMISSION_PERCENT}% of each consultation,
          from your first one — shown to the client before they pay, so nobody
          negotiates in the dark. And a {formatRupees(SUBSCRIPTION_FEE)} yearly
          subscription, which is waived for your entire first year.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[TIER_FEE.LOWER, TIER_FEE.MIDDLE, TIER_FEE.HIGH].map((fee) => {
            const split = splitFee(fee);
            return (
              <div key={fee} className="card overflow-hidden">
                <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
                <div className="p-5 sm:p-6">
                  <p className="mono-label text-muted">Consultation</p>
                  <p className="font-mono-num mt-1 text-2xl">
                    {formatRupees(fee)}
                  </p>

                  <dl className="mt-5 space-y-2.5 border-t border-rule pt-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-sm text-ink">You receive</dt>
                      <dd className="font-mono-num text-sm text-accent">
                        {formatRupees(split.lawyerCut)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-sm text-slate">
                        LawNest commission
                      </dt>
                      <dd className="font-mono-num text-sm text-muted">
                        {formatRupees(split.platformCut)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="mono-label text-muted">Year one and after</dt>
                      <dd className="mono-label text-verified">Unchanged</dd>
                    </div>
                  </dl>
                </div>
              </div>
            );
          })}
        </div>

        {/* Year one against year two, side by side — the actual offer */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="card p-5 sm:p-6">
            <p className="mono-label text-accent">Year one</p>
            <p className="font-mono-num mt-2 text-3xl text-accent">
              {formatRupees(0)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              No subscription fee at all for {FREE_MONTHS} months. You pay only
              the {COMMISSION_PERCENT}% on consultations you actually take — so
              a month with no bookings costs you nothing.
            </p>
          </div>
          <div className="card p-5 sm:p-6">
            <p className="mono-label text-muted">Year two onwards</p>
            <p className="font-mono-num mt-2 text-3xl">
              {formatRupees(SUBSCRIPTION_FEE)}
              <span className="mono-label text-muted"> / year</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              About {formatRupees(SUBSCRIPTION_MONTHLY)} a month, on top of the
              same {COMMISSION_PERCENT}%. {consultsToCoverFee()} consultations
              cover it for the whole year.
            </p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="relative overflow-hidden">
        <Engraving side="right" />
        <div className="container section relative">
          <h2>What you get</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_YOU_GET.map((f) => (
              <div key={f.title} className="card p-5 sm:p-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-accent-bg text-accent">
                  <f.icon className="size-4" strokeWidth={2.5} />
                </span>
                <h3 className="mt-4 text-lg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof — live counts, the same query the landing page runs */}
      <section className="container section-tight">
        <div className="card overflow-hidden">
          <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
          <dl className="grid gap-y-7 p-6 sm:grid-cols-3 sm:p-9">
            {[
              [String(verifiedCount), "advocates verified and listed"],
              [String(courts.length), "courts represented"],
              [String(cities.length), "cities"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl text-ink">{value}</dt>
                <dd className="mt-2 text-sm text-slate">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How joining works */}
      <section className="container section-tight">
        <h2>How joining works</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map(([n, title, body]) => (
            <div key={n} className="card p-6">
              <span className="mono-label text-accent">{n}</span>
              <h3 className="mt-4 text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — plain <details>, no library */}
      <section className="container section-tight">
        <h2>Before you ask</h2>
        <div className="mt-8 divide-y divide-rule border-y border-rule">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-ink marker:content-['']">
                <span className="font-display text-lg">{q}</span>
                <span className="mono-label shrink-0 text-accent transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate">
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container section-tight">
        <div className="card flex flex-wrap items-center justify-between gap-6 p-6 sm:p-9">
          <div className="max-w-lg">
            <p className="mono-label text-muted">Ready when you are</p>
            <h2 className="mt-4 text-[1.75rem]">
              Your first year has no subscription fee
            </h2>
            <p className="mt-3 leading-relaxed text-slate">
              Sign up in a minute, get verified in about two days, and pay
              nothing to be listed until {new Date().getFullYear() + 1}. After
              that it is {formatRupees(SUBSCRIPTION_FEE)} a year.
            </p>
          </div>
          <Link
            href="/lawyer/sign-up"
            className="btn-primary inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium"
          >
            Join as an advocate
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </main>
  );
}
