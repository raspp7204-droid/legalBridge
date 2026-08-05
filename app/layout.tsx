import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AssistantWidget } from "@/components/assistant-widget";
import { FeedbackWidget } from "@/components/feedback-widget";
import { getDbUser } from "@/lib/auth";
import "./globals.css";

// Display face — opsz axis pinned to 72 in globals.css (PLAN.md §2)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LawNest — verified advocates at a fixed fee",
  description:
    "Talk to a verified Indian advocate for a fixed fee. See the price, and the split, before you pay.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The free legal assistant is a client-facing product; advocates don't get
  // asked "what does the law say" by their own dashboard.
  const user = await getDbUser();
  const isLawyer = user?.role === "LAWYER";

  return (
    // Clerk owns authentication for the whole app (LAUNCH.md Task 1).
    // Font vars live on <html> so :root can resolve them — --font-display in
    // globals.css references --font-fraunces and only sees :root scope.
    /* afterSignOutUrl points at our own /sign-out route rather than "/".
       Clerk's <UserButton> sign-out clears its session in the browser and then
       soft-navigates, which leaves the server-rendered header — name, points
       pill, LawNest ID — sitting there from the React cache until something
       forces a refetch. Routing it through /sign-out → /reset ends on a hard
       navigation, so the profile cannot survive the sign-out. */
    <ClerkProvider afterSignOutUrl="/sign-out">
      <html
        lang="en"
        className={`${fraunces.variable} ${inter.variable} ${GeistMono.variable}`}
      >
        <body className="flex min-h-screen flex-col antialiased">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          {/* Floating assistant — client-facing pages only */}
          {!isLawyer && <AssistantWidget />}
          {/* Suggestion box — everyone, including advocates and admins.
              It sits above the assistant where there is one to sit above. */}
          <FeedbackWidget signedIn={!!user} stacked={!isLawyer} />
        </body>
      </html>
    </ClerkProvider>
  );
}
