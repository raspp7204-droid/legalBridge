/** Stat tiles then a table — the shape every admin screen shares. */
export default function Loading() {
  return (
    <div className="container container-wide section-tight">
      <div className="h-3 w-24 animate-pulse rounded-full bg-rule" />
      <div className="mt-4 h-12 w-1/2 animate-pulse rounded-lg bg-rule sm:h-14" />
      <div className="mt-9 grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-32 animate-pulse" />
        ))}
      </div>
      <div className="card mt-6 h-80 animate-pulse" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
