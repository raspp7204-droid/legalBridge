import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { ensureDbUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * First authenticated stop after Clerk. Creates the local User row (with a
 * LawNest ID for clients, a pending LawyerProfile for advocates) and then
 * sends the person to their own side of the product (LAUNCH.md Task 1).
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; redirect_url?: string }>;
}) {
  const { role } = await searchParams;
  const intended: Role = role === "LAWYER" ? "LAWYER" : "CLIENT";

  const user = await ensureDbUser(intended);
  if (!user) redirect(intended === "LAWYER" ? "/lawyer/sign-in" : "/sign-in");

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "LAWYER") redirect("/lawyer");
  redirect("/me");
}
