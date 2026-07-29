import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Video } from "lucide-react";
import { db } from "@/lib/db";
import { getClientUser } from "@/lib/session";
import { EmptyState } from "@/components/empty-state";
import { formatRupees } from "@/lib/money";
import { formatSlotFull } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "My consultations — LegalBridge" };

type BookingRow = Awaited<ReturnType<typeof getBookings>>[number];

async function getBookings(clientId: string) {
  return db.booking.findMany({
    where: { clientId, paid: true },
    orderBy: { slotAt: "desc" },
    include: {
      lawyer: { include: { user: { select: { name: true, avatar: true } } } },
    },
  });
}

function BookingCard({ b, past }: { b: BookingRow; past: boolean }) {
  return (
    <article className="card card-interactive flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <Image
        src={b.lawyer.user.avatar}
        alt=""
        width={56}
        height={56}
        className="size-14 shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[1.0625rem]">{b.lawyer.user.name}</h3>
        <p className="mono-label mt-1 text-muted">
          {formatSlotFull(b.slotAt)} · {b.lawyer.court}
        </p>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        <p className="font-mono-num text-brass">{formatRupees(b.amount)}</p>
        <div className="flex gap-2">
          <Link
            href={`/consult/${b.id}`}
            className="mono-label flex items-center gap-1.5 rounded-full border border-rule px-3 py-2 transition-colors hover:border-brass/50"
          >
            <MessageSquare className="size-3.5" strokeWidth={2} />
            Chat
          </Link>
          {!past && (
            <Link
              href={`/consult/${b.id}/room`}
              className="mono-label flex items-center gap-1.5 rounded-full border border-rule px-3 py-2 transition-colors hover:border-brass/50"
            >
              <Video className="size-3.5" strokeWidth={2} />
              Video
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function MePage() {
  const client = await getClientUser();
  if (!client) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="No client profile"
          body="Run pnpm db:seed to create the demo personas."
          actionHref="/lawyers"
          actionLabel="Browse advocates"
        />
      </main>
    );
  }

  const bookings = await getBookings(client.id);
  const now = Date.now();
  const upcoming = bookings.filter((b) => b.slotAt.getTime() >= now);
  const past = bookings.filter((b) => b.slotAt.getTime() < now);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="mono-label text-muted">Signed in as {client.name}</p>
      <h1 className="mt-3 text-[2.5rem] sm:text-[3rem]">
        My <span className="tone-accent">consultations</span>
      </h1>

      {bookings.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No consultations yet"
            body="Once you book an advocate, your chats and video rooms live here."
            actionHref="/lawyers"
            actionLabel="Find an advocate"
          />
        </div>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="text-xl">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Nothing scheduled. Your past consultations are below.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {upcoming.map((b) => (
                  <BookingCard key={b.id} b={b} past={false} />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl">Past</h2>
              <div className="mt-4 space-y-3">
                {past.map((b) => (
                  <BookingCard key={b.id} b={b} past />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
