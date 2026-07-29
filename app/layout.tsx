import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AssistantWidget } from "@/components/assistant-widget";
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
    <ClerkProvider>
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
        </body>
      </html>
    </ClerkProvider>
  );
}
