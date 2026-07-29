import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { VideoRoom } from "@/components/video-room";
import { formatSlotFull } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "Video room — LawNest" };

export default async function RoomPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      lawyer: { include: { user: { select: { name: true, avatar: true } } } },
    },
  });

  if (!booking) notFound();

  return (
    <main className="container container-room section-tight">
      <p className="mono-label text-muted">
        Consultation · {formatSlotFull(booking.slotAt)}
      </p>
      <h1 className="mt-2 text-[1.75rem] sm:text-[2rem]">
        Video room with{" "}
        <span className="tone-accent">{booking.lawyer.user.name}</span>
      </h1>

      <div className="mt-8">
        <VideoRoom
          bookingId={booking.id}
          lawyerName={booking.lawyer.user.name}
          lawyerAvatar={booking.lawyer.user.avatar}
        />
      </div>
    </main>
  );
}
