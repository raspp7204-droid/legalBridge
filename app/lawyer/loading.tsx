/** KPI rows, then charts — the advocate console's frame. */
export default function Loading() {
  return (
    <div className="container container-wide section-tight">
      <div className="h-3 w-40 animate-pulse rounded-full bg-rule" />
      <div className="mt-4 h-12 w-2/3 animate-pulse rounded-lg bg-rule" />
      <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card h-28 animate-pulse" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card h-72 animate-pulse" />
        <div className="card h-72 animate-pulse" />
      </div>
      <span className="sr-only">Loading your dashboard…</span>
    </div>
  );
}
