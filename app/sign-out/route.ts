import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * A sign-out that does not need ClerkJS.
 *
 * Clerk's own <SignOutButton> is a client component: if clerk.accounts.dev is
 * unreachable — a tracker blocker, a dropped network, a session Clerk has
 * already removed — it never boots, and the header renders neither an avatar
 * nor a "Sign in" link because the server still sees the stale cookie. That
 * leaves no way back in from the UI at all.
 *
 * This clears the cookies from the server, so it works with the Clerk script
 * blocked entirely. Clerk re-issues everything on the next real sign-in.
 */
const CLERK_COOKIE_PREFIXES = [
  "__session",
  "__client",
  "__clerk",
  "__refresh",
];

export async function GET() {
  const jar = await cookies();

  for (const c of jar.getAll()) {
    if (CLERK_COOKIE_PREFIXES.some((p) => c.name.startsWith(p))) {
      jar.delete(c.name);
    }
  }

  redirect("/sign-in");
}
