export default function Loading() {
  return (
    <div className="container section">
      <div className="h-3 w-28 animate-pulse rounded-full bg-rule" />
      <div className="mt-6 h-12 w-3/4 animate-pulse rounded-lg bg-rule sm:h-16" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-rule" />
      <div className="mt-12 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-32 animate-pulse" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
