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
    /* Two of these sit side by side under 640px (~162px each), so everything
       below carries a max-sm: variant that drops or shrinks what cannot fit.
       Nothing at or above sm: changes. */
    <article
      className="card card-interactive flex flex-col p-5 max-sm:p-3"
    >
      {/* Row 1 — avatar, name, verified, tier chip */}
      <div className="flex items-start gap-3.5 max-sm:flex-col max-sm:gap-2">
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
            className="size-14 rounded-full object-cover max-sm:size-10"
          />
        </span>

        <div className="min-w-0 flex-1 max-sm:w-full">
          <div className="flex items-start justify-between gap-2">
            {/* truncate sets whitespace-nowrap; undo it so the name wraps
                to two lines in the narrow column instead of clipping. */}
            <h3 className="truncate text-[1.0625rem] leading-snug max-sm:overflow-visible max-sm:text-[0.9rem] max-sm:whitespace-normal">
              <Link
                href={`/lawyers/${lawyer.id}`}
                className="transition-colors hover:text-accent"
              >
                {lawyer.user.name}
              </Link>
            </h3>
            <span className="chip-tier shrink-0 max-sm:hidden">
              {lawyer.tier}
            </span>
          </div>

          {/* nowrap on mobile: the badge is a lone 16px icon, and letting it
              wrap onto its own line cost a whole row in a 162px card. */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 max-sm:mt-0.5 max-sm:flex-nowrap max-sm:gap-x-1.5">
            {lawyer.status === "VERIFIED" && <VerifiedBadge compact />}
            <p className="truncate text-sm text-slate max-sm:text-xs">
              {lawyer.years} yrs · {lawyer.court}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2 — practice areas */}
      <div className="mt-4 flex flex-wrap gap-1.5 max-sm:hidden">
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
      <p className="mt-3 truncate text-sm text-muted max-sm:hidden">
        {lawyer.languages.join(" · ")}
      </p>


      {/* Row 4 — rating, consults, live state */}
      <div className="mt-3 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 max-sm:mt-2 max-sm:mb-3">
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-star text-star" strokeWidth={2} />
          <span className="font-mono-num text-sm">
            {lawyer.rating.toFixed(1)}
          </span>
        </span>
        <span className="font-mono-num text-sm text-muted max-sm:hidden">
          {lawyer.reviewCount} consults
        </span>
        <span className="ml-auto max-sm:mt-1 max-sm:ml-0 max-sm:w-full">
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
      <div className="mt-auto flex items-center justify-between border-t border-rule pt-4 max-sm:pt-3">
        <p className="font-mono-num text-lg text-accent max-sm:text-base">
          {formatRupees(lawyer.fee)}
          <span className="mono-label ml-1 text-muted max-sm:hidden">
            / consult
          </span>
        </p>
        <Link
          href={`/lawyers/${lawyer.id}`}
          className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium max-sm:gap-1 max-sm:px-3 max-sm:py-2 max-sm:text-xs"
        >
          Consult
          <ArrowRight className="size-3.5 max-sm:size-3" strokeWidth={2.5} />
        </Link>
      </div>
    </article>
  );
}
