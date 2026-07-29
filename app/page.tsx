import Link from "next/link";
import {
  ArrowRight,
  MessagesSquare,
  Search,
  CreditCard,
  MessageSquareText,
  Quote,
} from "lucide-react";
import { db } from "@/lib/db";
import { Starfield } from "@/components/starfield";
import { LiveStrip } from "@/components/live-strip";
import { CategoryTile } from "@/components/category-tile";
import { LawyerCard, LawyerCardCompact } from "@/components/lawyer-card";
import { lawyerCardSelect } from "@/lib/lawyers";

export const dynamic = "force-dynamic";

const LADDER = [
  { tier: "LOWER", fee: 399, note: "2–5 yrs · district courts" },
  { tier: "MIDDLE", fee: 549, note: "6–12 yrs · sessions & high court" },
  { tier: "HIGH", fee: 799, note: "13+ yrs · senior counsel" },
];

const STEPS = [
  {
    icon: Search,
    title: "Pick your matter",
    body: "Choose the problem in plain words. We show advocates who actually practise it.",
  },
  {
    icon: CreditCard,
    title: "See the fee, then pay",
    body: "One fixed price for 30 minutes, with the advocate's share shown before you pay by UPI.",
  },
  {
    icon: MessageSquareText,
    title: "Chat or video",
    body: "The consultation opens the moment payment lands. Talk it through, then decide.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I had three quotes from local lawyers, all different, none written down. Here the ₹549 was on screen before I paid.",
    name: "Ritu Bansal",
    matter: "Cheque bounce · Jaipur",
  },
  {
    quote:
      "My brother filed for mutation behind my back. Thirty minutes told me exactly which office to go to and what to carry.",
    name: "Aarav Mehta",
    matter: "Property & land · Bengaluru",
  },
  {
    quote:
      "I was let go without notice and had no idea I could still claim my dues. The advocate walked me through it the same evening.",
    name: "Sandeep Kulkarni",
    matter: "Employment · Pune",
  },
];

const PRESS = [
  "The Economic Times",
  "YourStory",
  "Inc42",
  "LiveLaw",
  "Bar & Bench",
];

