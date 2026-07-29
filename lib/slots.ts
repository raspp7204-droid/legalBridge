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
 */
export async function ensureUpcomingSlots(lawyerId: string, days = 3) {
  const now = new Date();

  const existing = await db.slot.findMany({
    where: { lawyerId, startsAt: { gt: now } },
    select: { startsAt: true },
  });
  const taken = new Set(existing.map((s) => s.startsAt.getTime()));

  const wanted: { lawyerId: string; startsAt: Date; booked: boolean }[] = [];
  for (let day = 1; day <= days; day++) {
    for (const [h, m] of SLOT_TIMES) {
      const startsAt = istSlot(day, h, m);
      if (startsAt <= now || taken.has(startsAt.getTime())) continue;
      wanted.push({ lawyerId, startsAt, booked: false });
    }
  }

  if (wanted.length) await db.slot.createMany({ data: wanted });
  return existing.length + wanted.length;
}
