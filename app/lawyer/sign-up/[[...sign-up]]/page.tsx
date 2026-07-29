import { SignUp } from "@clerk/nextjs";
import { AuthShell, clerkAppearance } from "@/components/auth-shell";

export const metadata = { title: "Join as an advocate — LawNest" };

export default function LawyerSignUpPage() {
  return (
    <AuthShell
      eyebrow="For advocates"
      title="Join as an"
      accent="advocate"
      blurb="Create your account with an email and a one-time code, then complete your practice profile. LawNest verifies your Bar Council enrolment before your listing goes live."
      points={[
        "Your profile stays pending until our team verifies your enrolment number.",
        "You keep 80% of every consultation fee — the split is shown to clients upfront.",
        "Consultations, earnings and payouts all sit in one dashboard.",
      ]}
      footer={{
        label: "Already registered?",
        href: "/lawyer/sign-in",
        cta: "Advocate sign-in",
      }}
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
