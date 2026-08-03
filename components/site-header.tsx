import Link from "next/link";
import { Scale, Globe } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/auth";
import { MobileMenu } from "@/components/mobile-menu";
import { PointsPill } from "@/components/points-pill";

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

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/promotions", label: "Promotions" },
];

export async function SiteHeader() {
  const [{ userId }, user] = await Promise.all([auth(), getDbUser()]);
  const signedIn = !!userId;
  const role = user?.role ?? null;

  const NAV =
    role === "LAWYER" ? LAWYER_NAV : role === "ADMIN" ? ADMIN_NAV : CLIENT_NAV;

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

        <div className="ml-auto flex items-center gap-2 max-md:gap-1.5">
          {/* Language dropdown is visually present and does nothing (CLAUDE.md §3) */}
          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1.5 text-slate transition-colors hover:border-accent/40 hover:text-ink md:flex"
            aria-label="Change language"
          >
            <Globe className="size-4" strokeWidth={2} />
            <span className="mono-label">EN</span>
          </button>

          {!signedIn && (
            <>
            {/* Marketing before the auth wall: this used to point straight at
                a sign-in form, so an advocate met the pitch only after
                deciding to sign in. md: rather than lg: — tablets get it too. */}
            <Link
              href="/for-advocates"
              className="mono-label hidden rounded-full border border-accent/40 px-3 py-2 text-accent transition-colors hover:bg-accent-bg md:inline-block"
            >
              Advocates: free 1 year
            </Link>
            {/* Under md the sheet carries every other action, so this is the
                one visible control — filled, and sized to the 40px hamburger
                beside it, instead of a hairline pill that clashes with it. */}
            <Link
              href="/sign-in"
              className="mono-label rounded-full border border-rule px-3 py-2 text-ink transition-colors hover:border-accent/40 max-md:border-accent max-md:bg-accent max-md:px-3.5 max-md:py-2.5 max-md:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="btn-primary mono-label hidden rounded-full px-4 py-2 md:inline-block"
              >
                Get started
              </Link>
            </>
          )}

          {signedIn && (
            <>
            {role === "CLIENT" && (
              <PointsPill
                points={user?.points ?? 0}
                className="hidden md:inline-flex"
              />
            )}
            {user?.clientCode && (
              <Link
                href="/account"
                className="mono-label hidden rounded-full border border-rule bg-surface px-3 py-1.5 text-muted transition-colors hover:border-accent/40 hover:text-ink md:inline-block"
                title="Your LawNest ID"
              >
                {user.clientCode}
              </Link>
            )}
            <span className="mono-label hidden max-w-[9rem] truncate text-ink lg:inline-block">
              {user?.name.replace(/^Adv\.\s*/, "") ?? ""}
            </span>
            {/* fallback shows while Clerk boots — and stays if it never
                does, so the header is never a dead end. */}
            <UserButton
              appearance={{ elements: { avatarBox: "size-9" } }}
              userProfileUrl="/account"
              userProfileMode="navigation"
              fallback={
                <a
                  href="/sign-out"
                  title="Sign out"
                  className="mono-label hidden rounded-full border border-rule px-3 py-2 text-slate transition-colors hover:border-accent/40 hover:text-ink md:inline-block"
                >
                  Sign out
                </a>
              }
            />
            {role === "LAWYER" ? (
              <Link
                href="/lawyer/inbox"
                className="btn-primary mono-label hidden rounded-full px-4 py-2 md:inline-block"
              >
                Open inbox
              </Link>
            ) : role === "CLIENT" ? (
              <Link
                href="/lawyers"
                className="btn-primary mono-label hidden rounded-full px-4 py-2 md:inline-block"
              >
                Consult now
              </Link>
              ) : null}
            </>
          )}

          {/* Under 768px everything above collapses into one sheet, so the
              header stays a single 64px row and advocate sign-in is one tap
              from the top of any page. */}
          <MobileMenu
            nav={NAV}
            signedIn={signedIn}
            role={role}
            name={user?.name ?? null}
            clientCode={user?.clientCode ?? null}
            points={role === "CLIENT" ? (user?.points ?? 0) : null}
          />
        </div>
      </div>
    </header>
  );
}
