/**
 * Faint starfield behind the hero and category sections (PLAN.md §2).
 * Pure CSS radial-gradients — no canvas, no JS. Twinkle is disabled under
 * prefers-reduced-motion by the global rule in globals.css.
 */
export function Starfield({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Two offset dot layers at different scales read as depth */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 18%, rgba(244,241,234,.55) 50%, transparent 50%),
            radial-gradient(1px 1px at 32% 62%, rgba(244,241,234,.35) 50%, transparent 50%),
            radial-gradient(1.5px 1.5px at 58% 22%, rgba(212,162,78,.45) 50%, transparent 50%),
            radial-gradient(1px 1px at 74% 74%, rgba(244,241,234,.40) 50%, transparent 50%),
            radial-gradient(1px 1px at 88% 34%, rgba(244,241,234,.30) 50%, transparent 50%),
            radial-gradient(1.5px 1.5px at 46% 88%, rgba(212,162,78,.30) 50%, transparent 50%)
          `,
          backgroundSize: "340px 340px",
          animation: "lb-twinkle 5.5s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 22% 44%, rgba(244,241,234,.45) 50%, transparent 50%),
            radial-gradient(1px 1px at 66% 12%, rgba(244,241,234,.35) 50%, transparent 50%),
            radial-gradient(1px 1px at 84% 58%, rgba(212,162,78,.35) 50%, transparent 50%)
          `,
          backgroundSize: "210px 210px",
          animation: "lb-twinkle 7.5s ease-in-out infinite reverse",
        }}
      />
      {/* Vignette so the field never competes with copy */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_35%,var(--bg)_78%)]" />
    </div>
  );
}
