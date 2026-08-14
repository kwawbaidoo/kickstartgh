"use client";

import { useState } from "react";

import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { useSettingsStore } from "@/store/settings-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { ProfileFormInput } from "@/schemas/settings";

export default function ProfileSettingsPage() {
  const profile = useSettingsStore((state) => state.profile);
  const updateProfile = useSettingsStore((state) => state.updateProfile);
  const teamName = useOnboardingStore((state) => state.activeTeam.name);
  const [saved, setSaved] = useState(false);

  function handleSubmit(data: ProfileFormInput) {
    updateProfile(data);
    setSaved(true);
  }

  const defaultValues: ProfileFormInput = {
    full_name: profile.full_name,
    phone: profile.phone,
    email: profile.email,
    photo: profile.photo,
    preferred_role: profile.preferred_role,
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader title="My Profile" description="Your personal details across KickStartGH." />
      {saved && <p className="text-sm text-primary">Profile updated.</p>}
      <ProfileForm
        defaultValues={defaultValues}
        date_joined={profile.date_joined}
        teamName={teamName}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
