/** Mirrors the listing's shape — rail on the left, cards on the right — so the
    page does not jump when the real thing arrives. */
export default function Loading() {
  return (
    <div className="container container-wide section-tight">
      <div className="h-7 w-52 animate-pulse rounded-full bg-rule" />
      <div className="mt-5 h-12 w-2/3 animate-pulse rounded-lg bg-rule sm:h-14" />
      <div className="mt-3 h-4 w-64 animate-pulse rounded-full bg-rule" />

      <div className="mt-8 grid gap-7 lg:grid-cols-[264px_1fr]">
        <div className="hidden lg:block">
          <div className="card h-[28rem] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading advocates…</span>
    </div>
  );
}
