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
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
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
          className="cta-brass inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
        >
          <RotateCw className="size-4" strokeWidth={2.5} />
          Try again
        </button>
        <Link
          href="/lawyers"
          className="inline-flex items-center rounded-full border border-rule px-5 py-3 text-sm transition-colors hover:border-brass/50"
        >
          Browse advocates
        </Link>
      </div>
    </main>
  );
}
