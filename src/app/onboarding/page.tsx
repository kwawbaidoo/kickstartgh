import Link from "next/link";
import { Shield } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function OnboardingLandingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Shield className="size-8" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Let&apos;s set up your team
          </h1>
          <p className="text-sm text-muted-foreground">
            Create your team&apos;s digital identity in under five minutes. No
            paperwork, no spreadsheets — just your squad, organized.
          </p>
        </div>

        <Link href="/onboarding/role" className={buttonVariants({ size: "lg", className: "w-full" })}>
          Get Started
        </Link>

        <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4">
          Skip to dashboard
        </Link>
      </div>
    </div>
  );
}
