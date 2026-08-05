export default function Loading() {
  return (
    <div className="container container-narrow section-tight">
      <div className="h-3 w-32 animate-pulse rounded-full bg-rule" />
      <div className="mt-4 h-12 w-1/2 animate-pulse rounded-lg bg-rule" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card h-28 animate-pulse" />
        ))}
      </div>
      <span className="sr-only">Loading your consultations…</span>
    </div>
  );
}
