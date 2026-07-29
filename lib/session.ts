import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE, isRole, type SessionRole } from "@/lib/roles";

/**
 * Current role, or null when signed out. No real auth (PLAN.md §7).
 * The cookie holds only a role; the seeded persona for that role is
 * resolved below so every page has a real user to work with.
 */
export async function getSessionRole(): Promise<SessionRole | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return isRole(value) ? value : null;
}

/** Demo personas from the seed (CLAUDE.md §7). */
const PERSONA_PHONE = {
  CLIENT: "+919900000002", // Aarav Mehta
  ADMIN: "+919900000001", // Riva Sharma
  LAWYER: "+919845012001", // Adv. Meera Nair
} as const;

/** The signed-in user for the current role. Defaults to the client persona. */
export async function getCurrentUser() {
  const role = (await getSessionRole()) ?? "CLIENT";
  return db.user.findUnique({ where: { phone: PERSONA_PHONE[role] } });
}

/** The client persona — used by the booking flow regardless of view role. */
export async function getClientUser() {
  return db.user.findUnique({ where: { phone: PERSONA_PHONE.CLIENT } });
}

/** The lawyer persona's profile — used by the advocate dashboard. */
export async function getLawyerProfile() {
  const user = await db.user.findUnique({
    where: { phone: PERSONA_PHONE.LAWYER },
    include: { lawyer: true },
  });
  return user?.lawyer ?? null;
}
