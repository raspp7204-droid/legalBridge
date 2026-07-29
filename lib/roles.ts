/** Client-safe role constants. Identity itself is owned by Clerk (lib/auth.ts). */

export const ROLES = ["CLIENT", "LAWYER", "ADMIN"] as const;
export type SessionRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<SessionRole, string> = {
  CLIENT: "Client",
  LAWYER: "Advocate",
  ADMIN: "Admin",
};
