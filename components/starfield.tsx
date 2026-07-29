/**
 * Faint paper texture behind the hero and category sections.
 * Was a dark starfield; on the Daylight Chambers theme it reads as ruled
 * ledger paper — hairlines in --rule that fade out before they reach copy.
 * Pure CSS gradients, no canvas, no JS, no animation.
 */
export function Starfield({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Ledger rules */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, var(--rule) 0 1px, transparent 1px 34px)",
        }}
      />
      {/* Wash so the texture never competes with copy */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, var(--paper) 30%, transparent 100%)",
        }}
      />
    </div>
  );
}
