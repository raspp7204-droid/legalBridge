import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { formatRupees } from "@/lib/money";
import type { AdvocateSuggestion } from "@/lib/lawyer-search";

/**
 * An advocate as the assistant surfaces them. Deliberately not
 * LawyerCardCompact — that takes a full Prisma payload with Date slots, and
 * this data has crossed the model boundary as plain JSON. It is also sized
 * for a 400px panel rather than a listing grid.
 */
export function AssistantAdvocateCard({ a }: { a: AdvocateSuggestion }) {
  return (
    <Link
      href={a.href}
      className="card card-interactive block p-3"
      target="_blank"
      rel="noreferrer"
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`relative shrink-0 rounded-full p-[2px] ${
            a.online ? "bg-verified" : "bg-rule"
          }`}
        >
          <Image
            src={a.avatar}
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-display truncate text-[0.9rem] leading-tight text-ink">
              {a.name}
            </p>
            <VerifiedBadge compact />
          </div>
          <p className="mt-0.5 truncate text-xs text-slate">
            {a.years} yrs · {a.court}
          </p>
          <p className="mono-label mt-1 flex items-center gap-2 text-muted">
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-star text-star" strokeWidth={2} />
              <span className="font-mono-num">{a.rating.toFixed(1)}</span>
            </span>
            <span className="truncate">{a.languages.slice(0, 2).join(" · ")}</span>
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono-num text-[0.9rem] text-accent">
            {formatRupees(a.fee)}
          </p>
          <p className="mono-label mt-0.5 flex items-center justify-end gap-0.5 text-muted">
            Consult
            <ArrowRight className="size-3" strokeWidth={2.5} />
          </p>
        </div>
      </div>
    </Link>
  );
}
