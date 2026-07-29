/** ● LIVE NOW · N advocates online — count comes from the seed, not a guess. */
export function LiveStrip({ online }: { online: number }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-rule bg-surface px-3.5 py-1.5">
      <span className="relative flex size-2">
        <span className="animate-pulse-dot absolute inline-flex size-2 rounded-full bg-live" />
        <span className="relative inline-flex size-2 rounded-full bg-live" />
      </span>
      <span className="mono-label text-text">
        Live now · {online} advocates online
      </span>
    </div>
  );
}
