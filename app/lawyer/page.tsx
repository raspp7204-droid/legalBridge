import Image from "next/image";
import Link from "next/link";
import {
  IndianRupee,
  CalendarDays,
  Inbox,
  Star,
  Timer,
  Wallet,
  ArrowRight,
  MessageSquare,
  Video,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/auth";
import { AvailabilityToggle } from "@/components/availability-toggle";
import { EarningsChart } from "@/components/earnings-chart";
import { formatRupees } from "@/lib/money";
import { formatSlotFull, formatSlotTime } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "Advocate dashboard — LawNest" };

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  hint?: string;
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
      <p
        className={`font-mono-num mt-3 text-2xl ${accent ? "text-accent" : "text-ink"}`}
      >
        {value}
      </p>
      {hint && <p className="mono-label mt-1 text-muted">{hint}</p>}
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
  const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

  const [bookings, totals, monthTotals] = await Promise.all([
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
    }),
  ]);

  const today = bookings.filter(
    (b) => b.slotAt >= startOfDay && b.slotAt < endOfDay,
  );
  const upcoming = bookings
    .filter((b) => b.slotAt >= now)
    .sort((a, b) => a.slotAt.getTime() - b.slotAt.getTime());

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

      {/* KPI row */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
          value={formatRupees(monthTotals._sum.lawyerCut ?? 0)}
          hint={now.toLocaleDateString("en-IN", { month: "long" })}
        />
        <Kpi
          icon={Wallet}
          label="Pending payout"
          value={formatRupees(pendingPayout)}
          hint="settles weekly"
        />
        <Kpi
          icon={Inbox}
          label="Consultations"
          value={String(totals._count)}
          hint="paid bookings"
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

          {/* Today */}
          <section className="card p-5">
            <h2 className="text-xl">Today</h2>
            {today.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Nothing scheduled today.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {today.map((b) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <Image
                      src={b.client.avatar}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 shrink-0 rounded-full object-cover"
                      unoptimized
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{b.client.name}</p>
                      <p className="mono-label text-muted">
                        {formatSlotTime(b.slotAt)} ·{" "}
                        {formatRupees(b.lawyerCut)} to you
                      </p>
                    </div>
                    <Link
                      href={`/consult/${b.id}`}
                      className="btn-primary mono-label shrink-0 rounded-full px-3 py-1.5"
                    >
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming */}
          <section className="card p-5">
            <h2 className="text-xl">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No upcoming consultations booked.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {upcoming.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-rule bg-surface-2 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={b.client.avatar}
                        alt=""
                        width={32}
                        height={32}
                        className="size-8 shrink-0 rounded-full object-cover"
                        unoptimized
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{b.client.name}</p>
                        <p className="mono-label text-muted">
                          {formatSlotFull(b.slotAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/consult/${b.id}`}
                        className="mono-label flex flex-1 items-center justify-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-2 transition-colors hover:border-accent/40"
                      >
                        <MessageSquare className="size-3.5" strokeWidth={2} />
                        Open chat
                      </Link>
                      <Link
                        href={`/consult/${b.id}/room`}
                        className="mono-label flex flex-1 items-center justify-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-2 transition-colors hover:border-accent/40"
                      >
                        <Video className="size-3.5" strokeWidth={2} />
                        Join video
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
