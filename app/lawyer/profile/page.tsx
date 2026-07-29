import { db } from "@/lib/db";
import { getLawyerProfile } from "@/lib/session";
import { EmptyState } from "@/components/empty-state";
import { SaveButton } from "@/components/save-button";
import { formatRupees } from "@/lib/money";
import { saveProfile } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit profile — LawNest" };

const ALL_LANGUAGES = [
  "Hindi",
  "English",
  "Marathi",
  "Kannada",
  "Tamil",
  "Telugu",
  "Bengali",
  "Gujarati",
  "Malayalam",
  "Punjabi",
  "Urdu",
];

const CITIES = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Hyderabad",
  "Kolkata",
];

export default async function LawyerProfilePage() {
  const profile = await getLawyerProfile();

  if (!profile) {
    return (
      <main className="container section">
        <EmptyState
          title="No advocate profile"
          body="Run pnpm db:seed to create the demo advocate."
          actionHref="/lawyer"
          actionLabel="Back to dashboard"
        />
      </main>
    );
  }

  const [categories, mine] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
    db.lawyerProfile.findUnique({
      where: { id: profile.id },
      select: { categories: { select: { slug: true } } },
    }),
  ]);

  const myCats = new Set(mine?.categories.map((c) => c.slug) ?? []);

  return (
    <main className="container container-narrow section-tight">
      <p className="mono-label text-muted">Advocate</p>
      <h1 className="mt-3 text-[2.5rem] sm:text-[3rem]">
        Edit <span className="tone-accent">profile</span>
      </h1>

      <form action={saveProfile} className="mt-10 space-y-6">
        <div className="card p-5">
          <label htmlFor="bio" className="mono-label text-muted">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={profile.bio}
            className="mt-3 w-full resize-y rounded-lg border border-rule bg-surface-2 px-3 py-2.5 text-[0.95rem] leading-relaxed"
          />
        </div>

        <div className="card p-5">
          <label htmlFor="city" className="mono-label text-muted">
            City
          </label>
          <select
            id="city"
            name="city"
            defaultValue={profile.city}
            className="mt-3 w-full rounded-lg border border-rule bg-surface-2 px-3 py-2.5 text-[0.95rem]"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="card p-5">
          <legend className="mono-label text-muted">Languages</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {ALL_LANGUAGES.map((l) => (
              <label
                key={l}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-rule bg-surface-2 px-3 py-1.5 text-sm has-checked:border-accent has-checked:bg-accent-bg"
              >
                <input
                  type="checkbox"
                  name="languages"
                  value={l}
                  defaultChecked={profile.languages.includes(l)}
                  className="accent-[var(--accent)]"
                />
                {l}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="card p-5">
          <legend className="mono-label text-muted">Practice areas</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <label
                key={c.slug}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-rule bg-surface-2 px-3 py-1.5 text-sm has-checked:border-accent has-checked:bg-accent-bg"
              >
                <input
                  type="checkbox"
                  name="categories"
                  value={c.slug}
                  defaultChecked={myCats.has(c.slug)}
                  className="accent-[var(--accent)]"
                />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="card p-5">
          <p className="mono-label text-muted">Fee &amp; tier</p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono-num text-2xl text-accent">
              {formatRupees(profile.fee)}
            </span>
            <span className="mono-label rounded-full border border-accent/40 px-2 py-0.5 text-accent">
              {profile.tier}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Set by LawNest during verification.
          </p>
        </div>

        <SaveButton />
      </form>
    </main>
  );
}
