import Link from "next/link";
import {
  ArrowRight,
  Check,
  MessagesSquare,
  Search,
  CreditCard,
  MessageSquareText,
  Quote,
} from "lucide-react";
import { db } from "@/lib/db";
import { blockLawyers } from "@/lib/auth";
import { Starfield } from "@/components/starfield";
import { Engraving } from "@/components/engraving";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { AskAiButton } from "@/components/ask-ai-button";
import { CategoryTile } from "@/components/category-tile";
import { LawyerCard, LawyerCardCompact } from "@/components/lawyer-card";
import { lawyerCardSelect } from "@/lib/lawyers";
import { formatRupees, TIER_FEE } from "@/lib/money";

export const dynamic = "force-dynamic";

const LADDER = [
  { tier: "LOWER", fee: 399, note: "2–5 yrs · district courts" },
  { tier: "MIDDLE", fee: 549, note: "6–12 yrs · sessions & high court" },
  { tier: "HIGH", fee: 799, note: "13+ yrs · senior counsel" },
];

/* The tickmark strip along the foot of the hero — five promises, each one
   something the visitor can check on the very next page. */
const PROMISES = [
  "Bar Council verified",
  "Fixed fee, no hourly billing",
  "Fee split shown before you pay",
  "Chat + video consultation",
  "Rewards on every booking",
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
    title: "Chat with your advocate",
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
  // Advocates do not browse or book advocates (lib/auth.ts).
  await blockLawyers();
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
      ...lawyerCardSelect(),
    }),
    db.lawyerProfile.count({ where: { status: "VERIFIED", online: true } }),
  ]);

  // Marketplace numbers — advocate, court and city counts are all live.
  const [verifiedCount, courts, cities] = await Promise.all([
    db.lawyerProfile.count({ where: { status: "VERIFIED" } }),
    db.lawyerProfile.findMany({
      where: { status: "VERIFIED" },
      select: { court: true },
      distinct: ["court"],
    }),
    db.lawyerProfile.findMany({
      where: { status: "VERIFIED" },
      select: { city: true },
      distinct: ["city"],
    }),
  ]);

  /* The market, then the platform. The first two are public sector figures
     and are labelled as such under the grid; the last two are live counts
     out of the database. */
  const stats = [
    {
      value: "5 Cr+",
      body: "cases pending across Indian courts — most people never speak to an advocate at all",
    },
    {
      value: "15 lakh+",
      body: "advocates enrolled with State Bar Councils, and no honest way to price one",
    },
    {
      value: String(verifiedCount),
      body: `advocates enrolment-verified on LawNest, across ${courts.length} courts in ${cities.length} cities`,
    },
    {
      value: formatRupees(TIER_FEE.LOWER),
      body: "the fixed floor for 30 minutes — no hourly billing, no surprise fee",
    },
  ];

  return (
    <main>
      {/* Hero — a laptop screen's worth: the promise, the eight matters as
          chips, three ways in, the live advocate panel, and a tickmark strip
          of what you get, ruled off along the foot. */}
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop />

        <div className="container relative flex flex-col justify-center pt-10 pb-10 sm:pt-14 lg:min-h-[calc(100vh-var(--header-h)-var(--strip-h))] lg:pt-12 lg:pb-10">
          {/* 1.25/0.75 rather than an even split: the copy column has to hold
              three CTAs on one row before the panel needs the space. */}
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-14">
            {/* Copy */}
            <div>
              <div className="animate-rise inline-flex items-center gap-2.5">
                <span className="relative flex size-2">
                  <span className="animate-pulse-dot absolute inline-flex size-2 rounded-full bg-accent" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                <span className="mono-label text-accent">
                  Live now · {onlineCount} advocates online
                </span>
              </div>

              <h1 className="animate-rise mt-5 max-w-[15ch] text-balance">
                Know what the law says,{" "}
                <span className="tone-accent">before</span> you pay.
              </h1>

              <p
                className="animate-rise mt-6 max-w-xl text-lg leading-relaxed text-slate"
                style={{ animationDelay: "80ms" }}
              >
                Verified advocates across India at a fixed fee. Thirty minutes of
                real chat with an advocate who practises your matter — and you
                see exactly how the fee splits before you book.
              </p>

              {/* The eight matters, as chips — the fastest route into the
                  listing without making the visitor read a grid first. */}
              <div
                className="animate-rise mt-7 flex flex-wrap gap-2"
                style={{ animationDelay: "120ms" }}
              >
                {categories.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`/lawyers?category=${c.slug}`}
                    /* Eight chips cost five rows at 375px and push the CTAs
                       under the fold — the last two hide on phones, where the
                       category grid is a short scroll away anyway. */
                    className={`chip-matter ${i >= 6 ? "max-sm:hidden" : ""}`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>

              <div
                className="animate-rise mt-8 flex flex-wrap items-center gap-3"
                style={{ animationDelay: "160ms" }}
              >
                <Link
                  href="/lawyers"
                  className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium"
                >
                  Find an advocate
                  <ArrowRight className="size-4" strokeWidth={2.5} />
                </Link>
                <Link
                  href="/categories"
                  className="btn-secondary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium"
                >
                  Explore the platform
                </Link>
                {/* Opens the floating assistant in place — no navigation, so
                    the demo can ask a question without leaving the landing. */}
                <AskAiButton className="btn-quiet inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium" />
              </div>
            </div>

            {/* Advocates online now */}
            <aside
              className="animate-rise card p-4 sm:p-5"
              style={{ animationDelay: "200ms" }}
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
                {/* The next three appear in "Online right now" below, so
                    nobody shows up twice on this page. */}
                {featured.slice(0, 2).map((l) => (
                  <LawyerCardCompact key={l.id} lawyer={l} />
                ))}
              </div>

              <p className="mt-4 border-t border-rule pt-3 text-sm leading-relaxed text-slate">
                Every advocate here is enrolment-verified against the Bar Council
                register before they can take a consultation.
              </p>
            </aside>
          </div>

          {/* What you get, ruled off along the foot of the hero */}
          <ul
            className="animate-rise mt-11 flex flex-wrap gap-x-7 gap-y-3 border-t border-rule pt-6 lg:mt-12"
            style={{ animationDelay: "260ms" }}
          >
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-slate">
                <Check className="size-4 shrink-0 text-accent" strokeWidth={2.5} />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The claim, priced. The ladder used to sit in the hero; it earns more
          room here, directly under the market numbers that set it up. */}
      <section
        id="pricing"
        className="relative scroll-mt-[calc(var(--header-h)+var(--strip-h))] overflow-hidden"
      >
        <Engraving side="right" />
        <div className="container section-tight relative">
          <p className="mono-label text-muted">Why this matters</p>
          <h2 className="mt-4 max-w-2xl">
            Legal help in India is{" "}
            <span className="tone-accent">unpriced</span>, not unavailable
          </h2>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.value} className="card p-5">
                <dt className="font-display text-3xl text-ink">{s.value}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-slate">
                  {s.body}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mono-label mt-5 text-muted">
            Sector figures · National Judicial Data Grid, Bar Council of India
          </p>

          <p className="mt-12 max-w-2xl leading-relaxed text-slate">
            So we priced it. Three tiers, one fixed fee each — what you pay
            depends on how senior an advocate you want, never on how urgent your
            problem sounds on the phone.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {LADDER.map((t) => (
              <div key={t.tier} className="card overflow-hidden">
                <div className="h-[3px] w-full bg-accent" aria-hidden="true" />
                <div className="p-5 sm:p-6">
                  <p className="mono-label text-muted">{t.tier}</p>
                  <p className="font-mono-num mt-2 text-3xl text-accent">
                    ₹{t.fee}
                  </p>
                  <p className="mt-2 text-sm text-slate">{t.note}</p>
                </div>
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

      {/* Online now — ranked on rating and availability, never on payment */}
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

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {featured.slice(2, 5).map((l) => (
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
      <section className="relative overflow-hidden pb-8">
        <Engraving side="left" />
        <div className="container relative">
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
        </div>
      </section>
    </main>
  );
}
