import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container section flex flex-col items-center text-center">
      <div className="flex max-w-lg flex-col items-center">
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
        className="btn-primary mt-8 rounded-full px-5 py-3 text-sm font-medium"
      >
        Find an advocate
      </Link>
      </div>
    </main>
  );
}
