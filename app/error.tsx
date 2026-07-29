"use client";

import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container section flex flex-col items-center text-center">
      <div className="flex max-w-lg flex-col items-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-danger/40 bg-danger/10">
        <TriangleAlert className="size-5 text-danger" strokeWidth={2} />
      </span>
      <h1 className="mt-6 text-[2rem]">Something went wrong</h1>
      <p className="mt-3 text-muted">
        That page did not load. Try again — if it keeps happening, go back to
        the advocate listing.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
        >
          <RotateCw className="size-4" strokeWidth={2.5} />
          Try again
        </button>
        <Link
          href="/lawyers"
          className="btn-secondary inline-flex items-center rounded-full px-5 py-3 text-sm font-medium"
        >
          Browse advocates
        </Link>
      </div>
      </div>
    </main>
  );
}
