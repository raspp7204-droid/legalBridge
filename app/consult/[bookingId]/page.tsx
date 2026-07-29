import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, FileText, Timer } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { ChatThread } from "@/components/chat-thread";
import { VerifiedBadge } from "@/components/verified-badge";
import { formatSlotFull } from "@/lib/lawyers";
import { formatRupees } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "Consultation — LawNest" };

// Static placeholders — file upload is out of scope (CLAUDE.md §3)
const DOCUMENTS = [
  { name: "Sale deed (2019).pdf", meta: "1.2 MB · shared by you" },
  { name: "Mutation notice.jpg", meta: "480 KB · shared by advocate" },
];

export default async function ConsultPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  const [booking, viewer] = await Promise.all([
    db.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: { select: { name: true, avatar: true } },
        lawyer: {
          include: {
            user: { select: { name: true, avatar: true } },
            categories: { select: { slug: true, name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            senderRole: true,
            body: true,
            createdAt: true,
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!booking) notFound();

  const lawyer = booking.lawyer;

  // Which side of the thread is this? Decided by identity, not by the role
  // label — the advocate signs in as themselves at /lawyer/login (Task 2).
  const as = viewer?.id === lawyer.userId ? "LAWYER" : "CLIENT";

  return (
    /* Two panes: the thread, and the consultation's details beside it.
       The panel drops below the thread under 900px (RETHEME.md Task 3). */
    <main className="container container-chat grid gap-6 py-6 min-[900px]:grid-cols-[1fr_300px] sm:py-10">
      <ChatThread
        bookingId={booking.id}
        as={as}
        initialMessages={booking.messages.map((m) => ({
          id: m.id,
          senderRole: m.senderRole,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
        }))}
        lawyerName={lawyer.user.name}
        lawyerAvatar={lawyer.user.avatar}
        clientName={booking.client.name}
        clientAvatar={booking.client.avatar}
        online={lawyer.online}
        slotLabel={formatSlotFull(booking.slotAt)}
      />

      <aside className="space-y-4 min-[900px]:sticky min-[900px]:top-24 min-[900px]:self-start">
        {/* Advocate mini-profile */}
        <div className="card p-4">
          <p className="mono-label text-muted">
            {as === "LAWYER" ? "Your client" : "Your advocate"}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={`shrink-0 rounded-full p-[2px] ${
                as === "LAWYER" || lawyer.online ? "bg-verified" : "bg-rule"
              }`}
            >
              <Image
                src={
                  as === "LAWYER" ? booking.client.avatar : lawyer.user.avatar
                }
                alt=""
                width={44}
                height={44}
                className="size-11 rounded-full object-cover"
              />
            </span>
            <div className="min-w-0">
              <p className="font-display truncate text-[0.95rem] leading-tight">
                {as === "LAWYER" ? booking.client.name : lawyer.user.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                {as === "LAWYER" ? (
                  <p className="truncate text-xs text-slate">
                    Client · consultation paid
                  </p>
                ) : (
                  <>
                    {lawyer.status === "VERIFIED" && <VerifiedBadge compact />}
                    <p className="truncate text-xs text-slate">
                      {lawyer.years} yrs · {lawyer.court}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-rule pt-3">
            <span className="mono-label text-muted">
              {as === "LAWYER" ? "You receive" : "Paid"}
            </span>
            <span className="font-mono-num text-sm text-accent">
              {formatRupees(as === "LAWYER" ? booking.lawyerCut : booking.amount)}
            </span>
          </div>

          <p className="mono-label mt-3 text-muted">Practice areas</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {lawyer.categories.map((c) => (
              <span key={c.slug} className="chip-tag">
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Slot + session timer */}
        <div className="card p-4">
          <p className="mono-label flex items-center gap-1.5 text-muted">
            <CalendarDays className="size-3.5" strokeWidth={2.5} />
            Session
          </p>
          <p className="mt-2 text-sm text-slate">
            {formatSlotFull(booking.slotAt)}
          </p>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="mono-label flex items-center gap-1.5 text-muted">
              <Timer className="size-3.5" strokeWidth={2.5} />
              Time left
            </span>
            <span className="font-mono-num text-lg text-ink">28:41</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-[5%] rounded-full bg-verified" />
          </div>
          <p className="mono-label mt-2 text-muted">of 30 minutes</p>
        </div>

        {/* Shared documents */}
        <div className="card p-4">
          <p className="mono-label text-muted">Documents</p>
          <div className="mt-3 space-y-2">
            {DOCUMENTS.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-2.5 rounded-lg border border-rule bg-surface-2 p-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-bg text-accent">
                  <FileText className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-ink">{d.name}</p>
                  <p className="mono-label truncate text-muted">{d.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
