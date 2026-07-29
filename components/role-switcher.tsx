"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { ROLES, ROLE_LABELS, type SessionRole } from "@/lib/roles";

/** Demo role switch — writes the lb_session cookie, no auth (PLAN.md §7). */
export function RoleSwitcher({
  role,
  name,
}: {
  role: SessionRole | null;
  name?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: SessionRole | null) {
    setOpen(false);
    startTransition(async () => {
      await fetch("/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      router.refresh();
    });
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={pending}
        className="flex items-center gap-2 rounded-full border border-rule bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent/40 hover:bg-surface-2 disabled:opacity-60"
      >
        <UserRound className="size-4 text-muted" strokeWidth={2} />
        <span className="mono-label">
          {pending
            ? "…"
            : name
              ? name.replace(/^Adv\.\s*/, "").split(" ")[0]
              : role
                ? ROLE_LABELS[role]
                : "Sign in"}
        </span>
        <ChevronDown className="size-3.5 text-muted" strokeWidth={2.5} />
      </button>

      {open && (
        <div
          role="menu"
          className="card absolute right-0 z-50 mt-2 w-48 overflow-hidden p-1"
        >
          <p className="mono-label px-3 py-2 text-muted">
            {name ? `Signed in · ${name}` : "Sign in"}
          </p>
          <Link
            role="menuitem"
            href="/login"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-2"
          >
            Client sign-in
          </Link>
          <Link
            role="menuitem"
            href="/lawyer/login"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-2"
          >
            Advocate sign-in
          </Link>
          <div className="my-1 h-px bg-rule" />
          <p className="mono-label px-3 py-2 text-muted">View as</p>
          {ROLES.map((r) => (
            <button
              key={r}
              role="menuitem"
              type="button"
              onClick={() => choose(r)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface-2"
            >
              {ROLE_LABELS[r]}
              {role === r && (
                <Check className="size-4 text-verified" strokeWidth={2.5} />
              )}
            </button>
          ))}
          {role && (
            <>
              <div className="my-1 h-px bg-rule" />
              <button
                role="menuitem"
                type="button"
                onClick={() => choose(null)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <LogOut className="size-4" strokeWidth={2} />
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
