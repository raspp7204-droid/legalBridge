import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getLawyerProfile } from "@/lib/session";
import { EmptyState } from "@/components/empty-state";
import { formatSlotFull } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "Inbox — LegalBridge" };

export default async function LawyerInbox() {
  const profile = await getLawyerProfile();

  const threads = profile
    ? await db.booking.findMany({
        where: { lawyerId: profile.id, paid: true },
        orderBy: { slotAt: "desc" },
        include: {
          client: { select: { name: true, avatar: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { messages: true } },
        },
      })
    : [];

  return (
    <main className="container section-tight">
      <p className="mono-label text-muted">Advocate</p>
      <h1 className="mt-3 text-[2.5rem] sm:text-[3rem]">
        <span className="tone-accent">Inbox</span>
      </h1>

      {threads.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No consultations yet"
            body="When a client books and pays, the thread opens here."
            actionHref="/lawyer"
            actionLabel="Back to dashboard"
          />
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {threads.map((t) => (
            <Link
              key={t.id}
              href={`/consult/${t.id}`}
              className="card card-interactive flex items-center gap-4 p-4"
            >
              <Image
                src={t.client.avatar}
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate">{t.client.name}</p>
                  <span className="mono-label shrink-0 text-muted">
                    {formatSlotFull(t.slotAt)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-muted">
                  {t.messages[0]?.body ?? "No messages yet"}
                </p>
              </div>
              <span className="mono-label shrink-0 rounded-full border border-rule px-2 py-1 text-muted">
                {t._count.messages}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
