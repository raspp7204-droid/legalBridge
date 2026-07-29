import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { signInAsClient } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in — LawNest" };

export default async function ClientLogin() {
  const clients = await db.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { phone: "asc" },
    select: { id: true, name: true, avatar: true, phone: true },
  });

  return (
    <main className="band-alt">
      <div className="container container-narrow section-tight">
        <div className="mx-auto w-full max-w-[720px]">
          <p className="mono-label text-muted">For clients</p>
          <h1 className="mt-3 text-[2.25rem] sm:text-[2.75rem]">
            Client <span className="tone-accent">sign-in</span>
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-slate">
            Sign in to see your consultations, open a chat, or join the video
            room.
          </p>
          <p className="mono-label mt-3 flex items-center gap-2 text-muted">
            <ShieldCheck className="size-3.5 text-verified" strokeWidth={2.5} />
            Demo sign-in · no password
          </p>

          <form action={signInAsClient} className="card mt-8 overflow-hidden">
            <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
            <ul className="divide-y divide-rule">
              {clients.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="submit"
                    name="userId"
                    value={c.id}
                    className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 sm:px-5"
                  >
                    <Image
                      src={c.avatar}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 shrink-0 rounded-full object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-display block truncate text-[0.95rem]">
                        Sign in as {c.name}
                      </span>
                      <span className="mono-label block truncate text-muted">
                        {c.phone}
                        {i === 0 && " · demo persona"}
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
            Are you an advocate?{" "}
            <Link href="/lawyer/login" className="text-accent hover:underline">
              Advocate sign-in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
