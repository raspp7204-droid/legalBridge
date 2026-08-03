import { db } from "@/lib/db";

/** The consultation times we publish, IST wall-clock. */
const SLOT_TIMES: ReadonlyArray<readonly [number, number]> = [
  [10, 0],
  [11, 30],
  [14, 0],
  [16, 30],
];

/** A Date for an IST wall-clock time N days out (IST = UTC+5:30). */
function istSlot(daysFromNow: number, hour: number, minute: number) {
  const istNow = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(
      istNow.getUTCFullYear(),
      istNow.getUTCMonth(),
      istNow.getUTCDate() + daysFromNow,
      hour,
      minute,
    ) -
      5.5 * 60 * 60 * 1000,
  );
}

/**
 * Make sure an advocate has bookable time on the calendar. Without this a
 * newly verified advocate shows "by appointment" and a client can never
 * reach the booking flow — which is exactly what a real advocate hits after
 * signing up. Idempotent: only fills the gap, never duplicates a slot.
 *
 * Seven days by default, matching the seed. Three days meant a calendar that
 * emptied itself within 72 hours, so a demo left alone over a weekend showed
 * every advocate as "by appointment".
 */
export async function ensureUpcomingSlots(lawyerId: string, days = 7) {
  const now = new Date();

  const existing = await db.slot.findMany({
    where: { lawyerId, startsAt: { gt: now } },
    select: { startsAt: true },
  });
  const taken = new Set(existing.map((s) => s.startsAt.getTime()));

  const wanted: { lawyerId: string; startsAt: Date; booked: boolean }[] = [];
  // Day 0 is today: at 16:27 the 16:30 slot is still perfectly bookable, and
  // starting at tomorrow silently threw away the rest of the working day.
  // The `startsAt <= now` guard below drops the ones that have gone.
  for (let day = 0; day <= days; day++) {
    for (const [h, m] of SLOT_TIMES) {
      const startsAt = istSlot(day, h, m);
      if (startsAt <= now || taken.has(startsAt.getTime())) continue;
      wanted.push({ lawyerId, startsAt, booked: false });
    }
  }

  if (wanted.length) await db.slot.createMany({ data: wanted });
  return existing.length + wanted.length;
}

/* ---- Instant consultations ---------------------------------------------
   A client who is already worried at 16:23 should not have to wait for
   tomorrow's 10:00. If the advocate has marked themselves online and is not
   mid-consultation, they can be reached now. */

/** How long an in-progress consultation blocks an advocate. */
export const CONSULT_MINUTES = 30;

/** Lead time before an instant consultation starts — enough to pay. */
const INSTANT_LEAD_MS = 5 * 60 * 1000;

/**
 * When an instant consultation booked right now would start: the next
 * 5-minute boundary at least INSTANT_LEAD_MS away.
 *
 * Rounding to a bucket is not cosmetic — the pay page reuses an existing
 * unpaid booking by matching slotAt exactly, so a start time that moved every
 * millisecond would mint a fresh booking on every refresh.
 */
export function nextInstantStart(now: Date = new Date()) {
  const t = now.getTime() + INSTANT_LEAD_MS;
  const bucket = 5 * 60 * 1000;
  return new Date(Math.ceil(t / bucket) * bucket);
}

/**
 * Is this advocate reachable right now? Online, verified, and not already in
 * a consultation — a paid booking whose 30 minutes have not run out yet.
 */
export async function isInstantAvailable(lawyer: {
  id: string;
  online: boolean;
  status: string;
}) {
  if (!lawyer.online || lawyer.status !== "VERIFIED") return false;

  const now = new Date();
  const busy = await db.booking.count({
    where: {
      lawyerId: lawyer.id,
      paid: true,
      endedAt: null,
      slotAt: {
        gt: new Date(now.getTime() - CONSULT_MINUTES * 60 * 1000),
        lte: now,
      },
    },
  });

  return busy === 0;
}
