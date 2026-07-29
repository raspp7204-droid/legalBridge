import { db } from "@/lib/db";
import { blockLawyers } from "@/lib/auth";
import { CategoryTile } from "@/components/category-tile";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Starfield } from "@/components/starfield";
import { Engraving } from "@/components/engraving";

export const dynamic = "force-dynamic";

export const metadata = { title: "Legal matters — LawNest" };

export default async function CategoriesPage() {
  // Advocates do not browse or book advocates (lib/auth.ts).
  await blockLawyers();
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { lawyers: { where: { status: "VERIFIED" } } } },
    },
  });

  return (
    <main className="relative overflow-hidden">
      <Starfield className="h-[420px]" />
      <Engraving side="right" />
      <div className="container section relative">
        <p className="mono-label text-muted">Browse by matter</p>
        <h1 className="mt-3 max-w-3xl">
          What is the <span className="tone-accent">problem</span>?
        </h1>
        <p className="mt-5 max-w-xl text-muted">
          Pick the closest one. You will see verified advocates who handle it,
          with their fee shown upfront.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryTile
              key={c.id}
              slug={c.slug}
              name={c.name}
              icon={c.icon}
              blurb={c.blurb}
              count={c._count.lawyers}
            />
          ))}
        </div>
      </div>

      {/* Closing band so the page ends on a section, not on empty paper */}
      <section className="band-alt relative">
        <div className="container section-tight flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-[1.75rem]">Not sure which one fits?</h2>
            <p className="mt-3 max-w-lg text-slate">
              Describe the problem in your own words to the free assistant, or
              browse every verified advocate and filter by city and language.
            </p>
          </div>
          <Link
            href="/lawyers"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
          >
            See all advocates
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </main>
  );
}
