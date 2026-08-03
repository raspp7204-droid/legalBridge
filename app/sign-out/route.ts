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
 * This clears the httpOnly cookies from the server — which the browser cannot
 * touch — then hands off to /reset for the localStorage half. Works with the
 * Clerk script blocked entirely. Clerk re-issues everything on next sign-in.
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

  /* Hand off to /reset, which finishes the job in the browser: on a Clerk
     development instance the dev browser token also lives in localStorage,
     and cookies alone leave a dead session able to resurrect itself.
     ?to=/ because someone who chose to sign out wants the site, not a login
     form — /reset still defaults to /sign-in when it is reached to recover a
     broken session instead. */
  redirect("/reset?to=/");
}
