import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Engraving } from "@/components/engraving";

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
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  blurb: string;
  points: string[];
  footer: { label: string; href: string; cta: string };
  children: React.ReactNode;
}) {
  return (
    <main className="relative overflow-hidden">
      <Engraving side="left" />
      <div className="container section-tight relative">
        <div className="grid items-start gap-12 min-[900px]:grid-cols-[1fr_440px]">
          {/* Left — why you're signing in */}
          <div className="min-[900px]:pt-6">
            <p className="mono-label text-muted">{eyebrow}</p>
            <h1 className="mt-3 text-[2.25rem] sm:text-[2.75rem]">
              {title} <span className="tone-accent">{accent}</span>
            </h1>
            <p className="mt-5 max-w-lg leading-relaxed text-slate">{blurb}</p>

            <ul className="mt-8 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent">
                    <ShieldCheck className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <p className="text-sm leading-relaxed text-slate">{p}</p>
                </li>
              ))}
            </ul>

            <p className="mono-label mt-8 text-muted">
              Email + one-time code · no Aadhaar, no government ID, ever
            </p>

            <p className="mt-6 text-sm text-slate">
              {footer.label}{" "}
              <Link href={footer.href} className="text-accent hover:underline">
                {footer.cta}
              </Link>
            </p>
          </div>

          {/* Right — the Clerk widget */}
          <div className="min-[900px]:justify-self-end">{children}</div>
        </div>
      </div>
    </main>
  );
}
