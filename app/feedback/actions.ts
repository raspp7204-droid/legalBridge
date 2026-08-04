"use server";

import { revalidatePath } from "next/cache";
import type { FeedbackKind } from "@prisma/client";
import { db } from "@/lib/db";
import { getDbUser } from "@/lib/auth";

const KINDS: FeedbackKind[] = ["SUGGESTION", "ISSUE", "PRAISE"];

export type FeedbackState = {
  ok: boolean;
  error?: string;
};

/**
 * The suggestion box. Open to signed-out visitors on purpose — the people
 * most worth hearing from are the ones who bounced before making an account.
 *
 * Signed-in details are read off the session rather than trusted from the
 * form, so a submission cannot claim to be from someone else.
 */
export async function submitFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 4) {
    return { ok: false, error: "Tell us a little more than that." };
  }

  const rawKind = String(formData.get("kind") ?? "SUGGESTION") as FeedbackKind;
  const kind = KINDS.includes(rawKind) ? rawKind : "SUGGESTION";

  const user = await getDbUser();

  // Trim to something a table can render. Nobody is paginating this.
  const typedName = String(formData.get("name") ?? "").trim().slice(0, 80);
  const typedEmail = String(formData.get("email") ?? "").trim().slice(0, 120);

  await db.feedback.create({
    data: {
      kind,
      body: body.slice(0, 2000),
      name: user?.name ?? (typedName || null),
      email: user?.email ?? (typedEmail || null),
      role: user?.role ?? null,
      userId: user?.id ?? null,
      page: String(formData.get("page") ?? "").trim().slice(0, 120) || null,
    },
  });

  revalidatePath("/admin/feedback");
  return { ok: true };
}
