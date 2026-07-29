import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

export function CategoryTile({
  slug,
  name,
  icon,
  blurb,
  count,
}: {
  slug: string;
  name: string;
  icon: string;
  blurb?: string;
  count: number;
}) {
  // Seed stores a lucide icon name; fall back if it ever drifts.
  const Icon = ((Icons as unknown as Record<string, unknown>)[icon] ??
    Icons.Scale) as React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;

  return (
    <Link
      href={`/lawyers?category=${slug}`}
      className="card card-interactive group flex flex-col p-5"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl border border-rule bg-accent-bg">
          <Icon className="size-5 text-accent" strokeWidth={2} />
        </span>
        <ArrowUpRight
          className="size-4 text-muted transition-colors group-hover:text-accent"
          strokeWidth={2}
        />
      </div>

      <h3 className="mt-4 text-[1.0625rem] leading-snug">{name}</h3>
      {blurb && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate">
          {blurb}
        </p>
      )}
      <p className="mono-label mt-auto pt-4 text-muted">
        {count} {count === 1 ? "advocate" : "advocates"}
      </p>
    </Link>
  );
}

export type { IconName };
