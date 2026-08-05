"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/auth";
import { withFlash } from "@/lib/flash";

export async function saveProfile(formData: FormData) {
  const profile = await requireLawyerProfile();

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const court = String(formData.get("court") ?? "").trim();
  const bciNumber = String(formData.get("bciNumber") ?? "").trim();
  const yearsRaw = Number(formData.get("years"));
  const years =
    Number.isFinite(yearsRaw) && yearsRaw >= 0 ? Math.trunc(yearsRaw) : null;
  const languages = formData
    .getAll("languages")
    .map(String)
    .filter(Boolean);
  const categorySlugs = formData.getAll("categories").map(String);

  // The roster reads "Adv. <name>"; an account created with email + password
  // starts out named after the email prefix, so let them fix it here.
  if (name) {
    await db.user.update({
      where: { id: profile.userId },
      data: { name: /^adv\.?\s/i.test(name) ? name : `Adv. ${name}` },
    });
  }

  await db.lawyerProfile.update({
    where: { id: profile.id },
    data: {
      bio: bio || profile.bio,
      city: city || profile.city,
      court: court || profile.court,
      bciNumber: bciNumber || profile.bciNumber,
      years: years ?? profile.years,
      languages: languages.length ? languages : profile.languages,
      categories: {
        set: categorySlugs.map((slug) => ({ slug })),
      },
    },
  });

  revalidatePath("/lawyer/profile");
  revalidatePath("/lawyer");
  revalidatePath("/lawyers");
  redirect(withFlash("/lawyer/profile", "profile-saved"));
}
