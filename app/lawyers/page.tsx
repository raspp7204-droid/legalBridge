import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { blockLawyers } from "@/lib/auth";
import { LawyerCard } from "@/components/lawyer-card";
import { FilterRail } from "@/components/filter-rail";
import { FilterSheet } from "@/components/filter-sheet";
import { EmptyState } from "@/components/empty-state";
import { LiveStrip } from "@/components/live-strip";
import { lawyerCardSelect, EXPERIENCE_BANDS, SORTS } from "@/lib/lawyers";
import {
  toList,
  activeFilterCount,
  type RawSearchParams,
} from "@/lib/search-params";

export const dynamic = "force-dynamic";

export const metadata = { title: "Advocates — LawNest" };

const CITIES = [
  "Bengaluru",
  "Delhi",
  "Hyderabad",
  "Jaipur",
  "Kolkata",
  "Lucknow",
  "Mumbai",
  "Pune",
];

const LANGUAGES = [
  "English",
  "Hindi",
  "Kannada",
  "Marathi",
  "Bengali",
  "Telugu",
  "Tamil",
  "Malayalam",
  "Punjabi",
  "Urdu",
];

export default async function LawyersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  // Advocates do not browse or book advocates (lib/auth.ts).
  await blockLawyers();
  const sp = await searchParams;

  const categorySlugs = toList(sp.category);
  const tiers = toList(sp.tier).filter((t) =>
    ["LOWER", "MIDDLE", "HIGH"].includes(t),
  ) as Prisma.EnumTierFilter["in"];
  const bands = toList(sp.exp).filter((b) => b in EXPERIENCE_BANDS);
  const langs = toList(sp.lang);
  const cities = toList(sp.city);
  const onlineOnly = toList(sp.online).includes("1");
  const sort = (toList(sp.sort)[0] ?? "rating") as keyof typeof SORTS;

  const where: Prisma.LawyerProfileWhereInput = {
    status: "VERIFIED",
    ...(categorySlugs.length
      ? { categories: { some: { slug: { in: categorySlugs } } } }
      : {}),
    ...(tiers?.length ? { tier: { in: tiers } } : {}),
    ...(langs.length ? { languages: { hasSome: langs } } : {}),
    ...(cities.length ? { city: { in: cities } } : {}),
    ...(onlineOnly ? { online: true } : {}),
    ...(bands.length
      ? {
          OR: bands.map((b) => {
            const band = EXPERIENCE_BANDS[b as keyof typeof EXPERIENCE_BANDS];
            return { years: { gte: band.min, lte: band.max } };
          }),
        }
      : {}),
  };

  const orderBy: Prisma.LawyerProfileOrderByWithRelationInput[] =
    sort === "price"
      ? [{ fee: "asc" }, { rating: "desc" }]
      : sort === "experience"
        ? [{ years: "desc" }, { rating: "desc" }]
        : [{ rating: "desc" }, { reviewCount: "desc" }];

  /* One ranked list, no paid placement: results are ordered by whatever the
     client asked for (rating, fee, experience) and nothing else. */
  const [lawyers, categories, onlineCount] = await Promise.all([
    db.lawyerProfile.findMany({ where, orderBy, ...lawyerCardSelect() }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
    db.lawyerProfile.count({ where: { status: "VERIFIED", online: true } }),
  ]);

  const total = lawyers.length;

  const rail = (
    <FilterRail
      sp={sp}
      categories={categories}
      cities={CITIES}
      languages={LANGUAGES}
    />
  );

  const activeCategory = categorySlugs.length
    ? categories.find((c) => c.slug === categorySlugs[0])?.name
    : null;

  return (
    <main className="container container-wide section-tight">
      <LiveStrip online={onlineCount} />
      <h1 className="mt-5 text-[2rem] sm:text-[3rem]">
        {activeCategory ? (
          <>
            <span className="tone-accent">{activeCategory}</span> advocates
          </>
        ) : (
          <>
            Verified <span className="tone-accent">advocates</span>
          </>
        )}
      </h1>
      <p className="mt-3 text-muted">
        {total} {total === 1 ? "advocate" : "advocates"} available · fixed fee,
        shown before you book
      </p>

      <div className="mt-8 lg:hidden">
        <FilterSheet activeCount={activeFilterCount(sp)}>{rail}</FilterSheet>
      </div>

      <div className="mt-6 grid gap-7 lg:grid-cols-[264px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{rail}</div>
        </aside>

        <div>
          {total === 0 ? (
            <EmptyState
              title="No advocates match those filters"
              body="Try removing a filter — city and language together often narrow it too far."
              actionHref="/lawyers"
              actionLabel="Clear filters"
            />
          ) : (
            /* 3 up on desktop, 2 on tablet, 2 compact on mobile */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] sm:gap-5">
              {lawyers.map((l) => (
                <LawyerCard key={l.id} lawyer={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
