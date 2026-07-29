import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, isRole, type SessionRole } from "@/lib/roles";

/**
 * Demo auth (CHAT-AND-POLISH.md Task 1). The cookie holds `ROLE` or
 * `ROLE:userId` — signing in from /login or /lawyer/login writes the id so the
 * two sides of a consultation are genuinely separate identities. A bare role
 * (the old role-switcher format) still works and falls back to the persona.
 */
export type Session = { role: SessionRole; userId: string | null };

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const [role, userId] = raw.split(":");
  if (!isRole(role)) return null;
  return { role, userId: userId || null };
}

/** Current role, or null when signed out. */
export async function getSessionRole(): Promise<SessionRole | null> {
  return (await getSession())?.role ?? null;
}

/** Demo personas from the seed (CLAUDE.md §7). */
const PERSONA_PHONE = {
  CLIENT: "+919900000002", // Aarav Mehta
  ADMIN: "+919900000001", // Riva Sharma
  LAWYER: "+919845012001", // Adv. Meera Nair
} as const;

/** The signed-in user. Falls back to the persona for the role. */
export async function getCurrentUser() {
  const session = await getSession();
  const role = session?.role ?? "CLIENT";

  if (session?.userId) {
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (user) return user;
  }
  return db.user.findUnique({ where: { phone: PERSONA_PHONE[role] } });
}

/** The client the booking flow acts as — the signed-in client, else Aarav. */
export async function getClientUser() {
  const session = await getSession();
  if (session?.role === "CLIENT" && session.userId) {
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (user) return user;
  }
  return db.user.findUnique({ where: { phone: PERSONA_PHONE.CLIENT } });
}

/** The signed-in advocate's profile, else the demo advocate (Meera Nair). */
export async function getLawyerProfile() {
  const session = await getSession();

  if (session?.role === "LAWYER" && session.userId) {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { lawyer: true },
    });
    if (user?.lawyer) return user.lawyer;
  }

  const fallback = await db.user.findUnique({
    where: { phone: PERSONA_PHONE.LAWYER },
    include: { lawyer: true },
  });
  return fallback?.lawyer ?? null;
}

/** Gate for the advocate area — anything else lands on the sign-in page. */
export async function requireLawyerProfile() {
  const session = await getSession();
  if (session?.role !== "LAWYER") redirect("/lawyer/login");

  const base = await getLawyerProfile();
  if (!base) redirect("/lawyer/login");

  const profile = await db.lawyerProfile.findUnique({
    where: { id: base.id },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });
  if (!profile) redirect("/lawyer/login");
  return profile;
}

/** Write the demo session cookie. Called from the sign-in server actions. */
export async function signIn(role: SessionRole, userId?: string | null) {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId ? `${role}:${userId}` : role, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
