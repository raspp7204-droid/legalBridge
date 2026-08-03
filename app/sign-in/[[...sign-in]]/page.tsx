import { SignIn } from "@clerk/nextjs";
import { AuthShell, clerkAppearance } from "@/components/auth-shell";

export const metadata = { title: "Sign in — LawNest" };

export default function ClientSignInPage() {
  return (
    <AuthShell
      eyebrow="For clients"
      title="Sign in to"
      accent="LawNest"
      blurb="Your consultations and their chat threads live behind this sign-in. Same email, same one-time code."
      points={[
        "Open any consultation you have paid for, from any device.",
        "Chat with your advocate — the thread is private to the two of you.",
        "Your LawNest ID stays the same for every matter you bring.",
      ]}
      footer={{ label: "New here?", href: "/sign-up", cta: "Create an account" }}
    >
      <SignIn
        appearance={clerkAppearance}
        signUpUrl="/sign-up"
        forceRedirectUrl="/onboarding?role=CLIENT"
        fallbackRedirectUrl="/onboarding?role=CLIENT"
      />
    </AuthShell>
  );
}
