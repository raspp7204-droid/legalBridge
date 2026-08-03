/**
 * Full-bleed art behind the landing hero — on the ivory page, not over it.
 *
 * Same idea as the gutter Engraving, scaled up to carry a whole hero: ledger
 * hairlines for grain, a courthouse colonnade bled off the right edge, and an
 * engraved seal low-left. Everything is drawn in --ink at 3–7%, so the
 * background stays --paper and nothing behind the copy needs a scrim.
 * Pure SVG + gradients — nothing to load, nothing to blur.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      {/* Ledger rules */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, var(--rule) 0 1px, transparent 1px 38px)",
        }}
      />

      {/* Colonnade — court architecture, bled off the right edge */}
      <svg
        className="absolute inset-y-0 right-0 h-full w-[min(56rem,72%)] text-ink max-md:hidden"
        viewBox="0 0 720 560"
        preserveAspectRatio="xMaxYMid slice"
        fill="none"
        stroke="currentColor"
      >
        <g opacity="0.07" strokeWidth="1.25">
          {/* Pediment */}
          <path d="M96 148 360 44l264 104" />
          <path d="M96 148h528M96 168h528M110 188h500" />
          {/* Columns, arched between */}
          {[150, 246, 342, 438, 534].map((x) => (
            <g key={x}>
              <path d={`M${x} 188v300`} />
              <path d={`M${x + 44} 188v300`} />
              <path d={`M${x + 4} 250a20 20 0 0 1 36 0`} opacity="0.7" />
            </g>
          ))}
          <path d="M110 488h500M96 508h528" />
        </g>

        {/* Fluting — the detail that makes the columns read as stone */}
        <g opacity="0.04" strokeWidth="1">
          {[150, 246, 342, 438, 534].flatMap((x) =>
            [14, 22, 30].map((o) => (
              <path key={`${x}-${o}`} d={`M${x + o} 200v276`} />
            )),
          )}
        </g>
      </svg>

      {/* Engraved seal — scales of justice, low and left */}
      <svg
        className="absolute -left-28 bottom-[-7rem] size-[32rem] text-ink max-lg:hidden"
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
      >
        <g opacity="0.05" strokeWidth="1">
          {[92, 124, 156, 188].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} />
          ))}
        </g>
        <g opacity="0.06" strokeWidth="2" strokeLinecap="round">
          <path d="M200 108v168M164 276h72M120 140h160" />
          <path d="M120 140l-28 56a28 28 0 0 0 56 0z" />
          <path d="M280 140l-28 56a28 28 0 0 0 56 0z" />
          <circle cx="200" cy="130" r="9" />
        </g>
      </svg>

      {/* Paper wash — the texture fades out before it reaches the headline */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(46rem 34rem at 12% 38%, var(--paper) 42%, transparent 100%)",
        }}
      />
    </div>
  );
}
