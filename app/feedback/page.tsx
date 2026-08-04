import { db } from "@/lib/db";
import { getDbUser } from "@/lib/auth";
import { FeedbackForm } from "@/components/feedback-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Suggestions & feedback — LawNest",
  description:
    "Tell LawNest what to build next. Open to clients, advocates and anyone who has used the site.",
};

/**
 * The suggestion box, as its own page rather than a floating widget — the
 * assistant already owns the bottom-right corner, and a second launcher there
 * would fight it on a 375px screen.
 */
export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const [user, sp, received] = await Promise.all([
    getDbUser(),
    searchParams,
    db.feedback.count(),
  ]);

  return (
    <main className="container container-narrow section-tight">
      <p className="mono-label text-muted">Suggestion box</p>
      <h1 className="mt-3 text-[2rem] sm:text-[3rem]">
        Tell us what to <span className="tone-accent">build next</span>
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate">
        LawNest is early enough that one message can change what gets built
        this week. Whether you booked a consultation, practise law, or just
        looked around and left — the thing that annoyed you is the thing we
        want to hear about.
      </p>

      {received > 0 && (
        <p className="mono-label mt-4 text-muted">
          {received} {received === 1 ? "suggestion" : "suggestions"} received so
          far · every one is read
        </p>
      )}

      <div className="mt-9">
        <FeedbackForm
          signedInAs={user?.name ?? null}
          page={sp.from}
        />
      </div>

      <p className="mono-label mt-8 border-t border-rule pt-5 text-muted">
        Do not send confidential case details here. This box is not a
        consultation and it is not covered by privilege — book an advocate for
        anything that matters.
      </p>
    </main>
  );
}