export default async function Home() {
  const [categories, featured, onlineCount] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { lawyers: { where: { status: "VERIFIED" } } } },
      },
    }),
    db.lawyerProfile.findMany({
      where: { status: "VERIFIED", online: true },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: 6,
      ...lawyerCardSelect,
    }),
    db.lawyerProfile.count({ where: { status: "VERIFIED", online: true } }),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Starfield />
        {/* Two-region hero: copy + CTAs left, live marketplace panel right.
            Collapses to one column below 900px (RETHEME.md Task 3). */}
        <div className="container section relative grid gap-12 min-[900px]:grid-cols-[1.05fr_0.95fr] min-[900px]:items-center">
          <div className="min-[900px]:col-start-1 min-[900px]:row-start-1">
            <div className="animate-rise">
              <LiveStrip online={onlineCount} />
            </div>

            <h1 className="animate-rise mt-6">
              Know what the law says,{" "}
              <span className="tone-accent">before</span> you pay.
            </h1>

            <p
              className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-slate"
              style={{ animationDelay: "80ms" }}
            >
              Verified advocates across India at a fixed fee. Thirty minutes by
              chat or video — and you see exactly how the fee splits before you
              book.
            </p>

            <div
              className="animate-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "160ms" }}
            >
              <Link
                href="/lawyers"
                className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
              >
                Find an advocate
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="/categories"
                className="btn-secondary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
              >
                Browse legal matters
              </Link>
            </div>
          </div>

          {/* Advocates online now — fills the right column */}
          <aside
            className="animate-rise card p-4 min-[900px]:col-start-2 min-[900px]:row-span-2 min-[900px]:row-start-1 min-[900px]:self-center sm:p-5"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[1.25rem]">Advocates online now</h2>
              <Link
                href="/lawyers?online=1"
                className="mono-label shrink-0 text-accent hover:underline"
              >
                See all
              </Link>
            </div>

            <p className="mono-label mt-1.5 flex items-center gap-2 text-verified">
              <span className="relative flex size-2">
                <span className="animate-pulse-dot absolute inline-flex size-2 rounded-full bg-verified" />
                <span className="relative inline-flex size-2 rounded-full bg-verified" />
              </span>
              {onlineCount} online · average reply under 5 min
            </p>

            <div className="mt-4 space-y-2.5">
              {featured.slice(0, 2).map((l) => (
                <LawyerCardCompact key={l.id} lawyer={l} />
              ))}
            </div>

            <p className="mt-4 border-t border-rule pt-3 text-sm text-slate">
              Every advocate here is enrolment-verified against the Bar Council
              register before they can take a consultation.
            </p>
          </aside>

          {/* Price ladder */}
          <div
            className="animate-rise grid gap-3 sm:grid-cols-3 min-[900px]:col-start-1 min-[900px]:row-start-2"
            style={{ animationDelay: "240ms" }}
          >
            {LADDER.map((t) => (
              <div key={t.tier} className="card p-5">
                <p className="mono-label text-muted">{t.tier}</p>
                <p className="font-mono-num mt-2 text-3xl text-accent">
                  ₹{t.fee}
                </p>
                <p className="mt-2 text-sm text-slate">{t.note}</p>
              </div>
            ))}
            <p className="mono-label text-muted sm:col-span-3">
              Per 30-minute consultation · no hourly billing
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative overflow-hidden">
        <Starfield />
        <div className="container section relative">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2>What do you need help with?</h2>
            <Link
              href="/categories"
              className="mono-label flex items-center gap-1 text-accent hover:underline"
            >
              All matters
              <ArrowRight className="size-3.5" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryTile
                key={c.id}
                slug={c.slug}
                name={c.name}
                icon={c.icon}
                count={c._count.lawyers}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container section">
        <h2>How it works</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card p-6">
              <span className="mono-label text-accent">0{i + 1}</span>
              <s.icon className="mt-4 size-6 text-accent" strokeWidth={2} />
              <h3 className="mt-4 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured advocates */}
      <section className="container section">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2>Online right now</h2>
            <p className="mt-2 text-slate">
              Verified advocates available for a consultation today.
            </p>
          </div>
          <Link
            href="/lawyers?online=1"
            className="mono-label flex items-center gap-1 text-accent hover:underline"
          >
            See all online
            <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>

        {/* The hero panel already shows the first two — don't repeat them */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(2).map((l) => (
            <LawyerCard key={l.id} lawyer={l} />
          ))}
        </div>
      </section>

      {/* Free assistant band */}
      <section className="container section-tight">
        <div className="card p-6 sm:p-9">
          <div className="h-px w-16 bg-accent" aria-hidden="true" />
          <h2 className="mt-5 flex items-center gap-3">
            <MessagesSquare className="size-6 text-accent" strokeWidth={2} />
            Ask a legal question, free
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate">
            Describe your problem in plain words. The assistant explains what the
            law generally says, points you to the right practice area, and tells
            you plainly when you need a real advocate.
          </p>
          <p className="mono-label mt-6 text-muted">
            Free · not legal advice · bottom-right corner
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container section">
        <h2>What clients say</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card flex flex-col p-6">
              <Quote className="size-5 text-accent" strokeWidth={2} />
              <blockquote className="mt-4 flex-1 leading-relaxed text-slate">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 border-t border-rule pt-4">
                <p className="text-sm">{t.name}</p>
                <p className="mono-label mt-1 text-muted">{t.matter}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Press row */}
      <section className="container pb-8">
        <p className="mono-label text-center text-muted">Featured on</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {PRESS.map((p) => (
            <span
              key={p}
              className="font-display text-lg text-muted/70 transition-colors hover:text-muted"
            >
              {p}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
