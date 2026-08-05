import Link from "next/link";
import {
  IndianRupee,
  CalendarDays,
  Star,
  Timer,
  Wallet,
  ArrowRight,
  Percent,
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/auth";
import { AvailabilityToggle } from "@/components/availability-toggle";
import { EarningsChart } from "@/components/earnings-chart";
import {
  SearchDemandChart,
  OnlineSwitchChart,
} from "@/components/market-charts";
import { searchDemandSeries, onlineSwitchSeries, trend } from "@/lib/demand";
import { formatRupees } from "@/lib/money";
import { formatSlotFull, formatSlotTime, formatSlotDay } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "Advocate dashboard — LawNest" };

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  hint?: string;
  /** Percent change against the previous period; null when there's no baseline. */
  delta?: number | null;
  accent?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md border border-rule bg-accent-bg">
          <Icon className="size-3.5 text-accent" strokeWidth={2} />
        </span>
        <p className="mono-label text-muted">{label}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <p
          className={`font-mono-num text-2xl ${accent ? "text-accent" : "text-ink"}`}
        >
          {value}
        </p>
        {delta !== undefined && delta !== null && (
          <span
            className={`mono-label flex items-center gap-0.5 ${
              delta >= 0 ? "text-verified" : "text-danger"
            }`}
          >
            {delta >= 0 ? (
              <TrendingUp className="size-3" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="size-3" strokeWidth={2.5} />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <p className="mono-label mt-1 text-muted">{hint}</p>}
    </div>
  );
}

/** A single share-of-revenue row. Bar width is the share, not the count. */
function MixRow({
  name,
  count,
  earned,
  total,
}: {
  name: string;
  count: number;
  earned: number;
  total: number;
}) {
  const pct = total ? Math.round((earned / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-sm text-ink">{name}</p>
        <p className="font-mono-num shrink-0 text-sm">
          {formatRupees(earned)}
          <span className="mono-label ml-1.5 text-muted">{pct}%</span>
        </p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mono-label mt-1 text-muted">
        {count} {count === 1 ? "consultation" : "consultations"}
      </p>
    </div>
  );
}

/** IST day key, so the chart buckets match the dashboard's other dates. */
function dayKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
}

export default async function LawyerDashboard() {
  const profile = await requireLawyerProfile();

  const now = new Date();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

  const [bookings, totals, monthTotals, lastMonthTotals, slotStats, matterCount] =
    await Promise.all([
    db.booking.findMany({
      where: { lawyerId: profile.id, paid: true },
      orderBy: { slotAt: "desc" },
      include: {
        client: { select: { name: true, avatar: true, clientCode: true } },
        lawyer: { select: { categories: { select: { name: true } } } },
        _count: { select: { messages: true } },
      },
    }),
    db.booking.aggregate({
      where: { lawyerId: profile.id, paid: true },
      _sum: { lawyerCut: true, platformCut: true, amount: true },
      _count: true,
    }),
    db.booking.aggregate({
      where: { lawyerId: profile.id, paid: true, createdAt: { gte: startOfMonth } },
      _sum: { lawyerCut: true },
      _count: true,
    }),
    // Same window one month back, so "this month" can carry a real delta
    // instead of a number with nothing to compare it against.
    db.booking.aggregate({
      where: {
        lawyerId: profile.id,
        paid: true,
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { lawyerCut: true },
    }),
    // Slot utilisation — the one number that tells an advocate whether to
    // open more availability or raise their tier.
    db.slot.groupBy({
      by: ["booked"],
      where: { lawyerId: profile.id, startsAt: { gte: startOfDay } },
      _count: true,
    }),
    // How wide the practice is — drives the modelled search volume below.
    db.category.count({ where: { lawyers: { some: { id: profile.id } } } }),
  ]);

  const today = bookings.filter(
    (b) => b.slotAt >= startOfDay && b.slotAt < endOfDay,
  );
  const upcoming = bookings
    .filter((b) => b.slotAt >= now)
    .sort((a, b) => a.slotAt.getTime() - b.slotAt.getTime());

  // One chronological list: today's remaining sessions run straight into the
  // days after, which is how a practice actually reads a diary.
  const agenda = [...today.filter((b) => b.slotAt >= now), ...upcoming]
    .filter((b, i, arr) => arr.findIndex((x) => x.id === b.id) === i)
    .slice(0, 8);

  // Pending payout — everything earned that hasn't reached a payout run yet.
  // Payouts settle weekly; nothing here is a real bank transfer.
  const pendingPayout = bookings
    .filter((b) => b.createdAt >= thirtyDaysAgo)
    .reduce((sum, b) => sum + b.lawyerCut, 0);

  const nextPayout = new Date(startOfDay);
  nextPayout.setDate(nextPayout.getDate() + ((5 - nextPayout.getDay() + 7) % 7 || 7));

  // 30-day earnings series, zero-filled so the chart keeps its shape.
  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    buckets.set(dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000)), 0);
  }
  for (const b of bookings) {
    const k = dayKey(b.createdAt);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + b.lawyerCut);
  }
  const series = [...buckets.entries()].map(([k, amount]) => ({
    label: new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(`${k}T06:00:00Z`)),
    amount,
  }));

  const answered = bookings.filter((b) => b._count.messages > 0).length;
  const responseRate = bookings.length
    ? Math.round((answered / bookings.length) * 100)
    : 100;

  /* ---- Business metrics ---- */

  const thisMonth = monthTotals._sum.lawyerCut ?? 0;
  const lastMonth = lastMonthTotals._sum.lawyerCut ?? 0;
  // Null when there is no prior month to compare against — a "+100%" against
  // zero is noise, not a trend.
  const monthDelta =
    lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  const openSlots = slotStats.find((s) => !s.booked)?._count ?? 0;
  const takenSlots = slotStats.find((s) => s.booked)?._count ?? 0;
  const totalSlots = openSlots + takenSlots;
  const utilisation = totalSlots ? Math.round((takenSlots / totalSlots) * 100) : 0;

  const avgValue = totals._count
    ? Math.round((totals._sum.lawyerCut ?? 0) / totals._count)
    : 0;

  // Repeat business — the metric that separates a practice from a queue.
  const clientIds = bookings.map((b) => b.clientId);
  const uniqueClients = new Set(clientIds).size;
  const repeatClients = uniqueClients
    ? Math.round(((clientIds.length - uniqueClients) / clientIds.length) * 100)
    : 0;

  // Revenue by practice area, biggest first.
  const byMatter = new Map<string, { count: number; earned: number }>();
  for (const b of bookings) {
    const name = b.lawyer.categories[0]?.name ?? "General";
    const row = byMatter.get(name) ?? { count: 0, earned: 0 };
    row.count += 1;
    row.earned += b.lawyerCut;
    byMatter.set(name, row);
  }
  const matterMix = [...byMatter.entries()]
    .map(([name, r]) => ({ name, ...r }))
    .sort((a, b) => b.earned - a.earned);
  const mixTotal = matterMix.reduce((s, m) => s + m.earned, 0);

  /* ---- Market demand (lib/demand.ts) ----
     Modelled from the practice's shape, not measured — nothing in the schema
     records searches. Both cards say so under the chart. */
  const demand = searchDemandSeries({
    seed: profile.id,
    matters: matterCount,
    years: profile.years,
  });
  const switching = onlineSwitchSeries({
    seed: profile.id,
    city: profile.city || "India",
  });

  const searchesThisWeek = demand[demand.length - 1].searches;
  const searchTrend = trend(demand.map((d) => d.searches));
  const searchTotal = demand.reduce((s, d) => s + d.searches, 0);

  const switchedThisMonth = switching[switching.length - 1];
  const switchTrend = trend(switching.map((d) => d.clients));
  const shareStart = switching[0].share;

  // What still stands between this advocate and a live listing.
  const missing = [
    !profile.court && "court",
    !profile.city && "city",
    !profile.years && "years in practice",
    !profile.bciNumber && "Bar Council enrolment number",
    !profile.bio && "bio",
  ].filter(Boolean) as string[];

  const awaitingVerification = profile.status !== "VERIFIED";

  return (
    <main className="container container-wide section-tight">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label text-muted">Advocate dashboard</p>
          <h1 className="mt-3 text-[2.25rem] sm:text-[2.75rem]">
            Good to see you,{" "}
            <span className="tone-accent">
              {profile.user.name.replace(/^Adv\.\s*/, "").split(" ")[0]}
            </span>
          </h1>
          <p className="mono-label mt-3 text-muted">
            {profile.court || "Court not set"} · {profile.city || "City not set"}{" "}
            ·{" "}
            <span
              className={
                profile.status === "VERIFIED" ? "text-verified" : "text-accent"
              }
            >
              {profile.status}
            </span>
          </p>
        </div>
        <AvailabilityToggle
          initial={profile.online}
          verified={profile.status === "VERIFIED"}
        />
      </div>

      {awaitingVerification && (
        <div className="card mt-6 border-l-2 border-l-accent p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="mono-label text-accent">
                {profile.status === "REJECTED"
                  ? "Verification rejected"
                  : "Pending verification"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {profile.status === "REJECTED"
                  ? "Your enrolment could not be matched against the Bar Council register. Correct your details and we will review again."
                  : "You are not visible to clients yet. LawNest checks your Bar Council enrolment before your listing goes live — that is what the verified badge means, so we do not skip it."}
              </p>
              {missing.length > 0 && (
                <p className="mono-label mt-3 text-muted">
                  Still needed · {missing.join(" · ")}
                </p>
              )}
            </div>
            <Link
              href="/lawyer/profile"
              className="btn-primary mono-label shrink-0 rounded-full px-4 py-2"
            >
              {missing.length > 0 ? "Complete profile" : "Edit profile"}
            </Link>
          </div>

          <ol className="mt-5 grid gap-3 border-t border-rule pt-4 sm:grid-cols-3">
            {[
              ["01", "Complete your practice details"],
              ["02", "LawNest verifies your enrolment"],
              ["03", "Your listing goes live and clients can book"],
            ].map(([n, label]) => (
              <li key={n} className="flex gap-2.5">
                <span className="mono-label text-accent">{n}</span>
                <span className="text-sm text-slate">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Revenue — what the practice earned */}
      <p className="mono-label mt-9 text-muted">Revenue</p>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={IndianRupee}
          label="Total earnings"
          value={formatRupees(totals._sum.lawyerCut ?? 0)}
          hint="after platform fee"
          accent
        />
        <Kpi
          icon={CalendarDays}
          label="This month"
          value={formatRupees(thisMonth)}
          delta={monthDelta}
          hint={
            monthDelta === null
              ? now.toLocaleDateString("en-IN", { month: "long" })
              : `vs ${formatRupees(lastMonth)} last month`
          }
        />
        <Kpi
          icon={Wallet}
          label="Pending payout"
          value={formatRupees(pendingPayout)}
          hint="settles weekly"
        />
        <Kpi
          icon={Receipt}
          label="Avg consultation"
          value={formatRupees(avgValue)}
          hint="your share per booking"
        />
      </div>

      {/* Practice — how the business is running */}
      <p className="mono-label mt-8 text-muted">Practice</p>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={Percent}
          label="Slot utilisation"
          value={`${utilisation}%`}
          hint={`${takenSlots} of ${totalSlots} upcoming slots booked`}
        />
        <Kpi
          icon={Users}
          label="Repeat clients"
          value={`${repeatClients}%`}
          hint={`${uniqueClients} distinct ${uniqueClients === 1 ? "client" : "clients"}`}
        />
        <Kpi
          icon={Star}
          label="Avg rating"
          value={profile.rating.toFixed(1)}
          hint={`${profile.reviewCount} reviews`}
        />
        <Kpi
          icon={Timer}
          label="Response rate"
          value={`${responseRate}%`}
          hint="threads you replied in"
        />
      </div>

      {/* Market — demand around this practice, not this advocate's own takings */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3">
        <p className="mono-label text-muted">Market demand</p>
        <p className="mono-label text-muted">
          Modelled for {profile.city || "India"} · indicative
        </p>
      </div>

      <div className="mt-3 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl">Clients searching for an advocate</h2>
            <p className="mono-label text-muted">last 12 weeks</p>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <p className="font-mono-num text-2xl text-accent">
              {searchesThisWeek.toLocaleString("en-IN")}
            </p>
            <p className="mono-label text-muted">searches this week</p>
            {searchTrend !== null && (
              <span
                className={`mono-label flex items-center gap-0.5 ${
                  searchTrend >= 0 ? "text-verified" : "text-danger"
                }`}
              >
                {searchTrend >= 0 ? (
                  <TrendingUp className="size-3" strokeWidth={2.5} />
                ) : (
                  <TrendingDown className="size-3" strokeWidth={2.5} />
                )}
                {Math.abs(searchTrend)}%
              </span>
            )}
          </div>

          <div className="mt-4">
            <SearchDemandChart data={demand} />
          </div>

          <p className="mt-4 border-t border-rule pt-3 text-sm leading-relaxed text-slate">
            {searchTotal.toLocaleString("en-IN")} searches across your{" "}
            {matterCount === 1 ? "practice area" : `${matterCount} practice areas`}{" "}
            in the last quarter. Open more slots and you rank higher for clients
            filtering by availability.
          </p>
          <p className="mono-label mt-2 text-muted">
            Indicative demand · modelled from practice areas and seniority
          </p>
        </section>

        <section className="card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl">Clients moving to online legal help</h2>
            <p className="mono-label text-muted">last 12 months</p>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <p className="font-mono-num text-2xl text-ink">
              {switchedThisMonth.clients.toLocaleString("en-IN")}
            </p>
            <p className="mono-label text-muted">this month</p>
            {switchTrend !== null && (
              <span
                className={`mono-label flex items-center gap-0.5 ${
                  switchTrend >= 0 ? "text-verified" : "text-danger"
                }`}
              >
                {switchTrend >= 0 ? (
                  <TrendingUp className="size-3" strokeWidth={2.5} />
                ) : (
                  <TrendingDown className="size-3" strokeWidth={2.5} />
                )}
                {Math.abs(switchTrend)}%
              </span>
            )}
          </div>

          <div className="mt-4">
            <OnlineSwitchChart data={switching} />
          </div>

          <p className="mt-4 border-t border-rule pt-3 text-sm leading-relaxed text-slate">
            {switchedThisMonth.share}% of people in {profile.city || "India"} now
            take a legal problem online first, up from {shareStart}% a year ago —
            that is the queue your listing sits in front of.
          </p>
          <p className="mono-label mt-2 text-muted">
            Indicative adoption · modelled for {profile.city || "India"}
          </p>
        </section>
      </div>

      {/* Two columns: the business on the left, the day on the right */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl">Earnings, last 30 days</h2>
              <p className="mono-label text-muted">your 80% share</p>
            </div>
            <div className="mt-5">
              <EarningsChart data={series} />
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule p-5">
              <h2 className="text-xl">Consultations</h2>
              <Link
                href="/lawyer/inbox"
                className="mono-label flex items-center gap-1 text-accent hover:underline"
              >
                Open inbox
                <ArrowRight className="size-3.5" strokeWidth={2.5} />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <p className="p-5 text-sm text-muted">
                No paid consultations yet. Once a client books you, the row
                appears here with the split.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-rule">
                      {[
                        "Date",
                        "Client",
                        "Matter",
                        "Amount",
                        "Your cut",
                        "Platform",
                        "Status",
                      ].map((h) => (
                        <th key={h} className="mono-label px-4 py-3 text-muted">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 12).map((b) => (
                      <tr key={b.id} className="border-b border-rule last:border-0">
                        <td className="mono-label px-4 py-3 text-muted">
                          {formatSlotFull(b.slotAt)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Link
                            href={`/consult/${b.id}`}
                            className="transition-colors hover:text-accent"
                          >
                            {b.client.name}
                          </Link>
                          <span className="mono-label block text-muted">
                            {b.client.clientCode ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate">
                          {b.lawyer.categories[0]?.name ?? "General"}
                        </td>
                        <td className="font-mono-num px-4 py-3 text-sm">
                          {formatRupees(b.amount)}
                        </td>
                        <td className="font-mono-num px-4 py-3 text-sm text-accent">
                          {formatRupees(b.lawyerCut)}
                        </td>
                        <td className="font-mono-num px-4 py-3 text-sm text-muted">
                          {formatRupees(b.platformCut)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`mono-label rounded-full border px-2 py-1 ${
                              b.slotAt >= now
                                ? "border-verified/40 text-verified"
                                : "border-rule text-muted"
                            }`}
                          >
                            {b.slotAt >= now ? "Upcoming" : "Completed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Payout summary */}
          <section className="card overflow-hidden">
            <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
            <div className="p-5">
              <p className="mono-label text-muted">Available balance</p>
              <p className="font-mono-num mt-1 text-3xl text-accent">
                {formatRupees(pendingPayout)}
              </p>

              <dl className="mt-5 space-y-2.5 border-t border-rule pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="mono-label text-muted">Next payout</dt>
                  <dd className="font-mono-num text-sm">
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                    }).format(nextPayout)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="mono-label text-muted">Lifetime billed</dt>
                  <dd className="font-mono-num text-sm">
                    {formatRupees(totals._sum.amount ?? 0)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="mono-label text-muted">Platform fee paid</dt>
                  <dd className="font-mono-num text-sm text-muted">
                    {formatRupees(totals._sum.platformCut ?? 0)}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 rounded-lg border border-rule bg-surface-2 p-3 text-sm leading-relaxed text-slate">
                You keep <strong>80%</strong> of every consultation. LawNest
                takes 20%, shown to the client before they pay.
              </p>
            </div>
          </section>

          {/* Practice mix — where the revenue actually comes from */}
          <section className="card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl">Practice mix</h2>
              <p className="mono-label text-muted">by revenue</p>
            </div>
            {matterMix.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No revenue to break down yet.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {matterMix.slice(0, 5).map((m) => (
                  <MixRow key={m.name} {...m} total={mixTotal} />
                ))}
              </div>
            )}
          </section>

          {/* Schedule — a dense agenda, not a feed of client photos */}
          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule p-5">
              <h2 className="text-xl">Schedule</h2>
              <p className="mono-label text-muted">
                {today.length} today · {upcoming.length} upcoming
              </p>
            </div>

            {upcoming.length === 0 && today.length === 0 ? (
              <p className="p-5 text-sm text-muted">
                Nothing booked. Open more slots on your profile to get listed
                higher for clients filtering by availability.
              </p>
            ) : (
              <ul className="divide-y divide-rule">
                {agenda.map((b) => {
                  const isToday = b.slotAt >= startOfDay && b.slotAt < endOfDay;
                  return (
                    <li key={b.id}>
                      <Link
                        href={`/consult/${b.id}`}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2"
                      >
                        <div className="w-16 shrink-0">
                          <p className="font-mono-num text-sm text-ink">
                            {formatSlotTime(b.slotAt)}
                          </p>
                          <p className="mono-label text-muted">
                            {isToday ? "Today" : formatSlotDay(b.slotAt)}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1 border-l border-rule pl-3">
                          <p className="mono-label truncate text-ink">
                            {b.client.clientCode ?? "—"}
                          </p>
                          <p className="mono-label mt-0.5 truncate text-muted">
                            {b.lawyer.categories[0]?.name ?? "General"}
                          </p>
                        </div>
                        <p className="font-mono-num shrink-0 text-sm text-accent">
                          {formatRupees(b.lawyerCut)}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
