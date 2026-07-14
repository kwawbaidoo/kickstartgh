"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TeamSettingsForm } from "@/components/settings/TeamSettingsForm";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { TeamDetailsInput } from "@/schemas/onboarding";

export default function TeamSettingsPage() {
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const updateTeam = useOnboardingStore((state) => state.updateTeam);
  const [saved, setSaved] = useState(false);

  function handleSubmit(data: TeamDetailsInput) {
    updateTeam(data);
    setSaved(true);
  }

  const defaultValues: TeamDetailsInput = {
    name: activeTeam.name,
    nickname: activeTeam.nickname,
    region: activeTeam.region,
    district: activeTeam.district,
    homeGround: activeTeam.homeGround,
    yearEstablished: activeTeam.yearEstablished,
    logo: activeTeam.logo,
    colorPrimary: activeTeam.colorPrimary ?? "#323232",
    colorSecondary: activeTeam.colorSecondary ?? "#ffdb00",
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
