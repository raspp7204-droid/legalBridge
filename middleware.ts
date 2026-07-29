import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk owns authentication (LAUNCH.md Task 1). Everything below is a
 * signed-in area; the advocate area bounces to its own sign-in page so the
 * two sides stay visually separate.
 */
const isLawyerArea = createRouteMatcher([
  "/lawyer",
  "/lawyer/(.*)",
]);

const isLawyerPublic = createRouteMatcher([
  "/lawyer/sign-in(.*)",
  "/lawyer/sign-up(.*)",
]);

const isProtected = createRouteMatcher([
  "/me(.*)",
  "/account(.*)",
  "/onboarding(.*)",
  "/book/(.*)",
  "/consult/(.*)",
  "/admin(.*)",
  "/api/chat/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isLawyerArea(req) && !isLawyerPublic(req)) {
    if (!userId) {
      const url = new URL("/lawyer/sign-in", req.url);
      url.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isProtected(req) && !userId) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next internals and static files, always run for API routes.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
