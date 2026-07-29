import { cookies } from "next/headers";
import { SESSION_COOKIE, isRole } from "@/lib/roles";

/** POST { role } to switch, POST { role: null } to sign out. No auth by design. */
export async function POST(req: Request) {
  let role: string | null = null;
  try {
    ({ role = null } = (await req.json()) as { role?: string | null });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const store = await cookies();

  if (role === null) {
    store.delete(SESSION_COOKIE);
    return Response.json({ role: null });
  }

  if (!isRole(role)) {
    return Response.json({ error: "Unknown role." }, { status: 400 });
  }

  store.set(SESSION_COOKIE, role, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ role });
}
