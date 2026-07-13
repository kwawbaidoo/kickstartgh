"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { InviteCard } from "@/components/onboarding/InviteCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function InvitePage() {
  const router = useRouter();
  const teamName = useOnboardingStore((state) => state.draft.team.name) || "your team";
  const inviteCode = useOnboardingStore((state) => state.draft.inviteCode);
  const setInviteCode = useOnboardingStore((state) => state.setInviteCode);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    if (!inviteCode) {
      setInviteCode(generateInviteCode());
    }
    const timeout = setTimeout(() => setIsGenerating(false), 500);
    return () => clearTimeout(timeout);
  }, [inviteCode, setInviteCode]);

  return (
    <OnboardingLayout
      step={3}
      backHref="/onboarding/staff"
      title="Invite your players"
      description="Share this link so players can join your squad on WhatsApp."
    >
      {isGenerating || !inviteCode ? (
        <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <LoadingSkeleton className="size-32 rounded-xl" />
          <LoadingSkeleton className="h-9 w-full" />
          <LoadingSkeleton className="h-11 w-full" />
        </div>
      ) : (
        <InviteCard teamName={teamName} inviteCode={inviteCode} />
      )}

      <Button size="lg" className="w-full" onClick={() => router.push("/onboarding/success")}>
        Continue
      </Button>
    </OnboardingLayout>
  );
}
