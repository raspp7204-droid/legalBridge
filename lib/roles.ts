/** Client-safe role constants. Cookie reading lives in lib/session.ts (server only). */

export const SESSION_COOKIE = "lb_session";

export const ROLES = ["CLIENT", "LAWYER", "ADMIN"] as const;
export type SessionRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<SessionRole, string> = {
  CLIENT: "Client",
  LAWYER: "Advocate",
  ADMIN: "Admin",
};

export function isRole(value: string | undefined | null): value is SessionRole {
  return !!value && (ROLES as readonly string[]).includes(value);
}
