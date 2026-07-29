/**
 * Engraved brand motif for the gutters (CHAT-AND-POLISH.md Task 3).
 * Concentric rings behind a line-art scales of justice, drawn in --ink at
 * 4–6% and bled off one edge so the empty side of a section reads as
 * intentional letterpress rather than blank paper. Static SVG — nothing to
 * animate, so prefers-reduced-motion needs no special case.
 */
export function Engraving({
  side = "right",
  className = "",
}: {
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 hidden w-[520px] overflow-hidden md:block ${
        side === "right" ? "right-[-160px]" : "left-[-160px]"
      } ${className}`}
    >
      <svg
        viewBox="0 0 400 400"
        className="absolute top-1/2 h-[520px] w-[520px] -translate-y-1/2 text-ink"
        fill="none"
        stroke="currentColor"
      >
        {/* Concentric rings — engraved seal */}
        <g opacity="0.06" strokeWidth="1">
          {[60, 92, 124, 156, 188].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} />
          ))}
        </g>
        <g opacity="0.04" strokeWidth="1">
          {[76, 108, 140, 172].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} strokeDasharray="2 6" />
          ))}
        </g>

        {/* Scales of justice, line art */}
        <g opacity="0.06" strokeWidth="2" strokeLinecap="round">
          <path d="M200 108v168" />
          <path d="M164 276h72" />
          <path d="M120 140h160" />
          <path d="M120 140l-28 56a28 28 0 0 0 56 0z" />
          <path d="M280 140l-28 56a28 28 0 0 0 56 0z" />
          <circle cx="200" cy="130" r="9" />
        </g>
      </svg>
    </div>
  );
}
