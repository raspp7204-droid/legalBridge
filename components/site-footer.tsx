import Link from "next/link";
import { Scale } from "lucide-react";
import { Engraving } from "@/components/engraving";
import { getDbUser } from "@/lib/auth";

const INSTAGRAM = "https://www.instagram.com/lawnest_";

/** Instagram glyph as line art — lucide v1 no longer ships brand icons. */
function InstagramMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Legal matters",
    links: [
      { href: "/lawyers?category=divorce-family", label: "Divorce & family" },
      { href: "/lawyers?category=property-land", label: "Property & land" },
      { href: "/lawyers?category=criminal-defence", label: "Criminal defence" },
      { href: "/categories", label: "All 8 matters" },
    ],
  },
  {
    title: "For clients",
    links: [
      { href: "/lawyers", label: "Find an advocate" },
      { href: "/me", label: "My consultations" },
      { href: "/sign-in", label: "Client sign-in" },
      { href: "/categories", label: "How it works" },
    ],
  },
  {
    title: "For advocates",
    links: [
      { href: "/lawyer/sign-in", label: "Advocate sign-in" },
      { href: "/lawyer", label: "Advocate dashboard" },
      { href: "/lawyer/inbox", label: "Consultation inbox" },
      { href: "/lawyer/profile", label: "Edit my profile" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: INSTAGRAM, label: "Instagram" },
      { href: "/admin", label: "Platform admin" },
      { href: "/admin/verification", label: "Verification queue" },
      { href: "/lawyers?online=1", label: "Advocates online" },
      { href: "/categories", label: "All legal matters" },
    ],
  },
];

/* An advocate has no use for the booking funnel, so their footer is their own
   product: chambers links, then the platform's terms. */
const LAWYER_COLUMNS = [
  {
    title: "My chambers",
    links: [
      { href: "/lawyer", label: "Dashboard" },
      { href: "/lawyer/inbox", label: "Consultation inbox" },
      { href: "/lawyer/profile", label: "Edit my profile" },
    ],
  },
  {
    title: "Earnings",
    links: [
      { href: "/lawyer", label: "Payouts & balance" },
      { href: "/lawyer", label: "Consultation history" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: INSTAGRAM, label: "Instagram" },
      { href: "/", label: "About LawNest" },
    ],
  },
];

export async function SiteFooter() {
  const user = await getDbUser();
  const columns = user?.role === "LAWYER" ? LAWYER_COLUMNS : COLUMNS;
  const blurb =
    user?.role === "LAWYER"
      ? "You keep 80% of every consultation fee. Clients see the split before they pay, so nobody negotiates in the dark."
      : "Verified advocates across India at a fixed fee. You see the price, and the split, before you pay.";

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-rule bg-surface">
      <Engraving side="left" />
      <div className="container relative py-14">
        <div
          className={`grid gap-10 sm:grid-cols-2 ${
            columns.length === 3 ? "lg:grid-cols-4" : "lg:grid-cols-5"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg border border-rule bg-surface-2">
                <Scale className="size-4 text-accent" strokeWidth={2} />
              </span>
              <span className="font-display text-lg">
                Law<span className="tone-accent">Nest</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate">
              {blurb}
            </p>

            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-label mt-5 inline-flex items-center gap-2 rounded-full border border-rule bg-surface-2 px-3 py-2 text-slate transition-colors hover:border-accent/40 hover:text-accent"
            >
              <InstagramMark className="size-4" />
              @lawnest_
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mono-label text-muted">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) =>
                  l.href.startsWith("http") ? (
                    <li key={l.href + l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate transition-colors hover:text-accent"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-slate transition-colors hover:text-accent"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono-label text-muted">
            © 2026 LawNest · Bengaluru
          </p>
          <p className="max-w-lg text-xs leading-relaxed text-muted/90">
            LawNest is a technology platform. It does not provide legal
            advice and is not a law firm. Advocates listed here are independent
            practitioners enrolled with a State Bar Council.
          </p>
        </div>
      </div>
    </footer>
  );
}
