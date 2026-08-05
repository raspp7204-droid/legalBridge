"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { withFlash } from "@/lib/flash";

/** Mark a suggestion read, or put it back in the queue. */
export async function toggleHandled(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const row = await db.feedback.findUnique({ where: { id } });
  if (!row) return;

  await db.feedback.update({
    where: { id },
    data: { handled: !row.handled },
  });

  revalidatePath("/admin/feedback");
  redirect(
    withFlash("/admin/feedback", row.handled ? "feedback-unread" : "feedback-read"),
  );
}
