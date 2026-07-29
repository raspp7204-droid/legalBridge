import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { formatRupees } from "@/lib/money";
import { signInAsLawyer } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Advocate sign-in — LawNest" };

export default async function LawyerLogin() {
  const advocates = await db.lawyerProfile.findMany({
    where: { status: "VERIFIED" },
    orderBy: [{ tier: "asc" }, { rating: "desc" }],
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  return (
    <main className="band-alt">
      <div className="container container-narrow section-tight">
        <div className="mx-auto w-full max-w-[720px]">
          <p className="mono-label text-muted">For advocates</p>
          <h1 className="mt-3 text-[2.25rem] sm:text-[2.75rem]">
            Advocate <span className="tone-accent">sign-in</span>
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-slate">
            Pick your name to open your chambers dashboard, inbox and profile.
          </p>
          <p className="mono-label mt-3 flex items-center gap-2 text-muted">
            <ShieldCheck className="size-3.5 text-verified" strokeWidth={2.5} />
            Demo sign-in · no password
          </p>

          <form action={signInAsLawyer} className="card mt-8 overflow-hidden">
            <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
            <ul className="divide-y divide-rule">
              {advocates.map((a) => (
                <li key={a.id}>
                  <button
                    type="submit"
                    name="userId"
                    value={a.user.id}
                    className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 sm:px-5"
                  >
                    <Image
                      src={a.user.avatar}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 shrink-0 rounded-full object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-display block truncate text-[0.95rem]">
                        Sign in as {a.user.name}
                      </span>
                      <span className="mono-label block truncate text-muted">
                        {a.court} · {a.city} · {formatRupees(a.fee)}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-muted"
                      strokeWidth={2.5}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </form>

          <p className="mt-6 text-sm text-slate">
            Looking for a lawyer instead?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Client sign-in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
