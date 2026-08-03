import { Prisma } from "@prisma/client";

/**
 * One shape for every lawyer list/card query, so LawyerCard has one prop type.
 *
 * A function, not a const: `new Date()` inside a module-level object is frozen
 * at import time. It used to be `new Date(0)`, which meant "next free slot"
 * quietly matched slots from 1970 — every advocate advertised a time that had
 * already passed. Evaluating per call keeps it honest.
 */
export function lawyerCardSelect() {
  return {
    include: {
      user: { select: { name: true, avatar: true } },
      categories: { select: { slug: true, name: true } },
      slots: {
        where: { booked: false, startsAt: { gt: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 1,
      },
    },
  } satisfies Prisma.LawyerProfileDefaultArgs;
}

export type LawyerCardData = Prisma.LawyerProfileGetPayload<
  ReturnType<typeof lawyerCardSelect>
>;

/**
 * "17:00" in IST. Slots are 24-hour on purpose: they sit in mono next to ₹
 * amounts and enrolment numbers, and "17:00" can't be misread as 5am the way
 * a stray "5:00" can when someone is booking in a hurry.
 */
export function formatSlotTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function formatSlotDay(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function formatSlotFull(date: Date) {
  return `${formatSlotDay(date)} · ${formatSlotTime(date)}`;
}

export const EXPERIENCE_BANDS = {
  "0-5": { label: "0–5 yrs", min: 0, max: 5 },
  "6-12": { label: "6–12 yrs", min: 6, max: 12 },
  "13+": { label: "13+ yrs", min: 13, max: 100 },
} as const;

export type ExperienceBand = keyof typeof EXPERIENCE_BANDS;

export const SORTS = {
  rating: "Top rated",
  price: "Price: low to high",
  experience: "Most experienced",
} as const;

export type SortKey = keyof typeof SORTS;

/** IST calendar day key — the basis for "is this slot today?". */
export function istDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    date,
  );
}

/**
 * "Today" / "Tomorrow" / "Tue 5 Aug", relative to the current IST day.
 * What a client actually needs to know is how soon, not which date.
 */
export function relativeSlotDay(date: Date, now: Date = new Date()) {
  const key = istDayKey(date);
  if (key === istDayKey(now)) return "Today";
  if (key === istDayKey(new Date(now.getTime() + 86_400_000))) return "Tomorrow";
  return formatSlotDay(date);
}

/** "Today 17:00" — the label the slot picker shows. */
export function relativeSlotLabel(date: Date, now: Date = new Date()) {
  return `${relativeSlotDay(date, now)} ${formatSlotTime(date)}`;
}
