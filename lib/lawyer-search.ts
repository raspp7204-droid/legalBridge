import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * The advocate lookup the AI assistant runs against the real database.
 *
 * The assistant used to be a brochure: it could name a category but never an
 * advocate, because it had no way to know one. This is what closes that gap —
 * it reads the intent out of the question (matter, budget, city, language)
 * and returns advocates that actually exist, at fees that are actually real.
 */

export type AdvocateQuery = {
  categorySlug?: string;
  maxFee?: number;
  city?: string;
  language?: string;
  minYears?: number;
};

/**
 * Flat and JSON-safe on purpose: this crosses the model boundary and comes
 * back through the UI-message stream, so no Date objects and no nested
 * Prisma payloads (which is why it is not LawyerCardData).
 */
export type AdvocateSuggestion = {
  id: string;
  name: string;
  avatar: string;
  city: string;
  court: string;
  years: number;
  tier: string;
  fee: number;
  rating: number;
  reviewCount: number;
  online: boolean;
  languages: string[];
  categories: string[];
  href: string;
};

export type AdvocateSearchResult = {
  advocates: AdvocateSuggestion[];
  /** Filters that had to be dropped to find anyone — the model should say so. */
  relaxed: string[];
  /** Deep link to the same search on /lawyers. */
  browseHref: string;
};

/** Only the filters the assistant can express — the listing page owns the rest. */
function buildWhere(q: AdvocateQuery): Prisma.LawyerProfileWhereInput {
  return {
    status: "VERIFIED",
    ...(q.categorySlug ? { categories: { some: { slug: q.categorySlug } } } : {}),
    ...(q.maxFee ? { fee: { lte: q.maxFee } } : {}),
    // Case-insensitive so "bengaluru" and "Hindi" both land.
    ...(q.city ? { city: { equals: q.city, mode: "insensitive" as const } } : {}),
    ...(q.language ? { languages: { has: q.language } } : {}),
    ...(q.minYears ? { years: { gte: q.minYears } } : {}),
  };
}

function browseHref(q: AdvocateQuery) {
  const p = new URLSearchParams();
  if (q.categorySlug) p.set("category", q.categorySlug);
  if (q.city) p.set("city", q.city);
  if (q.language) p.set("lang", q.language);
  if (q.maxFee) p.set("sort", "price");
  const qs = p.toString();
  return qs ? `/lawyers?${qs}` : "/lawyers";
}

async function run(q: AdvocateQuery, take: number) {
  const rows = await db.lawyerProfile.findMany({
    where: buildWhere(q),
    // A budget question is a price question; otherwise lead with quality.
    orderBy: q.maxFee
      ? [{ fee: "asc" }, { rating: "desc" }]
      : [{ rating: "desc" }, { reviewCount: "desc" }],
    take,
    include: {
      user: { select: { name: true, avatar: true } },
      categories: { select: { name: true } },
    },
  });

  return rows.map(
    (l): AdvocateSuggestion => ({
      id: l.id,
      name: l.user.name,
      avatar: l.user.avatar,
      city: l.city,
      court: l.court,
      years: l.years,
      tier: l.tier,
      fee: l.fee,
      rating: l.rating,
      reviewCount: l.reviewCount,
      online: l.online,
      languages: l.languages,
      categories: l.categories.map((c) => c.name),
      href: `/lawyers/${l.id}`,
    }),
  );
}

/**
 * Never returns an empty list while any verified advocate exists. If the full
 * filter finds nobody, constraints are dropped one at a time and it retries.
 *
 * Order matters: budget goes first because money is the most elastic thing a
 * client said — "nobody under ₹549 in Bengaluru, the nearest is ₹799 there"
 * is a far better answer than silently sending a Bengaluru client to Pune.
 * City is given up last. `relaxed` names what was dropped so the assistant
 * can say so out loud instead of going quiet mid-demo.
 */
export async function searchAdvocates(
  q: AdvocateQuery,
  take = 3,
): Promise<AdvocateSearchResult> {
  const relaxed: string[] = [];
  const working: AdvocateQuery = { ...q };

  let advocates = await run(working, take);

  for (const [key, label] of [
    ["maxFee", "budget"],
    ["minYears", "experience"],
    ["language", "language"],
    ["city", "city"],
  ] as const) {
    if (advocates.length > 0) break;
    if (working[key] === undefined) continue;
    delete working[key];
    relaxed.push(label);
    advocates = await run(working, take);
  }

  // Last resort: any verified advocate at all, so the panel is never blank.
  if (advocates.length === 0 && working.categorySlug) {
    delete working.categorySlug;
    relaxed.push("practice area");
    advocates = await run(working, take);
  }

  return { advocates, relaxed, browseHref: browseHref(q) };
}
