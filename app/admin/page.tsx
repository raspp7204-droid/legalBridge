import Link from "next/link";
import { Users, ShieldQuestion, CalendarCheck, IndianRupee, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatRupees } from "@/lib/money";
import { formatSlotFull } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin — LawNest" };

function Stat({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="flex size-9 items-center justify-center rounded-lg border border-rule bg-accent-bg">
        <Icon className="size-4 text-accent" strokeWidth={2} />
      </span>
      <p className="mono-label mt-4 text-muted">{label}</p>
      <p className="font-mono-num mt-1 text-3xl">{value}</p>
    </>
  );

  return href ? (
    <Link href={href} className="card card-interactive block p-5">
      {inner}
    </Link>
  ) : (
    <div className="card p-5">{inner}</div>
  );
}

export default async function AdminPage() {
  await requireAdmin();
  const [lawyers, pending, bookings, revenue, recent] = await Promise.all([
    db.lawyerProfile.count(),
    db.lawyerProfile.count({ where: { status: "PENDING" } }),
    db.booking.count({ where: { paid: true } }),
    db.booking.aggregate({
      where: { paid: true },
      _sum: { platformCut: true },
    }),
    db.booking.findMany({
      where: { paid: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        client: { select: { name: true } },
        lawyer: { include: { user: { select: { name: true } } } },
      },
    }),
  ]);

  return (
    <main className="container section-tight">
      <p className="mono-label text-muted">Admin · Riva Sharma</p>
      <h1 className="mt-3 text-[2.5rem] sm:text-[3rem]">
        Platform <span className="tone-accent">overview</span>
      </h1>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Users}
          label="Advocates"
          value={String(lawyers)}
          href="/admin/lawyers"
        />
        <Stat
          icon={ShieldQuestion}
          label="Pending verification"
          value={String(pending)}
          href="/admin/verification"
        />
        <Stat
          icon={CalendarCheck}
          label="Bookings"
          value={String(bookings)}
          href="/admin/bookings"
        />
        <Stat
          icon={IndianRupee}
          label="Platform revenue"
          value={formatRupees(revenue._sum.platformCut ?? 0)}
        />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Recent bookings</h2>
          <Link
            href="/admin/bookings"
            className="mono-label flex items-center gap-1 text-accent hover:underline"
          >
            All bookings
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>

        <div className="card mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-rule text-left">
                <th className="mono-label px-4 py-3 font-normal text-muted">
                  Client
                </th>
                <th className="mono-label px-4 py-3 font-normal text-muted">
                  Advocate
                </th>
                <th className="mono-label px-4 py-3 font-normal text-muted">
                  Slot
                </th>
                <th className="mono-label px-4 py-3 text-right font-normal text-muted">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No paid bookings yet.
                  </td>
                </tr>
              ) : (
                recent.map((b) => (
                  <tr key={b.id} className="border-b border-rule last:border-0">
                    <td className="px-4 py-3">{b.client.name}</td>
                    <td className="px-4 py-3">{b.lawyer.user.name}</td>
                    <td className="font-mono-num px-4 py-3 text-muted">
                      {formatSlotFull(b.slotAt)}
                    </td>
                    <td className="font-mono-num px-4 py-3 text-right text-accent">
                      {formatRupees(b.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
