import Link from "next/link";
import { Scale } from "lucide-react";
import { Engraving } from "@/components/engraving";

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
      { href: "/admin", label: "Platform admin" },
      { href: "/admin/verification", label: "Verification queue" },
      { href: "/lawyers?online=1", label: "Advocates online" },
      { href: "/categories", label: "All legal matters" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-rule bg-surface">
      <Engraving side="left" />
      <div className="container relative py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
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
              Verified advocates across India at a fixed fee. You see the price,
              and the split, before you pay.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mono-label text-muted">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
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
