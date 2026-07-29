import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionRole } from "@/lib/session";
import { ChatThread } from "@/components/chat-thread";
import { formatSlotFull } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "Consultation — LegalBridge" };

export default async function ConsultPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  const [booking, role] = await Promise.all([
    db.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: { select: { name: true, avatar: true } },
        lawyer: {
          include: { user: { select: { name: true, avatar: true } } },
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
    getSessionRole(),
  ]);

  if (!booking) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <ChatThread
        bookingId={booking.id}
        as={role === "LAWYER" ? "LAWYER" : "CLIENT"}
        initialMessages={booking.messages.map((m) => ({
          id: m.id,
          senderRole: m.senderRole,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
        }))}
        lawyerName={booking.lawyer.user.name}
        lawyerAvatar={booking.lawyer.user.avatar}
        clientName={booking.client.name}
        clientAvatar={booking.client.avatar}
        online={booking.lawyer.online}
        slotLabel={formatSlotFull(booking.slotAt)}
      />
    </main>
  );
}
