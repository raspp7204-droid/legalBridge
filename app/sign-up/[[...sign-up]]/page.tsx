import { SignUp } from "@clerk/nextjs";
import { AuthShell, clerkAppearance } from "@/components/auth-shell";

export const metadata = { title: "Create your account — LawNest" };

export default function ClientSignUpPage() {
  return (
    <AuthShell
      eyebrow="For clients"
      title="Create your"
      accent="account"
      blurb="Sign up with your email. We send a one-time code to verify it — that is the whole check. You get a LawNest ID, and your consultations stay tied to it."
      points={[
        "Email plus a one-time code. No password resets over SMS, no OTP charges.",
        "You get a LawNest ID (LB-2026-00001) — that is the only identifier we issue.",
        "Fixed consultation fees, with the advocate's share shown before you pay.",
      ]}
      footer={{
        label: "Already have an account?",
        href: "/sign-in",
        cta: "Sign in",
      }}
    >
      <SignUp
        appearance={clerkAppearance}
        signInUrl="/sign-in"
        forceRedirectUrl="/onboarding?role=CLIENT"
        fallbackRedirectUrl="/onboarding?role=CLIENT"
      />
    </AuthShell>
  );
}
