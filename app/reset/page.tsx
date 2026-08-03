"use client";

import { useEffect, useState } from "react";

/**
 * Full client-side Clerk reset.
 *
 * Clearing cookies from the server is not enough on a Clerk *development*
 * instance: the dev browser token lives in localStorage as well, which is why
 * a dead session keeps coming back as `__clerk_db_jwt=dvb_…` on every request
 * even after the cookies are gone. If the session that token points at has
 * been removed, ClerkJS gets stuck retrying /touch against it, the error
 * response carries no CORS headers, and the browser reports the whole thing
 * as `TypeError: Failed to fetch` — so the sign-in form never renders.
 *
 * This wipes every Clerk key from localStorage and sessionStorage, drops the
 * non-httpOnly cookies, then hard-navigates so ClerkJS boots from nothing and
 * performs a fresh handshake.
 */
const CLERK_PREFIXES = ["__clerk", "__session", "__client", "__refresh", "clerk"];

function isClerkKey(key: string) {
  const k = key.toLowerCase();
  return CLERK_PREFIXES.some((p) => k.startsWith(p)) || k.includes("clerk");
}

export default function ResetPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const wiped: string[] = [];

    try {
      for (const store of [window.localStorage, window.sessionStorage]) {
        for (const key of Object.keys(store)) {
          if (isClerkKey(key)) {
            store.removeItem(key);
            wiped.push(key);
          }
        }
      }
    } catch {
      /* storage can be blocked outright — the cookie wipe below still runs */
    }

    // Non-httpOnly cookies. The httpOnly ones were already expired by the
    // /sign-out route that sent us here.
    for (const raw of document.cookie.split(";")) {
      const name = raw.split("=")[0]?.trim();
      if (name && isClerkKey(name)) {
        for (const path of ["/", "/sign-in", "/sign-up"]) {
          document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        wiped.push(name);
      }
    }

    setDone(true);
    // replace(), not push(): the reset page must not sit in history where a
    // back button would re-run it.
    const t = setTimeout(() => window.location.replace("/sign-in"), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="container container-narrow section">
      <div className="document">
        <div className="card p-8 text-center">
          <p className="mono-label text-muted">Session reset</p>
          <h1 className="mt-4 text-[1.75rem]">
            Clearing your <span className="tone-accent">sign-in state</span>
          </h1>
          <p className="mt-4 leading-relaxed text-slate">
            {done
              ? "Done — taking you to sign in."
              : "Removing stored session data…"}
          </p>
          <p className="mono-label mt-6 text-muted">
            If this page does not move on,{" "}
            {/* Plain <a>, not <Link>: a soft client navigation would keep the
                same JS context alive, and the whole point is to reboot ClerkJS
                from an empty store. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/sign-in" className="text-accent underline">
              go to sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
