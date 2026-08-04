"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

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
}
