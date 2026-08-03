import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { formatRupees } from "@/lib/money";
import { relativeSlotLabel, type LawyerCardData } from "@/lib/lawyers";

/**
 * Compact row used inside the hero's "Advocates online now" panel — same data,
 * one line of it, so two stack in the hero's right column without crowding.
 */
export function LawyerCardCompact({ lawyer }: { lawyer: LawyerCardData }) {
  const nextSlot = lawyer.slots[0];

  return (
    <Link
      href={`/lawyers/${lawyer.id}`}
      className="card card-interactive flex items-center gap-3 p-3.5"
    >
      <span
        className={`relative shrink-0 rounded-full p-[2px] ${
          lawyer.online ? "bg-verified" : "bg-rule"
        }`}
      >
        <Image
          src={lawyer.user.avatar}
          alt=""
          width={44}
          height={44}
          className="size-11 rounded-full object-cover"
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="font-display truncate text-[0.95rem] leading-tight">
            {lawyer.user.name}
          </p>
          {lawyer.status === "VERIFIED" && <VerifiedBadge compact />}
        </div>
        <p className="mt-0.5 truncate text-xs text-slate">
          {lawyer.years} yrs · {lawyer.court}
        </p>
        <p className="mono-label mt-1 text-muted">
          {lawyer.online ? (
            <span className="text-verified">● Available now</span>
          ) : nextSlot ? (
            <>Next {relativeSlotLabel(nextSlot.startsAt)}</>
          ) : (
            <>By appointment</>
          )}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-mono-num text-[0.95rem] text-accent">
          {formatRupees(lawyer.fee)}
        </p>
        <p className="mono-label text-muted">30 min</p>
      </div>
    </Link>
  );
}

export function LawyerCard({ lawyer }: { lawyer: LawyerCardData }) {
  const nextSlot = lawyer.slots[0];

  return (
    <article
      className="card card-interactive flex flex-col p-5"
    >
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
                className="transition-colors hover:text-accent"
              >
                {lawyer.user.name}
              </Link>
            </h3>
            <span className="chip-tier shrink-0">{lawyer.tier}</span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {lawyer.status === "VERIFIED" && <VerifiedBadge compact />}
            <p className="truncate text-sm text-slate">
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
            className="chip-tag"
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
      <div className="mt-3 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-star text-star" strokeWidth={2} />
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
              <span className="mono-label text-verified">Available now</span>
            </span>
          ) : nextSlot ? (
            <span className="mono-label text-muted">
              Next {relativeSlotLabel(nextSlot.startsAt)}
            </span>
          ) : (
            <span className="mono-label text-muted">By appointment</span>
          )}
        </span>
      </div>

      {/* Row 5 — price + CTA */}
      <div className="mt-auto flex items-center justify-between border-t border-rule pt-4">
        <p className="font-mono-num text-lg text-accent">
          {formatRupees(lawyer.fee)}
          <span className="mono-label ml-1 text-muted">/ consult</span>
        </p>
        <Link
          href={`/lawyers/${lawyer.id}`}
          className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
        >
          Consult
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>
    </article>
  );
}
