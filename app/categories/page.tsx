import { db } from "@/lib/db";
import { CategoryTile } from "@/components/category-tile";
import { Starfield } from "@/components/starfield";

export const dynamic = "force-dynamic";

export const metadata = { title: "Legal matters — LegalBridge" };

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { lawyers: { where: { status: "VERIFIED" } } } },
    },
  });

  return (
    <main className="relative">
      <Starfield className="h-[420px]" />
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
    </main>
  );
}
