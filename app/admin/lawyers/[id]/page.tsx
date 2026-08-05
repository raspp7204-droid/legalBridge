import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, TriangleAlert, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SaveButton } from "@/components/save-button";
import { formatRupees, TIER_FEE } from "@/lib/money";
import { AVATAR_PRESETS, ALLOWED_AVATAR_HOSTS } from "@/lib/avatars";
import { updateAvatar, updateLawyer, deleteLawyer } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit advocate — LawNest" };

const TIERS = ["LOWER", "MIDDLE", "HIGH"] as const;
const STATUSES = ["PENDING", "VERIFIED", "REJECTED"] as const;

const field =
  "mt-2 w-full rounded-lg border border-rule bg-surface-2 px-3 py-2.5 text-[0.95rem]";

export default async function AdminEditLawyer({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; photo?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;

  const lawyer = await db.lawyerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, avatar: true, email: true } },
      categories: { select: { name: true } },
      _count: { select: { bookings: true, slots: true } },
    },
  });
  if (!lawyer) notFound();

  const paidBookings = await db.booking.count({
    where: { lawyerId: id, paid: true },
  });

  return (
    <main className="container container-narrow section-tight">
      <Link
        href="/admin/lawyers"
        className="mono-label inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2.5} />
        All advocates
      </Link>

      <p className="mono-label mt-6 text-muted">Admin · edit advocate</p>
      <h1 className="mt-3 text-[2rem] sm:text-[2.75rem]">
        {lawyer.user.name.replace(/^Adv\.\s*/, "")}
      </h1>
      <p className="mono-label mt-3 text-muted">
        {lawyer.user.email ?? "no account email"} · {lawyer._count.bookings}{" "}
        bookings · {lawyer._count.slots} slots
      </p>

      {sp.saved && (
        <p className="mono-label mt-6 flex items-center gap-2 rounded-lg border border-verified/40 bg-surface px-4 py-3 text-verified">
          <Check className="size-3.5" strokeWidth={3} />
          Changes saved and live on the listing
        </p>
      )}
      {sp.photo === "saved" && (
        <p className="mono-label mt-6 flex items-center gap-2 rounded-lg border border-verified/40 bg-surface px-4 py-3 text-verified">
          <Check className="size-3.5" strokeWidth={3} />
          Photo updated
        </p>
      )}
      {sp.photo === "rejected" && (
        <p className="mono-label mt-6 flex items-start gap-2 rounded-lg border border-danger/40 bg-surface px-4 py-3 text-danger">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
          <span>
            That image host is not allowed, so the photo was not changed. Use
            one of {ALLOWED_AVATAR_HOSTS.join(", ")} — any other host is
            refused by the image optimiser and would break the advocate&apos;s
            page.
          </span>
        </p>
      )}

      {/* ---- Photo ---- */}
      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="text-xl">Photo</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          Pick one below, or paste a URL. There is no file upload — the photo is
          a link, and only images from{" "}
          {ALLOWED_AVATAR_HOSTS.map((h) => (
            <span key={h} className="font-mono-num">
              {h}{" "}
            </span>
          ))}
          are accepted.
        </p>

        <div className="mt-5 flex items-center gap-4 border-b border-rule pb-5">
          <Image
            src={lawyer.user.avatar}
            alt=""
            width={64}
            height={64}
            className="size-16 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="mono-label text-muted">Currently</p>
            <p className="mt-1 truncate text-sm text-slate">
              {lawyer.user.avatar}
            </p>
          </div>
        </div>

        {/* Each preset is its own submit button — one click, no JS. */}
        <form action={updateAvatar} className="mt-5">
          <input type="hidden" name="id" value={lawyer.id} />
          <p className="mono-label text-muted">Choose a photo</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {AVATAR_PRESETS.map((url) => (
              <button
                key={url}
                type="submit"
                name="avatar"
                value={url}
                title="Use this photo"
                className={`rounded-full p-[3px] transition-colors ${
                  url === lawyer.user.avatar
                    ? "bg-accent"
                    : "bg-rule hover:bg-accent/50"
                }`}
              >
                <Image
                  src={url}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
              </button>
            ))}
          </div>
        </form>

        <form action={updateAvatar} className="mt-6 border-t border-rule pt-5">
          <input type="hidden" name="id" value={lawyer.id} />
          <label className="block">
            <span className="mono-label text-muted">Or paste an image URL</span>
            <input
              name="avatar"
              type="url"
              required
              defaultValue={lawyer.user.avatar}
              className={field}
            />
          </label>
          <button
            type="submit"
            className="btn-secondary mono-label mt-3 rounded-full px-4 py-2.5"
          >
            Update photo
          </button>
        </form>
      </section>

      {/* ---- Details ---- */}
      <form action={updateLawyer} className="mt-6 space-y-6">
        <input type="hidden" name="id" value={lawyer.id} />

        <section className="card p-5 sm:p-6">
          <h2 className="text-xl">Practice details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mono-label text-muted">Name</span>
              <input
                name="name"
                defaultValue={lawyer.user.name.replace(/^Adv\.\s*/, "")}
                className={field}
              />
              <span className="mono-label mt-2 block text-muted">
                &ldquo;Adv.&rdquo; is added automatically
              </span>
            </label>

            <label className="block">
              <span className="mono-label text-muted">City</span>
              <input name="city" defaultValue={lawyer.city} className={field} />
            </label>

            <label className="block">
              <span className="mono-label text-muted">Court</span>
              <input
                name="court"
                defaultValue={lawyer.court}
                className={field}
              />
            </label>

            <label className="block">
              <span className="mono-label text-muted">Years in practice</span>
              <input
                name="years"
                type="number"
                min={0}
                max={70}
                defaultValue={lawyer.years}
                className={`font-mono-num ${field}`}
              />
            </label>

            <label className="block">
              <span className="mono-label text-muted">
                Bar Council enrolment
              </span>
              <input
                name="bciNumber"
                defaultValue={lawyer.bciNumber}
                className={`font-mono-num ${field}`}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mono-label text-muted">Bio</span>
              <textarea
                name="bio"
                rows={4}
                defaultValue={lawyer.bio}
                className={`resize-y leading-relaxed ${field}`}
              />
            </label>
          </div>

          <p className="mono-label mt-4 text-muted">
            Practice areas ·{" "}
            {lawyer.categories.map((c) => c.name).join(" · ") || "none set"} ·
            edited by the advocate on their own profile
          </p>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="text-xl">Listing</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mono-label text-muted">Tier — sets the fee</span>
              <select
                name="tier"
                defaultValue={lawyer.tier}
                className={field}
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t} — {formatRupees(TIER_FEE[t])}
                  </option>
                ))}
              </select>
              <span className="mono-label mt-2 block text-muted">
                Currently {formatRupees(lawyer.fee)} · the fee follows the tier
                and is never set by hand
              </span>
            </label>

            <label className="block">
              <span className="mono-label text-muted">Status</span>
              <select
                name="status"
                defaultValue={lawyer.status}
                className={field}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="mono-label mt-2 block text-muted">
                Only VERIFIED advocates appear to clients
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-rule bg-surface-2 px-3 py-2.5 has-checked:border-accent has-checked:bg-accent-bg sm:col-span-2">
              <input
                type="checkbox"
                name="online"
                defaultChecked={lawyer.online}
                className="accent-[var(--accent)]"
              />
              <span className="text-sm">
                Available now — shows the green dot and the LIVE strip
              </span>
            </label>
          </div>

          <div className="mt-6">
            <SaveButton label="Save changes" />
          </div>
        </section>
      </form>

      {/* ---- Delete ---- */}
      <section className="card mt-6 border-l-2 border-l-danger p-5 sm:p-6">
        <h2 className="text-xl">Delete this advocate</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate">
          This removes the advocate, their account, and everything attached to
          them. It cannot be undone.
        </p>

        <ul className="mono-label mt-4 space-y-1 text-muted">
          <li>· {lawyer._count.bookings} bookings, and every message in them</li>
          <li>· {lawyer._count.slots} slots</li>
          <li>· their user account and reward history</li>
        </ul>

        {paidBookings > 0 && (
          <p className="mono-label mt-4 flex items-start gap-2 rounded-lg border border-danger/40 px-3 py-2.5 text-danger">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
            <span>
              {paidBookings} paid{" "}
              {paidBookings === 1 ? "consultation" : "consultations"} will be
              destroyed — clients will lose those threads. Set the status to
              REJECTED instead if you only want them off the listing.
            </span>
          </p>
        )}

        {/* `required` on the checkbox does the confirming — the browser will
            not submit until it is ticked, and no JS is involved. */}
        <form action={deleteLawyer} className="mt-5">
          <input type="hidden" name="id" value={lawyer.id} />
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate">
            <input
              type="checkbox"
              required
              className="mt-1 accent-[var(--danger)]"
            />
            <span>
              I understand this permanently deletes {lawyer.user.name} and all
              their bookings.
            </span>
          </label>
          <button
            type="submit"
            className="mono-label mt-4 inline-flex items-center gap-2 rounded-full border border-danger px-4 py-2.5 text-danger transition-colors hover:bg-danger hover:text-white"
          >
            <Trash2 className="size-3.5" strokeWidth={2.5} />
            Delete permanently
          </button>
        </form>
      </section>
    </main>
  );
}
