"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn } from "@/lib/session";

/** Demo sign-in — pick a seeded advocate, no password (Task 1). */
export async function signInAsLawyer(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  await signIn("LAWYER", userId);
  revalidatePath("/", "layout");
  redirect("/lawyer");
}
