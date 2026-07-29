"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/auth";

export async function saveProfile(formData: FormData) {
  const profile = await requireLawyerProfile();

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
}
