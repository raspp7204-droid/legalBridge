import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { formatRupees } from "@/lib/money";
import { formatSlotTime, type LawyerCardData } from "@/lib/lawyers";

export function LawyerCard({ lawyer }: { lawyer: LawyerCardData }) {
  const nextSlot = lawyer.slots[0];

  return (
    <article className="card card-interactive flex flex-col p-5">
      {/* Row 1 — avatar, name, verified, tier chip */}
      <div className="flex items-start gap-3.5">
        <span
          className={`relative shrink-0 rounded-full p-[2px] ${
            lawyer.online ? "bg-verified" : "bg-rule"
          }`}
        >
          <Image
            src={lawyer.user.avatar}
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-full object-cover"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[1.0625rem] leading-snug">
              <Link
                href={`/lawyers/${lawyer.id}`}
                className="transition-colors hover:text-brass"
              >
                {lawyer.user.name}
              </Link>
            </h3>
            <span className="mono-label shrink-0 rounded-full border border-brass/50 px-2 py-0.5 text-brass">
              {lawyer.tier}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {lawyer.status === "VERIFIED" && <VerifiedBadge compact />}
            <p className="truncate text-sm text-muted">
              {lawyer.years} yrs · {lawyer.court}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2 — practice areas */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {lawyer.categories.map((c) => (
          <span
            key={c.slug}
            className="rounded-md border border-rule bg-surface-2 px-2 py-1 text-xs text-text/85"
          >
            {c.name}
          </span>
        ))}
      </div>

      {/* Row 3 — languages */}
      <p className="mt-3 truncate text-sm text-muted">
        {lawyer.languages.join(" · ")}
      </p>

      {/* Row 4 — rating, consults, live state */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-brass text-brass" strokeWidth={2} />
          <span className="font-mono-num text-sm">
            {lawyer.rating.toFixed(1)}
          </span>
        </span>
        <span className="font-mono-num text-sm text-muted">
          {lawyer.reviewCount} consults
        </span>
        <span className="ml-auto">
          {lawyer.online ? (
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-verified" />
              <span className="mono-label text-verified">Online</span>
            </span>
          ) : nextSlot ? (
            <span className="mono-label text-muted">
              Next slot {formatSlotTime(nextSlot.startsAt)}
            </span>
          ) : (
            <span className="mono-label text-muted">By appointment</span>
          )}
        </span>
      </div>

      {/* Row 5 — price + CTA */}
      <div className="mt-4 flex items-center justify-between border-t border-rule pt-4">
        <p className="font-mono-num text-lg text-brass">
          {formatRupees(lawyer.fee)}
          <span className="mono-label ml-1 text-muted">/ consult</span>
        </p>
        <Link
          href={`/lawyers/${lawyer.id}`}
          className="cta-brass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
        >
          Consult
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </article>
  );
}
