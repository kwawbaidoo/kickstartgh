"use client";

import { useRouter } from "next/navigation";

import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { TeamForm } from "@/components/onboarding/TeamForm";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { TeamDetailsInput } from "@/schemas/onboarding";

export default function TeamDetailsPage() {
  const router = useRouter();
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const teamId = useOnboardingStore((state) => state.team_id);
  const saveTeam = useOnboardingStore((state) => state.saveTeam);

  async function handleSubmit(data: TeamDetailsInput) {
    await saveTeam(data);
    router.push("/onboarding/staff");
  }

  const defaultValues: Partial<TeamDetailsInput> | undefined = teamId
    ? {
        name: activeTeam.name,
        nickname: activeTeam.nickname,
        region: activeTeam.region,
        district: activeTeam.district,
        home_ground: activeTeam.home_ground,
        year_established: activeTeam.year_established,
        logo: activeTeam.logo,
        color_primary: activeTeam.color_primary,
        color_secondary: activeTeam.color_secondary,
        slogan: activeTeam.slogan,
        facebook: activeTeam.facebook,
        instagram: activeTeam.instagram,
        tiktok: activeTeam.tiktok,
        website: activeTeam.website,
      }
    : undefined;

  return (
    <OnboardingLayout
      step={1}
      backHref="/onboarding/role"
      title="Create your team"
      description="Tell us a bit about your team. You can always edit this later."
    >
      <TeamForm defaultValues={defaultValues} onSubmit={handleSubmit} />
    </OnboardingLayout>
  );
}
