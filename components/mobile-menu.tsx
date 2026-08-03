"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, Gift, Scale, ArrowRight } from "lucide-react";
import { formatPoints } from "@/lib/rewards";

type NavItem = { href: string; label: string };

/**
 * Mobile only (<768px). The header used to carry a second sticky row of
 * scrolling links, which ate ~40px of every phone viewport and still hid the
 * advocate entry point — signed-out visitors had to scroll to the footer to
 * find it. One sheet replaces both.
 */
export function MobileMenu({
  nav,
  signedIn,
  role,
  name,
  clientCode,
  points,
}: {
  nav: NavItem[];
  signedIn: boolean;
  role: "CLIENT" | "LAWYER" | "ADMIN" | null;
  name: string | null;
  clientCode: string | null;
  points: number | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // A tap that navigates must not leave the sheet hanging open.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes; body scroll locks while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* One bordered list with hairline dividers, not one bordered box per link —
     nine stacked boxes was what made the sheet scroll on a 667px phone. */
  const link =
    "flex min-h-[48px] items-center justify-between px-4 text-ink transition-colors active:bg-surface-2";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-rule bg-surface text-ink md:hidden"
      >
        <Menu className="size-5" strokeWidth={2} />
      </button>

      {/* Portalled to <body>: the header carries backdrop-blur, which makes it
          the containing block for fixed descendants, so an overlay rendered
          in place was clipped to the 64px bar — the page never dimmed and a
          tap below the header did not close the sheet. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/45"
            />

            <div className="absolute inset-x-0 top-0 max-h-[92dvh] overflow-y-auto rounded-b-2xl border-b border-rule bg-paper">
              <div className="flex h-16 items-center gap-3 border-b border-rule px-4">
                <span className="flex size-8 items-center justify-center rounded-lg border border-rule bg-surface">
                  <Scale className="size-4 text-accent" strokeWidth={2} />
                </span>
                <span className="font-display text-lg tracking-tight">
                  Law<span className="tone-accent">Nest</span>
                </span>
                {/* Language dropdown is visually present and does nothing
                  (CLAUDE.md §3) — an icon here instead of a full-width row. */}
                <button
                  type="button"
                  className="mono-label ml-auto flex h-10 items-center gap-1.5 rounded-full border border-rule bg-surface px-3 text-slate"
                  aria-label="Change language"
                >
                  <Globe className="size-4" strokeWidth={2} />
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex size-10 items-center justify-center rounded-full border border-rule bg-surface"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-4 p-4 pb-6">
                {signedIn && (
                  <div className="rounded-xl border border-rule bg-surface-2 p-3.5">
                    <p className="font-display text-[1.0625rem] leading-tight">
                      {name?.replace(/^Adv\.\s*/, "") ?? "Signed in"}
                    </p>
                    {clientCode && (
                      <p className="mono-label mt-1 text-muted">{clientCode}</p>
                    )}
                    {points !== null && (
                      <Link
                        href="/rewards"
                        className="mono-label mt-3 flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-bg px-3 py-2 text-accent"
                      >
                        <Gift className="size-3.5" strokeWidth={2.5} />
                        {formatPoints(points)} points
                      </Link>
                    )}
                  </div>
                )}

                <nav className="divide-y divide-rule overflow-hidden rounded-xl border border-rule bg-surface">
                  {nav.map((item) => (
                    <Link key={item.href} href={item.href} className={link}>
                      {item.label}
                      <ArrowRight
                        className="size-3.5 text-muted"
                        strokeWidth={2.5}
                      />
                    </Link>
                  ))}
                  {signedIn && (
                    <>
                      <Link href="/account" className={link}>
                        My account
                        <ArrowRight
                          className="size-3.5 text-muted"
                          strokeWidth={2.5}
                        />
                      </Link>
                      {/* Plain link, not Clerk's <SignOutButton>: this has to
                        work when the Clerk script cannot load. */}
                      <a href="/sign-out" className={link}>
                        Sign out
                        <ArrowRight
                          className="size-3.5 text-muted"
                          strokeWidth={2.5}
                        />
                      </a>
                    </>
                  )}
                </nav>

                {!signedIn && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/sign-in"
                        className="flex min-h-[46px] items-center justify-center rounded-full border border-rule bg-surface px-4 text-sm"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/sign-up"
                        className="btn-primary flex min-h-[46px] items-center justify-center rounded-full px-4 font-medium"
                      >
                        Get started
                      </Link>
                    </div>

                    {/* The advocate entry point, one tap from the top of any
                      page — it used to live only in the footer. */}
                    <div className="rounded-xl border border-rule bg-surface-2 p-3.5">
                      <p className="mono-label text-muted">For advocates</p>
                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        <Link
                          href="/lawyer/sign-in"
                          className="flex min-h-[44px] items-center justify-center rounded-full border border-accent/40 bg-surface px-3 text-sm text-accent"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/lawyer/sign-up"
                          className="flex min-h-[44px] items-center justify-center rounded-full border border-rule bg-surface px-3 text-sm text-slate"
                        >
                          Join
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                {signedIn && role !== "ADMIN" && (
                  <Link
                    href={role === "LAWYER" ? "/lawyer/inbox" : "/lawyers"}
                    className="btn-primary flex min-h-[44px] items-center justify-center rounded-full px-5 py-3 font-medium"
                  >
                    {role === "LAWYER" ? "Open inbox" : "Consult now"}
                  </Link>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
