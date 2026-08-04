import { SignUp } from "@clerk/nextjs";
import { AuthShell, clerkAppearance } from "@/components/auth-shell";
import { PlacementBanner } from "@/components/placement-offer";
import { FOUNDING_MONTHS, PLATFORM_PERCENT } from "@/lib/offers";

export const metadata = { title: "Join as an advocate — LawNest" };

export default function LawyerSignUpPage() {
  return (
    <AuthShell
      eyebrow="For advocates"
      title="Join as an"
      accent="advocate"
      blurb="Create your account with an email and a one-time code, then complete your practice profile. LawNest verifies your Bar Council enrolment before your listing goes live."
      /* Written from lib/offers.ts so the auth page can never contradict the
         recruitment band that sent the advocate here. */
      points={[
        `Founding advocates keep 100% of every fee for ${FOUNDING_MONTHS} months — normally ${100 - PLATFORM_PERCENT}%.`,
        "Your profile stays pending until our team verifies your enrolment number.",
        "Consultations, earnings and payouts all sit in one dashboard.",
      ]}
      footer={{
        label: "Already registered?",
        href: "/lawyer/sign-in",
        cta: "Advocate sign-in",
      }}
      banner={<PlacementBanner />}
      recoverTo="/lawyer/sign-up"
    >
      <SignUp
        appearance={clerkAppearance}
        signInUrl="/lawyer/sign-in"
        forceRedirectUrl="/onboarding?role=LAWYER"
        fallbackRedirectUrl="/onboarding?role=LAWYER"
      />
    </AuthShell>
  );
}
