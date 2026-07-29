import Link from "next/link";
import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-rule bg-surface-2">
        <SearchX className="size-5 text-muted" strokeWidth={2} />
      </span>
      <h3 className="mt-5">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="btn-primary mono-label mt-6 rounded-full px-5 py-2.5"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
