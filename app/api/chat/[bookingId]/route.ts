import { db } from "@/lib/db";
import { isRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;

  const messages = await db.message.findMany({
    where: { bookingId },
    orderBy: { createdAt: "asc" },
    select: { id: true, senderRole: true, body: true, createdAt: true },
  });

  return Response.json({ messages });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;

  let body: string;
  let senderRole: string;
  try {
    ({ body, senderRole } = (await req.json()) as {
      body: string;
      senderRole: string;
    });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = (body ?? "").trim();
  if (!text) {
    return Response.json({ error: "Message is empty." }, { status: 400 });
  }
  if (!isRole(senderRole) || senderRole === "ADMIN") {
    return Response.json({ error: "Unknown sender." }, { status: 400 });
  }

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    return Response.json({ error: "Booking not found." }, { status: 404 });
  }

  const message = await db.message.create({
    data: { bookingId, senderRole, body: text.slice(0, 2000) },
    select: { id: true, senderRole: true, body: true, createdAt: true },
  });

  return Response.json({ message });
}
