import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { formatRupees } from "@/lib/money";
import { formatSlotFull } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

export const metadata = { title: "All bookings — LawNest" };

export default async function AdminBookings() {
  await requireAdmin();
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true } },
      lawyer: { include: { user: { select: { name: true } } } },
      _count: { select: { messages: true } },
    },
  });

  return (
    <main className="container container-wide section-tight">
      <p className="mono-label text-muted">Admin</p>
      <h1 className="mt-3 text-[2rem] sm:text-[3rem]">
        All <span className="tone-accent">bookings</span>
      </h1>

      {bookings.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No bookings yet"
            body="Bookings appear here as soon as a client reaches the payment step."
            actionHref="/admin"
            actionLabel="Back to admin"
          />
        </div>
      ) : (
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-rule text-left">
                {[
                  "Ref",
                  "Client",
                  "Advocate",
                  "Slot",
                  "Amount",
                  "Split",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="mono-label px-4 py-3 font-normal text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-rule last:border-0">
                  <td className="font-mono-num px-4 py-3 uppercase text-muted">
                    <Link
                      href={`/consult/${b.id}`}
                      className="transition-colors hover:text-accent"
                    >
                      {b.id.slice(-8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{b.client.name}</td>
                  <td className="px-4 py-3">{b.lawyer.user.name}</td>
                  <td className="font-mono-num px-4 py-3 text-muted">
                    {formatSlotFull(b.slotAt)}
                  </td>
                  <td className="font-mono-num px-4 py-3 text-accent">
                    {formatRupees(b.amount)}
                  </td>
                  <td className="font-mono-num px-4 py-3 text-muted">
                    {formatRupees(b.lawyerCut)} / {formatRupees(b.platformCut)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`mono-label rounded-full border px-2 py-1 ${
                        b.paid
                          ? "border-verified/40 text-verified"
                          : "border-accent/35 text-accent"
                      }`}
                    >
                      {b.paid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
