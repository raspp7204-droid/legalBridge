import { Prisma } from "@prisma/client";

/** One shape for every lawyer list/card query, so LawyerCard has one prop type. */
export const lawyerCardSelect = {
  include: {
    user: { select: { name: true, avatar: true } },
    categories: { select: { slug: true, name: true } },
    slots: {
      where: { booked: false, startsAt: { gt: new Date(0) } },
      orderBy: { startsAt: "asc" },
      take: 1,
    },
  },
} satisfies Prisma.LawyerProfileDefaultArgs;

export type LawyerCardData = Prisma.LawyerProfileGetPayload<
  typeof lawyerCardSelect
>;

/** "4:30 PM" in IST — slots are seeded as IST wall-clock times. */
export function formatSlotTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
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
