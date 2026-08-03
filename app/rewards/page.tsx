import Link from "next/link";
import { Gift, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { formatRupees } from "@/lib/money";
import {
  REWARDS_STEPS,
  REWARDS_TAGLINE,
  REDEEM_MIN,
  formatPoints,
  maxRedeemable,
  pointsToRupees,
} from "@/lib/rewards";

export const dynamic = "force-dynamic";

export const metadata = { title: "Rewards — LawNest" };

function entryDate(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export default async function RewardsPage() {
  const client = await requireClient();
  if (!client) {
    return (
      <main className="container section">
        <EmptyState
          title="Rewards are for clients"
          body="Sign in as a client to see your LawNest points."
          actionHref="/lawyers"
          actionLabel="Browse advocates"
        />
      </main>
    );
  }

  const ledger = await db.rewardLedger.findMany({
    where: { userId: client.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const balance = client.points;
  // What the balance is worth on the most expensive consultation we sell.
  const usableNow = maxRedeemable(balance, 799);
  const toNext = balance >= REDEEM_MIN ? 0 : REDEEM_MIN - balance;

  return (
    <main className="container container-narrow section-tight">
      <p className="mono-label text-muted">LawNest Rewards</p>
      <h1 className="mt-3 text-[2rem] sm:text-[3rem]">
        Your <span className="tone-accent">points</span>
      </h1>
      <p className="mt-3 text-muted">{REWARDS_TAGLINE}</p>

      {/* Balance — the one bold card on the page */}
      <div className="card mt-8 overflow-hidden">
        <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mono-label text-muted">Balance</p>
              <p className="font-mono-num mt-1 flex items-center gap-2.5 text-[2.75rem] leading-none text-accent">
                <Gift className="size-7 shrink-0" strokeWidth={2} />
                {formatPoints(balance)}
              </p>
              <p className="mono-label mt-2 text-muted">
                worth {formatRupees(pointsToRupees(balance))} off consultations
              </p>
            </div>

            <Link
              href="/lawyers"
              className="btn-primary mono-label flex items-center gap-1.5 rounded-full px-5 py-3"
            >
              {usableNow > 0 ? "Spend them on a consultation" : "Book and earn"}
              <ArrowRight className="size-3.5" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="mt-6 border-t border-rule pt-5">
            {usableNow > 0 ? (
              <p className="text-sm leading-relaxed text-slate">
                You can use{" "}
                <span className="font-mono-num text-ink">
                  {formatPoints(usableNow)} points
                </span>{" "}
                at checkout right now — that&apos;s{" "}
                {formatRupees(pointsToRupees(usableNow))} off your next booking.
                The toggle appears on the payment page.
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-slate">
                {formatPoints(toNext)} more points and you can start spending
                them. Points unlock in blocks of {REDEEM_MIN}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="mt-10">
        <h2 className="text-xl">How it works</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {REWARDS_STEPS.map((s, i) => (
            <div key={s.title} className="card p-5">
              <p className="font-mono-num text-accent">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-[1.0625rem]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ledger */}
      <section className="mt-10">
        <h2 className="text-xl">Points history</h2>
        {ledger.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No points yet"
              body="Your first consultation credits 5% of the fee straight back. Every entry — earned or spent — is listed here."
              actionHref="/lawyers"
              actionLabel="Find an advocate"
            />
          </div>
        ) : (
          <ul className="card mt-4 divide-y divide-rule">
            {ledger.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{e.reason}</p>
                  <p className="mono-label mt-1 text-muted">
                    {entryDate(e.createdAt)} ·{" "}
                    {e.kind === "EARN" ? "Earned" : "Redeemed"}
                  </p>
                </div>
                <p
                  className={`font-mono-num shrink-0 text-sm ${
                    e.points >= 0 ? "text-verified" : "text-muted"
                  }`}
                >
                  {e.points >= 0 ? "+" : "−"}
                  {formatPoints(Math.abs(e.points))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mono-label mt-8 text-muted">
        Points have no cash value and cannot be transferred or withdrawn.
      </p>
    </main>
  );
}
