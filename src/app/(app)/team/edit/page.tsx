"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TeamSettingsForm } from "@/components/settings/TeamSettingsForm";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { TeamDetailsInput } from "@/schemas/onboarding";

export default function EditTeamPage() {
  const router = useRouter();
  const activeTeam = useOnboardingStore((state) => state.activeTeam);
  const updateTeam = useOnboardingStore((state) => state.updateTeam);

  function handleSubmit(data: TeamDetailsInput) {
    updateTeam(data);
    router.push("/team");
  }

  const defaultValues: TeamDetailsInput = {
    name: activeTeam.name,
    nickname: activeTeam.nickname,
    region: activeTeam.region,
    district: activeTeam.district,
    homeGround: activeTeam.homeGround,
    yearEstablished: activeTeam.yearEstablished,
    logo: activeTeam.logo,
    coverImage: activeTeam.coverImage,
    colorPrimary: activeTeam.colorPrimary ?? "#323232",
    colorSecondary: activeTeam.colorSecondary ?? "#ffdb00",
    slogan: activeTeam.slogan,
    facebook: activeTeam.facebook,
    instagram: activeTeam.instagram,
    tiktok: activeTeam.tiktok,
    website: activeTeam.website,
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/team"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Team
      </Link>
      <SectionHeader title="Edit Team" description="Update your team's identity and online presence." />
      <TeamSettingsForm defaultValues={defaultValues} onSubmit={handleSubmit} />
    </div>
  );
}
