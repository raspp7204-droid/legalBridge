/**
 * The hero's background image — a neoclassical courthouse facade drawn as
 * line art, bleeding off the right edge behind the copy.
 *
 * Drawn rather than photographed on purpose: a stock courtroom photo would
 * fight the ivory palette and cost a network request, and every competitor's
 * landing page already has one. This is a single inline SVG at 4–7% ink, so
 * it reads as an engraved plate on the paper. Static — nothing to animate,
 * so prefers-reduced-motion needs no special case.
 */
export function CourthouseBackdrop({ className = "" }: { className?: string }) {
  const columns = [0, 1, 2, 3, 4, 5];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 hidden overflow-hidden md:block ${className}`}
    >
      <svg
        viewBox="0 0 560 420"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 size-full text-ink"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Sky rules behind the building — faint engraved hatching */}
        <g opacity="0.12" strokeWidth="1">
          {[40, 62, 84, 106, 128].map((y) => (
            <path key={y} d={`M300 ${y}H560`} strokeDasharray="1 7" />
          ))}
        </g>

        {/* Pediment */}
        <g opacity="0.12" strokeWidth="1.6">
          <path d="M150 150 320 74 490 150" />
          <path d="M150 150H490" />
          {/* Tympanum relief — the scales, echoed from the seal motif */}
          <path d="M320 100v34M300 112h40M300 112l-7 13a7 7 0 0 0 14 0zM340 112l-7 13a7 7 0 0 0 14 0z" />
        </g>

        {/* Architrave */}
        <g opacity="0.10" strokeWidth="1.4">
          <path d="M142 150H498M142 164H498M142 178H498" />
        </g>

        {/* Colonnade */}
        <g opacity="0.10" strokeWidth="1.4">
          {columns.map((i) => {
            const x = 172 + i * 60;
            return (
              <g key={i}>
                {/* Capital */}
                <path d={`M${x - 15} 178h30M${x - 12} 190h24`} />
                {/* Shaft, with a fluting line so it isn't a bare rectangle */}
                <path d={`M${x - 11} 190v130M${x + 11} 190v130`} />
                <path d={`M${x} 196v118`} opacity="0.5" strokeDasharray="2 5" />
                {/* Base */}
                <path d={`M${x - 14} 320h28M${x - 17} 330h34`} />
              </g>
            );
          })}
        </g>

        {/* Stylobate and steps */}
        <g opacity="0.10" strokeWidth="1.4">
          <path d="M132 330H508" />
          <path d="M120 344H520" />
          <path d="M108 358H532" />
          <path d="M96 372H544" />
          <path d="M84 386H556" />
        </g>

        {/* Wash so the plate rises out of the bottom and is gone by the
            time it reaches the headline */}
        <rect
          x="0"
          y="0"
          width="560"
          height="420"
          fill="url(#lb-fade)"
          stroke="none"
        />
        <defs>
          <linearGradient id="lb-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--paper)" stopOpacity="0.95" />
            <stop offset="38%" stopColor="var(--paper)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--paper)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
