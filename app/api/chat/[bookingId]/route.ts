import { db } from "@/lib/db";
import { getDbUser } from "@/lib/auth";

// Route handlers must never be cached — the poll depends on fresh reads
// (LAUNCH.md Task 2).
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = { "cache-control": "no-store, max-age=0" };

/**
 * Decide what this caller may do with the booking we already loaded.
 * The sender is derived from the Clerk session, never from the request body
 * (LAUNCH.md Task 2).
 *
 * This takes the booking rather than fetching it, because the poll runs every
 * two seconds against a database in another continent — every avoidable round
 * trip is ~300ms on the wire before any work happens.
 */
function authorize(
  booking: { clientId: string; lawyer: { userId: string } },
  user: { id: string; role: string } | null,
) {
  if (!user) return { error: "Sign in required.", status: 401 } as const;

  // Participation decides first: an admin who booked a consultation is that
  // booking's client and writes as one.
  const isClient = user.id === booking.clientId;
  const isLawyer = user.id === booking.lawyer.userId;

  if (!isClient && !isLawyer) {
    if (user.role === "ADMIN") {
      // Admin can read any thread for oversight, but never writes into it.
      return { role: "ADMIN" as const, canWrite: false } as const;
    }
    return { error: "Not your consultation.", status: 403 } as const;
  }

  return {
    role: isLawyer ? ("LAWYER" as const) : ("CLIENT" as const),
    canWrite: true,
  } as const;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;

  /* `since` makes the poll incremental: the client sends the timestamp of the
     newest message it holds and we return only from there. gte, not gt, so a
     message written in the same millisecond as the last one is never skipped
     — the client dedupes by id anyway. */
  const sinceParam = new URL(req.url).searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;
  const validSince = since && !Number.isNaN(since.getTime()) ? since : null;

  /* One round trip for the booking and its messages, in parallel with the
     one for the user. This used to be three sequential queries. */
  const [booking, user] = await Promise.all([
    db.booking.findUnique({
      where: { id: bookingId },
      select: {
        clientId: true,
        endedAt: true,
        lawyer: { select: { userId: true } },
        messages: {
          where: validSince ? { createdAt: { gte: validSince } } : undefined,
          orderBy: { createdAt: "asc" },
          select: { id: true, senderRole: true, body: true, createdAt: true },
        },
      },
    }),
    getDbUser(),
  ]);

  if (!booking) {
    return Response.json(
      { error: "Booking not found." },
      { status: 404, headers: NO_STORE },
    );
  }

  const auth = authorize(booking, user);
  if ("error" in auth) {
    return Response.json(
      { error: auth.error },
      { status: auth.status, headers: NO_STORE },
    );
  }

  // endedAt rides along on every poll — that is what locks the *other*
  // window within ~2s when one side ends the consultation.
  return Response.json(
    {
      messages: booking.messages,
      as: auth.role,
      endedAt: booking.endedAt?.toISOString() ?? null,
      // Tells the client this was a delta, not the whole thread.
      partial: !!validSince,
    },
    { headers: NO_STORE },
  );
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

  const [booking, user] = await Promise.all([
    db.booking.findUnique({
      where: { id: bookingId },
      select: {
        clientId: true,
        endedAt: true,
        lawyer: { select: { userId: true } },
      },
    }),
    getDbUser(),
  ]);

  if (!booking) {
    return Response.json(
      { error: "Booking not found." },
      { status: 404, headers: NO_STORE },
    );
  }

  const auth = authorize(booking, user);
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
  if (booking.endedAt) {
    return Response.json(
      { error: "This consultation has ended." },
      { status: 409, headers: NO_STORE },
    );
  }

  // senderRole comes from the Clerk session, never from the request body.
  const message = await db.message.create({
    data: { bookingId, senderRole: auth.role, body: text.slice(0, 2000) },
    select: { id: true, senderRole: true, body: true, createdAt: true },
  });

  return Response.json({ message }, { headers: NO_STORE });
}
