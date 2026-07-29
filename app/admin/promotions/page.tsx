import Image from "next/image";
import Link from "next/link";
import { Megaphone, IndianRupee, LayoutGrid, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatRupees } from "@/lib/money";
import {
  TIER_PRICE,
  TIER_LABEL,
  PROMO_INVENTORY,
  isActivePromo,
  monthlyRevenue,
} from "@/lib/promotions";
import { savePromotion, togglePromotion } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Promotions — LawNest" };

const TIERS = ["NONE", "BASIC", "FEATURED", "SPOTLIGHT"] as const;

function isoDate(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function AdminPromotions() {
  await requireAdmin();

  const advocates = await db.lawyerProfile.findMany({
    where: { status: "VERIFIED" },
    orderBy: [
      { promoted: "desc" },
      { promotedRank: { sort: "asc", nulls: "last" } },
      { rating: "desc" },
    ],
    include: { user: { select: { name: true, avatar: true } } },
  });

  const active = advocates.filter(isActivePromo);
  const mrr = monthlyRevenue(advocates);

  return (
    <main className="container container-wide section-tight">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label text-muted">Admin · revenue</p>
          <h1 className="mt-3 text-[2.5rem] sm:text-[3rem]">
            Paid <span className="tone-accent">placements</span>
          </h1>
          <p className="mt-3 max-w-2xl text-slate">
            Advocates pay to rank above organic results. Every promoted listing
            carries a PROMOTED label, and paid placement only reorders advocates
            who already match the client&apos;s filters.
          </p>
        </div>
        <Link
          href="/lawyers"
          className="mono-label flex items-center gap-1 text-accent hover:underline"
        >
          See it live on the listing
          <ArrowRight className="size-3.5" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Revenue summary */}
      <div className="mt-9 grid gap-3 sm:grid-cols-3">
        <div className="card p-5">
          <span className="flex size-9 items-center justify-center rounded-lg border border-rule bg-accent-bg">
            <IndianRupee className="size-4 text-accent" strokeWidth={2} />
          </span>
          <p className="mono-label mt-4 text-muted">Promotion MRR</p>
          <p className="font-mono-num mt-1 text-3xl text-accent">
            {formatRupees(mrr)}
          </p>
          <p className="mono-label mt-1 text-muted">per month, recurring</p>
        </div>

        <div className="card p-5">
          <span className="flex size-9 items-center justify-center rounded-lg border border-rule bg-accent-bg">
            <Megaphone className="size-4 text-accent" strokeWidth={2} />
          </span>
          <p className="mono-label mt-4 text-muted">Active promotions</p>
          <p className="font-mono-num mt-1 text-3xl">{active.length}</p>
          <p className="mono-label mt-1 text-muted">
            {active.map((a) => TIER_LABEL[a.promotedTier]).join(" · ") || "none live"}
          </p>
        </div>

        <div className="card p-5">
          <span className="flex size-9 items-center justify-center rounded-lg border border-rule bg-accent-bg">
            <LayoutGrid className="size-4 text-accent" strokeWidth={2} />
          </span>
          <p className="mono-label mt-4 text-muted">Slots filled</p>
          <p className="font-mono-num mt-1 text-3xl">
            {active.length}
            <span className="text-muted"> / {PROMO_INVENTORY}</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${Math.min(100, (active.length / PROMO_INVENTORY) * 100)}%`,
              }}
            />
          </div>
          <p className="mono-label mt-2 text-muted">
            {Math.max(0, PROMO_INVENTORY - active.length)} available to sell
          </p>
        </div>
      </div>

      {/* Rate card */}
      <div className="card mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
        <p className="mono-label text-muted">Rate card</p>
        {(["BASIC", "FEATURED", "SPOTLIGHT"] as const).map((t) => (
          <p key={t} className="mono-label text-ink">
            {TIER_LABEL[t]}{" "}
            <span className="font-mono-num text-accent">
              {formatRupees(TIER_PRICE[t])}
            </span>
            <span className="text-muted"> /mo</span>
          </p>
        ))}
      </div>

      {/* The table */}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-rule">
              {[
                "Advocate",
                "Tier",
                "Rank",
                "Runs until",
                "Monthly",
                "Status",
                "",
              ].map((h) => (
                <th key={h} className="mono-label px-4 py-3 text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {advocates.map((a) => {
              const live = isActivePromo(a);
              return (
                <tr key={a.id} className="border-b border-rule last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={a.user.avatar}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm">{a.user.name}</p>
                        <p className="mono-label truncate text-muted">
                          {a.city} · {a.tier}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      form={`promo-${a.id}`}
                      name="tier"
                      defaultValue={a.promotedTier}
                      className="rounded-lg border border-rule bg-surface-2 px-2.5 py-1.5 text-sm"
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {TIER_LABEL[t]}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <input
                      form={`promo-${a.id}`}
                      name="rank"
                      type="number"
                      min={1}
                      max={99}
                      defaultValue={a.promotedRank ?? ""}
                      placeholder="—"
                      className="font-mono-num w-16 rounded-lg border border-rule bg-surface-2 px-2.5 py-1.5 text-sm"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      form={`promo-${a.id}`}
                      name="until"
                      type="date"
                      defaultValue={isoDate(a.promotedUntil)}
                      className="font-mono-num rounded-lg border border-rule bg-surface-2 px-2.5 py-1.5 text-sm"
                    />
                  </td>

                  <td className="font-mono-num px-4 py-3 text-sm">
                    {a.promotedTier === "NONE"
                      ? "—"
                      : formatRupees(TIER_PRICE[a.promotedTier])}
                  </td>

                  <td className="px-4 py-3">
                    {live ? (
                      <span className="mono-label rounded-full border border-verified/40 px-2 py-1 text-verified">
                        Live
                      </span>
                    ) : a.promoted ? (
                      <span className="mono-label rounded-full border border-rule px-2 py-1 text-muted">
                        Expired
                      </span>
                    ) : (
                      <span className="mono-label text-muted">Organic</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <form action={savePromotion} id={`promo-${a.id}`}>
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className="mono-label rounded-full border border-rule px-3 py-1.5 transition-colors hover:border-accent/40 hover:text-accent"
                        >
                          Save
                        </button>
                      </form>
                      <form action={togglePromotion}>
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className={`mono-label rounded-full px-3 py-1.5 transition-colors ${
                            a.promoted
                              ? "border border-rule text-muted hover:text-ink"
                              : "btn-primary"
                          }`}
                        >
                          {a.promoted ? "Turn off" : "Promote"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mono-label mt-6 text-muted">
        Promoted advocates appear only when they match the client&apos;s active
        filters · expired campaigns fall back to organic automatically
      </p>
    </main>
  );
}
