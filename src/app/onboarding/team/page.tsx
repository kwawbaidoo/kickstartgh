"use client";

import { useRouter } from "next/navigation";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { TeamForm } from "@/components/onboarding/TeamForm";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { TeamDetailsInput } from "@/schemas/onboarding";

export default function TeamDetailsPage() {
  const router = useRouter();
  const draftTeam = useOnboardingStore((state) => state.draft.team);
  const setTeamDetails = useOnboardingStore((state) => state.setTeamDetails);

  function handleSubmit(data: TeamDetailsInput) {
    setTeamDetails(data);
    router.push("/onboarding/staff");
  }

  return (
    <OnboardingLayout
      step={1}
      backHref="/onboarding/role"
      title="Create your team"
      description="Tell us a bit about your team. You can always edit this later."
    >
      <TeamForm defaultValues={draftTeam} onSubmit={handleSubmit} />
    </OnboardingLayout>
  );
}
