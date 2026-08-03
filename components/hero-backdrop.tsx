/**
 * Full-bleed art behind the landing hero.
 *
 * The brief's reference is a photographic hero, but a stock photo would fight
 * the Daylight Chambers palette and cost a network round-trip on the one page
 * that has to paint instantly on stage. So the "photograph" is drawn: an
 * ink-navy field, a courthouse colonnade bled off the right edge, an oxblood
 * dawn glow, and ledger hairlines for grain. Pure SVG + gradients — nothing to
 * load, nothing to animate.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base field */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0C1424 0%, #17233A 52%, #1F2E4A 100%)",
        }}
      />

      {/* Ledger hairlines — the paper grain, carried over from the light theme */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(244,239,228,0.5) 0 1px, transparent 1px 38px)",
        }}
      />

      {/* Colonnade — court architecture, bled off the right edge */}
      <svg
        className="absolute inset-y-0 right-0 h-full w-[min(58rem,85%)]"
        viewBox="0 0 720 560"
        preserveAspectRatio="xMaxYMid slice"
        fill="none"
        stroke="rgba(244,239,228,1)"
      >
        <g opacity="0.09" strokeWidth="1.25">
          {/* Pediment */}
          <path d="M96 148 360 44l264 104" />
          <path d="M96 148h528M96 168h528M110 188h500" />
          {/* Columns with arches between them */}
          {[150, 246, 342, 438, 534].map((x) => (
            <g key={x}>
              <path d={`M${x} 188v300`} />
              <path d={`M${x + 44} 188v300`} />
              <path
                d={`M${x + 4} 250a20 20 0 0 1 36 0`}
                opacity="0.7"
              />
            </g>
          ))}
          <path d="M110 488h500M96 508h528" />
        </g>

        {/* Fluting — the vertical detail that makes the columns read as stone */}
        <g opacity="0.05" strokeWidth="1">
          {[150, 246, 342, 438, 534].flatMap((x) =>
            [14, 22, 30].map((o) => (
              <path key={`${x}-${o}`} d={`M${x + o} 200v276`} />
            )),
          )}
        </g>
      </svg>

      {/* Engraved seal — scales of justice, low and left */}
      <svg
        className="absolute -left-24 bottom-[-6rem] size-[34rem] max-lg:hidden"
        viewBox="0 0 400 400"
        fill="none"
        stroke="rgba(244,239,228,1)"
      >
        <g opacity="0.07" strokeWidth="1">
          {[92, 124, 156, 188].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} />
          ))}
        </g>
        <g opacity="0.08" strokeWidth="2" strokeLinecap="round">
          <path d="M200 108v168M164 276h72M120 140h160" />
          <path d="M120 140l-28 56a28 28 0 0 0 56 0z" />
          <path d="M280 140l-28 56a28 28 0 0 0 56 0z" />
          <circle cx="200" cy="130" r="9" />
        </g>
      </svg>

      {/* Oxblood dawn glow, top-right — the only warmth in the field */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 40rem at 88% 6%, rgba(158,43,37,0.30), transparent 62%)",
        }}
      />
      {/* Ivory lift behind the headline so copy never sits on flat navy */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(52rem 38rem at 6% 34%, rgba(244,239,228,0.10), transparent 60%)",
        }}
      />

      {/* Vignette + hand-off into the ivory page below */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(12,20,36,0.55), transparent 42%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--paper))",
        }}
      />
    </div>
  );
}
