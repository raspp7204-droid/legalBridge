import Image from "next/image";
import Link from "next/link";
import { Pencil, Check } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatRupees } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "All advocates — LawNest" };

const STATUS_STYLE = {
  VERIFIED: "border-verified/40 text-verified",
  PENDING: "border-accent/35 text-accent",
  REJECTED: "border-danger/40 text-danger",
} as const;

export default async function AdminLawyers({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const lawyers = await db.lawyerProfile.findMany({
    orderBy: [{ status: "asc" }, { rating: "desc" }],
    include: { user: { select: { name: true, avatar: true } } },
  });

  return (
    <main className="container container-wide section-tight">
      <p className="mono-label text-muted">Admin</p>
      <h1 className="mt-3 text-[2rem] sm:text-[3rem]">
        All <span className="tone-accent">advocates</span>
      </h1>
      <p className="mt-3 text-muted">{lawyers.length} on the platform</p>

      {sp.deleted && (
        <p className="mono-label mt-6 flex items-center gap-2 rounded-lg border border-verified/40 bg-surface px-4 py-3 text-verified">
          <Check className="size-3.5" strokeWidth={3} />
          Advocate deleted, along with their bookings and account
        </p>
      )}

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-rule text-left">
              {[
                "Advocate",
                "City",
                "Court",
                "BCI",
                "Tier",
                "Fee",
                "Status",
                "",
              ].map((h, i) => (
                <th
                  key={h || i}
                  className="mono-label px-4 py-3 font-normal text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lawyers.map((l) => (
              <tr key={l.id} className="border-b border-rule last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/lawyers/${l.id}`}
                    className="flex items-center gap-2.5 transition-colors hover:text-accent"
                  >
                    <Image
                      src={l.user.avatar}
                      alt=""
                      width={28}
                      height={28}
                      className="size-7 rounded-full object-cover"
                    />
                    {l.user.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{l.city}</td>
                <td className="px-4 py-3 text-muted">{l.court}</td>
                <td className="font-mono-num px-4 py-3 text-muted">
                  {l.bciNumber}
                </td>
                <td className="mono-label px-4 py-3">{l.tier}</td>
                <td className="font-mono-num px-4 py-3 text-accent">
                  {formatRupees(l.fee)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`mono-label rounded-full border px-2 py-1 ${STATUS_STYLE[l.status]}`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/lawyers/${l.id}`}
                    className="mono-label inline-flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    <Pencil className="size-3" strokeWidth={2.5} />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
