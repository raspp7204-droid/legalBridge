import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, Scale, Languages } from "lucide-react";
import { db } from "@/lib/db";
import { blockLawyers } from "@/lib/auth";
import { FeeBreakdown } from "@/components/fee-breakdown";
import { SlotPicker } from "@/components/slot-picker";
import { VerifiedBadge } from "@/components/verified-badge";
import { formatSlotTime, relativeSlotDay } from "@/lib/lawyers";
import {
  ensureUpcomingSlots,
  isInstantAvailable,
  nextInstantStart,
} from "@/lib/slots";

export const dynamic = "force-dynamic";

export default async function LawyerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Advocates do not browse or book advocates (lib/auth.ts).
  await blockLawyers();
  const { id } = await params;

  const lawyer = await db.lawyerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, avatar: true } },
      categories: { select: { slug: true, name: true } },
      // Future slots only — a picker offering yesterday's 10:00 is worse
      // than one showing nothing.
      slots: {
        where: { startsAt: { gt: new Date() } },
        orderBy: { startsAt: "asc" },
      },
      _count: { select: { bookings: { where: { paid: true } } } },
    },
  });

  if (!lawyer) notFound();

  /* Self-heal a stale calendar. Seeded advocates only ever get topped up when
     they toggle online or get approved, so a database left alone for a week
     shows every profile as "by appointment". Costs nothing in the normal case
     — it only runs when there is genuinely nothing left to book. */
  let slots = lawyer.slots;
  if (slots.length === 0 && lawyer.status === "VERIFIED") {
    await ensureUpcomingSlots(lawyer.id);
    slots = await db.slot.findMany({
      where: { lawyerId: lawyer.id, startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
    });
  }

  const now = new Date();
  const slotDTOs = slots.map((s) => ({
    id: s.id,
    startsAt: s.startsAt.toISOString(),
    booked: s.booked,
    day: relativeSlotDay(s.startsAt, now),
    time: formatSlotTime(s.startsAt),
  }));

  // Reachable right now? Online, verified, and not mid-consultation.
  const instant = await isInstantAvailable(lawyer);
  const instantAt = instant ? nextInstantStart(now) : null;

  return (
    <main className="container section-tight">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left — profile */}
        <div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span
              className={`relative shrink-0 self-start rounded-full p-[3px] ${
                lawyer.online ? "bg-verified" : "bg-rule"
              }`}
            >
              <Image
                src={lawyer.user.avatar}
                alt=""
                width={104}
                height={104}
                className="size-26 rounded-full object-cover"
                priority
              />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[2rem] sm:text-[2.5rem]">
                  {lawyer.user.name}
                </h1>
                {lawyer.status === "VERIFIED" && <VerifiedBadge />}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <Scale className="size-4" strokeWidth={2} />
                  {lawyer.court}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" strokeWidth={2} />
                  {lawyer.city}
                </span>
                <span className="font-mono-num">{lawyer.years} yrs</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5">
                  <Star
                    className="size-4 fill-star text-accent"
                    strokeWidth={2}
                  />
                  <span className="font-mono-num">
                    {lawyer.rating.toFixed(1)}
                  </span>
                  <span className="mono-label text-muted">
                    {lawyer.reviewCount} reviews
                  </span>
                </span>
                <span className="mono-label text-muted">
                  {lawyer._count.bookings} consults on LawNest
                </span>
                {lawyer.online && (
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-verified" />
                    <span className="mono-label text-verified">Online now</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <section className="mt-9">
            <h2 className="text-xl">About</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-slate">
              {lawyer.bio}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl">Practice areas</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {lawyer.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/lawyers?category=${c.slug}`}
                  className="rounded-lg border border-rule bg-surface-2 px-3 py-1.5 text-sm text-slate transition-colors hover:border-accent/40"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl">Languages</h2>
            <p className="mt-3 flex items-center gap-2 text-slate">
              <Languages className="size-4 text-muted" strokeWidth={2} />
              {lawyer.languages.join(" · ")}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl">Enrolment</h2>
            <p className="mono-label mt-3 text-muted">
              Bar Council no. <span className="text-ink">{lawyer.bciNumber}</span>
            </p>
          </section>
        </div>

        {/* Right — sticky booking column */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            <FeeBreakdown fee={lawyer.fee} />
            <SlotPicker
              lawyerId={lawyer.id}
              slots={slotDTOs}
              fee={lawyer.fee}
              instantTime={instantAt ? formatSlotTime(instantAt) : null}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
