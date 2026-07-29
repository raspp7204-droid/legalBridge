import Link from "next/link";
import { Scale, Globe } from "lucide-react";
import { getSession, getCurrentUser } from "@/lib/session";
import { RoleSwitcher } from "@/components/role-switcher";

const CLIENT_NAV = [
  { href: "/categories", label: "Legal matters" },
  { href: "/lawyers", label: "Advocates" },
  { href: "/me", label: "My consultations" },
];

const LAWYER_NAV = [
  { href: "/lawyer", label: "Dashboard" },
  { href: "/lawyer/inbox", label: "Inbox" },
  { href: "/lawyer/profile", label: "My profile" },
];

export async function SiteHeader() {
  const session = await getSession();
  const role = session?.role ?? null;
  const user = role ? await getCurrentUser() : null;
  const NAV = role === "LAWYER" ? LAWYER_NAV : CLIENT_NAV;

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg border border-rule bg-surface">
            <Scale className="size-4 text-accent" strokeWidth={2} />
          </span>
          <span className="font-display text-lg tracking-tight">
            Law<span className="tone-accent">Nest</span>
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

          <RoleSwitcher role={role} name={user?.name ?? null} />

          {role === "LAWYER" ? (
            <Link
              href="/lawyer/inbox"
              className="btn-primary mono-label hidden rounded-full px-4 py-2 sm:inline-block"
            >
              Open inbox
            </Link>
          ) : (
            <>
              <Link
                href="/lawyer/login"
                className="mono-label hidden rounded-full border border-rule px-3 py-2 text-slate transition-colors hover:border-accent/40 hover:text-ink lg:inline-block"
              >
                For advocates
              </Link>
              <Link
                href="/lawyers"
                className="btn-primary mono-label hidden rounded-full px-4 py-2 sm:inline-block"
              >
                Consult now
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav — the desktop links stay reachable under 768px */}
      <nav className="container flex items-center gap-1 overflow-x-auto border-t border-rule py-2 md:hidden">
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
