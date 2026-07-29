import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-verified"
      title="Enrolment verified against the Bar Council register"
    >
      <BadgeCheck className="size-4 shrink-0" strokeWidth={2.5} />
      {!compact && <span className="mono-label">Verified</span>}
    </span>
  );
}
