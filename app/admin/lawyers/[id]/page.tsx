import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, TriangleAlert } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SaveButton } from "@/components/save-button";
import { formatRupees, TIER_FEE } from "@/lib/money";
import { AVATAR_PRESETS, ALLOWED_AVATAR_HOSTS } from "@/lib/avatars";
import { AvatarUpload, PresetPhotoButton } from "@/components/avatar-upload";
import { ActionButton } from "@/components/action-button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { updateAvatar, updateLawyer, deleteLawyer } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit advocate — LawNest" };

const TIERS = ["LOWER", "MIDDLE", "HIGH"] as const;
const STATUSES = ["PENDING", "VERIFIED", "REJECTED"] as const;

const field =
  "mt-2 w-full rounded-lg border border-rule bg-surface-2 px-3 py-2.5 text-[0.95rem]";

export default async function AdminEditLawyer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

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

      {/* ---- Photo ---- */}
      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="text-xl">Photo</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
          Upload a file, pick one of the stock portraits, or paste a URL. An
          uploaded photo is cropped square and resized in your browser before it
          is saved, so it stays small. A pasted URL must come from{" "}
          {ALLOWED_AVATAR_HOSTS.join(", ")} — any other host is refused by the
          image optimiser.
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
              {lawyer.user.avatar.startsWith("data:")
                ? `Uploaded photo · ${Math.round(lawyer.user.avatar.length / 1024)}KB`
                : lawyer.user.avatar}
            </p>
          </div>
        </div>

        {/* Upload — the file is resized in the browser and stored inline. */}
        <form action={updateAvatar} className="mt-5">
          <input type="hidden" name="id" value={lawyer.id} />
          <p className="mono-label text-muted">Upload from this device</p>
          <div className="mt-3">
            <AvatarUpload />
          </div>
        </form>

        {/* Each preset is its own submit button — one click, no JS. */}
        <form action={updateAvatar} className="mt-6 border-t border-rule pt-5">
          <input type="hidden" name="id" value={lawyer.id} />
          <p className="mono-label text-muted">Choose a photo</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {AVATAR_PRESETS.map((url) => (
              <PresetPhotoButton
                key={url}
                url={url}
                current={url === lawyer.user.avatar}
              />
            ))}
          </div>
        </form>

        <form action={updateAvatar} className="mt-6 border-t border-rule pt-5">
          <input type="hidden" name="id" value={lawyer.id} />
          <label className="block">
            <span className="mono-label text-muted">Or paste an image URL</span>
            {/* Only prefilled when the current photo is a link. An uploaded
                one is a 20KB data URL and would fill the field with noise. */}
            <input
              name="avatar"
              type="url"
              required
              defaultValue={
                lawyer.user.avatar.startsWith("data:") ? "" : lawyer.user.avatar
              }
              placeholder="https://randomuser.me/api/portraits/men/32.jpg"
              className={field}
            />
          </label>
          <div className="mt-3">
            <ActionButton
              label="Update photo"
              pendingLabel="Updating…"
              variant="secondary"
            />
          </div>
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

        <form action={deleteLawyer} className="mt-5">
          <input type="hidden" name="id" value={lawyer.id} />
          <ConfirmSubmit
            trigger="Delete permanently"
            icon={<Trash2 className="size-3.5" strokeWidth={2.5} />}
            title={`Delete ${lawyer.user.name}?`}
            body={
              <>
                <p>
                  This removes their account and everything attached to it:{" "}
                  {lawyer._count.bookings} bookings and every message in them,{" "}
                  {lawyer._count.slots} slots, and their reward history.
                </p>
                {paidBookings > 0 && (
                  <p className="mt-3 text-danger">
                    {paidBookings} paid{" "}
                    {paidBookings === 1 ? "consultation" : "consultations"} will
                    be destroyed and clients will lose those threads.
                  </p>
                )}
                <p className="mt-3">This cannot be undone.</p>
              </>
            }
            confirmLabel="Delete permanently"
            pendingLabel="Deleting…"
          />
        </form>
      </section>
    </main>
  );
}
