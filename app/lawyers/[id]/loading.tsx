/** Two columns, with the sticky fee rail on the right — the same frame the
    profile settles into. */
export default function Loading() {
  return (
    <div className="container section-tight">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center gap-4">
            <div className="size-20 animate-pulse rounded-full bg-rule" />
            <div className="flex-1">
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-rule" />
              <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-rule" />
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded-full bg-rule" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="card h-52 animate-pulse" />
          <div className="card h-72 animate-pulse" />
        </div>
      </div>
      <span className="sr-only">Loading advocate…</span>
    </div>
  );
}
