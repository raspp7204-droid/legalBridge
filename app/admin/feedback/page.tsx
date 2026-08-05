import Link from "next/link";
import {
  Lightbulb,
  TriangleAlert,
  Heart,
  Inbox,
  ArrowRight,
  Check,
} from "lucide-react";
import type { FeedbackKind } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { ActionButton } from "@/components/action-button";
import { toggleHandled } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Suggestions — LawNest" };

const KIND: Record<
  FeedbackKind,
  { label: string; icon: typeof Lightbulb; tone: string }
> = {
  SUGGESTION: { label: "Idea", icon: Lightbulb, tone: "text-accent" },
  ISSUE: { label: "Problem", icon: TriangleAlert, tone: "text-danger" },
  PRAISE: { label: "Good", icon: Heart, tone: "text-verified" },
};

const stamp = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(d);

export default async function AdminFeedback() {
  await requireAdmin();

  const rows = await db.feedback.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const open = rows.filter((r) => !r.handled);
  const counts = (["SUGGESTION", "ISSUE", "PRAISE"] as const).map((k) => ({
    kind: k,
    n: rows.filter((r) => r.kind === k).length,
  }));

  return (
    <main className="container container-wide section-tight">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label text-muted">Admin · suggestion box</p>
          <h1 className="mt-3 text-[2rem] sm:text-[3rem]">
            What people are <span className="tone-accent">telling us</span>
          </h1>
          <p className="mt-3 max-w-2xl text-slate">
            Everything sent through the suggestion box, newest unread first.
            Marking one read clears it out of the queue without deleting it.
          </p>
        </div>
        <Link
          href="/feedback"
          className="mono-label flex items-center gap-1 text-accent hover:underline"
        >
          See the public form
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Counts */}
      <div className="mt-9 grid gap-3 sm:grid-cols-4">
        <div className="card p-5">
          <span className="flex size-9 items-center justify-center rounded-lg border border-rule bg-accent-bg">
            <Inbox className="size-4 text-accent" strokeWidth={2} />
          </span>
          <p className="mono-label mt-4 text-muted">Unread</p>
          <p className="font-mono-num mt-1 text-3xl text-accent">
            {open.length}
          </p>
          <p className="mono-label mt-1 text-muted">
            of {rows.length} received
          </p>
        </div>

        {counts.map(({ kind, n }) => {
          const meta = KIND[kind];
          return (
            <div key={kind} className="card p-5">
              <span className="flex size-9 items-center justify-center rounded-lg border border-rule bg-surface-2">
                <meta.icon className={`size-4 ${meta.tone}`} strokeWidth={2} />
              </span>
              <p className="mono-label mt-4 text-muted">{meta.label}</p>
              <p className="font-mono-num mt-1 text-3xl">{n}</p>
              <p className="mono-label mt-1 text-muted">
                {rows.length
                  ? `${Math.round((n / rows.length) * 100)}% of all`
                  : "nothing yet"}
              </p>
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing in the box yet"
            body="Suggestions sent from the footer link land here. Send one yourself to see how it reads."
            actionHref="/feedback"
            actionLabel="Open the form"
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((r) => {
            const meta = KIND[r.kind];
            return (
              <li
                key={r.id}
                className={`card p-5 ${r.handled ? "opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="mono-label flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={`inline-flex items-center gap-1.5 ${meta.tone}`}
                      >
                        <meta.icon className="size-3.5" strokeWidth={2.5} />
                        {meta.label}
                      </span>
                      <span className="text-muted" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-muted">{stamp(r.createdAt)}</span>
                      {r.role && (
                        <>
                          <span className="text-muted" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-muted">{r.role}</span>
                        </>
                      )}
                      {r.page && (
                        <>
                          <span className="text-muted" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-muted">from {r.page}</span>
                        </>
                      )}
                    </p>

                    <p className="mt-3 leading-relaxed whitespace-pre-line text-ink">
                      {r.body}
                    </p>

                    <p className="mono-label mt-3 text-muted">
                      {r.name || "Anonymous"}
                      {r.email ? ` · ${r.email}` : ""}
                    </p>
                  </div>

                  <form action={toggleHandled} className="shrink-0">
                    <input type="hidden" name="id" value={r.id} />
                    <ActionButton
                      label={r.handled ? "Read" : "Mark read"}
                      pendingLabel={r.handled ? "Reopening…" : "Marking…"}
                      icon={r.handled ? <Check className="size-3.5" strokeWidth={3} /> : undefined}
                      variant="quiet"
                      size="sm"
                    />
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
