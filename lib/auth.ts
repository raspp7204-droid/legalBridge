import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Clerk is the only source of truth for identity (LAUNCH.md Task 1). Every
 * local `User` row is keyed by Clerk id; we never store passwords, phone
 * numbers or any government ID.
 */

/** Emails listed here become ADMIN on first sign-in. */
function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** The local user for the signed-in Clerk account, or null when signed out. */
export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return db.user.findUnique({ where: { clerkId: userId } });
}

/** "LB-2026-00042" — the client's LegalBridge id. Non-sensitive by design. */
async function nextClientCode() {
  const year = new Date().getFullYear();
  const used = await db.user.count({ where: { clientCode: { not: null } } });
  for (let i = 1; i <= 50; i++) {
    const code = `LB-${year}-${String(used + i).padStart(5, "0")}`;
    const clash = await db.user.findUnique({ where: { clientCode: code } });
    if (!clash) return code;
  }
  return `LB-${year}-${Date.now().toString().slice(-5)}`;
}

/**
 * Upsert the local row for the signed-in Clerk account. The role is only
 * applied when the row is created — signing in through the client pages can
 * never demote an existing advocate.
 */
export async function ensureDbUser(intendedRole: Role = "CLIENT") {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;

  const existing = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: { lawyer: true },
  });

  if (existing) {
    // ADMIN_EMAILS is checked on every visit, not just at signup, so adding
    // an address to the env promotes that account on its next page load.
    if (
      email &&
      existing.role !== "ADMIN" &&
      adminEmails().includes(email.toLowerCase())
    ) {
      return db.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN" },
        include: { lawyer: true },
      });
    }
    return existing;
  }

  const role: Role =
    email && adminEmails().includes(email.toLowerCase())
      ? "ADMIN"
      : intendedRole;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    email?.split("@")[0] ||
    "LawNest member";

  // An advocate who signed up with an email we already seeded claims that
  // catalog profile instead of getting a duplicate one.
  if (role === "LAWYER" && email) {
    const claimable = await db.user.findFirst({
      where: { email, clerkId: null, role: "LAWYER" },
    });
    if (claimable) {
      return db.user.update({
        where: { id: claimable.id },
        data: { clerkId: clerkUser.id },
        include: { lawyer: true },
      });
    }
  }

  const created = await db.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      name: role === "LAWYER" && !name.startsWith("Adv.") ? `Adv. ${name}` : name,
      avatar: clerkUser.imageUrl || "https://randomuser.me/api/portraits/lego/1.jpg",
      role,
      clientCode: role === "CLIENT" ? await nextClientCode() : null,
      // A new advocate starts PENDING and is verified in /admin/verification.
      ...(role === "LAWYER"
        ? {
            lawyer: {
              create: {
                bio: "",
                city: "",
                court: "",
                years: 0,
                tier: "LOWER",
                fee: 399,
                bciNumber: "",
                status: "PENDING",
                languages: ["English"],
              },
            },
          }
        : {}),
    },
    include: { lawyer: true },
  });

  return created;
}

/** Signed-in user of any role; sends you to sign-in otherwise. */
export async function requireUser(signInPath = "/sign-in") {
  const user = await ensureDbUser();
  if (!user) redirect(signInPath);
  return user;
}

/** A signed-in client (admins are allowed through for support). */
export async function requireClient() {
  const user = await requireUser("/sign-in");
  if (user.role === "LAWYER") redirect("/lawyer");
  return user;
}

/** The signed-in advocate's profile — anything else lands on advocate sign-in. */
export async function requireLawyerProfile() {
  const { userId } = await auth();
  if (!userId) redirect("/lawyer/sign-in");

  const user = await ensureDbUser("LAWYER");
  if (!user) redirect("/lawyer/sign-in");
  if (user.role !== "LAWYER") redirect("/");

  const profile = await db.lawyerProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
          // Drives the subscription free-year countdown (lib/subscription.ts).
          createdAt: true,
        },
      },
    },
  });
  if (!profile) redirect("/lawyer/sign-in");
  return profile;
}

/**
 * The client-side of the marketplace — browsing and booking advocates — is
 * not the advocate's product. A signed-in advocate landing on any of it goes
 * to their own dashboard instead.
 */
export async function blockLawyers(to = "/lawyer") {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (user?.role === "LAWYER") redirect(to);
  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/sign-in");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
