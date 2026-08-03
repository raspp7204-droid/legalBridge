"use client";

import { useEffect, useState } from "react";
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

  const link =
    "flex min-h-[44px] items-center justify-between rounded-xl border border-rule bg-surface px-4 py-3 text-ink transition-colors active:border-accent/40";

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

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
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
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="ml-auto flex size-10 items-center justify-center rounded-full border border-rule bg-surface"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-5 p-4 pb-7">
              {signedIn && (
                <div className="rounded-xl border border-rule bg-surface-2 p-4">
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

              <nav className="space-y-2">
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
                  <Link href="/account" className={link}>
                    My account
                    <ArrowRight
                      className="size-3.5 text-muted"
                      strokeWidth={2.5}
                    />
                  </Link>
                )}
              </nav>

              {!signedIn && (
                <>
                  <div className="space-y-2">
                    <Link
                      href="/sign-up"
                      className="btn-primary flex min-h-[44px] items-center justify-center rounded-full px-5 py-3 font-medium"
                    >
                      Get started
                    </Link>
                    <Link
                      href="/sign-in"
                      className="flex min-h-[44px] items-center justify-center rounded-full border border-rule bg-surface px-5 py-3 text-sm"
                    >
                      Client sign-in
                    </Link>
                  </div>

                  {/* The advocate entry point, one tap from the top of any
                      page — it used to live only in the footer. */}
                  <div className="rounded-xl border border-rule bg-surface-2 p-4">
                    <p className="mono-label text-muted">For advocates</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate">
                      Take paid consultations from verified clients. Fixed fee,
                      paid out on your share.
                    </p>
                    <div className="mt-3 space-y-2">
                      <Link
                        href="/lawyer/sign-in"
                        className="flex min-h-[44px] items-center justify-center rounded-full border border-accent/40 bg-surface px-5 py-3 text-sm text-accent"
                      >
                        Advocate sign-in
                      </Link>
                      <Link
                        href="/lawyer/sign-up"
                        className="flex min-h-[44px] items-center justify-center rounded-full px-5 py-3 text-sm text-slate underline decoration-rule underline-offset-4"
                      >
                        Join as an advocate
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

              {/* Language dropdown is visually present and does nothing (CLAUDE.md §3) */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-rule bg-surface px-4 py-3 text-slate"
                aria-label="Change language"
              >
                <Globe className="size-4" strokeWidth={2} />
                <span className="mono-label">EN</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
