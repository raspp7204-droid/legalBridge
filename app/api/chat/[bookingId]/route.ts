import { db } from "@/lib/db";
import { getDbUser } from "@/lib/auth";

// Route handlers must never be cached — the poll depends on fresh reads
// (LAUNCH.md Task 2).
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = { "cache-control": "no-store, max-age=0" };

/**
 * Who is asking, and are they part of this booking? The sender is derived
 * from the Clerk session, never from the request body (LAUNCH.md Task 2).
 */
async function authorize(bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, clientId: true, lawyer: { select: { userId: true } } },
  });
  if (!booking) return { error: "Booking not found.", status: 404 } as const;

  const user = await getDbUser();
  if (!user) return { error: "Sign in required.", status: 401 } as const;

  // Participation decides first: an admin who booked a consultation is that
  // booking's client and writes as one.
  const isClient = user.id === booking.clientId;
  const isLawyer = user.id === booking.lawyer.userId;

  if (!isClient && !isLawyer) {
    if (user.role === "ADMIN") {
      // Admin can read any thread for oversight, but never writes into it.
      return { booking, role: "ADMIN" as const, canWrite: false } as const;
    }
    return { error: "Not your consultation.", status: 403 } as const;
  }

  return {
    booking,
    role: isLawyer ? ("LAWYER" as const) : ("CLIENT" as const),
    canWrite: true,
  } as const;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;

  const auth = await authorize(bookingId);
  if ("error" in auth) {
    return Response.json(
      { error: auth.error },
      { status: auth.status, headers: NO_STORE },
    );
  }

  // Empty threads return [] — never a 404.
  const messages = await db.message.findMany({
    where: { bookingId },
    orderBy: { createdAt: "asc" },
    select: { id: true, senderRole: true, body: true, createdAt: true },
  });

  return Response.json({ messages, as: auth.role }, { headers: NO_STORE });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;

  let body: string;
  try {
    ({ body } = (await req.json()) as { body: string });
  } catch {
    return Response.json(
      { error: "Invalid request body." },
      { status: 400, headers: NO_STORE },
    );
  }

  const text = (body ?? "").trim();
  if (!text) {
    return Response.json(
      { error: "Message is empty." },
      { status: 400, headers: NO_STORE },
    );
  }

  const auth = await authorize(bookingId);
  if ("error" in auth) {
    return Response.json(
      { error: auth.error },
      { status: auth.status, headers: NO_STORE },
    );
  }
  if (!auth.canWrite) {
    return Response.json(
      { error: "Read-only for this session." },
      { status: 403, headers: NO_STORE },
    );
  }

  // senderRole comes from the Clerk session, never from the request body.
  const message = await db.message.create({
    data: { bookingId, senderRole: auth.role, body: text.slice(0, 2000) },
    select: { id: true, senderRole: true, body: true, createdAt: true },
  });

  return Response.json({ message }, { headers: NO_STORE });
}
