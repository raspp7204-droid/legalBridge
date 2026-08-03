import Link from "next/link";
import Image from "next/image";
import { IdCard, Mail, ArrowRight } from "lucide-react";
import { blockLawyers, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRupees } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = { title: "My account — LawNest" };

export default async function AccountPage() {
  await blockLawyers("/lawyer/profile");
  const user = await requireUser();

  const [count, spend] = await Promise.all([
    db.booking.count({ where: { clientId: user.id, paid: true } }),
    db.booking.aggregate({
      where: { clientId: user.id, paid: true },
      _sum: { amount: true },
    }),
  ]);

  return (
    <main>
      <div className="container container-narrow section-tight">
        <div className="document">
          <p className="mono-label text-muted">Account</p>
          <h1 className="mt-3 text-[2.25rem] sm:text-[2.75rem]">
            {user.name.split(" ")[0]}&apos;s <span className="tone-accent">details</span>
          </h1>

          <div className="card mt-8 overflow-hidden">
            <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
            <div className="p-6">
              <div className="flex items-center gap-4">
                <Image
                  src={user.avatar}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 rounded-full object-cover"
                  unoptimized
                />
                <div className="min-w-0">
                  <p className="font-display truncate text-[1.0625rem]">
                    {user.name}
                  </p>
                  <p className="mono-label flex items-center gap-1.5 truncate text-muted">
                    <Mail className="size-3.5" strokeWidth={2.5} />
                    {user.email ?? "—"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-rule bg-surface-2 p-4">
                <p className="mono-label flex items-center gap-1.5 text-muted">
                  <IdCard className="size-3.5" strokeWidth={2.5} />
                  Your LawNest ID
                </p>
                <p className="font-mono-num mt-2 text-2xl text-ink">
                  {user.clientCode ?? "—"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  Quote this when you contact us about a consultation. It is the
                  only identifier we issue — we never ask for Aadhaar, PAN or any
                  other government ID.
                </p>
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-rule pt-6 sm:grid-cols-2">
                <div>
                  <dt className="mono-label text-muted">Consultations</dt>
                  <dd className="font-mono-num mt-1 text-xl">{count}</dd>
                </div>
                <div>
                  <dt className="mono-label text-muted">Total paid</dt>
                  <dd className="font-mono-num mt-1 text-xl text-accent">
                    {formatRupees(spend._sum.amount ?? 0)}
                  </dd>
                </div>
              </dl>

              <Link
                href="/me"
                className="btn-primary mono-label mt-7 inline-flex items-center gap-2 rounded-full px-5 py-3"
              >
                My consultations
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          <p className="mono-label mt-6 text-center text-muted">
            How we handle your data ·{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              privacy policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
