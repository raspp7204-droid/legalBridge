import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatRupees } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "All advocates — LawNest" };

const STATUS_STYLE = {
  VERIFIED: "border-verified/40 text-verified",
  PENDING: "border-accent/35 text-accent",
  REJECTED: "border-danger/40 text-danger",
} as const;

export default async function AdminLawyers() {
  const lawyers = await db.lawyerProfile.findMany({
    orderBy: [{ status: "asc" }, { rating: "desc" }],
    include: { user: { select: { name: true, avatar: true } } },
  });

  return (
    <main className="container container-wide section-tight">
      <p className="mono-label text-muted">Admin</p>
      <h1 className="mt-3 text-[2.5rem] sm:text-[3rem]">
        All <span className="tone-accent">advocates</span>
      </h1>
      <p className="mt-3 text-muted">{lawyers.length} on the platform</p>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-rule text-left">
              {["Advocate", "City", "Court", "BCI", "Tier", "Fee", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="mono-label px-4 py-3 font-normal text-muted"
                  >
                    {h}
                  </th>
                ),
              )}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
