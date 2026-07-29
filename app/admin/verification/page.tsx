import Image from "next/image";
import { FileText, Check, X } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/empty-state";
import { approveLawyer, rejectLawyer } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Verification queue — LegalBridge" };

const DOCS = ["Bar Council certificate", "Photo ID", "Practice address proof"];

export default async function VerificationQueue() {
  const pending = await db.lawyerProfile.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { name: true, avatar: true } },
      categories: { select: { slug: true, name: true } },
    },
    orderBy: { years: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="mono-label text-muted">Admin</p>
      <h1 className="mt-3 text-[2.5rem] sm:text-[3rem]">
        Verification <span className="tone-accent">queue</span>
      </h1>
      <p className="mt-3 text-muted">
        {pending.length} advocate{pending.length === 1 ? "" : "s"} awaiting
        review. Approving publishes them to the listing immediately.
      </p>

      {pending.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Queue is clear"
            body="Every application has been reviewed. New applications appear here automatically."
            actionHref="/admin"
            actionLabel="Back to admin"
          />
        </div>
      ) : (
        <div className="mt-10 space-y-5">
          {pending.map((l) => (
            <article key={l.id} className="card p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <Image
                  src={l.user.avatar}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl">{l.user.name}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {l.court} · {l.city} · {l.years} yrs
                  </p>
                  <p className="mono-label mt-2 text-muted">
                    BCI <span className="text-text">{l.bciNumber}</span>
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-text/85">
                {l.bio}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {l.categories.map((c) => (
                  <span
                    key={c.slug}
                    className="rounded-md border border-rule bg-surface-2 px-2 py-1 text-xs text-text/85"
                  >
                    {c.name}
                  </span>
                ))}
              </div>

              {/* Static placeholder document cards (CLAUDE.md §3) */}
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {DOCS.map((d) => (
                  <div
                    key={d}
                    className="flex items-center gap-2 rounded-lg border border-rule bg-surface-2 px-3 py-2.5"
                  >
                    <FileText className="size-4 shrink-0 text-muted" strokeWidth={2} />
                    <span className="truncate text-xs text-text/85">{d}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-rule pt-5 sm:flex-row sm:items-end">
                <form action={approveLawyer} className="flex flex-1 gap-3">
                  <input type="hidden" name="id" value={l.id} />
                  <div className="flex-1">
                    <label
                      htmlFor={`tier-${l.id}`}
                      className="mono-label text-muted"
                    >
                      Assign tier
                    </label>
                    <select
                      id={`tier-${l.id}`}
                      name="tier"
                      defaultValue="MIDDLE"
                      className="mt-2 w-full rounded-lg border border-rule bg-bg px-3 py-2.5 text-sm"
                    >
                      <option value="LOWER">LOWER · ₹399</option>
                      <option value="MIDDLE">MIDDLE · ₹549</option>
                      <option value="HIGH">HIGH · ₹799</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="cta-brass mono-label flex h-[42px] shrink-0 items-center gap-1.5 self-end rounded-full px-5"
                  >
                    <Check className="size-4" strokeWidth={2.5} />
                    Approve
                  </button>
                </form>

                <form action={rejectLawyer}>
                  <input type="hidden" name="id" value={l.id} />
                  <button
                    type="submit"
                    className="mono-label flex h-[42px] items-center gap-1.5 rounded-full border border-danger/40 px-5 text-danger transition-colors hover:bg-danger/10"
                  >
                    <X className="size-4" strokeWidth={2.5} />
                    Reject
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
