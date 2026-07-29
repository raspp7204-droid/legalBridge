import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex size-12 items-center justify-center rounded-full border border-rule bg-surface-2">
        <Compass className="size-5 text-muted" strokeWidth={2} />
      </span>
      <h1 className="mt-6 text-[2rem]">Page not found</h1>
      <p className="mt-3 text-muted">
        That link does not lead anywhere. The advocate listing is the best place
        to start.
      </p>
      <Link
        href="/lawyers"
        className="cta-brass mt-8 rounded-full px-5 py-3 text-sm font-medium"
      >
        Find an advocate
      </Link>
    </main>
  );
}
