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

/**
 * Where to land afterwards. Read off window.location inside the effect rather
 * than with useSearchParams, which would need a Suspense boundary here for no
 * benefit. Relative single-slash paths only — never send anyone to another
 * origin because a query string asked.
 */
function destination() {
  try {
    // "/" itself, or "/path" — but not "//host" or "/\host", which browsers
    // treat as protocol-relative and would leave the site.
    const to = new URLSearchParams(window.location.search).get("to");
    if (to && /^\/($|[^/\\])/.test(to)) return to;
  } catch {
    /* fall through to the default */
  }
  return "/sign-in";
}

export default function ResetPage() {
  const [done, setDone] = useState(false);
  const [to, setTo] = useState("/sign-in");

  useEffect(() => {
    const wiped: string[] = [];
    const target = destination();
    setTo(target);

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
    /* replace(), not push(): the reset page must not sit in history where a
       back button would re-run it. A full location change, not router.push —
       this has to drop the React router cache, or the header would paint the
       signed-out page with the previous user's name still in it. */
    const t = setTimeout(() => window.location.replace(target), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="container container-narrow section">
      <div className="document">
        <div className="card p-8 text-center">
          <p className="mono-label text-muted">
            {to === "/sign-in" ? "Session reset" : "Signing out"}
          </p>
          <h1 className="mt-4 text-[1.75rem]">
            {to === "/sign-in" ? (
              <>
                Clearing your <span className="tone-accent">sign-in state</span>
              </>
            ) : (
              <>
                You are <span className="tone-accent">signed out</span>
              </>
            )}
          </h1>
          <p className="mt-4 leading-relaxed text-slate">
            {done
              ? to === "/sign-in"
                ? "Done — taking you to sign in."
                : "Done — taking you back to LawNest."
              : "Removing stored session data…"}
          </p>
          <p className="mono-label mt-6 text-muted">
            If this page does not move on,{" "}
            {/* Plain <a>, not <Link>: a soft client navigation would keep the
                same JS context alive, and the whole point is to reboot ClerkJS
                from an empty store. (The no-html-link-for-pages disable this
                used to carry is unnecessary now the href is a variable.) */}
            <a href={to} className="text-accent underline">
              {to === "/sign-in" ? "go to sign in" : "continue to LawNest"}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
