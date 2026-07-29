import Image from "next/image";
import Link from "next/link";
import { IndianRupee, CalendarDays, Inbox, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/session";
import { AvailabilityToggle } from "@/components/availability-toggle";
import { formatRupees } from "@/lib/money";
import { formatSlotFull, formatSlotTime } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "Advocate dashboard — LawNest" };

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <span className="flex size-9 items-center justify-center rounded-lg border border-rule bg-accent-bg">
        <Icon className="size-4 text-accent" strokeWidth={2} />
      </span>
      <p className="mono-label mt-4 text-muted">{label}</p>
      <p className="font-mono-num mt-1 text-2xl">{value}</p>
      {hint && <p className="mono-label mt-1 text-muted">{hint}</p>}
    </div>
  );
}

export default async function LawyerDashboard() {
  const profile = await requireLawyerProfile();

  const [bookings, earnings] = await Promise.all([
    db.booking.findMany({
      where: { lawyerId: profile.id, paid: true },
      orderBy: { slotAt: "asc" },
      include: {
        client: { select: { name: true, avatar: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    db.booking.aggregate({
      where: { lawyerId: profile.id, paid: true },
      _sum: { lawyerCut: true },
    }),
  ]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const today = bookings.filter(
    (b) => b.slotAt >= startOfDay && b.slotAt < endOfDay,
  );

  return (
    <main className="container section-tight">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label text-muted">Advocate dashboard</p>
          <h1 className="mt-3 text-[2.5rem] sm:text-[3rem]">
            Good to see you,{" "}
            <span className="tone-accent">
              {profile.user.name.replace(/^Adv\.\s*/, "").split(" ")[0]}
            </span>
          </h1>
          <p className="mono-label mt-3 text-muted">
            {profile.court} · {profile.city}
          </p>
        </div>
        <AvailabilityToggle initial={profile.online} />
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Stat
          icon={IndianRupee}
          label="Total received"
          value={formatRupees(earnings._sum.lawyerCut ?? 0)}
          hint="after platform fee"
        />
        <Stat
          icon={CalendarDays}
          label="Today"
          value={String(today.length)}
          hint={today.length === 1 ? "consultation" : "consultations"}
        />
        <Stat
          icon={Inbox}
          label="Total consults"
          value={String(bookings.length)}
          hint="paid bookings"
        />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Today&apos;s bookings</h2>
          <Link
            href="/lawyer/inbox"
            className="mono-label flex items-center gap-1 text-accent hover:underline"
          >
            Open inbox
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>

        {today.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Nothing scheduled today.{" "}
            {bookings.length > 0
              ? "Your other consultations are in the inbox."
              : "New bookings will appear here."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {today.map((b) => (
              <article
                key={b.id}
                className="card card-interactive flex items-center gap-4 p-4"
              >
                <Image
                  src={b.client.avatar}
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{b.client.name}</p>
                  <p className="mono-label text-muted">
                    {formatSlotTime(b.slotAt)} · {formatRupees(b.lawyerCut)} to
                    you
                  </p>
                </div>
                <Link
                  href={`/consult/${b.id}`}
                  className="btn-primary mono-label shrink-0 rounded-full px-3.5 py-2"
                >
                  Open
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl">Inbox preview</h2>
        {bookings.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No consultations yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.slice(0, 3).map((b) => (
              <Link
                key={b.id}
                href={`/consult/${b.id}`}
                className="card card-interactive flex items-center gap-4 p-4"
              >
                <Image
                  src={b.client.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{b.client.name}</p>
                  <p className="truncate text-sm text-muted">
                    {b.messages[0]?.body ?? "No messages yet"}
                  </p>
                </div>
                <span className="mono-label shrink-0 text-muted">
                  {formatSlotFull(b.slotAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
