import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Engraving } from "@/components/engraving";
import { ClerkRecovery } from "@/components/clerk-recovery";

/** Clerk widgets restyled into Daylight Chambers (LAUNCH.md Task 1). */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#9E2B25",
    colorText: "#17233A",
    colorTextSecondary: "#55606E",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FBF8F1",
    colorInputText: "#17233A",
    colorDanger: "#B23A31",
    colorSuccess: "#2C6E5B",
    borderRadius: "12px",
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "bg-surface border border-rule shadow-[0_1px_3px_rgb(23_35_58/0.06)]",
    headerTitle: "font-display",
    footerAction__signIn: "text-slate",
    formButtonPrimary:
      "bg-accent hover:bg-accent-dim text-white normal-case text-[0.95rem]",
  },
} as const;

export function AuthShell({
  eyebrow,
  title,
  accent,
  blurb,
  points,
  footer,
  recoverTo = "/sign-in",
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  blurb: string;
  points: string[];
  footer: { label: string; href: string; cta: string };
  /** Where a session reset should return to — this page, not the client one. */
  recoverTo?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative overflow-hidden">
      <Engraving side="left" />
      <div className="container section-tight relative">
        {/* Below 900px this is one column, so source order decides what a
            phone sees first — and the pitch used to push the actual sign-in
            box off the bottom of the screen. `contents` dissolves the left
            column into the grid there so the widget can sit second, right
            under the heading. Above 900px nothing here applies. */}
        <div className="grid items-start gap-6 min-[900px]:grid-cols-[1fr_440px] min-[900px]:gap-12">
          {/* Left — why you're signing in */}
          <div className="max-[900px]:contents min-[900px]:pt-6">
            <div className="max-[900px]:order-1">
              <p className="mono-label text-muted">{eyebrow}</p>
              <h1 className="mt-3 text-[1.875rem] sm:text-[2.75rem]">
                {title} <span className="tone-accent">{accent}</span>
              </h1>
            </div>

            <p className="mt-5 max-w-lg leading-relaxed text-slate max-[900px]:order-3 max-[900px]:mt-0">
              {blurb}
            </p>

            <ul className="mt-8 space-y-3 max-[900px]:order-4 max-[900px]:mt-0">
              {points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent">
                    <ShieldCheck className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <p className="text-sm leading-relaxed text-slate">{p}</p>
                </li>
              ))}
            </ul>

            <p className="mono-label mt-8 text-muted max-[900px]:order-5 max-[900px]:mt-0">
              Email + one-time code · no Aadhaar, no government ID, ever
            </p>

            <p className="mt-6 text-sm text-slate max-[900px]:order-6 max-[900px]:mt-0">
              {footer.label}{" "}
              <Link href={footer.href} className="text-accent hover:underline">
                {footer.cta}
              </Link>
            </p>
          </div>

          {/* Right — the Clerk widget, and the way out if it never boots */}
          <div className="max-[900px]:order-2 min-[900px]:justify-self-end">
            {children}
            <ClerkRecovery to={recoverTo} />
          </div>
        </div>
      </div>
    </main>
  );
}
