"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TeamSettingsForm } from "@/components/settings/TeamSettingsForm";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { TeamDetailsInput } from "@/schemas/onboarding";

export default function TeamSettingsPage() {
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const saveTeam = useOnboardingStore((state) => state.saveTeam);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(data: TeamDetailsInput) {
    await saveTeam(data);
    setSaved(true);
  }

  const defaultValues: TeamDetailsInput = {
    name: activeTeam.name,
    nickname: activeTeam.nickname,
    region: activeTeam.region,
    district: activeTeam.district,
    home_ground: activeTeam.home_ground,
    year_established: activeTeam.year_established,
    logo: activeTeam.logo,
    cover_image: activeTeam.cover_image,
    color_primary: activeTeam.color_primary ?? "#1e3a8a",
    color_secondary: activeTeam.color_secondary ?? "#2563eb",
    slogan: activeTeam.slogan,
    facebook: activeTeam.facebook,
    instagram: activeTeam.instagram,
    tiktok: activeTeam.tiktok,
    website: activeTeam.website,
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="Team Settings" description="Manage your team's identity and online presence." />
      {saved && <p className="text-sm text-primary">Team settings updated.</p>}
      <TeamSettingsForm defaultValues={defaultValues} onSubmit={handleSubmit} />
    </div>
  );
}
