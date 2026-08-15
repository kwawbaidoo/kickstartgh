"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { InviteCard } from "@/components/onboarding/InviteCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function InvitePage() {
  const router = useRouter();
  const teamName = useOnboardingStore((state) => state.activeTeam.name) || "your team";
  const invite_code = useOnboardingStore((state) => state.draft.invite_code);
  const invite_url = useOnboardingStore((state) => state.draft.invite_url);
  const createInvite = useOnboardingStore((state) => state.createInvite);
  const [isGenerating, setIsGenerating] = useState(() => !invite_code);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invite_code) return;
    createInvite("player")
      .catch(() => setError("Couldn't generate an invite code. Please try again."))
      .finally(() => setIsGenerating(false));
  }, [invite_code, createInvite]);

  return (
    <OnboardingLayout
      step={3}
      backHref="/onboarding/staff"
      title="Invite your players"
      description="Share this link so players can join your squad on WhatsApp."
    >
      {isGenerating ? (
        <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <LoadingSkeleton className="size-32 rounded-xl" />
          <LoadingSkeleton className="h-9 w-full" />
          <LoadingSkeleton className="h-11 w-full" />
        </div>
      ) : error ? (
        <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>
      ) : invite_code ? (
        <InviteCard teamName={teamName} invite_code={invite_code} invite_url={invite_url} />
      ) : null}

      <Button size="lg" className="w-full" onClick={() => router.push("/onboarding/success")}>
        Continue
      </Button>
    </OnboardingLayout>
  );
}
