"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/lib/session";

/** Demo sign-in as a seeded client (Task 1). */
export async function signInAsClient(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  await signIn("CLIENT", userId);
  revalidatePath("/", "layout");
  redirect("/me");
}

/** Sign out from anywhere — used by the header. */
export async function signOutAction() {
  await signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
