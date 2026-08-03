import Link from "next/link";
import { Gift } from "lucide-react";
import { formatPoints } from "@/lib/rewards";

/**
 * The rewards balance, always visible — the coin counter every Indian
 * consumer app puts in its header.
 */
export function PointsPill({
  points,
  className = "",
}: {
  points: number;
  className?: string;
}) {
  return (
    <Link
      href="/rewards"
      title="LawNest Rewards"
      className={`mono-label items-center gap-1.5 rounded-full border border-accent/30 bg-accent-bg px-3 py-1.5 text-accent transition-colors hover:border-accent/60 ${className}`}
    >
      <Gift className="size-3.5" strokeWidth={2.5} />
      {formatPoints(points)}
      <span className="sr-only"> LawNest points</span>
    </Link>
  );
}
