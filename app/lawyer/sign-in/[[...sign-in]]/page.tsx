import { SignIn } from "@clerk/nextjs";
import { AuthShell, clerkAppearance } from "@/components/auth-shell";
import { PlacementBanner } from "@/components/placement-offer";

export const metadata = { title: "Advocate sign-in — LawNest" };

export default function LawyerSignInPage() {
  return (
    <AuthShell
      eyebrow="For advocates"
      title="Advocate"
      accent="sign-in"
      blurb="Open your chambers dashboard: today's consultations, your inbox, earnings and payouts."
      points={[
        "Every paid consultation assigned to you, with the client's thread.",
        "Earnings, this month's total and your pending payout at a glance.",
        "Edit your practice areas, languages and bio any time.",
      ]}
      footer={{
        label: "Not on LawNest yet?",
        href: "/lawyer/sign-up",
        cta: "Join as an advocate",
      }}
      banner={<PlacementBanner />}
      recoverTo="/lawyer/sign-in"
    >
      <SignIn
        appearance={clerkAppearance}
        signUpUrl="/lawyer/sign-up"
        forceRedirectUrl="/onboarding?role=LAWYER"
        fallbackRedirectUrl="/onboarding?role=LAWYER"
      />
    </AuthShell>
  );
}
