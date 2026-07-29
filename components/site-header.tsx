import Link from "next/link";
import { Scale, Globe } from "lucide-react";
import { getSessionRole } from "@/lib/session";
import { RoleSwitcher } from "@/components/role-switcher";

const NAV = [
  { href: "/categories", label: "Legal matters" },
  { href: "/lawyers", label: "Advocates" },
  { href: "/me", label: "My consultations" },
];

export async function SiteHeader() {
  const role = await getSessionRole();

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-rule bg-surface">
            <Scale className="size-4 text-accent" strokeWidth={2} />
          </span>
          <span className="font-display text-lg tracking-tight">
            Legal<span className="tone-accent">Bridge</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-slate transition-colors hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Language dropdown is visually present and does nothing (CLAUDE.md §3) */}
          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-slate transition-colors hover:border-accent/40 hover:text-ink sm:flex"
            aria-label="Change language"
          >
            <Globe className="size-4" strokeWidth={2} />
            <span className="mono-label">EN</span>
          </button>

          <RoleSwitcher role={role} />

          <Link
            href="/lawyers"
            className="btn-primary mono-label hidden rounded-full px-4 py-2 sm:inline-block"
          >
            Consult now
          </Link>
        </div>
      </div>

      {/* Mobile nav — the desktop links stay reachable under 768px */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-rule px-4 py-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-slate transition-colors hover:bg-surface hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
