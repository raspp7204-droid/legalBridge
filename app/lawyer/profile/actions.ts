"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireLawyerProfile } from "@/lib/auth";

export async function saveProfile(formData: FormData) {
  const profile = await requireLawyerProfile();

  const bio = String(formData.get("bio") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
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
      languages: languages.length ? languages : profile.languages,
      categories: {
        set: categorySlugs.map((slug) => ({ slug })),
      },
    },
  });

  revalidatePath("/lawyer/profile");
  revalidatePath("/lawyers");
}
