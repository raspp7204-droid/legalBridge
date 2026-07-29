import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/session";
import { EmptyState } from "@/components/empty-state";
import { formatRupees } from "@/lib/money";
import { formatSlotFull } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "Inbox — LawNest" };

export default async function LawyerInbox() {
  const profile = await requireLawyerProfile();

  // Every PAID booking for this advocate, newest first — including threads
  // that have no messages yet (Task 1).
  const threads = await db.booking.findMany({
    where: { lawyerId: profile.id, paid: true },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  return (
    <main className="container section-tight">
      <p className="mono-label text-muted">Advocate · {profile.user.name}</p>
      <h1 className="mt-3 text-[2.5rem] sm:text-[3rem]">
        <span className="tone-accent">Inbox</span>
      </h1>
      <p className="mt-3 text-slate">
        {threads.length === 0
          ? "Paid consultations open here."
          : `${threads.length} paid consultation${threads.length === 1 ? "" : "s"}.`}
      </p>

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
          {threads.map((t) => {
            const empty = t._count.messages === 0;
            return (
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
                  <p
                    className={`mt-1 truncate text-sm ${
                      empty ? "text-verified" : "text-muted"
                    }`}
                  >
                    {empty
                      ? "New consultation · no messages yet"
                      : t.messages[0].body}
                  </p>
                </div>
                <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <span className="font-mono-num text-sm text-accent">
                    {formatRupees(t.lawyerCut)}
                  </span>
                  <span className="mono-label flex items-center gap-1 text-muted">
                    <MessageSquare className="size-3" strokeWidth={2.5} />
                    {t._count.messages}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
