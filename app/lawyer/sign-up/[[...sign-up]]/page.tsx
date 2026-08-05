import { SignUp } from "@clerk/nextjs";
import { AuthShell, clerkAppearance } from "@/components/auth-shell";
import { SubscriptionBanner } from "@/components/subscription-offer";
import {
  COMMISSION_PERCENT,
  FREE_MONTHS,
  SUBSCRIPTION_FEE,
} from "@/lib/subscription";
import { formatRupees } from "@/lib/money";

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
        `No subscription fee for your first ${FREE_MONTHS} months — ${formatRupees(SUBSCRIPTION_FEE)} a year after that.`,
        `You keep ${100 - COMMISSION_PERCENT}% of every consultation fee, from the first one.`,
        "Your profile stays pending until our team verifies your enrolment number.",
        "Consultations, earnings and payouts all sit in one dashboard.",
      ]}
      footer={{
        label: "Already registered?",
        href: "/lawyer/sign-in",
        cta: "Advocate sign-in",
      }}
      recoverTo="/lawyer/sign-up"
      banner={<SubscriptionBanner />}
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
